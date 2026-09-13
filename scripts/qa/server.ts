import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { z } from 'zod';

const optionsSchema = z.object({
  root: z.string().min(1),
  port: z.number().int().min(0).max(65535).default(4317),
});
const MIME: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};
const inside = (root: string, path: string) => {
  const fragment = relative(root, path);
  return fragment !== '..' && !fragment.startsWith(`..${sep}`) && !isAbsolute(fragment);
};

/** Small loopback-only static server shared by browser QA; close is owned by its caller. */
export async function startQaServer(input: { readonly root: string; readonly port?: number }) {
  const options = optionsSchema.parse(input);
  const root = await realpath(resolve(options.root));
  if (!(await stat(root)).isDirectory()) throw new TypeError('QA server root must be a directory');
  const serve = async (request: IncomingMessage, response: ServerResponse) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    let pathname: string;
    try {
      pathname = decodeURIComponent((request.url ?? '/').split('?')[0]);
    } catch (error) {
      if (!(error instanceof URIError)) throw error;
      response.writeHead(400).end();
      return;
    }
    if (pathname.includes('\0') || pathname.includes('\\')) {
      response.writeHead(400).end();
      return;
    }
    const candidate = resolve(root, `.${pathname}`);
    if (!inside(root, candidate)) {
      response.writeHead(403).end();
      return;
    }
    try {
      let file = await realpath(candidate);
      if (!inside(root, file)) {
        response.writeHead(403).end();
        return;
      }
      if ((await stat(file)).isDirectory()) file = await realpath(join(file, 'index.html'));
      if (!inside(root, file)) {
        response.writeHead(403).end();
        return;
      }
      const content = await readFile(file);
      response.writeHead(200, {
        'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
        'Content-Length': content.length,
      });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error.code === 'ENOENT' || error.code === 'ENOTDIR')
      ) {
        response.writeHead(404).end();
        return;
      }
      throw error;
    }
  };
  const server = createServer((request, response) => {
    void serve(request, response).catch((error: unknown) => {
      if (!response.headersSent) response.writeHead(500);
      response.end();
      console.error(
        'QA static server failed:',
        error instanceof Error ? error.message : String(error),
      );
    });
  });
  await new Promise<void>((resolveReady, reject) => {
    server.once('error', reject);
    server.listen(options.port, '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolveReady();
    });
  });
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new TypeError('Expected loopback TCP listener');
  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolveClosed, reject) => {
        server.close((error) => (error ? reject(error) : resolveClosed()));
        server.closeAllConnections();
      }),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { root: { type: 'string' }, port: { type: 'string' } } });
  const port = z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .parse(values.port ?? '4317');
  void startQaServer({ root: values.root ?? '.', port })
    .then((server) => {
      console.log(`QA server ${server.url}`);
      const close = () => {
        void server.close().catch((error: unknown) => {
          console.error(error instanceof Error ? error.message : String(error));
          process.exitCode = 1;
        });
      };
      process.once('SIGINT', close);
      process.once('SIGTERM', close);
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
