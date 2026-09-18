export type { EpicTier, EpicBuildingType, PlacedEpicBuilding } from './epics/types.js';
export { TIER_CONFIG, EPIC_BUILDINGS } from './epics/definitions.js';
export { EPIC_RENDERERS } from './epics/renderers.js';
export { selectEpicBuildings } from './epics/selection.js';
export {
  renderCatalogEpic,
  renderEpicBuildings,
  renderEpicGlowDefs,
  renderEpicCSS,
} from './epics/rendering.js';
export {
  EPIC_CATALOG,
  EPIC_CATALOG_COUNTS,
  getEpicCatalogEntry,
  isEpicBuildingType,
} from './epics/catalog.js';
export type { EpicCatalogEntry } from './epics/catalog.js';
export { getEpicGateThresholds, EPIC_STATS_RULES } from './epics/gates.js';
export type { EpicGateThreshold, EpicStatsRule } from './epics/gates.js';
