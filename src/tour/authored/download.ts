import { z } from 'zod';

const embeddedDocument = z.object({
  asset: z.object({ version: z.literal('2.0') }),
  buffers: z
    .array(z.object({ byteLength: z.number().int().positive(), uri: z.never().optional() }))
    .length(1),
  bufferViews: z
    .array(
      z.object({
        buffer: z.literal(0),
        byteOffset: z.number().int().nonnegative().optional(),
        byteLength: z.number().int().positive(),
      }),
    )
    .optional(),
  images: z
    .array(z.object({ uri: z.never().optional(), bufferView: z.number().int().nonnegative() }))
    .optional(),
  extensionsRequired: z.array(z.never()).optional(),
});

export class AuthoredLoadError extends Error {
  constructor(
    message = 'The village models could not load. Check your connection and try again.',
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'AuthoredLoadError';
  }
}

export function authoredFileLimit(file: string): number {
  if (!/^(?:[a-z\d][a-z\d_-]*\/)*[a-z\d][a-z\d_-]*\.glb$/iu.test(file))
    throw new AuthoredLoadError();
  return (file === 'nature/nature-collection.glb' ? 4 : 1) * 1024 * 1024;
}

export function validateAuthoredGlb(buffer: ArrayBuffer, file: string): void {
  const limit = authoredFileLimit(file);
  if (buffer.byteLength < 32 || buffer.byteLength > limit) throw new AuthoredLoadError();
  const view = new DataView(buffer);
  if (
    view.getUint32(0, true) !== 0x46546c67 ||
    view.getUint32(4, true) !== 2 ||
    view.getUint32(8, true) !== buffer.byteLength ||
    view.getUint32(16, true) !== 0x4e4f534a
  )
    throw new AuthoredLoadError();
  const length = view.getUint32(12, true);
  const binaryStart = 20 + length;
  if (
    length % 4 !== 0 ||
    binaryStart + 8 > buffer.byteLength ||
    view.getUint32(binaryStart + 4, true) !== 0x004e4942
  )
    throw new AuthoredLoadError();
  const binaryLength = view.getUint32(binaryStart, true);
  if (binaryLength % 4 !== 0 || binaryStart + 8 + binaryLength !== buffer.byteLength)
    throw new AuthoredLoadError();
  let json: unknown;
  try {
    json = JSON.parse(new TextDecoder().decode(buffer.slice(20, binaryStart)));
  } catch (error) {
    if (error instanceof SyntaxError) throw new AuthoredLoadError();
    throw error;
  }
  const result = embeddedDocument.safeParse(json);
  if (!result.success) throw new AuthoredLoadError();
  const document = result.data;
  const declared = document.buffers[0]?.byteLength ?? 0;
  if (declared > binaryLength || binaryLength - declared > 3) throw new AuthoredLoadError();
  for (const item of document.bufferViews ?? []) {
    if ((item.byteOffset ?? 0) + item.byteLength > declared) throw new AuthoredLoadError();
  }
  for (const image of document.images ?? []) {
    if (!document.bufferViews?.[image.bufferView]) throw new AuthoredLoadError();
  }
}

export async function downloadAuthored(
  file: string,
  baseUrl: URL,
  signal: AbortSignal,
): Promise<ArrayBuffer> {
  const limit = authoredFileLimit(file);
  signal.throwIfAborted();
  const response = await fetch(new URL(file, baseUrl), {
    signal,
    credentials: 'omit',
    redirect: 'error',
  });
  if (!response.ok || !response.body) throw new AuthoredLoadError();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let cancellationFailed: boolean;
  try {
    if (Number(response.headers.get('content-length')) > limit) throw new AuthoredLoadError();
    while (true) {
      signal.throwIfAborted();
      const { done, value } = await reader.read();
      signal.throwIfAborted();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new AuthoredLoadError();
      chunks.push(value);
    }
  } finally {
    const [cancelled] = await Promise.allSettled([reader.cancel()]);
    reader.releaseLock();
    cancellationFailed = cancelled.status === 'rejected' && !signal.aborted;
  }
  if (cancellationFailed) throw new AuthoredLoadError();
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  validateAuthoredGlb(bytes.buffer, file);
  return bytes.buffer;
}
