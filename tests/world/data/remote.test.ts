import { expect, it } from 'vitest';
import { loadRemoteWorld } from '../../../src/world/data/remote.js';
import { createWorldShareUrl } from '../../../src/world/data/urls.js';
import { MAX_IMPORT_BYTES } from '../../../src/core/settings/boundary.js';
import { dataHttpFixture } from './http-fixture.js';
import { worldDocumentFixture } from './world-fixture.js';

it('loads a linked public world and preserves the verified source for sharing', async () => {
  const document = worldDocumentFixture();
  const server = await dataHttpFixture((_request, response) =>
    response.end(JSON.stringify(document)),
  );
  try {
    const url = 'https://raw.githubusercontent.com/octocat/repo/main/world.json';
    const link = createWorldShareUrl('https://octocat.github.io/world/', url);
    const result = await loadRemoteWorld(link, { fetch: server.fetch });
    expect(result.publicSourceUrl).toBe(url);
    expect(result.documents[0]).toEqual(document);
  } finally {
    await server.close();
  }
});

it('accepts same-origin local fixtures while keeping them unpublished', async () => {
  const server = await dataHttpFixture((_request, response) =>
    response.end(JSON.stringify(worldDocumentFixture())),
  );
  try {
    const result = await loadRemoteWorld(`${server.url}/world.json`, {
      pageUrl: `${server.url}/world/`,
    });
    expect(result.kind).toBe('world');
    expect(result).not.toHaveProperty('publicSourceUrl');
  } finally {
    await server.close();
  }
});

it('rejects oversized legacy responses before they can replace caller state', async () => {
  const source = worldDocumentFixture().sourceSnapshot;
  const server = await dataHttpFixture((_request, response) =>
    response.end(`${JSON.stringify(source)}${' '.repeat(MAX_IMPORT_BYTES)}`),
  );
  try {
    await expect(
      loadRemoteWorld('https://octocat.github.io/snapshot.json', { fetch: server.fetch }),
    ).rejects.toMatchObject({ code: 'too_large' });
  } finally {
    await server.close();
  }
});

it('rejects an untrusted input before any network request', async () => {
  let calls = 0;
  const server = await dataHttpFixture((_request, response) => {
    calls++;
    response.end('{}');
  });
  try {
    for (const url of [
      'http://127.0.0.1/world.json',
      'https://example.com/world.json',
      'https://octocat.github.io/world.json?token=secret',
    ])
      await expect(loadRemoteWorld(url, { fetch: server.fetch })).rejects.toMatchObject({
        code: 'invalid_url',
      });
    expect(calls).toBe(0);
  } finally {
    await server.close();
  }
});
