import type { SnapshotV1 } from '../../core/snapshot-types.js';
import type { ContributionDay } from '../../core/types.js';
import type {
  ModelRecipe,
  Vec3,
  WorldActor,
  WorldActorSample,
  WorldBounds,
  WorldEntity,
  WorldIsland,
  WorldRange,
  WorldRegion,
  WorldRoute,
  WorldRouteNode,
  WorldSeason,
  WorldTerrain,
} from './geometry-types.js';
import type { PublicRepoRecord } from './repository-types.js';

export type * from './geometry-types.js';
export type * from './repository-types.js';

export type WorldSettings = {
  readonly layout: 'archipelago' | 'island' | 'seasonal';
  readonly layoutSeed: string;
  readonly hemisphere: 'north' | 'south';
  readonly culture: 'classic' | 'korean';
  readonly heightScale: { readonly kind: 'fixed'; readonly maxCount: 50 };
  readonly landUse: { readonly nature: 75; readonly town: 18; readonly city: 7 };
};

export type WorldInput = {
  readonly snapshot: SnapshotV1;
  readonly settings: WorldSettings;
  readonly repositories: readonly PublicRepoRecord[];
  readonly range?: WorldRange;
  readonly contextDays?: readonly Readonly<ContributionDay>[];
};

export type WorldConsistency = {
  readonly activeDays: number;
  readonly observedDays: number;
  readonly tier: 0 | 1 | 2 | 3;
  readonly complete: boolean;
};

export type WorldDay = {
  readonly id: string;
  readonly date: string;
  readonly tileId: string;
  readonly monthKey: string;
} & (
  | {
      readonly kind: 'observed';
      readonly count: number;
      readonly rewardTier: 0 | 1 | 2 | 3 | 4 | 5;
      readonly consistency: WorldConsistency;
    }
  | { readonly kind: 'missing' }
);

export type WorldEvent = {
  readonly id: string;
  readonly kind:
    'market' | 'harvest' | 'lanterns' | 'blossoms' | 'snow-lights' | 'release' | 'milestone';
  readonly anchorId: string;
  readonly startsOn: string;
  readonly endsOn?: string;
  readonly evidence: {
    readonly kind: 'consistency' | 'contributions' | 'release';
    readonly activeDays?: number;
    readonly observedDays?: number;
    readonly total?: number;
    readonly repoId?: string;
    readonly releaseId?: string;
  };
};

export type WorldDiscovery = {
  readonly id: string;
  readonly entityId: string;
  readonly catalogId?: string;
  readonly title: string;
  readonly description: string;
  readonly availableFrom: string;
};

export type WorldScene = {
  readonly schemaVersion: 1;
  readonly generatorVersion: 1;
  readonly modelVersion: 1;
  readonly worldId: string;
  readonly sourceDigest: string;
  readonly username: string;
  readonly year: number;
  readonly range: WorldRange;
  readonly settings: WorldSettings;
  readonly days: readonly WorldDay[];
  readonly islands: readonly WorldIsland[];
  readonly regions: readonly WorldRegion[];
  readonly terrain: WorldTerrain;
  readonly entities: readonly WorldEntity[];
  readonly routeNodes: readonly WorldRouteNode[];
  readonly routes: readonly WorldRoute[];
  readonly actors: readonly WorldActor[];
  readonly events: readonly WorldEvent[];
  readonly discoveries: readonly WorldDiscovery[];
  readonly modelRecipes: readonly ModelRecipe[];
  readonly bounds: WorldBounds;
};

export type WorldFocus =
  | { readonly kind: 'world' }
  | { readonly kind: 'month'; readonly monthKey: string }
  | { readonly kind: 'day'; readonly date: string }
  | { readonly kind: 'entity'; readonly entityId: string }
  | { readonly kind: 'actor'; readonly actorId: string };

export type WorldView = {
  readonly cursorDate: string;
  readonly seasonOverride: 'calendar' | WorldSeason;
  readonly lighting: 'day' | 'sunset' | 'night';
  readonly weather: 'seasonal' | 'clear' | 'rain' | 'snow';
  readonly motion: 'full' | 'subtle' | 'off';
  readonly quality: 'low' | 'high';
  readonly selectedId?: string;
  readonly followActorId?: string;
  readonly focus: WorldFocus;
  readonly camera: { readonly position: Vec3; readonly target: Vec3; readonly zoom: number };
  readonly elapsedSeconds: number;
};

export type WorldStats = {
  readonly totalContributions: number;
  readonly activeDays: number;
  readonly observedDays: number;
  readonly missingDays: number;
  readonly currentStreak: number;
  readonly longestStreak: number;
};

export type WorldFrame = {
  readonly cursorDate: string;
  readonly season: WorldSeason;
  readonly days: readonly WorldDay[];
  readonly terrain: WorldTerrain;
  readonly entities: readonly WorldEntity[];
  readonly routes: readonly WorldRoute[];
  readonly actors: readonly (WorldActor & WorldActorSample)[];
  readonly events: readonly WorldEvent[];
  readonly discoveries: readonly WorldDiscovery[];
  readonly stats: WorldStats;
};
