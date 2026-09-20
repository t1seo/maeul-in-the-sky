import { ASSET_CATALOG, EPIC_CATALOG } from '../browser.js';
import type { TerrainCellMetadata, TerrainMetadata } from '../core/scene-types.js';
import { DAILY_REWARD_MINIMUMS } from '../themes/terrain/assets/progression.js';

const LANDSCAPE_DESCRIPTIONS = {
  sand: 'on the coast',
  meadow: 'in the meadow',
  forest: 'in the forest',
  rock: 'in the mountains',
  snow: 'among snowy peaks',
  wetland: 'in the wetlands',
  dry: 'in dry grassland',
} as const;

export function describeDay(cell: TerrainCellMetadata, metadata: TerrainMetadata): string {
  const biome = cell.biome.isRiver
    ? 'by the river'
    : cell.biome.landscapeBiome
      ? LANDSCAPE_DESCRIPTIONS[cell.biome.landscapeBiome]
      : cell.biome.isPond
        ? 'by the pond'
        : cell.biome.forestDensity > 0.5
          ? 'in the forest'
          : 'on the hillside';
  const catalog = new Map(
    [...ASSET_CATALOG, ...EPIC_CATALOG].map((entry) => [String(entry.id), entry.displayName]),
  );
  const placements = new Map(
    [...metadata.placements, ...metadata.wonders].map((placement) => [
      placement.id,
      placement.catalogId,
    ]),
  );
  const names = [
    ...new Set(
      [...cell.assetIds, ...cell.wonderIds].flatMap((id) => {
        const name = catalog.get(placements.get(id) ?? id);
        return name ? [name] : [];
      }),
    ),
  ];
  const reward =
    cell.rewardTier === undefined
      ? ''
      : cell.rewardTier === 0
        ? ' · No daily reward'
        : ` · Daily reward ${cell.rewardTier}/5 (${DAILY_REWARD_MINIMUMS[cell.rewardTier]}+ contributions)`;
  const consistency = cell.consistency
    ? ` · Consistency ${cell.consistency.tier}/3 (${cell.consistency.activeDays} active days in trailing 28 days; ${cell.consistency.observedDays} supplied)`
    : '';
  return `${cell.date} · ${cell.count.toLocaleString()} contribution${cell.count === 1 ? '' : 's'} ${biome}${reward}${consistency}${names.length ? ` · ${names.join(', ')}` : ''}.`;
}

export function showDay(
  target: HTMLElement,
  cell: TerrainCellMetadata,
  metadata: TerrainMetadata,
): void {
  target.textContent = describeDay(cell, metadata);
  target.dataset.date = cell.date;
  target.dataset.week = String(cell.week);
  target.dataset.day = String(cell.day);
  target.dataset.count = String(cell.count);
  if (cell.rewardTier === undefined) delete target.dataset.rewardTier;
  else target.dataset.rewardTier = String(cell.rewardTier);
  if (cell.consistency) {
    target.dataset.consistencyTier = String(cell.consistency.tier);
    target.dataset.consistencyActiveDays = String(cell.consistency.activeDays);
    target.dataset.consistencyObservedDays = String(cell.consistency.observedDays);
  } else {
    delete target.dataset.consistencyTier;
    delete target.dataset.consistencyActiveDays;
    delete target.dataset.consistencyObservedDays;
  }
}
