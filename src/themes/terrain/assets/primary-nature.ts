import { ASSET_CATALOG } from './catalog.js';
import type { AssetType } from './types.js';

const BUILT_LANDSCAPE = new Set<AssetType>([
  'boat',
  'sailboat',
  'dock',
  'buoy',
  'lighthouse',
  'canal',
  'sandcastle',
  'sandcastleSummer',
  'parasol',
  'beachTowel',
  'surfboard',
  'birdhouse',
  'haybale',
  'beehive',
  'fence',
  'scarecrow',
  'barn',
  'barnWinter',
  'silo',
  'pigpen',
  'trough',
  'haystack',
  'beeFarm',
  'scarecrowAutumn',
  'harvestBasket',
  'hayMaze',
  'appleBasket',
]);
const NATURAL_DETAILS = new Set<AssetType>([
  'puddle',
  'snowdrift',
  'icicle',
  'cherryPetals',
  'tulip',
  'tulipField',
  'crocus',
  'rainPuddle',
  'flowerBed',
  'fireflies',
  'fallenLeaves',
  'leafSwirl',
]);
const NATURE = new Set(
  ASSET_CATALOG.filter(
    (entry) =>
      NATURAL_DETAILS.has(entry.id) ||
      (['water', 'shore', 'woodland', 'farm'].includes(entry.category) &&
        !BUILT_LANDSCAPE.has(entry.id)),
  ).map((entry) => entry.id),
);

export function isNaturePrimary(type: AssetType): boolean {
  return NATURE.has(type);
}
