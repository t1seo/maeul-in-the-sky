import { readFile, realpath, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ServerResponse } from 'node:http';
import { PreviewError } from './errors.js';

const MIME: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
};

export function defaultAssetRoot(): string {
  const directory = dirname(fileURLToPath(import.meta.url));
  const packaged = resolve(directory, 'demo');
  return existsSync(packaged) ? packaged : resolve(directory, '../../docs/demo');
}

export async function serveAsset(
  root: string,
  rawPath: string,
  response: ServerResponse,
): Promise<void> {
  let path: string;
  try {
    path = decodeURIComponent(rawPath.split('?')[0]);
  } catch (error) {
    if (error instanceof URIError) throw new PreviewError(400, 'path', 'Invalid asset path.');
    throw error;
  }
  if (
    !path.startsWith('/') ||
    path.includes('\\') ||
    path.includes('\0') ||
    path.split('/').some((part) => part === '..' || part.startsWith('.'))
  ) {
    throw new PreviewError(403, 'path', 'Asset path is not allowed.');
  }
  const assetRoot = resolve(root);
  const rootPrefix = assetRoot.endsWith(sep) ? assetRoot : `${assetRoot}${sep}`;
  const candidate = resolve(assetRoot, `.${path.endsWith('/') ? `${path}index.html` : path}`);
  if (!candidate.startsWith(rootPrefix))
    throw new PreviewError(403, 'path', 'Asset path is not allowed.');
  try {
    const [realRoot, realFile] = await Promise.all([realpath(assetRoot), realpath(candidate)]);
    const realPrefix = realRoot.endsWith(sep) ? realRoot : `${realRoot}${sep}`;
    if (!realFile.startsWith(realPrefix))
      throw new PreviewError(403, 'path', 'Asset path is not allowed.');
    const type = MIME[extname(realFile)];
    if (!type || !(await stat(realFile)).isFile())
      throw new PreviewError(404, 'not_found', 'Asset not found.');
    const content = await readFile(realFile);
    const connections = path.startsWith('/world/')
      ? "'self' https://api.github.com https://raw.githubusercontent.com https://*.github.io"
      : "'self'";
    response.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Content-Security-Policy': `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src ${connections}; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`,
    });
    response.end(content);
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      ['ENOENT', 'ENOTDIR', 'EACCES'].includes(String(error.code))
    ) {
      throw new PreviewError(404, 'not_found', 'Asset not found.');
    }
    throw error;
  }
}
