import { getAssetCatalogEntry, isAssetType } from '../assets/catalog.js';
import { ASSET_BOUNDS } from '../assets/bounds.js';
import { EPIC_BOUNDS } from '../epics/bounds.js';
import { isEpicBuildingType } from '../epics/catalog.js';
import type { AssetBounds } from '../assets/types.js';

const BUILDINGS = new Set([
  'tent',
  'hut',
  'house',
  'houseB',
  'church',
  'windmill',
  'tavern',
  'bakery',
  'stable',
  'shrine',
  'watermill',
  'igloo',
  'houseWinter',
  'houseBWinter',
  'churchWinter',
  'hanok',
  'pavilion',
  'choga',
  'koreanWatermill',
  'hanokGate',
  'market',
  'inn',
  'blacksmith',
  'castle',
  'tower',
  'cathedral',
  'library',
  'clocktower',
  'warehouse',
  'gatehouse',
  'manor',
  'hanokEstate',
  'barn',
  'barnWinter',
  'silo',
]);
const TREES = new Set([
  'cedarGrove',
  'ancientOak',
  'bambooThicket',
  'pine',
  'deciduous',
  'birch',
  'willow',
  'palm',
  'deadTree',
  'gardenTree',
  'snowPine',
  'snowDeciduous',
  'cherryBlossom',
  'cherryBlossomSmall',
  'cherryBlossomFull',
  'peachBlossom',
  'autumnMaple',
  'autumnOak',
  'autumnBirch',
  'autumnGinkgo',
  'christmasTree',
]);

export function isLandscapeBuilding(catalogId: string): boolean {
  return BUILDINGS.has(catalogId);
}

export function landscapeSpriteBounds(catalogId: string): AssetBounds {
  if (isAssetType(catalogId)) return ASSET_BOUNDS[catalogId];
  if (isEpicBuildingType(catalogId)) return EPIC_BOUNDS[catalogId];
  return { x: -3.6, y: 2, width: 7.2, height: 3 };
}

export function landscapeSpriteScale(catalogId: string): number {
  const bounds = landscapeSpriteBounds(catalogId);
  if (isEpicBuildingType(catalogId)) {
    return catalogId === 'colosseum' || catalogId === 'operaHouse'
      ? 86 / bounds.width
      : Math.min(78 / bounds.height, 96 / bounds.width);
  }
  if (!isAssetType(catalogId)) return 0.75;
  if (isLandscapeBuilding(catalogId)) {
    const width = getAssetCatalogEntry(catalogId).category === 'town' ? 42 : 32;
    return Math.min(width / bounds.width, 56 / bounds.height);
  }
  if (TREES.has(catalogId)) return 30 / bounds.height;
  return Math.min(20 / bounds.width, 23 / bounds.height);
}

export function landscapeFootRadius(catalogId: string): number {
  const width = landscapeSpriteBounds(catalogId).width * landscapeSpriteScale(catalogId);
  return Math.max(0.45, width / (isEpicBuildingType(catalogId) ? 22 : 30));
}
