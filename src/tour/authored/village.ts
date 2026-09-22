import type { AuthoredMapping } from './types.js';
import { VILLAGE_MODELS, villagePart } from './village-models.js';
import { onggiParts, villageDetails } from './village-details.js';

export const villageAsset: AuthoredMapping = (placement, fallback) => {
  const id = placement.source.catalogId;
  if (id === 'onggi') return { parts: onggiParts(), retainedParts: [] };
  if (id === 'haystack') {
    return {
      parts: [-0.37, 0.37].map((x) =>
        villagePart('hay', 1.15, 0.85, { offset: { x, y: 0, z: 0 }, yaw: x < 0 ? 0.1 : -0.15 }),
      ),
      retainedParts: [],
    };
  }
  const model = VILLAGE_MODELS.get(id);
  if (!model) return null;
  return {
    parts: [
      villagePart(
        model.file,
        model.height,
        model.span,
        model.yaw === undefined ? {} : { yaw: model.yaw },
      ),
    ],
    retainedParts: villageDetails(id, fallback),
    collider: model.collider === undefined ? fallback.collider : model.collider,
  };
};
