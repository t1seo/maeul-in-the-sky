import { readFile } from 'node:fs/promises';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadWildlife, validateWildlifeGlb } from '../../src/tour/wildlife/download.js';
import { wildlifeSpecies } from '../../src/tour/wildlife/catalog.js';
import { vegetationWind } from '../../src/tour/render/vegetation.js';

afterEach(() => vi.restoreAllMocks());
const url = new URL('https://example.github.io/tour/models/squirrel.glb');

async function squirrel(): Promise<ArrayBuffer> {
  return new Uint8Array(await readFile('docs/demo/tour/models/squirrel.glb')).buffer;
}

function glbDocument(document: unknown): ArrayBuffer {
  const json = new TextEncoder().encode(JSON.stringify(document));
  const buffer = new ArrayBuffer(20 + json.byteLength);
  const view = new DataView(buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, buffer.byteLength, true);
  view.setUint32(12, json.byteLength, true);
  view.setUint32(16, 0x4e4f534a, true);
  new Uint8Array(buffer, 20).set(json);
  return buffer;
}

describe('self-contained wildlife assets', () => {
  it('downloads a genuine GLB as bytes without credentials', async () => {
    const bytes = await squirrel();
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(bytes));
    const signal = new AbortController().signal;
    expect(await downloadWildlife(url, signal)).toEqual(bytes);
    expect(fetcher).toHaveBeenCalledWith(url, { signal, credentials: 'omit' });
  });

  it('rejects broken headers, JSON, remote buffers, textures and decoder dependencies', async () => {
    const valid = await squirrel();
    expect(() => validateWildlifeGlb(valid)).not.toThrow();
    for (const bytes of [new ArrayBuffer(0), valid.slice(0, 100), new ArrayBuffer(50)])
      expect(() => validateWildlifeGlb(bytes)).toThrow();
    for (const extra of [
      { buffers: [{ uri: 'https://other.example/model.bin' }] },
      { images: [{ uri: 'https://other.example/texture.png' }] },
      { extensionsRequired: ['KHR_draco_mesh_compression'] },
      { asset: { version: '1.0' } },
    ]) {
      expect(() =>
        validateWildlifeGlb(glbDocument({ asset: { version: '2.0' }, buffers: [{}], ...extra })),
      ).toThrow();
    }
  });

  it('bounds declared and streamed sizes, and honors cancellation', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    for (const response of [
      new Response('', { status: 404 }),
      new Response(null),
      new Response('x', { headers: { 'content-length': '1048577' } }),
      new Response(new Uint8Array(1048577)),
    ]) {
      fetcher.mockResolvedValueOnce(response);
      await expect(downloadWildlife(url, new AbortController().signal)).rejects.toThrow();
    }
    fetcher.mockResolvedValueOnce(new Response(await squirrel()));
    const controller = new AbortController();
    controller.abort();
    await expect(downloadWildlife(url, controller.signal)).rejects.toThrow();
  });

  it('maps genuine species aliases and only bends explicitly known vegetation', () => {
    expect(wildlifeSpecies('pigpen')).toBe('pig');
    expect(wildlifeSpecies('lamb')).toBe('sheep');
    expect(wildlifeSpecies('goat')).toBe('goat');
    for (const id of [
      'deciduous',
      'bambooThicket',
      'snowPine',
      'cherryBlossomFull',
      'cedarGrove',
      'appleTree',
      'gardenTree',
    ])
      expect(vegetationWind(id)).toBe('tree');
    expect(vegetationWind('fern')).toBe('shrub');
    expect(vegetationWind('bush')).toBe('shrub');
    expect(vegetationWind('cattail')).toBe('reed');
    expect(vegetationWind('reeds')).toBe('reed');
    expect(vegetationWind('sunflower')).toBe('flower');
    for (const id of [
      'pond',
      'willowPond',
      'rock',
      'coral',
      'rice',
      'orchard',
      'meadow',
      'house',
      'cow',
    ])
      expect(vegetationWind(id)).toBe('none');
  });
});
