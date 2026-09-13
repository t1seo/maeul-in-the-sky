import type { IsoCell } from '../blocks.js';
import type { BiomeContext } from '../biomes.js';
import type { ContributionStats } from '../../../core/types.js';
import { seededRandom } from '../../../utils/math.js';
import { assetCellIdentity, assetDateSeed } from '../assets/date-seed.js';
import { computeRichness } from '../assets/richness.js';
import { TIER_CONFIG, EPIC_BUILDINGS } from './definitions.js';
import type { EpicTier, PlacedEpicBuilding } from './types.js';

const MAX_EPIC_BUDGET = 3;
const MIN_MANHATTAN_DISTANCE = 3;

function manhattanDistance(a: PlacedEpicBuilding, w: number, d: number): number {
  return Math.abs(a.week - w) + Math.abs(a.day - d);
}

/**
 * Select epic buildings for the terrain.
 * Uses a 3-gate system: cell level, neighborhood richness, global stats.
 * Returns placed epic buildings (max 3) and a set of occupied cell keys.
 */
export function selectEpicBuildings(
  isoCells: IsoCell[],
  seed: number,
  stats: ContributionStats,
  biomeMap?: Map<string, BiomeContext>,
): { placed: PlacedEpicBuilding[]; epicCells: Set<string> } {
  const placed: PlacedEpicBuilding[] = [];
  const epicCells = new Set<string>();

  // Build cell lookup map
  const cellMap = new Map<string, IsoCell>();
  for (const cell of isoCells) {
    cellMap.set(`${cell.week},${cell.day}`, cell);
  }

  // Pre-check which tiers pass the global stats gate (Gate 3)
  const passedTiers = new Set<EpicTier>();
  for (const tier of ['legendary', 'epic', 'rare'] as const) {
    if (TIER_CONFIG[tier].statsGate(stats)) {
      passedTiers.add(tier);
    }
  }

  // Filter buildings to only those whose tier passed the stats gate
  const eligibleBuildings = EPIC_BUILDINGS.filter((b) => passedTiers.has(b.tier));
  if (eligibleBuildings.length === 0) return { placed, epicCells };

  // Compute streak bonus multiplier
  let streakMultiplier = 1.0;
  if (stats.currentStreak >= 30) streakMultiplier = 1.44;
  else if (stats.currentStreak >= 7) streakMultiplier = 1.15;

  const shuffled = [...isoCells].sort(
    (a, b) =>
      assetDateSeed(seed, assetCellIdentity(a), 'wonder-priority') -
      assetDateSeed(seed, assetCellIdentity(b), 'wonder-priority'),
  );

  for (const cell of shuffled) {
    if (placed.length >= MAX_EPIC_BUDGET) break;

    const key = `${cell.week},${cell.day}`;
    const identity = assetCellIdentity(cell);
    const rng = seededRandom(assetDateSeed(seed, identity, 'wonder'));
    if (cell.count === 0 || cell.level100 === 0) continue;

    // Skip water/river cells
    const biome = biomeMap?.get(key);
    if (biome?.isRiver || biome?.isPond) continue;

    // Anti-clustering: check distance from all placed epics
    const tooClose = placed.some(
      (p) => manhattanDistance(p, cell.week, cell.day) < MIN_MANHATTAN_DISTANCE,
    );
    if (tooClose) continue;

    // Gate 1: Find highest eligible tier for this cell's level
    const richness = computeRichness(cell, cellMap);

    // Try tiers from highest to lowest (legendary first for rarity priority)
    for (const tier of ['legendary', 'epic', 'rare'] as const) {
      if (!passedTiers.has(tier)) continue;
      const config = TIER_CONFIG[tier];

      // Gate 1: Cell level
      if (cell.level100 < config.minLevel) continue;

      // Gate 2: Neighborhood richness
      if (richness < config.minRichness) continue;

      // Compute final chance with richness bonus and streak multiplier
      const richnessExcess = richness - config.minRichness;
      const richnessBonus = 1 + Math.min(richnessExcess * 2, 0.5); // max +50%
      const finalChance = config.baseChance * richnessBonus * streakMultiplier;

      if (rng() < finalChance) {
        // Pick a random building of this tier
        const tierBuildings = eligibleBuildings.filter((b) => b.tier === tier);
        const building = tierBuildings[Math.floor(rng() * tierBuildings.length)];
        placed.push({
          id: `wonder:${identity}`,
          ...(cell.date ? { date: cell.date } : {}),
          catalogId: building.type,
          type: building.type,
          tier,
          week: cell.week,
          day: cell.day,
          cx: cell.isoX,
          cy: cell.isoY,
        });
        epicCells.add(key);
        break; // Move to next cell
      }
      break; // Only try the highest eligible tier per cell
    }
  }

  return { placed, epicCells };
}
