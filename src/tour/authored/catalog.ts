import { createTourAsset } from '../assets/index.js';
import type { TourModel } from '../types.js';
import type { AuthoredMapping } from './types.js';
import { natureAsset } from './nature.js';
import { villageAsset } from './village.js';

export const authoredAsset: AuthoredMapping = (placement, fallback) =>
  natureAsset(placement, fallback) ?? villageAsset(placement, fallback);

export function requestedAuthored(model: TourModel): string[] {
  const files = new Set<string>();
  for (const placement of model.placements) {
    const fallback = createTourAsset(
      placement.source.catalogId,
      placement.source.variant,
      placement.season,
    );
    const definition = authoredAsset(placement, fallback);
    for (const part of definition?.parts ?? []) files.add(part.file);
  }
  return [...files];
}
