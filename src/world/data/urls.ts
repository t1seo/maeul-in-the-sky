import { WorldDataError } from './errors.js';

export type WorldUrlOptions = { readonly pageUrl?: string };

const LOOPBACK = new Set(['127.0.0.1', 'localhost', '[::1]']);

function parseUrl(input: string, base?: string): URL {
  try {
    const url = new URL(input, base);
    if (url.username || url.password || url.hash || input.includes('#'))
      throw new WorldDataError(
        'invalid_url',
        'World URLs cannot contain credentials or fragments.',
      );
    return url;
  } catch (error) {
    if (error instanceof TypeError)
      throw new WorldDataError('invalid_url', 'Enter a complete public world JSON URL.');
    throw error;
  }
}

function permitted(url: URL, pageUrl?: string): boolean {
  if (
    url.protocol === 'https:' &&
    !url.port &&
    (url.hostname === 'raw.githubusercontent.com' || url.hostname.endsWith('.github.io'))
  )
    return true;
  if (!pageUrl) return false;
  const page = parseUrl(pageUrl);
  return (
    ['http:', 'https:'].includes(page.protocol) &&
    LOOPBACK.has(page.hostname) &&
    url.origin === page.origin
  );
}

export function parseWorldSourceUrl(input: string, options: WorldUrlOptions = {}): string {
  if (input.length > 8192) throw new WorldDataError('invalid_url', 'The world URL is too long.');
  let url = parseUrl(input, options.pageUrl);
  if (!permitted(url, options.pageUrl))
    throw new WorldDataError('invalid_url', 'Use an HTTPS GitHub Pages or raw GitHub JSON URL.');
  if (url.searchParams.has('world')) {
    if (
      [...url.searchParams.keys()].some((key) => key !== 'world') ||
      url.searchParams.getAll('world').length !== 1
    )
      throw new WorldDataError('invalid_url', 'A visit link must contain one world JSON URL.');
    url = parseUrl(url.searchParams.get('world') ?? '');
  }
  if (!permitted(url, options.pageUrl) || url.search)
    throw new WorldDataError(
      'invalid_url',
      'Use a public JSON URL without credentials or query parameters.',
    );
  return url.href;
}

export function createWorldShareUrl(appUrl: string, publicSourceUrl?: string): string {
  if (!publicSourceUrl)
    throw new WorldDataError('unpublished', 'Publish the JSON file before sharing a world link.');
  const source = parseWorldSourceUrl(publicSourceUrl);
  const app = parseUrl(appUrl);
  if (app.protocol !== 'https:')
    throw new WorldDataError(
      'unpublished',
      'Use the published HTTPS explorer to share this world.',
    );
  app.search = '';
  app.searchParams.set('world', source);
  return app.href;
}
