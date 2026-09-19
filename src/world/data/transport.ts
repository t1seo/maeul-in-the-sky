import ky from 'ky';
import { WorldDataError } from './errors.js';
import { MAX_WORLD_BYTES, readBoundedResponse, readWorldJson } from './json.js';

export type WorldRequestOptions = {
  readonly signal?: AbortSignal;
  readonly maxBytes?: number;
  readonly timeoutMs?: number;
  readonly fetch?: typeof globalThis.fetch;
  readonly headers?: Readonly<Record<string, string>>;
};

export async function requestWorldJson(
  url: string,
  options: WorldRequestOptions = {},
): Promise<{
  readonly value: unknown;
  readonly headers: Headers;
  readonly byteLength: number;
}> {
  if (options.signal?.aborted)
    throw new WorldDataError('cancelled', 'World loading was cancelled.');
  const controller = new AbortController();
  const cancel = (): void => controller.abort();
  options.signal?.addEventListener('abort', cancel, { once: true });
  let timedOut = false;
  const timer = setTimeout(
    () => {
      timedOut = true;
      controller.abort();
    },
    Math.min(options.timeoutMs ?? 10000, 10000),
  );
  const limit = Math.min(options.maxBytes ?? MAX_WORLD_BYTES, MAX_WORLD_BYTES);
  try {
    const response = await ky.get(url, {
      signal: controller.signal,
      retry: 0,
      timeout: false,
      throwHttpErrors: false,
      credentials: 'omit',
      redirect: 'error',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      headers: options.headers,
      ...(options.fetch ? { fetch: options.fetch } : {}),
    });
    if (!response.ok) {
      await response.body?.cancel();
      const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000;
      const retry = Number(response.headers.get('retry-after'));
      const retryTime = reset > 0 ? reset : retry > 0 ? Date.now() + retry * 1000 : undefined;
      const retryAt =
        retryTime !== undefined && Number.isFinite(retryTime) && retryTime < 8640000000000000
          ? new Date(retryTime).toISOString()
          : undefined;
      if (
        response.status === 429 ||
        (response.status === 403 &&
          (response.headers.get('x-ratelimit-remaining') === '0' ||
            response.headers.has('retry-after')))
      )
        throw new WorldDataError(
          'rate_limit',
          'GitHub public requests are rate limited. Please wait before trying again.',
          retryAt,
        );
      if (response.status === 404)
        throw new WorldDataError('not_found', 'The public repository or world file was not found.');
      throw new WorldDataError(
        'network',
        `The public data service returned HTTP ${response.status}.`,
      );
    }
    if (Number(response.headers.get('content-length')) > limit) {
      await response.body?.cancel();
      throw new WorldDataError('too_large', `JSON exceeds the ${limit / 1024 / 1024} MiB limit.`);
    }
    const { text, byteLength } = await readBoundedResponse(response.body, limit, controller.signal);
    return {
      value: readWorldJson(text, limit),
      headers: response.headers,
      byteLength,
    };
  } catch (error) {
    if (timedOut)
      throw new WorldDataError('timeout', 'The public data request timed out. Please try again.');
    if (controller.signal.aborted)
      throw new WorldDataError('cancelled', 'World loading was cancelled.');
    if (error instanceof WorldDataError) throw error;
    if (error instanceof Error)
      throw new WorldDataError(
        'network',
        'Could not read the public JSON. Check the connection and its CORS permissions, or import a file.',
      );
    throw error;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', cancel);
  }
}
