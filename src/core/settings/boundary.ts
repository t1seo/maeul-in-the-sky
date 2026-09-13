import { z } from 'zod';
import { InputValidationError } from './errors.js';

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
export const MAX_CONTRIBUTION_DAYS = 20_000;
export const MAX_ARCHIVE_SNAPSHOTS = 20;

export function readJsonInput(input: unknown): unknown {
  let json: string | undefined;
  try {
    json = typeof input === 'string' ? input : JSON.stringify(input);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    throw new InputValidationError([{ path: '$', message: 'Expected JSON-compatible input' }]);
  }
  if (
    json !== undefined &&
    (json.length > MAX_IMPORT_BYTES || new TextEncoder().encode(json).length > MAX_IMPORT_BYTES)
  ) {
    throw new InputValidationError([{ path: '$', message: 'Import exceeds 2 MiB limit' }]);
  }
  if (typeof input !== 'string') return input;
  try {
    const parsed: unknown = JSON.parse(input);
    return parsed;
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    throw new InputValidationError([{ path: '$', message: 'Malformed JSON' }]);
  }
}

export function parseBoundary<T>(schema: z.ZodType<T>, input: unknown, prefix = ''): T {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  throw new InputValidationError(
    result.error.issues.map((issue) => ({
      path: [prefix, ...issue.path.map(String)].filter(Boolean).join('.') || '$',
      message: issue.message,
    })),
  );
}
