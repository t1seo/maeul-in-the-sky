import { GitHubApiError } from '../api/client.js';

export class PreviewError extends Error {
  readonly name = 'PreviewError';

  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function publicError(error: unknown): PreviewError {
  if (error instanceof PreviewError) return error;
  if (error instanceof GitHubApiError) {
    switch (error.code) {
      case 'auth':
        if (error.status === 403) {
          return new PreviewError(403, 'forbidden', 'GitHub denied access to this account.');
        }
        return new PreviewError(401, 'auth', 'Check the server GITHUB_TOKEN permissions.');
      case 'notfound':
        return new PreviewError(404, 'not_found', 'GitHub account not found.');
      case 'ratelimit':
        return new PreviewError(429, 'rate_limit', 'GitHub rate limit reached. Try again later.');
      case 'timeout':
        return new PreviewError(504, 'timeout', 'GitHub request timed out. Try again.');
      case 'aborted':
        return new PreviewError(503, 'cancelled', 'Preview request was cancelled.');
      case 'http':
        return new PreviewError(
          error.status === 403 ? 403 : 502,
          'upstream',
          'GitHub request failed.',
        );
      case 'network':
      case 'invalidresponse':
      case 'configuration':
        return new PreviewError(502, 'upstream', 'GitHub data is temporarily unavailable.');
      default: {
        const exhaustive: never = error.code;
        return exhaustive;
      }
    }
  }
  return new PreviewError(500, 'internal', 'Unable to create this preview.');
}
