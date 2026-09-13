const ERROR_MESSAGES = {
  auth: 'Authentication failed: invalid GitHub token or insufficient permissions',
  notfound: 'GitHub user not found',
  ratelimit: 'GitHub API rate limit exceeded',
  timeout: 'GitHub API request timed out',
  network: 'Network failure: unable to reach GitHub API',
  http: 'GitHub API HTTP error',
  invalidresponse: 'GitHub API returned an invalid response',
  aborted: 'GitHub API request cancelled',
  configuration: 'Invalid GitHub API request configuration',
} as const;

export type GitHubApiErrorCode = keyof typeof ERROR_MESSAGES;

/** Safe to log: upstream bodies, credentials, URLs, and raw causes are never retained. */
export class GitHubApiError extends Error {
  readonly name = 'GitHubApiError';
  readonly retryable: boolean;
  readonly status: number | undefined;
  readonly retryAfterMs: number | undefined;

  constructor(
    readonly code: GitHubApiErrorCode,
    details: { readonly status?: number; readonly retryAfterMs?: number } = {},
  ) {
    super(
      code === 'http' ? `${ERROR_MESSAGES.http}: HTTP ${details.status}` : ERROR_MESSAGES[code],
    );
    this.status = details.status;
    this.retryAfterMs = details.retryAfterMs;
    this.retryable =
      code === 'network' ||
      code === 'timeout' ||
      code === 'ratelimit' ||
      (code === 'http' &&
        (details.status === 408 || [500, 502, 503, 504].includes(details.status ?? 0)));
  }
}
