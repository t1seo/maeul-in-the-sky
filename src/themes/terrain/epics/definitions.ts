import { passesEpicStatsGate } from './gates.js';
import type { ContributionStats } from '../../../core/types.js';
import type { EpicTier, EpicBuildingType } from './types.js';

interface TierConfig {
  minLevel: number;
  minRichness: number;
  baseChance: number;
  glowColor: string;
  statsGate: (stats: ContributionStats) => boolean;
}

export const TIER_CONFIG: Record<EpicTier, TierConfig> = {
  rare: {
    minLevel: 88,
    minRichness: 0.45,
    baseChance: 0.018,
    glowColor: '#FFD700',
    statsGate: (s) => passesEpicStatsGate('rare', s),
  },
  epic: {
    minLevel: 93,
    minRichness: 0.55,
    baseChance: 0.008,
    glowColor: '#9B59B6',
    statsGate: (s) => passesEpicStatsGate('epic', s),
  },
  legendary: {
    minLevel: 97,
    minRichness: 0.65,
    baseChance: 0.003,
    glowColor: '#00CED1',
    statsGate: (s) => passesEpicStatsGate('legendary', s),
  },
};

interface EpicBuildingDef {
  type: EpicBuildingType;
  tier: EpicTier;
}

export const EPIC_BUILDINGS: EpicBuildingDef[] = [
  // Rare (14) — 9 natural, 5 landmark
  { type: 'mountFuji', tier: 'rare' },
  { type: 'colosseum', tier: 'rare' },
  { type: 'giantSequoia', tier: 'rare' },
  { type: 'coralReef', tier: 'rare' },
  { type: 'pagoda', tier: 'rare' },
  { type: 'torii', tier: 'rare' },
  { type: 'geyser', tier: 'rare' },
  { type: 'hotSpring', tier: 'rare' },
  { type: 'eiffelTower', tier: 'rare' },
  { type: 'grandCanyon', tier: 'rare' },
  { type: 'windmillGrand', tier: 'rare' },
  { type: 'oasis', tier: 'rare' },
  { type: 'volcano', tier: 'rare' },
  { type: 'giantMushroom', tier: 'rare' },
  // Epic (10) — 7 natural, 3 landmark
  { type: 'aurora', tier: 'epic' },
  { type: 'tajMahal', tier: 'epic' },
  { type: 'giantWaterfall', tier: 'epic' },
  { type: 'stBasils', tier: 'epic' },
  { type: 'bambooGrove', tier: 'epic' },
  { type: 'operaHouse', tier: 'epic' },
  { type: 'glacierPeak', tier: 'epic' },
  { type: 'bioluminescentPool', tier: 'epic' },
  { type: 'meteorCrater', tier: 'epic' },
  { type: 'bonsaiGiant', tier: 'epic' },
  // Legendary (6) — 5 natural, 1 structure
  { type: 'floatingIsland', tier: 'legendary' },
  { type: 'crystalSpire', tier: 'legendary' },
  { type: 'dragonNest', tier: 'legendary' },
  { type: 'worldTree', tier: 'legendary' },
  { type: 'sakuraEternal', tier: 'legendary' },
  { type: 'ancientPortal', tier: 'legendary' },
];
