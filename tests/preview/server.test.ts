import { describe, expect, it } from 'vitest';
import * as preview from '../../src/preview/server.js';

describe('C09 local preview', () => {
  it('exposes the loopback server factory when imported', () => {
    // Given the preview service module, when consumers inspect its startup API.
    expect(preview).toHaveProperty('createPreviewServer', expect.any(Function));
    // Then callers can also start it in one operation.
    expect(preview).toHaveProperty('startPreviewServer', expect.any(Function));
  });
});

import { afterEach } from 'vitest';
import { startPreviewServer, createPreviewServer } from '../../src/preview/server.js';
import { assetFixture, httpRequest } from './helpers.js';

const cleanup: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});
async function local() {
  const assets = await assetFixture();
  cleanup.push(assets.close);
  const server = await startPreviewServer({ port: 0, token: '', assetRoot: assets.directory });
  cleanup.push(server.close);
  return server;
}

describe('C09-origin-secret HTTP boundary', () => {
  it('reports unavailable capability without exposing credentials when token is missing', async () => {
    // Given a loopback server with no token.
    const server = await local();
    // When its health endpoint is requested.
    const result = await httpRequest(server.url, { path: '/api/health' });
    // Then the capability is explicit and the data cannot be cached.
    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ status: 'ok', capabilities: { github: false } });
    expect(result.headers['cache-control']).toBe('no-store');
  });
  it('returns actionable 503 when an account is requested without a server token', async () => {
    // Given a server without GitHub credentials.
    const server = await local();
    // When a valid account request arrives.
    const result = await httpRequest(server.url, {
      path: '/api/preview',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"username":"octocat"}',
    });
    // Then the server names its environment configuration, never a browser token field.
    expect(result.status).toBe(503);
    expect(result.body).toContain('GITHUB_TOKEN');
  });
  it.each([
    { Host: 'evil.example' },
    { Origin: 'https://evil.example' },
    { Origin: 'null' },
    { Host: 'localhost:4318' },
    { 'Sec-Fetch-Site': 'cross-site' },
  ])('rejects an untrusted authority when headers are %j', async (headers) => {
    // Given the exact address selected by the server.
    const server = await local();
    // When a forged browser authority is sent.
    const result = await httpRequest(server.url, { path: '/api/health', headers });
    // Then no CORS exemption is provided.
    expect(result.status).toBe(403);
    expect(result.headers['access-control-allow-origin']).toBeUndefined();
  });
  it.each([
    ['{', 400, 'application/json'],
    ['x'.repeat(16385), 413, 'application/json'],
    ['{}', 415, 'text/plain'],
    ['{"username":"octocat","token":"canary-secret"}', 400, 'application/json'],
    ['{"username":"octocat","year":1800}', 400, 'application/json'],
  ])('rejects invalid payloads when status should be %s', async (body, status, contentType) => {
    // Given a local server.
    const server = await local();
    // When a malformed, oversized or unsupported request arrives.
    const result = await httpRequest(server.url, {
      path: '/api/preview',
      method: 'POST',
      body: String(body),
      headers: { 'Content-Type': String(contentType) },
    });
    // Then input errors remain sanitized even without configured credentials.
    expect(result.status).toBe(status);
    expect(result.body).not.toContain('canary-secret');
  });
  it.each(['/../package.json', '/%2e%2e/package.json', '/%5c..%5cpackage.json', '/.env'])(
    'rejects traversal when requesting %s',
    async (path) => {
      // Given a packaged asset root.
      const server = await local();
      // When an escape path is requested without URL normalization.
      const result = await httpRequest(server.url, { path });
      // Then only allowed assets are visible.
      expect(result.status).toBe(403);
    },
  );
  it('serves packaged HTML when the root page is requested', async () => {
    // Given a supplied asset root.
    const server = await local();
    // When the demo entry is requested.
    const result = await httpRequest(server.url);
    // Then the actual file is served with constrained browser access.
    expect(result.status).toBe(200);
    expect(result.body).toContain('Preview fixture');
    expect(result.headers['content-security-policy']).toContain("connect-src 'self'");
  });
  it('refuses a network bind when configured outside loopback', () => {
    // Given an externally reachable host, when configuration is constructed.
    expect(() => createPreviewServer({ host: '0.0.0.0' })).toThrow('loopback');
    // Then no listener exists to clean up.
  });
});
