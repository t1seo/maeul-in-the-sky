export type WorldDataErrorCode =
  | 'invalid_input'
  | 'unsupported_version'
  | 'too_large'
  | 'invalid_url'
  | 'unpublished'
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'stale'
  | 'rate_limit'
  | 'not_found'
  | 'private_repository'
  | 'storage'
  | 'quota'
  | 'replace_required'
  | 'library_full';

export class WorldDataError extends Error {
  readonly name = 'WorldDataError';

  constructor(
    readonly code: WorldDataErrorCode,
    message: string,
    readonly retryAt?: string,
  ) {
    super(message);
  }
}
