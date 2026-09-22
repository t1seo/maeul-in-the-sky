import type { ModelPart, WorldSeason } from '../../world/model/geometry-types.js';
import type { Variant } from '../../world/model/recipes/primitives.js';
import type { TourAsset } from '../types.js';

export type TourRecipeBuilder = (variant: Variant) => readonly ModelPart[];
export type AssetDefinition = {
  readonly build: TourRecipeBuilder;
  readonly kind: TourAsset['kind'];
  readonly scale: number;
  readonly footprint: readonly [number, number] | null;
  readonly season?: WorldSeason;
};
