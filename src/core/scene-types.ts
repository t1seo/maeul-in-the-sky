import type { NormalizationSummary, ResolvedRenderSettings } from './render-options.js';
import type { ContributionStats } from './types.js';

export type SceneBounds = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type SceneBiome = {
  readonly isRiver: boolean;
  readonly isPond: boolean;
  readonly nearWater: boolean;
  readonly forestDensity: number;
};

export type RewardTier = 0 | 1 | 2 | 3 | 4 | 5;
export type PositiveRewardTier = Exclude<RewardTier, 0>;

export type ConsistencyTier = 0 | 1 | 2 | 3;

export type ConsistencyProgress = {
  readonly activeDays: number;
  readonly observedDays: number;
  readonly tier: ConsistencyTier;
};

export type ConsistencyEffectKind =
  'springPetals' | 'summerFireflies' | 'autumnLeaves' | 'winterFrost';

export type ConsistencyParticle = {
  readonly x: number;
  readonly y: number;
  readonly size: number;
};

export type SceneConsistencyEffect = {
  readonly id: string;
  readonly kind: ConsistencyEffectKind;
  readonly anchorDate: string;
  readonly week: number;
  readonly day: number;
  readonly cx: number;
  readonly cy: number;
  readonly tier: Exclude<ConsistencyTier, 0>;
  readonly activeDays: number;
  readonly particles: readonly ConsistencyParticle[];
  readonly footprint: SceneBounds;
};

export type SceneCell = {
  readonly date: string;
  readonly week: number;
  readonly day: number;
  readonly absoluteWeek: number;
  readonly count: number;
  readonly level100: number;
  readonly rewardTier?: RewardTier;
  readonly consistency?: ConsistencyProgress;
  readonly height: number;
  readonly isoX: number;
  readonly isoY: number;
};

export type SceneBiomeEntry = {
  readonly week: number;
  readonly day: number;
  readonly biome: SceneBiome;
};

export type ScenePlacement = {
  readonly id: string;
  readonly catalogId: string;
  readonly anchorDate: string;
  readonly week: number;
  readonly day: number;
  readonly cx: number;
  readonly cy: number;
  readonly footprint: SceneBounds;
  readonly drawOrder: number;
  readonly variant: number;
  readonly animated: boolean;
  readonly decorative?: boolean;
  readonly primary?: boolean;
  readonly rewardTier?: PositiveRewardTier;
};

export type SceneDailyReward = ScenePlacement & {
  readonly count: number;
  readonly rewardTier: PositiveRewardTier;
  readonly minimumCount: number;
};

export type WonderThreshold = {
  readonly metric: 'level100' | 'richness' | 'total' | 'longestStreak';
  readonly required: number;
  readonly current: number;
  readonly achieved: boolean;
};

export type SceneWonderPlacement = ScenePlacement & {
  readonly tier: 'rare' | 'epic' | 'legendary';
  readonly thresholds: readonly WonderThreshold[];
  readonly explanation: string;
};

export type NeighborhoodPath = {
  readonly id: string;
  readonly catalogId: string;
  readonly anchorDate: string;
  readonly week: number;
  readonly day: number;
  readonly footprint: SceneBounds;
  readonly drawOrder: number;
  readonly points: readonly { readonly x: number; readonly y: number }[];
};

export type LayoutSeedPolicy = {
  readonly root: string;
  readonly policy: 'username-date-v1' | 'username-date-v2' | 'username-date-v3';
};

export type TerrainScene = {
  readonly schemaVersion: 1;
  readonly layoutVersion: 1 | 2 | 3;
  readonly username: string;
  readonly year: number;
  readonly fromDate: string;
  readonly toDate: string;
  readonly settings: ResolvedRenderSettings;
  readonly normalization: NormalizationSummary;
  readonly stats: Readonly<ContributionStats>;
  readonly seed: LayoutSeedPolicy;
  readonly cells: readonly SceneCell[];
  readonly biomes: readonly SceneBiomeEntry[];
  readonly placements: readonly ScenePlacement[];
  readonly wonders: readonly SceneWonderPlacement[];
  readonly rewards?: readonly SceneDailyReward[];
  readonly consistencyEffects?: readonly SceneConsistencyEffect[];
  readonly neighborhoodPaths: readonly NeighborhoodPath[];
  readonly bounds: SceneBounds;
};

export type TerrainCellMetadata = {
  readonly date: string;
  readonly count: number;
  readonly week: number;
  readonly day: number;
  readonly level100: number;
  readonly rewardTier?: RewardTier;
  readonly consistency?: ConsistencyProgress;
  readonly biome: SceneBiome;
  readonly assetIds: readonly string[];
  readonly wonderIds: readonly string[];
  readonly rewardIds?: readonly string[];
  readonly consistencyEffectIds?: readonly string[];
};

export type TerrainMetadata = {
  readonly schemaVersion: 1;
  readonly layoutVersion: 1 | 2 | 3;
  readonly username: string;
  readonly year: number;
  readonly fromDate: string;
  readonly toDate: string;
  readonly dataDayCount: number;
  readonly missingDayCount: number;
  readonly stats: Readonly<ContributionStats>;
  readonly normalization: NormalizationSummary;
  readonly seed: LayoutSeedPolicy;
  readonly bounds: SceneBounds;
  readonly cells: readonly TerrainCellMetadata[];
  readonly placements: readonly ScenePlacement[];
  readonly wonders: readonly SceneWonderPlacement[];
  readonly rewards?: readonly SceneDailyReward[];
  readonly consistencyEffects?: readonly SceneConsistencyEffect[];
  readonly neighborhoodPaths: readonly NeighborhoodPath[];
};

export type TerrainRenderResult = {
  readonly dark: string;
  readonly light: string;
  readonly metadata: TerrainMetadata;
};
