import { afterEach, describe, expect, it } from 'vitest';
import { request } from 'node:http';
import { startPreviewServer } from '../../src/preview/server.js';
import { httpRequest } from './helpers.js';
import { upstreamFixture } from './upstream.js';

const cleanup: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});

async function local() {
  const upstream = await upstreamFixture();
  cleanup.push(upstream.close);
  const server = await startPreviewServer({
    port: 0,
    token: 'dedup-fixture',
    fetchContributions: upstream.dependency('/pending'),
  });
  cleanup.push(server.close);
  return { server, upstream };
}
const options = {
  path: '/api/preview',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{"username":"octocat","year":2025,"settings":{"motion":"off"}}',
};

describe('C09-cache-timeout HTTP deduplication', () => {
  it('shares one upstream request when simultaneous HTTP clients request an account', async () => {
    // Given a first request waiting on a real upstream response.
    const { server, upstream } = await local();
    const first = httpRequest(server.url, options);
    await upstream.arrived();
    const joined = new Promise<void>((resolve) => server.server.once('request', () => resolve()));
    // When a second request joins before the upstream response arrives.
    const second = httpRequest(server.url, options);
    await joined;
    upstream.release();
    // Then both clients get identical actual data from one upstream lookup.
    const responses = await Promise.all([first, second]);
    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    expect(responses[0]?.body).toBe(responses[1]?.body);
    expect(upstream.calls).toHaveLength(1);
  });
  it('keeps a shared upstream alive when one HTTP subscriber disconnects', async () => {
    // Given one cancellable client and a second client sharing its request.
    const { server, upstream } = await local();
    const first = request(`${server.url}/api/preview`, {
      method: 'POST',
      headers: options.headers,
    });
    first.on('error', (error) => {
      expect(error).toMatchObject({ code: 'ECONNRESET' });
    });
    const firstClosed = new Promise<void>((resolve) => first.once('close', resolve));
    first.end(options.body);
    await upstream.arrived();
    const joined = new Promise<void>((resolve) => server.server.once('request', () => resolve()));
    const second = httpRequest(server.url, options);
    await joined;
    // When the first client leaves and the upstream then responds.
    first.destroy();
    await firstClosed;
    upstream.release();
    // Then the remaining HTTP subscriber receives a successful response.
    const result = await second;
    expect(result.status).toBe(200);
    expect(upstream.calls).toHaveLength(1);
  });
});
