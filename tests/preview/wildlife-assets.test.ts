import { afterEach, expect, it } from 'vitest';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { startPreviewServer } from '../../src/preview/server.js';
import { assetFixture } from './helpers.js';

const cleanup: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});

it.each([
  {
    file: 'squirrel.glb',
    contentType: 'model/gltf-binary',
    bytes: Buffer.from([0x67, 0x6c, 0x54, 0x46, 2, 0, 0, 0, 16, 0, 0, 0, 0xff, 0x80, 0, 1]),
  },
  {
    file: 'CREDITS.md',
    contentType: 'text/markdown; charset=utf-8',
    bytes: Buffer.from('# Wildlife credits\n\nCreator · Source · License\n'),
  },
])(
  'serves the packed tour $file without changing its bytes',
  async ({ file, contentType, bytes }) => {
    const root = await assetFixture();
    cleanup.push(root.close);
    const models = join(root.directory, 'tour/models');
    await mkdir(models, { recursive: true });
    await writeFile(join(models, file), bytes);
    const server = await startPreviewServer({
      port: 0,
      token: '',
      assetRoot: pathToFileURL(root.directory),
    });
    cleanup.push(server.close);

    const response = await fetch(`${server.url}/tour/models/${file}`, {
      signal: AbortSignal.timeout(10_000),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(contentType);
    expect(Buffer.from(await response.arrayBuffer())).toEqual(bytes);
    expect(response.headers.get('cross-origin-resource-policy')).toBe('same-origin');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('content-security-policy')).toContain(
      "connect-src 'self' https://raw.githubusercontent.com https://*.github.io;",
    );
  },
);
