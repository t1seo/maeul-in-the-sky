import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { fetchContributions } from '../api/client.js';
import type { ContributionData } from '../core/types.js';
import { defaultAssetRoot, serveAsset } from './assets.js';
import { PreviewCache } from './cache.js';
import { createPreviewResponse, parsePreviewRequest } from './data.js';
import { PreviewError } from './errors.js';
import { checkOrigin, readJson, sendError, sendJson } from './http.js';

export type PreviewServerOptions = {
  readonly host?: string;
  readonly port?: number;
  readonly assetRoot?: string | URL;
  readonly token?: string;
  readonly fetchContributions?: typeof fetchContributions;
  readonly requestTimeoutMs?: number;
  readonly cacheTtlMs?: number;
  readonly cacheMaxEntries?: number;
};

export type PreviewAddress = { readonly host: string; readonly port: number; readonly url: string };
export type PreviewServerHandle = {
  readonly server: Server;
  readonly listen: () => Promise<PreviewAddress>;
  readonly close: () => Promise<void>;
};
export type StartedPreviewServer = PreviewServerHandle & PreviewAddress;

type Fetched = { readonly data: ContributionData; readonly fetchedAt: string };

function bounded(value: number, min: number, max: number, field: string): number {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new PreviewError(400, 'configuration', `Invalid preview ${field}.`);
  }
  return value;
}

export function createPreviewServer(options: PreviewServerOptions = {}): PreviewServerHandle {
  const host = options.host ?? '127.0.0.1';
  if (host !== '127.0.0.1' && host !== '::1') {
    throw new PreviewError(
      400,
      'configuration',
      'Preview host must be a loopback address (127.0.0.1 or ::1).',
    );
  }
  const port = bounded(options.port ?? 4318, 0, 65535, 'port');
  const timeoutMs = bounded(options.requestTimeoutMs ?? 30_000, 1, 120_000, 'timeout');
  const cache = new PreviewCache<Fetched>(
    bounded(options.cacheTtlMs ?? 300_000, 0, 300_000, 'cache TTL'),
    bounded(options.cacheMaxEntries ?? 32, 1, 32, 'cache size'),
    timeoutMs,
  );
  const assetRoot =
    options.assetRoot instanceof URL
      ? fileURLToPath(options.assetRoot)
      : resolve(options.assetRoot ?? defaultAssetRoot());
  const token = (options.token ?? process.env.GITHUB_TOKEN)?.trim();
  const fetchData = options.fetchContributions ?? fetchContributions;
  const active = new Set<AbortController>();
  let origin = '';
  let closed = false;
  let listening: Promise<PreviewAddress> | undefined;
  let closing: Promise<void> | undefined;

  async function route(
    request: IncomingMessage,
    response: ServerResponse,
    signal: AbortSignal,
  ): Promise<void> {
    checkOrigin(request, origin);
    if (closed) throw new PreviewError(503, 'shutdown', 'Preview server is closing.');
    switch (request.url) {
      case '/api/health':
        if (request.method !== 'GET')
          throw new PreviewError(405, 'method', 'Use GET for server health.');
        sendJson(response, 200, { status: 'ok', capabilities: { github: Boolean(token) } });
        return;
      case '/api/preview': {
        if (request.method !== 'POST')
          throw new PreviewError(405, 'method', 'Use POST for account preview.');
        const input = parsePreviewRequest(await readJson(request));
        if (!token)
          throw new PreviewError(
            503,
            'missing_token',
            'Start the local preview server with GITHUB_TOKEN set in its environment.',
          );
        const key = JSON.stringify([input.username.toLowerCase(), input.year ?? 'rolling']);
        const fetched = await cache.get(key, signal, async (fetchSignal) => ({
          data: await fetchData(input.username, input.year, token, { signal: fetchSignal }),
          fetchedAt: new Date().toISOString(),
        }));
        if (signal.aborted) return;
        sendJson(
          response,
          200,
          await createPreviewResponse(fetched.data, input, fetched.fetchedAt),
        );
        return;
      }
      default:
        if (request.url?.startsWith('/api/'))
          throw new PreviewError(404, 'not_found', 'API route not found.');
        if (request.method !== 'GET')
          throw new PreviewError(405, 'method', 'Use GET for demo assets.');
        await serveAsset(assetRoot, request.url ?? '/', response);
    }
  }

  const server = createServer((request, response) => {
    const controller = new AbortController();
    active.add(controller);
    const timer = setTimeout(() => {
      controller.abort();
      response.shouldKeepAlive = false;
      sendError(response, new PreviewError(504, 'timeout', 'Preview request timed out.'));
    }, timeoutMs);
    const disconnect = () => {
      clearTimeout(timer);
      active.delete(controller);
      controller.abort();
      if (!request.complete) request.destroy();
    };
    response.once('close', disconnect);
    void route(request, response, controller.signal)
      .catch((error) => {
        response.shouldKeepAlive = false;
        sendError(response, error);
        request.resume();
      })
      .finally(() => clearTimeout(timer));
  });
  server.headersTimeout = Math.max(timeoutMs, 1000);
  server.requestTimeout = timeoutMs;
  server.keepAliveTimeout = 1000;

  function listen(): Promise<PreviewAddress> {
    if (closed)
      return Promise.reject(new PreviewError(503, 'shutdown', 'Preview server is closed.'));
    if (listening) return listening;
    listening = new Promise((accept, reject) => {
      const failed = (error: Error) => {
        server.removeListener('listening', ready);
        reject(error);
      };
      const ready = () => {
        server.removeListener('error', failed);
        const address = server.address();
        if (!address || typeof address === 'string') {
          reject(new PreviewError(500, 'listen', 'Preview server did not bind a TCP address.'));
          return;
        }
        origin = `http://${host === '::1' ? '[::1]' : host}:${address.port}`;
        accept({ host, port: address.port, url: origin });
      };
      server.once('error', failed);
      server.once('listening', ready);
      server.listen(port, host);
    });
    return listening;
  }

  function close(): Promise<void> {
    if (closing) return closing;
    closed = true;
    cache.close();
    for (const controller of active) controller.abort();
    closing = Promise.allSettled(listening ? [listening] : []).then(
      () =>
        new Promise<void>((accept, reject) => {
          server.close((error) => {
            if (error && (!('code' in error) || error.code !== 'ERR_SERVER_NOT_RUNNING'))
              reject(error);
            else accept();
          });
          server.closeAllConnections();
        }),
    );
    return closing;
  }
  return { server, listen, close };
}

export async function startPreviewServer(
  options: PreviewServerOptions = {},
): Promise<StartedPreviewServer> {
  const handle = createPreviewServer(options);
  try {
    return { ...handle, ...(await handle.listen()) };
  } catch (error) {
    await handle.close();
    throw error;
  }
}
