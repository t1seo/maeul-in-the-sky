import { request } from 'node:http';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

export async function assetFixture() {
  const directory = await mkdtemp(join(tmpdir(), 'maeul-preview-'));
  await writeFile(join(directory, 'index.html'), '<!doctype html><title>Preview fixture</title>');
  await writeFile(join(directory, 'app.js'), 'export const ready = true;');
  return { directory, close: () => rm(directory, { recursive: true, force: true }) };
}

export function address(server: Server): AddressInfo {
  const value = server.address();
  if (!value || typeof value === 'string') throw new Error('HTTP fixture did not bind');
  return value;
}

export function httpRequest(
  url: string,
  options: {
    readonly path?: string;
    readonly method?: string;
    readonly body?: string;
    readonly headers?: Readonly<Record<string, string | undefined>>;
  } = {},
) {
  return new Promise<{
    status: number;
    headers: Readonly<Record<string, string | string[] | undefined>>;
    body: string;
  }>((resolve, reject) => {
    const req = request(
      url,
      { method: options.method ?? 'GET', path: options.path ?? '/', headers: options.headers },
      (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () =>
          resolve({ status: response.statusCode ?? 0, headers: response.headers, body }),
        );
        response.on('error', reject);
      },
    );
    req.on('error', reject);
    req.end(options.body);
  });
}
