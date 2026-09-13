import { createServer, type IncomingMessage } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { fetchContributions } from '../../src/api/client.js';
import { calendarResponse } from './response-fixtures.js';

describe('fetchContributions through a local HTTP fixture', () => {
  const requests: IncomingMessage[] = [];
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const server = createServer((request, response) => {
    requests.push(request);
    switch (request.url) {
      case '/unauthorized':
        response.writeHead(401).end('Unauthorized');
        return;
      case '/limited':
        response.writeHead(429, { 'retry-after': '0' }).end('Try again');
        return;
      case '/malformed':
        response.writeHead(200).end('{not JSON');
        return;
      case '/invalid-calendar':
        response.end(JSON.stringify(calendarResponse({ date: '2025-02-30' })));
        return;
      case '/redirect':
        response.writeHead(302, { location: '/happy' }).end();
        return;
      case '/delay': {
        const timer = setTimeout(() => {
          timers.delete(timer);
          response.end(JSON.stringify(calendarResponse()));
        }, 200);
        timers.add(timer);
        return;
      }
      default:
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify(calendarResponse()));
    }
  });
  let origin = '';

  beforeAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new TypeError('Expected TCP fixture address');
    origin = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    for (const timer of timers) clearTimeout(timer);
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    expect(server.listening).toBe(false);
  });

  it('reads a Contribution Calendar through native fetch without transmitting the token', async () => {
    // Given
    const before = requests.length;
    // When
    const result = await fetchContributions('fixture-user', 2025, 'ghp_fixture_secret', {
      endpoint: `${origin}/happy`,
    });
    // Then
    expect(result).toMatchObject({ username: 'fixture-user', year: 2025, stats: { total: 3 } });
    expect(result.weeks[0]?.days[0]).toEqual({ date: '2025-01-05', count: 3, level: 1 });
    expect(requests).toHaveLength(before + 1);
    expect(requests.at(-1)?.headers.authorization).toBeUndefined();
    expect(requests.at(-1)?.method).toBe('POST');
  });

  it.each([
    ['/unauthorized', 'auth', 1],
    ['/limited', 'ratelimit', 3],
    ['/malformed', 'invalidresponse', 1],
    ['/invalid-calendar', 'invalidresponse', 1],
    ['/redirect', 'http', 1],
    ['/delay', 'timeout', 1],
  ])('classifies %s over HTTP and cleans up', async (path, code, attempts) => {
    // Given
    const before = requests.length;
    // When
    const result = fetchContributions('fixture-user', 2025, undefined, {
      endpoint: `${origin}${path}`,
      timeoutMs: 50,
      maxRetryWaitMs: 0,
    });
    // Then
    await expect(result).rejects.toMatchObject({ code });
    expect(requests).toHaveLength(before + Number(attempts));
  });
});
