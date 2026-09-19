import { afterEach, expect, it } from 'vitest';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { startPreviewServer } from '../../src/preview/server.js';
import { assetFixture, httpRequest } from './helpers.js';

const cleanup: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});

it('allows public world sources only in the explorer document policy', async () => {
  // Given a packaged explorer alongside the original demo.
  const root = await assetFixture();
  cleanup.push(root.close);
  await mkdir(join(root.directory, 'world'));
  await writeFile(join(root.directory, 'world/index.html'), '<title>World explorer</title>');
  const server = await startPreviewServer({
    port: 0,
    token: '',
    assetRoot: pathToFileURL(root.directory),
  });
  cleanup.push(server.close);
  // When both documents are served through the real preview HTTP server.
  const [world, original] = await Promise.all([
    httpRequest(server.url, { path: '/world/' }),
    httpRequest(server.url, { path: '/' }),
  ]);
  // Then public visits work without broadening the original demo's network policy.
  expect(world.status).toBe(200);
  expect(world.headers['content-security-policy']).toContain(
    "connect-src 'self' https://api.github.com https://raw.githubusercontent.com https://*.github.io;",
  );
  expect(original.headers['content-security-policy']).toContain("connect-src 'self';");
  expect(original.headers['content-security-policy']).not.toContain('https://api.github.com');
});
