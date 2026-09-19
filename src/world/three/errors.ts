export type ThreeErrorCode = 'unavailable' | 'context-lost' | 'disposed' | 'capture' | 'export';

export class ThreeRendererError extends Error {
  override readonly name = 'ThreeRendererError';

  constructor(
    readonly code: ThreeErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

export function renderFailure(error: unknown): Error {
  return error instanceof Error
    ? error
    : new ThreeRendererError('unavailable', 'The 3D view could not continue.', { cause: error });
}
