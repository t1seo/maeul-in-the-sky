import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { createAuthoredSource, type AuthoredSource } from './transforms.js';
import { AuthoredLoadError, authoredFileLimit, downloadAuthored } from './download.js';
import { disposeWildlifeModels } from '../wildlife/resources.js';

export type AuthoredModel = {
  readonly gltf: GLTF;
  readonly source: (node?: string) => AuthoredSource;
};
export type AuthoredLibrary = {
  readonly models: ReadonlyMap<string, AuthoredModel>;
  readonly dispose: () => void;
};

export async function loadAuthoredLibrary(
  files: readonly string[],
  baseUrl: URL,
  signal: AbortSignal,
): Promise<AuthoredLibrary> {
  signal.throwIfAborted();
  const requested = [...new Set(files)];
  requested.forEach(authoredFileLimit);
  const pending = new AbortController();
  const abort = (): void => pending.abort();
  signal.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, 20000);
  const models = new Map<string, AuthoredModel>();
  const parsed: GLTF[] = [];
  const sourceCaches: Map<string, AuthoredSource>[] = [];
  let failure: AuthoredLoadError | null = null;
  let disposed = false;
  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    disposeWildlifeModels(parsed);
    for (const cache of sourceCaches) cache.clear();
    parsed.length = 0;
    sourceCaches.length = 0;
    models.clear();
  };
  try {
    const loader = new GLTFLoader();
    const results = await Promise.allSettled(
      requested.map(async (file) => {
        try {
          const bytes = await downloadAuthored(file, baseUrl, pending.signal);
          pending.signal.throwIfAborted();
          const gltf = await loader.parseAsync(bytes, '');
          parsed.push(gltf);
          pending.signal.throwIfAborted();
          const cache = new Map<string, AuthoredSource>();
          sourceCaches.push(cache);
          cache.set('', createAuthoredSource(gltf.scene));
          const source = (node?: string): AuthoredSource => {
            if (disposed) throw new AuthoredLoadError();
            const key = node ?? '';
            const cached = cache.get(key);
            if (cached) return cached;
            const root = gltf.scene.getObjectByName(key);
            if (!root) throw new AuthoredLoadError();
            const result = createAuthoredSource(root);
            cache.set(key, result);
            return result;
          };
          models.set(file, { gltf, source });
        } catch (error) {
          const reason =
            error instanceof AuthoredLoadError
              ? error
              : new AuthoredLoadError(undefined, { cause: error });
          failure ??= reason;
          pending.abort();
          throw reason;
        }
      }),
    );
    signal.throwIfAborted();
    if (results.some((result) => result.status === 'rejected'))
      throw failure ?? new AuthoredLoadError();
    return { models, dispose };
  } catch (error) {
    dispose();
    throw error;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', abort);
  }
}
