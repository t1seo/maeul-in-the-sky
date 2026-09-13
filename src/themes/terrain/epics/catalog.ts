import { describeEpicStatsGate, EPIC_STATS_RULES, type EpicStatsRule } from './gates.js';
import type { AssetBounds } from '../assets/types.js';
import { TIER_CONFIG, EPIC_BUILDINGS } from './definitions.js';
import { EPIC_RENDERERS } from './renderers.js';
import { EPIC_BOUNDS } from './bounds.js';
import { WONDER_DESCRIPTIONS } from './descriptions.js';
import type { EpicTier, EpicBuildingType } from './types.js';

export interface EpicCatalogEntry {
  readonly id: EpicBuildingType;
  readonly type: EpicBuildingType;
  readonly displayName: string;
  readonly description: string;
  readonly category: 'nature' | 'landmark' | 'fantasy';
  readonly tier: EpicTier;
  readonly bounds: AssetBounds;
  readonly style: 'wonder';
  readonly season: 'all';
  readonly gate: {
    readonly minLevel: number;
    readonly minRichness: number;
    readonly baseChance: number;
    readonly statsDescription: string;
    readonly stats: EpicStatsRule;
  };
}

export function isEpicBuildingType(value: string): value is EpicBuildingType {
  return Object.hasOwn(EPIC_RENDERERS, value);
}

export const EPIC_CATALOG: readonly EpicCatalogEntry[] = EPIC_BUILDINGS.map(({ type, tier }) => {
  const [displayName, category, description] = WONDER_DESCRIPTIONS[type];
  const config = TIER_CONFIG[tier];
  return {
    id: type,
    type,
    tier,
    displayName,
    category,
    description,
    bounds: EPIC_BOUNDS[type],
    style: 'wonder',
    season: 'all',
    gate: {
      minLevel: config.minLevel,
      minRichness: config.minRichness,
      baseChance: config.baseChance,
      statsDescription: describeEpicStatsGate(tier),
      stats: EPIC_STATS_RULES[tier],
    },
  };
});

export function getEpicCatalogEntry(type: EpicBuildingType): EpicCatalogEntry {
  return EPIC_CATALOG_BY_ID[type];
}
const EPIC_CATALOG_BY_ID: Readonly<Record<string, EpicCatalogEntry>> = Object.fromEntries(
  EPIC_CATALOG.map((entry) => [entry.id, entry]),
);
export const EPIC_CATALOG_COUNTS = Object.freeze({
  total: EPIC_CATALOG.length,
  rare: EPIC_CATALOG.filter((entry) => entry.tier === 'rare').length,
  epic: EPIC_CATALOG.filter((entry) => entry.tier === 'epic').length,
  legendary: EPIC_CATALOG.filter((entry) => entry.tier === 'legendary').length,
});
export { getEpicGateThresholds } from './gates.js';
