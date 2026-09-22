import { afterEach, expect, it, vi } from 'vitest';
import { loadTourAssets } from '../../src/tour/app/assets.js';
import { loadTourModel } from '../../src/tour/model/load.js';
import { loadWildlifeLibrary, type WildlifeLibrary } from '../../src/tour/wildlife/library.js';
import { loadAuthoredLibrary, type AuthoredLibrary } from '../../src/tour/authored/library.js';

vi.mock('../../src/tour/wildlife/library.js', () => ({
  loadWildlifeLibrary: vi.fn(),
  requestedWildlife: () => ['cow'],
}));
vi.mock('../../src/tour/authored/library.js', () => ({ loadAuthoredLibrary: vi.fn() }));
vi.mock('../../src/tour/authored/catalog.js', () => ({
  requestedAuthored: () => ['nature/nature-collection.glb'],
}));

afterEach(() => vi.resetAllMocks());
const baseUrl = new URL('https://example.github.io/tour/models/');

it('owns both successful libraries and disposes their shared resources only once', async () => {
  const { model } = await loadTourModel({ pageUrl: 'https://example.github.io/tour/' });
  const wildlife: WildlifeLibrary = { models: new Map(), dispose: vi.fn() };
  const authored: AuthoredLibrary = { models: new Map(), dispose: vi.fn() };
  vi.mocked(loadWildlifeLibrary).mockResolvedValue(wildlife);
  vi.mocked(loadAuthoredLibrary).mockResolvedValue(authored);
  const assets = await loadTourAssets(model, baseUrl, new AbortController().signal);
  expect(assets.wildlife).toBe(wildlife);
  expect(assets.authored).toBe(authored);
  assets.dispose();
  assets.dispose();
  expect(wildlife.dispose).toHaveBeenCalledTimes(1);
  expect(authored.dispose).toHaveBeenCalledTimes(1);
});

it('disposes a late successful library after the other download fails', async () => {
  const { model } = await loadTourModel({ pageUrl: 'https://example.github.io/tour/' });
  const wildlife: WildlifeLibrary = { models: new Map(), dispose: vi.fn() };
  const failure = new Error('Missing detailed trees');
  let finish = (): void => {};
  let siblingSignal: AbortSignal | undefined;
  vi.mocked(loadWildlifeLibrary).mockImplementation((_species, _base, signal) => {
    siblingSignal = signal;
    return new Promise((resolve) => {
      finish = () => resolve(wildlife);
    });
  });
  vi.mocked(loadAuthoredLibrary).mockRejectedValue(failure);
  const pending = loadTourAssets(model, baseUrl, new AbortController().signal);
  const rejected = expect(pending).rejects.toBe(failure);
  await vi.waitFor(() => expect(siblingSignal?.aborted).toBe(true));
  finish();
  await rejected;
  expect(wildlife.dispose).toHaveBeenCalledTimes(1);
});

it('discards complete but stale libraries after cancellation', async () => {
  const { model } = await loadTourModel({ pageUrl: 'https://example.github.io/tour/' });
  const controller = new AbortController();
  const wildlife: WildlifeLibrary = { models: new Map(), dispose: vi.fn() };
  const authored: AuthoredLibrary = { models: new Map(), dispose: vi.fn() };
  vi.mocked(loadWildlifeLibrary).mockResolvedValue(wildlife);
  vi.mocked(loadAuthoredLibrary).mockImplementation(async () => {
    controller.abort();
    return authored;
  });
  await expect(loadTourAssets(model, baseUrl, controller.signal)).rejects.toThrow();
  expect(wildlife.dispose).toHaveBeenCalledTimes(1);
  expect(authored.dispose).toHaveBeenCalledTimes(1);
});
