import { GitHubApiError } from './errors.js';
import { parseGitHubResponse, type GitHubCalendar } from './response.js';

const GITHUB_API_ENDPOINT = 'https://api.github.com/graphql';
const RETRY_DELAYS = [1000, 2000] as const;
const TOTAL_TIMEOUT_MS = 30_000;

export type FetchContributionsOptions = {
  /** Each attempt includes response body reading; defaults to 10 seconds, maximum 120 seconds. */
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
  /** GitHub or a literal loopback HTTP(S) fixture URL. Tokens are only sent to GitHub. */
  readonly endpoint?: string;
  /** Cumulative retry sleep budget, defaults to 10 seconds, maximum 60 seconds. */
  readonly maxRetryWaitMs?: number;
};

function requestConfig(options: FetchContributionsOptions) {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const maxRetryWaitMs = options.maxRetryWaitMs ?? 10_000;
  if (
    !Number.isInteger(timeoutMs) ||
    timeoutMs <= 0 ||
    timeoutMs > 120_000 ||
    !Number.isInteger(maxRetryWaitMs) ||
    maxRetryWaitMs < 0 ||
    maxRetryWaitMs > 60_000
  ) {
    throw new GitHubApiError('configuration');
  }
  let endpoint: URL;
  try {
    endpoint = new URL(options.endpoint ?? GITHUB_API_ENDPOINT);
  } catch (error) {
    if (error instanceof TypeError) throw new GitHubApiError('configuration');
    throw error;
  }
  const isGitHub = endpoint.href === GITHUB_API_ENDPOINT;
  const isLoopback =
    ['127.0.0.1', '[::1]'].includes(endpoint.hostname) &&
    ['http:', 'https:'].includes(endpoint.protocol);
  if (
    (!isGitHub && !isLoopback) ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash
  ) {
    throw new GitHubApiError('configuration');
  }
  return { timeoutMs, maxRetryWaitMs, endpoint: endpoint.href, isGitHub };
}

async function requestAttempt(
  endpoint: string,
  init: RequestInit,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<GitHubCalendar> {
  if (signal?.aborted) throw new GitHubApiError('aborted');
  const controller = new AbortController();
  const abort = () => controller.abort(new GitHubApiError('aborted'));
  signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => controller.abort(new GitHubApiError('timeout')), timeoutMs);
  let rejectAbort: () => void = () => {};
  const interrupted = new Promise<never>((_resolve, reject) => {
    rejectAbort = () => reject(controller.signal.reason);
    controller.signal.addEventListener('abort', rejectAbort, { once: true });
  });
  try {
    const request = fetch(endpoint, { ...init, signal: controller.signal }).then(
      parseGitHubResponse,
    );
    return await Promise.race([request, interrupted]);
  } catch (error) {
    if (error instanceof GitHubApiError) throw error;
    throw new GitHubApiError('network');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
    controller.signal.removeEventListener('abort', rejectAbort);
    controller.abort();
  }
}

async function waitForRetry(delay: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) throw new GitHubApiError('aborted');
  await new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      reject(new GitHubApiError('aborted'));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, delay);
    signal?.addEventListener('abort', abort, { once: true });
  });
}

export async function makeGraphQLRequest(
  query: string,
  variables: Readonly<Record<string, unknown>>,
  token: string | undefined,
  options: FetchContributionsOptions,
): Promise<GitHubCalendar> {
  const config = requestConfig(options);
  const deadline = Date.now() + TOTAL_TIMEOUT_MS;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'maeul-in-the-sky',
  };
  if (token && config.isGitHub) headers['Authorization'] = `bearer ${token}`;
  const init: RequestInit = {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    redirect: 'manual',
  };
  let waitedMs = 0;
  for (let attempt = 0; ; attempt++) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) throw new GitHubApiError('timeout');
    try {
      return await requestAttempt(
        config.endpoint,
        init,
        Math.min(config.timeoutMs, remainingMs),
        options.signal,
      );
    } catch (error) {
      if (!(error instanceof GitHubApiError)) throw error;
      const backoff = RETRY_DELAYS[attempt];
      if (!error.retryable || backoff === undefined) throw error;
      const delay = error.retryAfterMs ?? backoff;
      if (delay > config.maxRetryWaitMs - waitedMs || delay >= deadline - Date.now()) throw error;
      await waitForRetry(delay, options.signal);
      waitedMs += delay;
    }
  }
}
