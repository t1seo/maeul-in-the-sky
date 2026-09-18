import type { PositiveRewardTier } from '../../../core/scene-types.js';
import type { BiomeContext } from '../biomes.js';
import type { AssetCatalogEntry, AssetType } from './types.js';
import type { PeakSeason } from '../seasons.js';
import { ASSET_CATALOG } from './catalog.js';
import { getSeasonalPoolOverrides } from '../seasons.js';

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
const SEASON_POSITION: Readonly<Record<PeakSeason, number>> = {
  winter: 0,
  spring: 14,
  summer: 28,
  autumn: 42,
};
const PRIMARY_POOLS = new Map<string, readonly AssetType[]>();

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
): readonly AssetType[] {
  const water = Boolean(biome?.isPond || biome?.isRiver);
  const key = `${tier}:${season}:${water}`;
  const cached = PRIMARY_POOLS.get(key);
  if (cached) return cached;
  const removed = getSeasonalPoolOverrides(SEASON_POSITION[season], 0, 99).remove;
  const eligible = ASSET_CATALOG.filter((entry) => {
    if (entry.style !== 'classic' || removed.has(entry.id)) return false;
    if (entry.season !== 'all' && entry.season !== season) return false;
    if (water ? entry.category !== 'water' : entry.category === 'water') return false;
    const band = primaryBand(entry);
    return band === tier || (tier === 3 && GROVE.has(entry.id));
  });
  const seasonal = eligible.filter((entry) => entry.season === season);
  const pool = [...eligible, ...seasonal, ...seasonal].map((entry) => entry.id);
  PRIMARY_POOLS.set(key, pool);
  return pool;
}
