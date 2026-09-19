import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

export async function dataHttpFixture(
  handle: (request: IncomingMessage, response: ServerResponse) => void,
) {
  const server = createServer(handle);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new TypeError('Expected a loopback port');
  const url = `http://127.0.0.1:${address.port}`;
  const fetch: typeof globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    const original = new URL(request.url);
    return globalThis.fetch(new Request(`${url}${original.pathname}${original.search}`, request));
  };
  return {
    url,
    fetch,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  };
}

export function repositoryApiFixture(id = 1) {
  return {
    id,
    full_name: `octocat/repo-${id}`,
    private: false,
    visibility: 'public',
    html_url: `https://github.com/octocat/repo-${id}`,
    description: 'Public miniature world',
    language: 'TypeScript',
    created_at: '2020-01-01T00:00:00Z',
    stargazers_count: 10,
  };
}

export function releaseApiFixture(id = 10) {
  return {
    id,
    tag_name: `v${id}`,
    name: `Release ${id}`,
    draft: false,
    html_url: `https://github.com/octocat/repo-1/releases/tag/v${id}`,
    created_at: '2024-01-01T00:00:00Z',
    published_at: '2024-02-29T12:00:00Z',
  };
}
