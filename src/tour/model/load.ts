import { MAX_IMPORT_BYTES } from '../../core/settings/boundary.js';
import { sampleSnapshot } from '../../demo/sample.js';
import { WorldDataError } from '../../world/data/errors.js';
import { requestWorldJson } from '../../world/data/transport.js';
import { parseWorldSourceUrl } from '../../world/data/urls.js';
import type { TourModel } from '../types.js';
import { parseTourSnapshot } from './snapshot.js';

export type TourLoadOptions = {
  readonly pageUrl: string;
  readonly signal?: AbortSignal;
  readonly fetch?: typeof globalThis.fetch;
};

export async function loadTourModel(
  options: TourLoadOptions,
): Promise<{ readonly model: TourModel; readonly source: string | null }> {
  if (options.signal?.aborted)
    throw new WorldDataError('cancelled', 'Village loading was cancelled.');
  let page: URL;
  try {
    page = new URL(options.pageUrl);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    throw new WorldDataError('invalid_url', 'The village tour URL is invalid.');
  }
  if (!page.search) return { model: parseTourSnapshot(sampleSnapshot()), source: null };
  const sources = page.searchParams.getAll('snapshot');
  const sourceInput = sources[0];
  if (
    sources.length !== 1 ||
    !sourceInput?.trim() ||
    [...page.searchParams.keys()].some((key) => key !== 'snapshot')
  ) {
    throw new WorldDataError(
      'invalid_url',
      'A village tour link must contain one nonempty snapshot URL.',
    );
  }
  const source = parseWorldSourceUrl(sourceInput, { pageUrl: options.pageUrl });
  const response = await requestWorldJson(source, {
    maxBytes: MAX_IMPORT_BYTES,
    ...(options.signal ? { signal: options.signal } : {}),
    ...(options.fetch ? { fetch: options.fetch } : {}),
  });
  if (options.signal?.aborted)
    throw new WorldDataError('cancelled', 'Village loading was cancelled.');
  return { model: parseTourSnapshot(response.value), source };
}
