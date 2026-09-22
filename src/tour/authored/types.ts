import type { ModelPart, Vec3, WorldSeason } from '../../world/model/geometry-types.js';
import type { TourAsset, TourPlacement } from '../types.js';
import type { WindProfile } from '../render/wind-profiles.js';

export type AuthoredPart = {
  readonly file: string;
  readonly node?: string;
  readonly height: number;
  readonly maxSpan: number;
  readonly offset?: Vec3;
  readonly yaw?: number;
  readonly wind?: WindProfile;
  readonly foliageMaterials?: readonly string[];
  readonly foliageColor?: string;
  readonly season?: WorldSeason;
};

export type AuthoredDefinition = {
  readonly parts: readonly AuthoredPart[];
  readonly retainedParts: readonly ModelPart[];
  readonly collider?: TourAsset['collider'];
};

export type AuthoredMapping = (
  placement: TourPlacement,
  fallback: TourAsset,
) => AuthoredDefinition | null;
