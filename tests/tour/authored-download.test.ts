import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AuthoredLoadError,
  authoredFileLimit,
  downloadAuthored,
  validateAuthoredGlb,
} from '../../src/tour/authored/download.js';

const base = new URL('https://example.github.io/tour/models/');
afterEach(() => vi.restoreAllMocks());

function glb(extra: Record<string, unknown> = {}): ArrayBuffer {
  const document = { asset: { version: '2.0' }, buffers: [{ byteLength: 4 }], ...extra };
  const json = new TextEncoder().encode(JSON.stringify(document));
  const length = Math.ceil(json.length / 4) * 4;
  const buffer = new ArrayBuffer(28 + length + 4);
  const view = new DataView(buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, buffer.byteLength, true);
  view.setUint32(12, length, true);
  view.setUint32(16, 0x4e4f534a, true);
  new Uint8Array(buffer, 20, length).fill(32);
  new Uint8Array(buffer, 20, json.length).set(json);
  view.setUint32(20 + length, 4, true);
  view.setUint32(24 + length, 0x004e4942, true);
  return buffer;
}

describe('local authored model download boundary', () => {
  it('allows a larger named nature collection while bounding ordinary files', () => {
    // Given the only reviewed multi-model collection.
    // When its download budget is selected.
    expect(authoredFileLimit('nature/nature-collection.glb')).toBe(4 * 1024 * 1024);
    // Then other filenames retain the smaller individual budget.
    expect(authoredFileLimit('village/house.glb')).toBe(1024 * 1024);
  });

  it.each([
    '../cow.glb',
    '/house.glb',
    'https://other.test/a.glb',
    'x/../a.glb',
    'a.glb?q=1',
    'a%2fb.glb',
    'a\\b.glb',
    'a//b.glb',
    'a.bin',
  ])('rejects unsafe local model path %s before a request', async (file) => {
    // Given an untrusted file path and an observable transport seam.
    const fetcher = vi.spyOn(globalThis, 'fetch');
    // When it attempts to escape the model inventory.
    await expect(downloadAuthored(file, base, new AbortController().signal)).rejects.toBeInstanceOf(
      AuthoredLoadError,
    );
    // Then no network request occurs.
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('loads an embedded GLB from the local base without credentials or redirects', async () => {
    // Given an embedded GLB response.
    const bytes = glb();
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(bytes));
    const signal = new AbortController().signal;
    // When the model is downloaded.
    const actual = await downloadAuthored('nature/oak.glb', base, signal);
    // Then the original bytes and local request policy are retained.
    expect(actual).toEqual(bytes);
    expect(fetcher).toHaveBeenCalledWith(new URL('nature/oak.glb', base), {
      signal,
      credentials: 'omit',
      redirect: 'error',
    });
  });

  it.each([
    { buffers: [{ byteLength: 4, uri: 'https://remote.test/data.bin' }] },
    { images: [{ uri: 'https://remote.test/leaf.png' }] },
    { images: [{ uri: 'data:image/png;base64,aaa', bufferView: 0 }] },
    { extensionsRequired: ['KHR_draco_mesh_compression'] },
    { asset: { version: '1.0' } },
    { buffers: [{ byteLength: 999999 }] },
  ])('rejects remote, unsupported or inconsistent GLB resources %j', (document) => {
    // Given an invalid embedded resource declaration.
    const bytes = glb(document);
    // When it crosses the GLB boundary, no loader is allowed to see it.
    expect(() => validateAuthoredGlb(bytes, 'house.glb')).toThrow(AuthoredLoadError);
  });

  it('rejects truncated chunks and malformed JSON before GLTFLoader receives them', () => {
    // Given byte containers whose header, chunk or JSON is incomplete.
    const malformed = glb();
    new Uint8Array(malformed)[20] = 0;
    const truncated = glb().slice(0, -4);
    const extra = new Uint8Array(glb().byteLength + 4).buffer;
    // When the containers are parsed at the trust boundary.
    for (const bytes of [new ArrayBuffer(0), malformed, truncated, extra]) {
      // Then each is a recoverable model error.
      expect(() => validateAuthoredGlb(bytes, 'house.glb')).toThrow(AuthoredLoadError);
    }
  });

  it('rejects declared and streamed oversize files and non-success responses', async () => {
    // Given each download-level failure independently.
    const fetcher = vi.spyOn(globalThis, 'fetch');
    for (const response of [
      new Response('', { status: 404 }),
      new Response(null),
      new Response('x', { headers: { 'content-length': '1048577' } }),
      new Response(new Uint8Array(1048577)),
    ]) {
      fetcher.mockResolvedValueOnce(response);
      // When the bounded downloader reads it.
      await expect(
        downloadAuthored('house.glb', base, new AbortController().signal),
      ).rejects.toBeInstanceOf(AuthoredLoadError);
    }
  });

  it('does not start a request after cancellation', async () => {
    // Given an already cancelled model load.
    const fetcher = vi.spyOn(globalThis, 'fetch');
    const controller = new AbortController();
    controller.abort();
    // When the downloader is entered.
    await expect(downloadAuthored('house.glb', base, controller.signal)).rejects.toThrow();
    // Then the transport remains unused.
    expect(fetcher).not.toHaveBeenCalled();
  });
});
