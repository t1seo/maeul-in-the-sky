import type { PositiveRewardTier } from '../../../core/scene-types.js';
import type { IsoCell } from '../blocks.js';
import type { AssetSelectionOptions, AssetType, PlacedAsset } from './types.js';
import { seededRandom } from '../../../utils/math.js';
import { getSeasonZone, getZonePeakSeason } from '../seasons.js';
import { dateSeasonZone } from '../scene/season.js';
import { assetDateSeed } from './date-seed.js';
import { mapVillageAsset } from './style-pool.js';
import { getDailyRewardTier } from './progression.js';
import { dailyPrimaryPool } from './progression-pool.js';

type PrimaryFamily = Readonly<Record<PositiveRewardTier, AssetType>>;

const MEADOW_FAMILIES: readonly PrimaryFamily[] = [
  { 1: 'flower', 2: 'appleTree', 3: 'hut', 4: 'house', 5: 'castle' },
  { 1: 'bush', 2: 'deciduous', 3: 'hut', 4: 'houseB', 5: 'manor' },
  { 1: 'flower', 2: 'birch', 3: 'hut', 4: 'house', 5: 'cathedral' },
];
const FOREST_FAMILY: PrimaryFamily = {
  1: 'fern',
  2: 'pine',
  3: 'hut',
  4: 'houseB',
  5: 'manor',
};
const WATER_FAMILY: PrimaryFamily = {
  1: 'pondLily',
  2: 'boat',
  3: 'sailboat',
  4: 'bridge',
  5: 'watermill',
};

function seasonalPrimary(
  type: AssetType,
  tier: PositiveRewardTier,
  cell: IsoCell,
  options: AssetSelectionOptions,
): AssetType {
  const zone =
    cell.date && options.hemisphere
      ? dateSeasonZone(cell.date, options.hemisphere)
      : getSeasonZone(cell.week, options.seasonRotation ?? 0);
  const season = getZonePeakSeason(zone);
  if (tier === 1) {
    if (season === 'winter') return 'bareBush';
    if (season === 'spring') return 'crocus';
    if (season === 'autumn') return 'harvestBasket';
  }
  if (tier === 2) {
    if (season === 'winter') return type === 'pine' ? 'snowPine' : 'snowDeciduous';
    if (season === 'spring') return 'cherryBlossomSmall';
    if (season === 'autumn') return type === 'birch' ? 'autumnBirch' : 'autumnMaple';
  }
  if (season === 'winter' && type === 'house') return 'houseWinter';
  if (season === 'winter' && type === 'houseB') return 'houseBWinter';
  return type;
}

export function dailyPrimaryPlacement(
  cell: IsoCell,
  key: string,
  seed: number,
  options: AssetSelectionOptions,
): PlacedAsset | undefined {
  const tier = getDailyRewardTier(cell.count ?? 0);
  if (tier === 0) return undefined;
  const biome = options.biomeMap?.get(`${cell.week},${cell.day}`);
  const water = biome?.isPond || biome?.isRiver;
  const familyDraw = seededRandom(assetDateSeed(seed, key, 'primary-family'))();
  const family = water
    ? WATER_FAMILY
    : biome && biome.forestDensity > 0.55
      ? FOREST_FAMILY
      : MEADOW_FAMILIES[Math.floor(familyDraw * MEADOW_FAMILIES.length)];
  const zone =
    cell.date && options.hemisphere
      ? dateSeasonZone(cell.date, options.hemisphere)
      : getSeasonZone(cell.week, options.seasonRotation ?? 0);
  const pool = dailyPrimaryPool(tier, getZonePeakSeason(zone), biome);
  const choice = seededRandom(assetDateSeed(seed, key, 'primary-catalog'));
  const base =
    tier < 5 && pool.length > 0 && choice() < 0.75
      ? pool[Math.floor(choice() * pool.length)]
      : water
        ? family[tier]
        : seasonalPrimary(family[tier], tier, cell, options);
  const mapped = mapVillageAsset(base, options.villageStyle ?? 'classic');
  const type = tier < 5 && mapped === 'hanokEstate' ? 'hanok' : mapped;
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
