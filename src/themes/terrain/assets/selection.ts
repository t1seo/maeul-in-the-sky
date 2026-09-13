import type { IsoCell } from '../blocks.js';
import type { BiomeContext } from '../biomes.js';
import { seededRandom } from '../../../utils/math.js';
import { getSeasonalPoolOverrides } from '../seasons.js';
import type { AssetSelectionOptions, PlacedAsset, AssetType, AssetPool } from './types.js';
import { getEffectiveLevel, getLevelPool100 } from './level-pool.js';
import { blendWithBiome } from './biome-pool.js';
import { applyVillageStyle } from './style-pool.js';
import { assetCellIdentity, assetDateSeed, dateSeasonWeek } from './date-seed.js';
import { isAssetType } from './catalog.js';

const SMIL_TYPES: ReadonlySet<AssetType> = new Set([
  'seagull',
  'waves',
  'bird',
  'windmill',
  'smoke',
  'fountain',
  'watermill',
  'jellyfish',
  'turtle',
  'butterfly',
  'bakery',
  'clocktower',
  'campfire',
]);
const CSS_TYPES: ReadonlySet<AssetType> = new Set(['cattail', 'tallGrass', 'laundry']);

function poolForCell(cell: IsoCell, options: AssetSelectionOptions): AssetPool {
  const level = getEffectiveLevel(cell.count === 0 ? 0 : cell.level100, options.density ?? 5);
  let pool = getLevelPool100(level);
  // Zero activity can have bare-ground decoration, never seasonal/biome settlement additions.
  if (cell.count === 0 || cell.level100 === 0) return pool;
  const biome = options.biomeMap?.get(`${cell.week},${cell.day}`);
  if (biome) pool = blendWithBiome(pool, biome, level);
  const seasonalWeek =
    cell.date && options.hemisphere ? dateSeasonWeek(cell.date, options.hemisphere) : undefined;
  if (seasonalWeek !== undefined || options.seasonRotation !== undefined) {
    const { add, remove } = getSeasonalPoolOverrides(
      seasonalWeek ?? cell.week,
      seasonalWeek === undefined ? options.seasonRotation : 0,
      level,
    );
    pool = {
      types: [...pool.types.filter((type) => !remove.has(type)), ...add.filter(isAssetType)],
      chance: pool.chance,
    };
  }
  return applyVillageStyle(pool, options.villageStyle ?? 'classic');
}

/** Date, cell conditions and explicit options determine identity; palette and traversal order do not. */
export function selectAssetPlacements(
  isoCells: readonly IsoCell[],
  seed: number,
  options: AssetSelectionOptions = {},
): PlacedAsset[] {
  const assets: PlacedAsset[] = [];
  const dates = new Map<string, number>();
  for (const cell of isoCells) {
    const key = assetCellIdentity(cell);
    dates.set(key, (dates.get(key) ?? 0) + 1);
  }
  for (const cell of isoCells) {
    if (options.excludeCells?.has(`${cell.week},${cell.day}`)) continue;
    const identity = assetCellIdentity(cell);
    // Compatibility for manually constructed/duplicate-date grids; valid calendars use date alone.
    const key = (dates.get(identity) ?? 0) > 1 ? `${identity}:${cell.week},${cell.day}` : identity;
    const rng = seededRandom(assetDateSeed(seed, key, 'selection'));
    const variants = seededRandom(assetDateSeed(options.variantSeed ?? seed, key, 'variant'));
    const pool = poolForCell(cell, options);
    const abundance = cell.count === 0 ? 0 : cell.level100 / 99;
    if (rng() >= pool.chance + abundance * 0.2 || pool.types.length === 0) continue;
    const slots = cell.count !== 0 && cell.level100 >= 43 && rng() < 0.4 ? 2 : 1;
    for (let slot = 0; slot < slots; slot++) {
      const type = pool.types[Math.floor(rng() * pool.types.length)];
      assets.push({
        id: `asset:${key}:${slot}`,
        date: cell.date,
        catalogId: type,
        cell,
        type,
        cx: cell.isoX,
        cy: cell.isoY,
        ox: (rng() - 0.5) * (slot === 0 ? 3 : 4),
        oy: (rng() - 0.5) * (slot === 0 ? 1.5 : 2),
        variant: Math.floor(variants() * 3),
        animated: false,
      });
    }
  }
  // Budget ranking never changes selected types or variants. Range changes may redistribute motion.
  const smil = new Set(
    assets
      .filter((a) => SMIL_TYPES.has(a.type))
      .sort((a, b) => assetDateSeed(seed, a.id, 'motion') - assetDateSeed(seed, b.id, 'motion'))
      .slice(0, 18)
      .map((a) => a.id),
  );
  const css = new Set(
    assets
      .filter((a) => CSS_TYPES.has(a.type))
      .sort((a, b) => assetDateSeed(seed, a.id, 'motion') - assetDateSeed(seed, b.id, 'motion'))
      .slice(0, 15)
      .map((a) => a.id),
  );
  const smoke = new Set(
    assets
      .filter((a) => a.type === 'smoke' && smil.has(a.id))
      .sort((a, b) => a.id.localeCompare(b.id))
      .slice(0, 8)
      .map((a) => a.id),
  );
  return assets
    .map((a) => ({
      ...a,
      animated: (smil.has(a.id) || css.has(a.id)) && (a.type !== 'smoke' || smoke.has(a.id)),
    }))
    .sort(
      (a, b) =>
        a.cell.week + a.cell.day - (b.cell.week + b.cell.day) ||
        a.cell.week - b.cell.week ||
        a.id.localeCompare(b.id),
    );
}

export function selectAssets(
  isoCells: IsoCell[],
  seed: number,
  variantSeed?: number,
  biomeMap?: Map<string, BiomeContext>,
  seasonRotation?: number,
  density: number = 5,
  excludeCells?: Set<string>,
  options: AssetSelectionOptions = {},
): PlacedAsset[] {
  return selectAssetPlacements(isoCells, seed, {
    ...options,
    variantSeed,
    biomeMap,
    seasonRotation,
    density,
    excludeCells,
  });
}
