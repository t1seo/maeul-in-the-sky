import { Box3, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type { TourModel } from '../types.js';
import { wildlifeSpecies, type WildlifeSpecies } from './catalog.js';
import { downloadWildlife, WildlifeLoadError } from './download.js';
import { disposeWildlifeModels } from './resources.js';

export type WildlifeModel = {
  readonly gltf: GLTF;
  readonly bounds: Box3;
  readonly height: number;
};

export type WildlifeLibrary = {
  readonly models: ReadonlyMap<WildlifeSpecies, WildlifeModel>;
  readonly dispose: () => void;
};

export function requestedWildlife(model: TourModel): WildlifeSpecies[] {
  const species = new Set<WildlifeSpecies>();
  for (const placement of model.placements) {
    const id = wildlifeSpecies(placement.source.catalogId);
    if (id) species.add(id);
  }
  return [...species];
}

export async function loadWildlifeLibrary(
  species: readonly WildlifeSpecies[],
  baseUrl: URL,
  signal: AbortSignal,
): Promise<WildlifeLibrary> {
  const pending = new AbortController();
  const abort = (): void => pending.abort();
  signal.addEventListener('abort', abort, { once: true });
  if (signal.aborted) pending.abort();
  const timeout = setTimeout(abort, 20000);
  const loader = new GLTFLoader();
  const models = new Map<WildlifeSpecies, WildlifeModel>();
  const parsed: GLTF[] = [];
  let disposed = false;
  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    disposeWildlifeModels(parsed);
    models.clear();
  };
  try {
    const results = await Promise.allSettled(
      [...new Set(species)].map(async (id) => {
        try {
          const bytes = await downloadWildlife(new URL(`${id}.glb`, baseUrl), pending.signal);
          pending.signal.throwIfAborted();
          const gltf = await loader.parseAsync(bytes, '');
          parsed.push(gltf);
          pending.signal.throwIfAborted();
          gltf.scene.updateMatrixWorld(true);
          const bounds = new Box3().setFromObject(gltf.scene, true);
          const height = bounds.getSize(new Vector3()).y;
          if (!Number.isFinite(height) || height <= 0) throw new WildlifeLoadError();
          gltf.scene.traverse((object) => {
            if (!(object instanceof Mesh)) return;
            object.castShadow = true;
            object.receiveShadow = true;
            for (const material of Array.isArray(object.material)
              ? object.material
              : [object.material]) {
              if (material instanceof MeshStandardMaterial) {
                material.roughness = 0.92;
                material.metalness = 0;
              }
            }
          });
          models.set(id, { gltf, bounds, height });
        } catch (error) {
          pending.abort();
          throw error;
        }
      }),
    );
    const failed = results.find((result) => result.status === 'rejected');
    if (failed) throw new WildlifeLoadError();
    signal.throwIfAborted();
    return { models, dispose };
  } catch (error) {
    dispose();
    throw error;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', abort);
  }
}
