export { computeStats } from './core/stats.js';
export { DEFAULT_VILLAGE_PRESET, isVillagePreset, VILLAGE_PRESETS } from './core/presets.js';
export { getTheme, listThemes, registerTheme } from './themes/registry.js';
export { prepareTerrainScene, renderTerrain, renderTerrainScene } from './themes/terrain/index.js';
export type { TerrainRenderOptions, TerrainSceneRenderOptions } from './themes/terrain/index.js';
export {
  ASSET_CATALOG,
  ASSET_CATALOG_COUNTS,
  renderCatalogAsset,
  getAssetCatalogEntry,
  isAssetType,
} from './themes/terrain/assets.js';
export {
  EPIC_CATALOG,
  EPIC_CATALOG_COUNTS,
  getEpicCatalogEntry,
  isEpicBuildingType,
  renderCatalogEpic,
} from './themes/terrain/epics.js';
export {
  createSnapshot,
  parseSettings,
  parseSnapshot,
  snapshotToContributionData,
} from './core/settings/parse.js';
export { resolveRenderSettings } from './core/settings/resolve.js';
export { InputValidationError, type ValidationIssue } from './core/settings/errors.js';
export { serializeSettings, serializeSnapshot } from './core/settings/serialize.js';
export { parseArchive } from './core/archive/parse.js';
export {
  computeSharedNormalization,
  createArchive,
  selectComparisonSnapshots,
  upsertArchiveSnapshot,
} from './core/archive/comparison.js';
export { serializeArchive } from './core/archive/serialize.js';
export type { VillagePreset } from './core/presets.js';
export type {
  ColorMode,
  ContributionData,
  ContributionDay,
  ContributionStats,
  ContributionWeek,
  Theme,
  ThemeOutput,
  ThemeOptions,
} from './core/types.js';
export type {
  ArtStyle,
  Hemisphere,
  MotionMode,
  NormalizationOptions,
  NormalizationSummary,
  RenderSettingsInput,
  ResolvedRenderSettings,
  TerrainLayout,
  VillageStyle,
} from './core/render-options.js';
export type {
  TerrainCellMetadata,
  TerrainMetadata,
  TerrainRenderResult,
  TerrainScene,
  SceneCell,
  RewardTier,
  PositiveRewardTier,
  ConsistencyTier,
  ConsistencyProgress,
  ConsistencyEffectKind,
  ConsistencyParticle,
  SceneConsistencyEffect,
  SceneDailyReward,
  ScenePlacement,
  SceneWonderPlacement,
} from './core/scene-types.js';
export type { ArchiveV1, SettingsV1, SnapshotSource, SnapshotV1 } from './core/snapshot-types.js';
export type { ActivityBreakdown, ActivityMonth } from './core/activity-types.js';
