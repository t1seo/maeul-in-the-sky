import { describe, expect, it } from 'vitest';
import { requestWorldJson } from '../../../src/world/data/transport.js';
import { dataHttpFixture } from './http-fixture.js';

describe('public JSON transport over real HTTP', () => {
  it('reports secondary rate limits with Retry-After even when primary quota remains', async () => {
    const server = await dataHttpFixture((_request, response) =>
      response.writeHead(403, { 'Retry-After': '60', 'X-RateLimit-Remaining': '50' }).end('{}'),
    );
    try {
      await expect(
        requestWorldJson('https://api.github.com/users/octocat/repos', { fetch: server.fetch }),
      ).rejects.toMatchObject({ code: 'rate_limit', retryAt: expect.any(String) });
    } finally {
      await server.close();
    }
  });
  it('omits credentials and reads a real streamed JSON response', async () => {
    let authorization: string | undefined;
    let cookie: string | undefined;
    const server = await dataHttpFixture((request, response) => {
      authorization = request.headers.authorization;
      cookie = request.headers.cookie;
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.write('{"world":');
      response.end('"한옥"}');
    });
    try {
      const result = await requestWorldJson('https://octocat.github.io/world.json', {
        fetch: server.fetch,
      });
      expect(result.value).toEqual({ world: '한옥' });
      expect(authorization).toBeUndefined();
      expect(cookie).toBeUndefined();
    } finally {
      await server.close();
    }
  });

  it.each([403, 429])('reports rate limiting for HTTP %i without retrying', async (status) => {
    let requests = 0;
    const server = await dataHttpFixture((_request, response) => {
      requests++;
      response
        .writeHead(status, { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': '1790000000' })
        .end('{}');
    });
    try {
      await expect(
        requestWorldJson('https://api.github.com/users/octocat/repos', { fetch: server.fetch }),
      ).rejects.toMatchObject({
        code: 'rate_limit',
        retryAt: new Date(1790000000000).toISOString(),
      });
      expect(requests).toBe(1);
    } finally {
      await server.close();
    }
  });

  it('bounds streamed bytes without trusting absent content length', async () => {
    const server = await dataHttpFixture((_request, response) => {
      response.writeHead(200);
      response.write('x'.repeat(128));
      response.end('x'.repeat(128));
    });
    try {
      await expect(
        requestWorldJson('https://octocat.github.io/world.json', {
          fetch: server.fetch,
          maxBytes: 128,
        }),
      ).rejects.toMatchObject({ code: 'too_large' });
    } finally {
      await server.close();
    }
  });

  it('times out a response whose body never finishes', async () => {
    const server = await dataHttpFixture((_request, response) => {
      response.writeHead(200);
      response.write('{');
    });
    try {
      await expect(
        requestWorldJson('https://octocat.github.io/world.json', {
          fetch: server.fetch,
          timeoutMs: 30,
        }),
      ).rejects.toMatchObject({ code: 'timeout' });
    } finally {
      await server.close();
    }
  });

  it('cancels an in-flight HTTP request and rejects redirects', async () => {
    const controller = new AbortController();
    const server = await dataHttpFixture((request, response) => {
      if (request.url === '/cancel') controller.abort();
      else response.writeHead(302, { Location: 'http://127.0.0.1/forbidden' }).end();
    });
    try {
      await expect(
        requestWorldJson('https://octocat.github.io/cancel', {
          fetch: server.fetch,
          signal: controller.signal,
        }),
      ).rejects.toMatchObject({ code: 'cancelled' });
      await expect(
        requestWorldJson('https://octocat.github.io/redirect', { fetch: server.fetch }),
      ).rejects.toMatchObject({ code: 'network' });
    } finally {
      await server.close();
    }
  });

  it('rejects malformed JSON without exposing the response body', async () => {
    const server = await dataHttpFixture((_request, response) =>
      response.end('secret malformed JSON'),
    );
    try {
      await expect(
        requestWorldJson('https://octocat.github.io/world.json', { fetch: server.fetch }),
      ).rejects.toMatchObject({ code: 'invalid_input', message: 'The file is not valid JSON.' });
    } finally {
      await server.close();
    }
  });
});
