import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execute = promisify(execFile);

describe('C09-live-data native ESM integration', () => {
  it('starts and renders a successful HTTP response when running outside the Vitest module loader', async () => {
    // Given the actual Node ESM loader and the production server module.
    const script = `
      import { startPreviewServer } from './src/preview/server.ts';
      import { upstreamFixture } from './tests/preview/upstream.ts';
      const upstream = await upstreamFixture();
      const server = await startPreviewServer({ port: 0, token: 'native-fixture', fetchContributions: upstream.dependency('/ok') });
      try {
        const response = await fetch(server.url + '/api/preview', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Origin: server.url },
          body: JSON.stringify({ username: 'octocat', year: 2025, settings: { motion: 'off' } }),
        });
        if (response.status !== 200) throw new Error('Native HTTP status: ' + response.status);
        const body = await response.json();
        process.stdout.write(JSON.stringify({ total: body.metadata.stats.total, source: body.snapshot.source.kind }));
      } finally { await server.close(); await upstream.close(); }
    `;
    // When a fresh Node process loads and uses the server through HTTP.
    const result = await execute(
      process.execPath,
      ['--import', 'tsx', '--input-type=module', '-e', script],
      { timeout: 10000 },
    );
    // Then native ESM export linking and real metadata both work.
    expect(JSON.parse(result.stdout)).toEqual({ total: 6, source: 'github' });
  }, 15000);
});
