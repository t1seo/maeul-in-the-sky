import type { IsoCell } from '../blocks.js';
import type { AssetSelectionOptions, PlacedAsset } from './types.js';
import { seededRandom } from '../../../utils/math.js';
import { getSeasonZone, getZonePeakSeason } from '../seasons.js';
import { datePeakSeason } from '../scene/season.js';
import { assetDateSeed } from './date-seed.js';
import { getDailyRewardTier } from './progression.js';
import { dailyPrimaryPool } from './progression-pool.js';
import { isNaturePrimary } from './primary-nature.js';
import { primaryFocalSite, spatialPrimaryType } from './primary-spatial.js';

export function dailyPrimaryPlacement(
  cell: IsoCell,
  key: string,
  seed: number,
  options: AssetSelectionOptions,
): PlacedAsset | undefined {
  const tier = getDailyRewardTier(cell.count ?? 0);
  if (tier === 0) return undefined;
  const biome = options.biomeMap?.get(`${cell.week},${cell.day}`);
  const season = cell.date
    ? datePeakSeason(cell.date, options.hemisphere ?? 'north')
    : getZonePeakSeason(getSeasonZone(cell.week, options.seasonRotation ?? 0));
  const pool = dailyPrimaryPool(tier, season, biome, options.villageStyle);
  const nature = pool.filter(isNaturePrimary);
  const focal = pool.filter((type) => !isNaturePrimary(type));
  const candidates = focal.length > 0 && primaryFocalSite(cell, seed) ? focal : nature;
  const type = spatialPrimaryType(candidates, cell, key, seed);
  const variant = Math.floor(
    seededRandom(assetDateSeed(options.variantSeed ?? seed, key, 'primary-variant'))() * 3,
  );
  return {
    id: `asset:${key}:0`,
    date: cell.date,
    catalogId: type,
    type,
    cell,
    cx: cell.isoX,
    cy: cell.isoY,
    ox: 0,
    oy: 0,
    variant,
    animated: false,
  };
}
