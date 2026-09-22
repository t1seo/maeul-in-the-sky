import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Mesh } from 'three';
import { loadAuthoredLibrary, type AuthoredLibrary } from '../../src/tour/authored/library.js';
import { AuthoredLoadError } from '../../src/tour/authored/download.js';
import { authoredFixtureBytes } from './authored-fixture.js';

const base = new URL('https://example.github.io/tour/models/');
const owned: AuthoredLibrary[] = [];
let bytes: ArrayBuffer;
beforeAll(async () => {
  bytes = await authoredFixtureBytes();
});
afterEach(() => {
  owned.splice(0).forEach((library) => library.dispose());
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('authored library lifetime', () => {
  it('loads each file once, resolves named roots and releases shared geometry once', async () => {
    // Given a genuine embedded GLB with two separately named source roots.
    const fetcher = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => new Response(bytes));
    // When a duplicate requested filename is loaded and its roots are selected.
    const library = await loadAuthoredLibrary(
      ['tree.glb', 'tree.glb'],
      base,
      new AbortController().signal,
    );
    owned.push(library);
    const model = library.models.get('tree.glb');
    if (!model) throw new TypeError('Expected loaded model');
    const oak = model.source('Oak');
    const birch = model.source('Birch');
    const geometry = oak.meshes[0]?.geometry;
    const dispose = vi.fn();
    geometry?.addEventListener('dispose', dispose);
    // Then each root has its own transform, shared data and exact disposal ownership.
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(oak).toBe(model.source('Oak'));
    expect(birch.bounds.min.x - oak.bounds.min.x).toBe(10);
    expect(birch.meshes[0]?.geometry).toBe(geometry);
    expect(() => model.source('Missing')).toThrow(AuthoredLoadError);
    library.dispose();
    library.dispose();
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(library.models.size).toBe(0);
    expect(() => model.source('Oak')).toThrow(AuthoredLoadError);
  });

  it('supports an empty inventory without fetching', async () => {
    // Given a scene that has no external static replacements.
    const fetcher = vi.spyOn(globalThis, 'fetch');
    // When its empty library loads.
    const library = await loadAuthoredLibrary([], base, new AbortController().signal);
    owned.push(library);
    // Then the scene may use its original fallback without network work.
    expect(library.models.size).toBe(0);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('disposes a parsed GLB that completes after its request became stale', async () => {
    // Given a cancellation arriving while GLTFLoader finishes parsing.
    const controller = new AbortController();
    const disposed = vi.fn();
    const parse = GLTFLoader.prototype.parseAsync;
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(bytes));
    vi.spyOn(GLTFLoader.prototype, 'parseAsync').mockImplementation(async function (
      this: GLTFLoader,
      input,
      path,
    ) {
      const result = await parse.call(this, input, path);
      result.scene.traverse((object) => {
        if (object instanceof Mesh) object.geometry.addEventListener('dispose', disposed);
      });
      controller.abort();
      return result;
    });
    // When the stale load settles.
    await expect(loadAuthoredLibrary(['tree.glb'], base, controller.signal)).rejects.toThrow();
    // Then shared geometry is disposed despite never reaching the renderer.
    expect(disposed).toHaveBeenCalledTimes(1);
  });

  it('bounds a stalled request at twenty seconds', async () => {
    // Given a transport which waits until the supplied request signal aborts.
    vi.useFakeTimers();
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    );
    // When the library deadline expires.
    const failed = expect(
      loadAuthoredLibrary(['tree.glb'], base, new AbortController().signal),
    ).rejects.toBeInstanceOf(AuthoredLoadError);
    await vi.advanceTimersByTimeAsync(20000);
    // Then loading is recoverable instead of remaining pending forever.
    await failed;
  });
});
