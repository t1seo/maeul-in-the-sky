import assert from 'node:assert/strict';
import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { startPreviewServer } from '../../src/preview/server.js';
import { parseSnapshot, snapshotToContributionData } from '../../src/core/settings/parse.js';
import { assetFixture } from './helpers.js';
import { upstreamFixture } from './upstream.js';
import {
  capture,
  evidenceRoot,
  requestBody,
  secretCanary,
  verifyClosed,
} from './manual-support.js';

const live = process.argv.includes('--live');
const boundariesOnly = process.argv.includes('--boundaries-only');
await mkdir(evidenceRoot, { recursive: true });
const cleanup: Array<() => Promise<void>> = [];
const ports: number[] = [];
try {
  const assets = await assetFixture();
  cleanup.push(assets.close);
  const local = await startPreviewServer({ port: 0, token: '', assetRoot: assets.directory });
  ports.push(local.port);
  cleanup.push(local.close);
  await capture('health-no-token', local.url, { path: '/api/health' }, 200);
  await capture('missing-token', local.url, requestBody(), 503);
  await capture(
    'bad-host',
    local.url,
    { path: '/api/health', headers: { Host: 'attacker.example' } },
    403,
  );
  await capture(
    'bad-origin',
    local.url,
    {
      ...requestBody(),
      headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.example' },
    },
    403,
  );
  await capture('malformed-json', local.url, { ...requestBody(), body: '{' }, 400);
  await capture(
    'bad-year',
    local.url,
    { ...requestBody(), body: '{"username":"octocat","year":1800}' },
    400,
  );
  await capture('oversize-json', local.url, { ...requestBody(), body: ' '.repeat(16385) }, 413);
  await capture(
    'injected-token',
    local.url,
    { ...requestBody(), body: JSON.stringify({ username: 'octocat', token: secretCanary }) },
    400,
  );
  await capture('static-index', local.url, {}, 200);
  await capture('static-js', local.url, { path: '/app.js' }, 200);
  await capture('traversal', local.url, { path: '/%2e%2e/package.json' }, 403);
  await capture('missing-asset', local.url, { path: '/missing.js' }, 404);

  const upstream = await upstreamFixture();
  cleanup.push(upstream.close);
  for (const [path, status] of [
    ['/401', 401],
    ['/403', 403],
    ['/429', 429],
    ['/500', 502],
    ['/malformed', 502],
    ['/pending', 504],
  ] as const) {
    const server = await startPreviewServer({
      port: 0,
      token: secretCanary,
      assetRoot: assets.directory,
      fetchContributions: upstream.dependency(path),
      requestTimeoutMs: 300,
    });
    ports.push(server.port);
    try {
      await capture(`upstream-${path.slice(1)}`, server.url, requestBody(), status);
    } finally {
      await server.close();
    }
  }
  assert.ok(upstream.calls.every((call) => !call.authorizationPresent));
  await writeFile(
    resolve(evidenceRoot, 'upstream-summary.json'),
    JSON.stringify(upstream.calls, null, 2),
  );

  if (!boundariesOnly) {
    const server = await startPreviewServer({
      port: 0,
      token: secretCanary,
      fetchContributions: upstream.dependency('/ok'),
    });
    ports.push(server.port);
    try {
      const response = await capture('fixture-success', server.url, requestBody(), 200);
      const envelope: unknown = JSON.parse(response.body);
      assert.ok(
        typeof envelope === 'object' &&
          envelope !== null &&
          'snapshot' in envelope &&
          'metadata' in envelope,
      );
      const snapshot = parseSnapshot(envelope.snapshot);
      assert.equal(snapshotToContributionData(snapshot).stats.total, 6);
      await capture('fixture-cache', server.url, requestBody(), 200);
      assert.equal(upstream.calls.filter((call) => call.path === '/ok').length, 1);
    } finally {
      await server.close();
    }
  }
  if (live) {
    assert.ok(
      process.env.GITHUB_TOKEN,
      'Provide GITHUB_TOKEN only to the server process environment',
    );
    const server = await startPreviewServer({ port: 0 });
    ports.push(server.port);
    try {
      await capture('live-health', server.url, { path: '/api/health' }, 200);
      const response = await capture('live-t1seo-2025', server.url, requestBody('t1seo'), 200);
      const envelope: unknown = JSON.parse(response.body);
      assert.ok(
        typeof envelope === 'object' &&
          envelope !== null &&
          'snapshot' in envelope &&
          'metadata' in envelope,
      );
      const snapshot = parseSnapshot(envelope.snapshot);
      const data = snapshotToContributionData(snapshot);
      assert.equal(snapshot.source.kind, 'github');
      assert.equal(snapshot.username, 't1seo');
      assert.ok(data.weeks.length > 0);
      assert.ok(
        typeof envelope.metadata === 'object' &&
          envelope.metadata !== null &&
          'stats' in envelope.metadata,
      );
      assert.deepEqual(envelope.metadata.stats, data.stats);
      assert.ok(!response.body.includes(process.env.GITHUB_TOKEN));
      await writeFile(
        resolve(evidenceRoot, 'live-summary.json'),
        JSON.stringify(
          {
            account: snapshot.username,
            year: snapshot.year,
            source: snapshot.source,
            total: data.stats.total,
            days: data.weeks.flatMap((week) => week.days).length,
            metadataStatsMatch: true,
          },
          null,
          2,
        ),
      );
    } finally {
      await server.close();
    }
  }
  await writeFile(
    resolve(evidenceRoot, boundariesOnly ? 'boundaries-result.json' : 'result.json'),
    JSON.stringify(
      { pass: true, liveGitHub: live, boundariesOnly, at: new Date().toISOString() },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ pass: true, liveGitHub: live, boundariesOnly, evidenceRoot }));
} finally {
  for (const close of cleanup.reverse()) await close();
  for (const port of ports) await verifyClosed(port);
  await appendFile(
    resolve(evidenceRoot, 'cleanup.txt'),
    `${new Date().toISOString()} All ${ports.length} preview ports rebound successfully after close; fixture server and temporary asset directory removed.\n`,
  );
}
