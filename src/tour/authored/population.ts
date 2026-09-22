import type { ModelPart } from '../../world/model/geometry-types.js';
import type { GeometryResources } from '../../world/three/geometry/resources.js';
import type { TourAsset, TourModel } from '../types.js';
import type { ForestWind } from '../render/wind.js';
import type { AuthoredLibrary } from './library.js';
import { createTourAsset } from '../assets/index.js';
import { authoredAsset } from './catalog.js';
import { createAuthoredBatches } from './batches.js';
import { AuthoredLoadError } from './download.js';

export function createAuthoredPopulation(
  model: TourModel,
  library: AuthoredLibrary | undefined,
  resources: GeometryResources,
  wind?: ForestWind,
) {
  const batches = createAuthoredBatches(resources, wind);
  const placements = new Set<string>();
  const retainedParts = new Map<string, readonly ModelPart[]>();
  const colliders = new Map<string, TourAsset['collider']>();
  const files = new Set<string>();
  let disposed = false;
  try {
    if (library) {
      for (const placement of model.placements) {
        const fallback = createTourAsset(
          placement.source.catalogId,
          placement.source.variant,
          placement.season,
        );
        const definition = authoredAsset(placement, fallback);
        if (!definition) continue;
        if (definition.parts.length === 0) throw new AuthoredLoadError();
        for (const part of definition.parts) {
          const source = library.models.get(part.file);
          if (!source) throw new AuthoredLoadError();
          batches.add(source.source(part.node), part, placement);
          files.add(part.file);
        }
        placements.add(placement.source.id);
        retainedParts.set(placement.source.id, definition.retainedParts);
        if (definition.collider !== undefined)
          colliders.set(placement.source.id, definition.collider);
      }
    }
    batches.finish();
  } catch (error) {
    batches.dispose();
    throw error;
  }
  return {
    root: batches.root,
    identities: batches.identities,
    placements,
    retainedParts,
    colliders,
    inspect: () => ({ count: placements.size, files: [...files], ...batches.inspect() }),
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      batches.dispose();
      placements.clear();
      retainedParts.clear();
      colliders.clear();
      files.clear();
    },
  };
}
