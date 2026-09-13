import { afterEach, describe, expect, it } from 'vitest';
import { request } from 'node:http';
import { startPreviewServer } from '../../src/preview/server.js';
import { assetFixture, httpRequest } from './helpers.js';
import { upstreamFixture } from './upstream.js';

const cleanup: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});
async function local(path: string, timeout = 30000) {
  const assets = await assetFixture();
  const upstream = await upstreamFixture();
  cleanup.push(assets.close, upstream.close);
  const server = await startPreviewServer({
    port: 0,
    token: 'preview-private-fixture-token',
    assetRoot: assets.directory,
    fetchContributions: upstream.dependency(path),
    requestTimeoutMs: timeout,
  });
  cleanup.push(server.close);
  return { server, upstream };
}
function preview(url: string, settings: unknown = {}) {
  return httpRequest(url, {
    path: '/api/preview',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: url },
    body: JSON.stringify({ username: 'octocat', year: 2025, settings }),
  });
}

describe('C09-live-data actual HTTP transport', () => {
  it.each([
    ['/401', 401, 'auth'],
    ['/403', 403, 'forbidden'],
    ['/429', 429, 'rate_limit'],
    ['/500', 502, 'upstream'],
    ['/malformed', 502, 'upstream'],
  ])('sanitizes errors when the upstream returns %s', async (path, status, code) => {
    // Given a real HTTP upstream returning the selected failure.
    const { server, upstream } = await local(String(path));
    // When an account preview request traverses the production GitHub client.
    const result = await preview(server.url);
    // Then status and public error are preserved without secret-bearing diagnostics.
    expect(result.status).toBe(status);
    expect(JSON.parse(result.body)).toMatchObject({ error: { code } });
    expect(result.body).not.toContain('preview-private-fixture-token');
    expect(upstream.calls).toHaveLength(1);
    expect(upstream.calls[0]?.authorizationPresent).toBe(false);
  });
  it('returns real snapshot counts and renderer metadata when the upstream succeeds', async () => {
    // Given an HTTP contribution calendar with one partial week and total six.
    const { server } = await local('/ok');
    // When the same-origin browser requests an account preview.
    const result = await preview(server.url, { motion: 'off' });
    // Then the versioned snapshot and actual prepared metadata agree.
    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toMatchObject({
      snapshot: {
        schemaVersion: 1,
        kind: 'maeul-snapshot',
        source: { kind: 'github' },
        settings: { motion: 'off' },
      },
      metadata: {
        dataDayCount: 3,
        stats: { total: 6, activeDays: 2 },
        cells: [
          { date: '2025-01-01', count: 1, week: 0, day: 3 },
          { date: '2025-01-02', count: 5, week: 0, day: 4 },
          { date: '2025-01-03', count: 0, week: 0, day: 5 },
        ],
      },
    });
    expect(result.body).not.toContain('preview-private-fixture-token');
  }, 15000);
  it('uses cached account data while resolving each request settings independently', async () => {
    // Given one fetched account and its initial settings.
    const { server, upstream } = await local('/ok');
    await preview(server.url, { title: 'First' });
    // When another preview changes settings without changing the account.
    const result = await preview(server.url, { title: 'Second' });
    // Then only rendering settings change and the upstream was called once.
    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toMatchObject({ snapshot: { settings: { title: 'Second' } } });
    expect(upstream.calls).toHaveLength(1);
  });
  it('cancels the real upstream when its HTTP consumer disconnects', async () => {
    // Given a preview waiting on an HTTP upstream body.
    const { server, upstream } = await local('/pending');
    const client = request(`${server.url}/api/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const clientClosed = new Promise<void>((resolve) => client.once('close', resolve));
    client.on('error', (error) => {
      expect(error).toMatchObject({ code: 'ECONNRESET' });
    });
    client.end('{"username":"octocat","year":2025}');
    await upstream.arrived();
    const upstreamClosed = upstream.disconnected();
    // When the client disconnects.
    client.destroy();
    await clientClosed;
    // Then the real downstream socket closes before server teardown.
    await upstreamClosed;
    expect(upstream.calls).toHaveLength(1);
  });
  it('returns a bounded timeout when an upstream never sends a response', async () => {
    // Given a stalled real HTTP upstream.
    const { server } = await local('/pending', 80);
    // When the preview reaches its request deadline.
    const result = await preview(server.url);
    // Then a sanitized timeout response ends the wait.
    expect(result.status).toBe(504);
    expect(JSON.parse(result.body)).toMatchObject({ error: { code: 'timeout' } });
  });
});
