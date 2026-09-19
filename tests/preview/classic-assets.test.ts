import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { expect, it } from 'vitest';
import { startPreviewServer } from '../../src/preview/server.js';

const classicHash = '44e02537900ec9d8a0f58b492ca4f4ba5ed7145f149929804c84272b725ae458';

it('serves the exact pre-upgrade renderer through the packaged demo asset route', async () => {
  const archived = await readFile(
    new URL('../../assets/versions/classic/browser.js', import.meta.url),
  );
  expect(createHash('sha256').update(archived).digest('hex')).toBe(classicHash);
  const server = await startPreviewServer({
    port: 0,
    token: '',
    assetRoot: new URL('../../docs/demo/', import.meta.url),
  });
  try {
    const response = await fetch(`${server.url}/versions/classic/browser.js`);
    const bytes = Buffer.from(await response.arrayBuffer());
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('javascript');
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(classicHash);
    const metadata = await fetch(`${server.url}/versions/classic/metadata.json`);
    expect(await metadata.json()).toMatchObject({
      id: 'classic',
      commit: '05a10eff07575acf2c81adcd66a66bc501507217',
      files: { 'browser.js': { sha256: classicHash } },
    });
  } finally {
    await server.close();
  }
});
