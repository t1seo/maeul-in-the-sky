import { expect, it } from 'vitest';
import { requestWorldJson } from '../../../src/world/data/transport.js';
import { readBoundedText, readWorldJson } from '../../../src/world/data/json.js';
import { createWorldShareUrl, parseWorldSourceUrl } from '../../../src/world/data/urls.js';
import { createWorldDatabase } from '../../../src/world/data/database.js';
import { dataHttpFixture } from './http-fixture.js';

it('counts an optional UTF-8 byte order mark in the actual wire budget', async () => {
  const server = await dataHttpFixture((_request, response) => response.end('\uFEFF{}'));
  try {
    expect(
      (await requestWorldJson('https://octocat.github.io/world.json', { fetch: server.fetch }))
        .byteLength,
    ).toBe(5);
  } finally {
    await server.close();
  }
});

it.each([
  [404, 'not_found'],
  [500, 'network'],
] as const)('returns friendly status %i errors', async (status, code) => {
  const server = await dataHttpFixture((_request, response) =>
    response.writeHead(status).end('{}'),
  );
  try {
    await expect(
      requestWorldJson('https://octocat.github.io/world.json', { fetch: server.fetch }),
    ).rejects.toMatchObject({ code });
  } finally {
    await server.close();
  }
});

it('rejects oversized Content-Length before consuming the body', async () => {
  const server = await dataHttpFixture((_request, response) =>
    response.writeHead(200, { 'Content-Length': '5000' }).end('{}'),
  );
  try {
    await expect(
      requestWorldJson('https://octocat.github.io/world.json', {
        fetch: server.fetch,
        maxBytes: 100,
      }),
    ).rejects.toMatchObject({ code: 'too_large' });
  } finally {
    await server.close();
  }
});

it('handles missing JSON bodies, cancelled reads and unavailable browser storage', async () => {
  await expect(
    requestWorldJson('https://octocat.github.io/world.json', { signal: AbortSignal.abort() }),
  ).rejects.toMatchObject({ code: 'cancelled' });
  await expect(readBoundedText(null, 100)).rejects.toMatchObject({ code: 'invalid_input' });
  await expect(readBoundedText(null, 100, AbortSignal.abort())).rejects.toMatchObject({
    code: 'cancelled',
  });
  expect(() => readWorldJson(undefined)).toThrow(
    expect.objectContaining({ code: 'invalid_input' }),
  );
  const database = createWorldDatabase();
  await expect(database.read('worlds')).rejects.toMatchObject({ code: 'storage' });
});

it('rejects malformed, oversized and unpublished share URLs', () => {
  for (const input of [
    'not a URL',
    'x'.repeat(8193),
    'https://octocat.github.io/world/?world=&world=another',
  ])
    expect(() => parseWorldSourceUrl(input)).toThrow(
      expect.objectContaining({ code: 'invalid_url' }),
    );
  expect(() =>
    createWorldShareUrl('http://127.0.0.1/world/', 'https://octocat.github.io/world.json'),
  ).toThrow(expect.objectContaining({ code: 'unpublished' }));
});
