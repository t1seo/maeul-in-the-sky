import { afterEach, describe, expect, it } from 'vitest';
import { symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createConnection } from 'node:net';
import { request } from 'node:http';
import { pathToFileURL } from 'node:url';
import { createPreviewServer, startPreviewServer } from '../../src/preview/server.js';
import { assetFixture, httpRequest } from './helpers.js';

const cleanup: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});
async function local() {
  const root = await assetFixture();
  cleanup.push(root.close);
  const server = await startPreviewServer({
    port: 0,
    token: '',
    assetRoot: pathToFileURL(root.directory),
  });
  cleanup.push(server.close);
  return { server, root };
}
function rawHttp(port: number, wire: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host: '127.0.0.1', port }, () => socket.write(wire));
    let output = '';
    socket.setEncoding('utf8');
    socket.on('data', (chunk) => {
      output += chunk;
    });
    socket.on('end', () => resolve(output));
    socket.on('error', reject);
  });
}

describe('C09-origin-secret additional boundaries', () => {
  it('rejects a symlink escape when an allowed extension points outside the asset root', async () => {
    // Given an HTML symlink to a file outside the packaged demo root.
    const { server, root } = await local();
    const outside = await assetFixture();
    cleanup.push(outside.close);
    await writeFile(join(outside.directory, 'private.html'), 'PRIVATE-CONTENT');
    await symlink(join(outside.directory, 'private.html'), join(root.directory, 'escaped.html'));
    // When the browser requests that apparent asset.
    const result = await httpRequest(server.url, { path: '/escaped.html' });
    // Then the resolved path remains outside the allowed file boundary.
    expect(result.status).toBe(403);
    expect(result.body).not.toContain('PRIVATE-CONTENT');
  });
  it('rejects duplicate Host fields when one value is the legitimate origin', async () => {
    // Given a correctly bound server.
    const { server } = await local();
    // When raw HTTP carries an ambiguous authority.
    const result = await rawHttp(
      server.port,
      `GET /api/health HTTP/1.1\r\nHost: 127.0.0.1:${server.port}\r\nHost: attacker.example\r\nConnection: close\r\n\r\n`,
    );
    // Then Node header normalization cannot bypass the exact-host requirement.
    expect(result).toMatch(/^HTTP\/1\.1 (400|403)/);
  });
  it('limits streaming bodies when Content-Length is absent', async () => {
    // Given a same-origin client sending chunked JSON.
    const { server } = await local();
    // When chunked bytes exceed the advertised limit.
    const result = await httpRequest(server.url, {
      path: '/api/preview',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' },
      body: ' '.repeat(16 * 1024 + 1),
    });
    // Then the server returns a usable error before parsing.
    expect(result.status).toBe(413);
  });
  it('times out incomplete input when a client never finishes JSON', async () => {
    // Given a server with a short request deadline.
    const server = await startPreviewServer({ port: 0, token: '', requestTimeoutMs: 80 });
    cleanup.push(server.close);
    // When the client leaves its request body incomplete.
    const status = await new Promise<number>((resolve, reject) => {
      const client = request(
        `${server.url}/api/preview`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': '100' },
        },
        (response) => {
          response.resume();
          response.on('end', () => resolve(response.statusCode ?? 0));
        },
      );
      client.on('error', reject);
      client.write('{');
    });
    // Then the server ends the request with a finite timeout.
    expect(status).toBe(504);
  });
  it.each([{ cacheTtlMs: 300001 }, { cacheMaxEntries: 33 }, { port: -1 }, { requestTimeoutMs: 0 }])(
    'rejects an out-of-contract server limit when configured with %j',
    (options) => {
      // Given a limit outside the published bounds, when creating the server.
      expect(() => createPreviewServer(options)).toThrow('Invalid preview');
      // Then no server can be bound using that configuration.
    },
  );
});
