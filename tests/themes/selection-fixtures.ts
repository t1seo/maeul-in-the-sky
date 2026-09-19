import { getAssetCatalogEntry } from '../../src/themes/terrain/assets/catalog.js';
import type { AssetType } from '../../src/themes/terrain/assets/types.js';
import type { BiomeContext } from '../../src/themes/terrain/biomes.js';
import type { IsoCell } from '../../src/themes/terrain/blocks.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';

const land: BiomeContext = {
  isPond: false,
  isRiver: false,
  nearWater: false,
  forestDensity: 0,
};
export const compositionBiomes = {
  land,
  forest: { ...land, forestDensity: 1 },
  shore: { ...land, nearWater: true },
  river: { ...land, isRiver: true },
  pond: { ...land, isPond: true },
} as const;

const nonNature = new Set<string>([
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
const naturalDecorations = new Set<string>([
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

export function isNaturalSelection(type: AssetType): boolean {
  const { category } = getAssetCatalogEntry(type);
  return (
    naturalDecorations.has(type) ||
    (['water', 'shore', 'woodland', 'farm'].includes(category) && !nonNature.has(type))
  );
}

export function selectionCell(date: string, count = 10): IsoCell {
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000) + 4;
  return {
    date,
    count,
    week: Math.floor(day / 7),
    day: ((day % 7) + 7) % 7,
    level100: 99,
    height: 10,
    isoX: 0,
    isoY: 0,
    colors: getTerrainPalette100('light').getElevation(99),
  };
}

export function seasonCohort(month: number, count: number): IsoCell[] {
  return Array.from({ length: 364 }, (_, index) =>
    selectionCell(
      new Date(Date.UTC(2015 + Math.floor(index / 28), month, (index % 28) + 1))
        .toISOString()
        .slice(0, 10),
      count,
    ),
  );
}
