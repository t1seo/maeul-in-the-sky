import type {
  NeighborhoodPath,
  SceneCell,
  ScenePlacement,
  TerrainScene,
} from '../core/scene-types.js';
import type { ModelRecipe, Vec3, WorldSeason } from '../world/model/geometry-types.js';

export type TourCell = {
  readonly source: SceneCell;
  readonly x: number;
  readonly z: number;
  readonly depth: number;
  readonly surface: 'grass' | 'snow' | 'earth' | 'water' | 'ice';
  readonly season: WorldSeason;
};

export type TourPlacement = {
  readonly source: ScenePlacement;
  readonly position: Vec3;
  readonly season: WorldSeason;
  readonly kind: 'asset' | 'wonder';
};

export type TourPath = {
  readonly source: NeighborhoodPath;
  readonly points: readonly Vec3[];
};

export type TourFall = {
  readonly position: Vec3;
  readonly edge: 'left' | 'right';
  readonly drop: number;
  readonly date: string;
};

export type TourStop = {
  readonly id: WorldSeason;
  readonly label: string;
  readonly date: string;
  readonly position: Vec3;
};

export type TourModel = {
  readonly scene: TerrainScene;
  readonly cellSize: 4;
  readonly cells: readonly TourCell[];
  readonly placements: readonly TourPlacement[];
  readonly paths: readonly TourPath[];
  readonly falls: readonly TourFall[];
  readonly stops: readonly TourStop[];
  readonly bounds: {
    readonly minX: number;
    readonly maxX: number;
    readonly minZ: number;
    readonly maxZ: number;
  };
};

export type TourAsset = {
  readonly recipe: ModelRecipe;
  readonly label: string;
  readonly kind: 'building' | 'plant' | 'prop' | 'wonder';
  readonly scale: number;
  readonly collider: { readonly halfX: number; readonly halfZ: number } | null;
};
