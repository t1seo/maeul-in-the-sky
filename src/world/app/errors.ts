export class WorldAppError extends Error {
  readonly name = 'WorldAppError';

  constructor(
    readonly code: 'initializing' | 'element' | 'empty' | 'unsupported' | 'capture',
    message: string,
  ) {
    super(message);
  }
}
