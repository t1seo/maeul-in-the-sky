import type { IncomingMessage, ServerResponse } from 'node:http';
import { PreviewError, publicError } from './errors.js';

export function sendJson(response: ServerResponse, status: number, body: unknown): void {
  if (response.destroyed || response.writableEnded) return;
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  response.end(JSON.stringify(body));
}

export function sendError(response: ServerResponse, error: unknown): void {
  const safe = publicError(error);
  sendJson(response, safe.status, { error: { code: safe.code, message: safe.message } });
}

export function checkOrigin(request: IncomingMessage, origin: string): void {
  const expectedHost = new URL(origin).host;
  const headerNames = request.rawHeaders
    .filter((_value, index) => index % 2 === 0)
    .map((name) => name.toLowerCase());
  if (
    headerNames.filter((name) => name === 'host').length !== 1 ||
    headerNames.filter((name) => name === 'origin').length > 1 ||
    request.headers.host !== expectedHost ||
    (request.headers.origin !== undefined && request.headers.origin !== origin) ||
    (request.headers['sec-fetch-site'] !== undefined &&
      !['same-origin', 'none'].includes(String(request.headers['sec-fetch-site'])))
  ) {
    throw new PreviewError(403, 'origin', 'Use the local preview address from this server.');
  }
}

export async function readJson(request: IncomingMessage): Promise<unknown> {
  if (
    !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers['content-type'] ?? '')
  ) {
    throw new PreviewError(415, 'content_type', 'Send application/json.');
  }
  if (request.headers['content-encoding'] && request.headers['content-encoding'] !== 'identity') {
    throw new PreviewError(415, 'content_encoding', 'Compressed request bodies are not supported.');
  }
  const limit = 16 * 1024;
  if (Number(request.headers['content-length']) > limit) {
    throw new PreviewError(413, 'body_too_large', 'Request body exceeds 16 KiB.');
  }
  const chunks: Buffer[] = [];
  let size = 0;
  // destroyOnReturn:false preserves the socket long enough to deliver a 413 response.
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    size += buffer.length;
    if (size > limit) throw new PreviewError(413, 'body_too_large', 'Request body exceeds 16 KiB.');
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    if (error instanceof SyntaxError)
      throw new PreviewError(400, 'invalid_json', 'Send valid JSON.');
    throw error;
  }
}
