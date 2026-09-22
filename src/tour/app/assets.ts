import type { TourModel } from '../types.js';
import { requestedAuthored } from '../authored/catalog.js';
import { loadAuthoredLibrary } from '../authored/library.js';
import { loadWildlifeLibrary, requestedWildlife } from '../wildlife/library.js';

export async function loadTourAssets(model: TourModel, baseUrl: URL, signal: AbortSignal) {
  signal.throwIfAborted();
  const pending = new AbortController();
  const abort = (): void => pending.abort();
  signal.addEventListener('abort', abort, { once: true });
  let failure: unknown;
  const watch = async <T>(operation: Promise<T>): Promise<T> => {
    try {
      return await operation;
    } catch (error) {
      failure ??= error;
      pending.abort();
      throw error;
    }
  };
  try {
    const [wildlife, authored] = await Promise.allSettled([
      watch(loadWildlifeLibrary(requestedWildlife(model), baseUrl, pending.signal)),
      watch(loadAuthoredLibrary(requestedAuthored(model), baseUrl, pending.signal)),
    ]);
    if (signal.aborted || wildlife.status === 'rejected' || authored.status === 'rejected') {
      if (wildlife.status === 'fulfilled') wildlife.value.dispose();
      if (authored.status === 'fulfilled') authored.value.dispose();
      signal.throwIfAborted();
      throw failure;
    }
    let disposed = false;
    return {
      wildlife: wildlife.value,
      authored: authored.value,
      dispose: (): void => {
        if (disposed) return;
        disposed = true;
        wildlife.value.dispose();
        authored.value.dispose();
      },
    };
  } finally {
    signal.removeEventListener('abort', abort);
  }
}

export type TourAssets = Awaited<ReturnType<typeof loadTourAssets>>;
