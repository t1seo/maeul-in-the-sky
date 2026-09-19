export class WorldModelError extends Error {
  readonly name = 'WorldModelError';
  constructor(
    readonly code: 'INVALID_WORLD' | 'INVALID_INPUT',
    message: string,
  ) {
    super(message);
  }
}
