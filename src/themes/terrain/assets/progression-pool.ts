import type { PositiveRewardTier } from '../../../core/scene-types.js';
import type { BiomeContext } from '../biomes.js';
import type { AssetCatalogEntry, AssetType, VillageStyle } from './types.js';
import type { PeakSeason } from '../seasons.js';
import { ASSET_CATALOG } from './catalog.js';
import { getSeasonalPoolOverrides } from '../seasons.js';
import { mapVillageAsset } from './style-pool.js';
import { isNaturePrimary } from './primary-nature.js';

const GRAND = new Set<AssetType>(['castle', 'cathedral', 'manor']);
const HOMES = new Set<AssetType>([
  'house',
  'houseB',
  'houseWinter',
  'houseBWinter',
  'church',
  'churchWinter',
  'windmill',
  'watermill',
  'lighthouse',
  'tavern',
]);
const GROVE = new Set<AssetType>([
  'pine',
  'deciduous',
  'willow',
  'palm',
  'birch',
  'gardenTree',
  'snowPine',
  'snowDeciduous',
  'cherryBlossom',
  'cherryBlossomFull',
  'peachBlossom',
  'autumnMaple',
  'autumnOak',
  'autumnBirch',
  'autumnGinkgo',
]);
const LANDMARK_NATURE = new Set<AssetType>([
  'cedarGrove',
  'ancientOak',
  'wildflowerMeadow',
  'bambooThicket',
  'alpineRocks',
  'orchard',
  'gardenTree',
  'snowPine',
  'snowDeciduous',
  'cherryBlossomFull',
  'peachBlossom',
  'autumnOak',
  'autumnGinkgo',
]);
const SMALL_NATURE = new Set<AssetType>([
  'bird',
  'owl',
  'squirrel',
  'mushroom',
  'moss',
  'fern',
  'spider',
  'butterfly',
  'berryBush',
  'log',
  'stump',
  'rabbit',
  'frog',
  'heron',
  'chicken',
  'scarecrow',
  'scarecrowAutumn',
  'laundry',
  'doghouse',
  'birdhouse',
]);
const RURAL_NATURE = new Set<AssetType>([
  'cow',
  'sheep',
  'horse',
  'donkey',
  'goat',
  'lamb',
  'pumpkin',
  'appleTree',
  'oliveTree',
  'lemonTree',
  'orangeTree',
  'pearTree',
  'peachTree',
]);
const WATER_SMALL = new Set<AssetType>([
  'fish',
  'fishSchool',
  'reeds',
  'pondLily',
  'cattail',
  'lily',
  'frog',
  'turtle',
  'heron',
  'shellfish',
  'tidePools',
  'frozenPond',
  'driftwood',
  'rock',
  'snowCoveredRock',
  'waves',
]);
const WATER_LANDMARKS = new Set<AssetType>([
  'lotusPond',
  'reedMarsh',
  'willowPond',
  'fishSchool',
  'reeds',
  'pondLily',
  'tidePools',
  'cattail',
  'willow',
  'frozenPond',
  'lily',
]);
const WATER_GRAND = new Set<AssetType>([
  'lotusPond',
  'reedMarsh',
  'willowPond',
  'willow',
  'alpineRocks',
  'turtle',
  'frozenPond',
]);
const WATER_FOCAL: Readonly<Record<PositiveRewardTier, readonly AssetType[]>> = {
  1: ['buoy'],
  2: ['boat', 'dock'],
  3: ['boat', 'sailboat', 'dock'],
  4: ['sailboat', 'bridge', 'watermill', 'lighthouse'],
  5: ['sailboat', 'bridge', 'watermill', 'lighthouse'],
};
const SEASON_POSITION: Readonly<Record<PeakSeason, number>> = {
  winter: 0,
  spring: 14,
  summer: 28,
  autumn: 42,
};
const PRIMARY_POOLS = new Map<string, readonly AssetType[]>();
const WINTER_FLOWERS = new Set<AssetType>(['lotusPond', 'wildflowerMeadow', 'pondLily', 'lily']);

function primaryBand(entry: AssetCatalogEntry): PositiveRewardTier {
  if (GRAND.has(entry.id)) return 5;
  if (HOMES.has(entry.id)) return 4;
  if (entry.category === 'decoration' || SMALL_NATURE.has(entry.id)) return 1;
  if (RURAL_NATURE.has(entry.id)) return 2;
  if (entry.bounds.width <= 6 && entry.bounds.height <= 7) return 1;
  if (entry.category === 'town') return 4;
  if (entry.category === 'village' || entry.category === 'farm') return 3;
  return 2;
}

export function dailyPrimaryPool(
  tier: PositiveRewardTier,
  season: PeakSeason,
  biome: BiomeContext | undefined,
  style: VillageStyle = 'classic',
): readonly AssetType[] {
  const water = Boolean(biome?.isPond || biome?.isRiver);
  const forest = (biome?.forestDensity ?? 0) > 0.55;
  const shore = Boolean(biome?.nearWater);
  const key = `${tier}:${season}:${water}:${forest}:${shore}:${style}`;
  const cached = PRIMARY_POOLS.get(key);
  if (cached) return cached;
  const removed = getSeasonalPoolOverrides(SEASON_POSITION[season], 0, 99).remove;
  const eligible = ASSET_CATALOG.filter((entry) => {
    if (entry.style !== 'classic' || removed.has(entry.id)) return false;
    if (entry.season !== 'all' && entry.season !== season) return false;
    if (season === 'winter' && WINTER_FLOWERS.has(entry.id)) return false;
    if (water) {
      return (
        (tier >= 4 ? WATER_GRAND : tier === 3 ? WATER_LANDMARKS : WATER_SMALL).has(entry.id) ||
        WATER_FOCAL[tier].includes(entry.id)
      );
    }
    if (entry.category === 'water') {
      return shore && tier >= 3 && (tier >= 4 ? WATER_GRAND : WATER_LANDMARKS).has(entry.id);
    }
    if (isNaturePrimary(entry.id)) {
      if (forest && entry.category === 'farm') return false;
      if (tier === 5) return LANDMARK_NATURE.has(entry.id);
      if (tier === 4) return LANDMARK_NATURE.has(entry.id) || GROVE.has(entry.id);
      if (tier === 3 && (LANDMARK_NATURE.has(entry.id) || GROVE.has(entry.id))) return true;
    } else if (tier === 5) {
      return GRAND.has(entry.id) || HOMES.has(entry.id) || entry.category === 'town';
    }
    return primaryBand(entry) === tier;
  });
  const pool = [
    ...new Set(
      eligible.map((entry) => {
        const mapped = mapVillageAsset(entry.id, style);
        return tier < 5 && mapped === 'hanokEstate' ? 'hanok' : mapped;
      }),
    ),
  ];
  PRIMARY_POOLS.set(key, pool);
  return pool;
}
