// Public API for programmatic usage
export { fetchContributions } from './api/client.js';
export { computeStats } from './core/stats.js';
export { generateTerrain } from './generate.js';
export { DEFAULT_VILLAGE_PRESET, isVillagePreset, VILLAGE_PRESETS } from './core/presets.js';
export { getTheme, listThemes, registerTheme } from './themes/registry.js';
export type { TerrainGenerationRequest, TerrainGenerationResult } from './generate.js';
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
