import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { startQaServer } from '../../scripts/qa/server.js';

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.reverse()) await cleanup();
  cleanups.length = 0;
});
async function setup() {
  const directory = await mkdtemp(join(tmpdir(), 'maeul-qa-test-'));
  cleanups.push(() => rm(directory, { recursive: true, force: true }));
  const root = join(directory, 'public');
  await mkdir(root);
  await writeFile(join(root, 'index.html'), '<h1>QA</h1>');
  await writeFile(join(root, 'image.svg'), '<svg/>');
  await writeFile(join(directory, 'outside.txt'), 'must not serve');
  await symlink(join(directory, 'outside.txt'), join(root, 'escape.txt'));
  const server = await startQaServer({ root, port: 0 });
  cleanups.push(server.close);
  return server;
}

describe('reusable QA static server', () => {
  it('serves real HTTP HTML and SVG responses with no-store and closes its listener', async () => {
    const server = await setup();
    const response = await fetch(`${server.url}/`);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.text()).toBe('<h1>QA</h1>');
    const svg = await fetch(`${server.url}/image.svg`, { method: 'HEAD' });
    expect(svg.headers.get('content-type')).toBe('image/svg+xml');
    expect(await svg.text()).toBe('');
  });
  it('rejects encoded traversal, escaping symlinks, malformed paths and non-read requests', async () => {
    const server = await setup();
    expect((await fetch(`${server.url}/%2e%2e%2foutside.txt`)).status).toBe(403);
    expect((await fetch(`${server.url}/escape.txt`)).status).toBe(403);
    expect((await fetch(`${server.url}/%ZZ`)).status).toBe(400);
    expect((await fetch(`${server.url}/missing`)).status).toBe(404);
    expect((await fetch(`${server.url}/`, { method: 'POST' })).status).toBe(405);
  });
});
