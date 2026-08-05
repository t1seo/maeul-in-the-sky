// Public API for programmatic usage
export { fetchContributions } from './api/client.js';
export { computeStats } from './core/stats.js';
export { generateTerrain } from './generate.js';
export { getTheme, listThemes, registerTheme } from './themes/registry.js';
export type { TerrainGenerationRequest, TerrainGenerationResult } from './generate.js';
export type { ContributionData, Theme, ThemeOutput, ThemeOptions } from './core/types.js';
