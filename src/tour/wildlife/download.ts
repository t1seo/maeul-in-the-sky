import { z } from 'zod';

const MAX_MODEL_BYTES = 1024 * 1024;
const embeddedDocument = z.object({
  asset: z.object({ version: z.literal('2.0') }),
  buffers: z.array(z.object({ uri: z.never().optional() })),
  images: z.array(z.object({ uri: z.never().optional(), bufferView: z.number() })).optional(),
  extensionsRequired: z.array(z.never()).optional(),
});

export class WildlifeLoadError extends Error {
  constructor(message = 'The animal models could not load. Check your connection and try again.') {
    super(message);
    this.name = 'WildlifeLoadError';
  }
}

export function validateWildlifeGlb(buffer: ArrayBuffer): void {
  const view = new DataView(buffer);
  if (
    buffer.byteLength < 28 ||
    buffer.byteLength > MAX_MODEL_BYTES ||
    view.getUint32(0, true) !== 0x46546c67 ||
    view.getUint32(4, true) !== 2 ||
    view.getUint32(8, true) !== buffer.byteLength ||
    view.getUint32(16, true) !== 0x4e4f534a
  )
    throw new WildlifeLoadError();
  const end = 20 + view.getUint32(12, true);
  if (end > buffer.byteLength) throw new WildlifeLoadError();
  const json: unknown = JSON.parse(new TextDecoder().decode(buffer.slice(20, end)));
  if (!embeddedDocument.safeParse(json).success) throw new WildlifeLoadError();
}

export async function downloadWildlife(url: URL, signal: AbortSignal): Promise<ArrayBuffer> {
  const response = await fetch(url, { signal, credentials: 'omit' });
  if (!response.ok || !response.body) throw new WildlifeLoadError();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    if (Number(response.headers.get('content-length')) > MAX_MODEL_BYTES)
      throw new WildlifeLoadError();
    while (true) {
      signal.throwIfAborted();
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_MODEL_BYTES) throw new WildlifeLoadError();
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  validateWildlifeGlb(bytes.buffer);
  return bytes.buffer;
}
