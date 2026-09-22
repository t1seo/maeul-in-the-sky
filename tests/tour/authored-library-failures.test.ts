import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { Mesh } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { loadAuthoredLibrary } from '../../src/tour/authored/library.js';
import { AuthoredLoadError } from '../../src/tour/authored/download.js';
import { authoredFixtureBytes } from './authored-fixture.js';

const base = new URL('https://example.github.io/tour/models/');
let bytes: ArrayBuffer;
beforeAll(async () => {
  bytes = await authoredFixtureBytes();
});
afterEach(() => vi.restoreAllMocks());

it('cleans a completed sibling after another file fails and preserves the first model error', async () => {
  // Given one completed parse followed by a failed second download.
  let failSecond: ((response: Response) => void) | undefined;
  const failedResponse = new Promise<Response>((resolve) => {
    failSecond = resolve;
  });
  const disposed = vi.fn();
  const parse = GLTFLoader.prototype.parseAsync;
  vi.spyOn(globalThis, 'fetch').mockImplementation((input) =>
    String(input).endsWith('first.glb') ? Promise.resolve(new Response(bytes)) : failedResponse,
  );
  vi.spyOn(GLTFLoader.prototype, 'parseAsync').mockImplementation(async function (
    this: GLTFLoader,
    input,
    path,
  ) {
    const result = await parse.call(this, input, path);
    result.scene.traverse((object) => {
      if (object instanceof Mesh) object.geometry.addEventListener('dispose', disposed);
    });
    failSecond?.(new Response('', { status: 404 }));
    return result;
  });
  // When the whole inventory settles after the partial failure.
  await expect(
    loadAuthoredLibrary(['first.glb', 'second.glb'], base, new AbortController().signal),
  ).rejects.toBeInstanceOf(AuthoredLoadError);
  // Then parsed resources are disposed exactly once before rejecting the library.
  expect(disposed).toHaveBeenCalledTimes(1);
});

it('rejects a malicious inventory before starting any safe sibling downloads', async () => {
  // Given a valid filename followed by a traversal attempt.
  const fetcher = vi.spyOn(globalThis, 'fetch');
  // When the full inventory reaches the library boundary.
  await expect(
    loadAuthoredLibrary(['first.glb', '../second.glb'], base, new AbortController().signal),
  ).rejects.toBeInstanceOf(AuthoredLoadError);
  // Then no partial work started before the inventory was accepted.
  expect(fetcher).not.toHaveBeenCalled();
});

it('retains the original useful failure when aborting the other model requests', async () => {
  // Given an actionable model error and another pending request.
  const reason = new AuthoredLoadError('The prepared model is incomplete.');
  vi.spyOn(globalThis, 'fetch').mockImplementation((input, options) => {
    if (String(input).endsWith('broken.glb')) return Promise.reject(reason);
    return new Promise((_resolve, reject) => {
      options?.signal?.addEventListener(
        'abort',
        () => reject(new DOMException('Cancelled sibling', 'AbortError')),
        { once: true },
      );
    });
  });
  // When failure cancellation reaches the sibling requests.
  const result = loadAuthoredLibrary(
    ['broken.glb', 'pending.glb'],
    base,
    new AbortController().signal,
  );
  // Then the useful first error is not replaced by the resulting abort exception.
  await expect(result).rejects.toBe(reason);
});

it('does not attach load work when its owner has already cancelled', async () => {
  // Given a stale owner and a valid model request.
  const controller = new AbortController();
  controller.abort();
  const fetcher = vi.spyOn(globalThis, 'fetch');
  // When its library is requested.
  await expect(loadAuthoredLibrary(['first.glb'], base, controller.signal)).rejects.toThrow();
  // Then no model resources or requests were created.
  expect(fetcher).not.toHaveBeenCalled();
});
