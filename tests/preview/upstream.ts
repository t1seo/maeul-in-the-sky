import { createServer, type ServerResponse } from 'node:http';
import { once } from 'node:events';
import { fetchContributions } from '../../src/api/client.js';
import { address } from './helpers.js';

export const CALENDAR_RESPONSE = {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: 6,
          weeks: [
            {
              contributionDays: [
                { date: '2025-01-01', contributionCount: 1, contributionLevel: 'FIRST_QUARTILE' },
                { date: '2025-01-02', contributionCount: 5, contributionLevel: 'FOURTH_QUARTILE' },
                { date: '2025-01-03', contributionCount: 0, contributionLevel: 'NONE' },
              ],
            },
          ],
        },
      },
    },
  },
};

export async function upstreamFixture() {
  const calls: Array<{ path: string; authorizationPresent: boolean }> = [];
  const waiting: ServerResponse[] = [];
  const arrivals: Array<() => void> = [];
  const server = createServer((request, response) => {
    const path = request.url ?? '/';
    calls.push({ path, authorizationPresent: request.headers.authorization !== undefined });
    request.resume();
    if (path === '/pending') {
      waiting.push(response);
      for (const notify of arrivals.splice(0)) notify();
      return;
    }
    const status = /^\/\d{3}$/.test(path) ? Number(path.slice(1)) : 200;
    response.writeHead(status, {
      'Content-Type': 'application/json',
      ...(status === 429 ? { 'Retry-After': '60' } : {}),
    });
    response.end(
      path === '/malformed'
        ? '{'
        : JSON.stringify(
            status === 200
              ? CALENDAR_RESPONSE
              : { message: 'Sensitive upstream diagnostic preview-private-fixture-token' },
          ),
    );
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${address(server).port}`;
  const dependency =
    (path: string): typeof fetchContributions =>
    (username, year, token, options) =>
      fetchContributions(username, year, token, {
        ...options,
        endpoint: `${url}${path}`,
        maxRetryWaitMs: 0,
      });
  return {
    calls,
    server,
    dependency,
    arrived: () =>
      waiting.length ? Promise.resolve() : new Promise<void>((resolve) => arrivals.push(resolve)),
    disconnected: () =>
      new Promise<void>((resolve) => {
        const response = waiting[0];
        if (!response || response.destroyed) resolve();
        else response.once('close', resolve);
      }),
    release: () => {
      for (const response of waiting.splice(0)) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(CALENDAR_RESPONSE));
      }
    },
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  };
}
