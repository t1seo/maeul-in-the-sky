import { WorldDataError } from './errors.js';

export const MAX_WORLD_BYTES = 8 * 1024 * 1024;

export function readWorldJson(input: unknown, limit = MAX_WORLD_BYTES): unknown {
  try {
    const text = typeof input === 'string' ? input : JSON.stringify(input);
    if (text === undefined)
      throw new WorldDataError('invalid_input', 'Choose a JSON world, snapshot or archive.');
    if (text.length > limit || new TextEncoder().encode(text).length > limit)
      throw new WorldDataError('too_large', `JSON exceeds the ${limit / 1024 / 1024} MiB limit.`);
    const parsed: unknown = JSON.parse(text);
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof TypeError || error instanceof RangeError)
      throw new WorldDataError('invalid_input', 'The file is not valid JSON.');
    throw error;
  }
}

export async function readBoundedText(
  stream: ReadableStream<Uint8Array> | null,
  limit: number,
  signal?: AbortSignal,
): Promise<string> {
  return (await readBoundedResponse(stream, limit, signal)).text;
}

export async function readBoundedResponse(
  stream: ReadableStream<Uint8Array> | null,
  limit: number,
  signal?: AbortSignal,
): Promise<{ readonly text: string; readonly byteLength: number }> {
  if (signal?.aborted) throw new WorldDataError('cancelled', 'World loading was cancelled.');
  if (!stream) throw new WorldDataError('invalid_input', 'The response has no JSON body.');
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let abort = (): void => undefined;
  const interrupted = new Promise<never>((_resolve, reject) => {
    abort = () => reject(new WorldDataError('cancelled', 'World loading was cancelled.'));
  });
  signal?.addEventListener('abort', abort, { once: true });
  let complete = false;
  let bytes = 0;
  let text = '';
  try {
    while (true) {
      const chunk = await Promise.race([reader.read(), interrupted]);
      if (chunk.done) {
        complete = true;
        return { text: text + decoder.decode(), byteLength: bytes };
      }
      bytes += chunk.value.byteLength;
      if (bytes > limit)
        throw new WorldDataError('too_large', `JSON exceeds the ${limit / 1024 / 1024} MiB limit.`);
      text += decoder.decode(chunk.value, { stream: true });
    }
  } finally {
    signal?.removeEventListener('abort', abort);
    if (!complete) await Promise.allSettled([reader.cancel()]);
    reader.releaseLock();
  }
}

export function freezeWorldValue<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) freezeWorldValue(child);
    Object.freeze(value);
  }
  return value;
}
