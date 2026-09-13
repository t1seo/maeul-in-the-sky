import { ASSET_RENDERERS } from './renderers.js';
import { ASSET_BOUNDS } from './bounds.js';
import { CATEGORY_MEMBERS } from './classification.js';
import { SEASON_MEMBERS } from './season-members.js';
import type { AssetCatalogEntry, AssetType, AssetCategory, AssetSeason } from './types.js';

const LABELS: Partial<Record<AssetType, string>> = {
  houseB: 'Gabled house',
  houseBWinter: 'Snowy gabled house',
  houseWinter: 'Snowy house',
  barnWinter: 'Snowy barn',
  churchWinter: 'Snowy church',
  sandcastleSummer: 'Summer sandcastle',
  cornStalk: 'Corn stalks',
  hanok: 'Hanok house',
  pavilion: 'Korean pavilion',
  stoneWall: 'Korean stone wall',
  onggi: 'Onggi jars',
};
const KOREAN_DESCRIPTIONS: Partial<Record<AssetType, string>> = {
  hanok: 'A timber-frame home with curved giwa roof tiles, cream walls and wooden lattice doors.',
  pavilion:
    'An open-sided resting pavilion with raised stone footing and a gently swept tiled roof.',
  stoneWall: 'An irregular stacked stone boundary capped with dark roof tiles.',
  onggi:
    'Three glazed earthenware storage jars with broad shoulders and flat lids on a stone terrace.',
};
const CATEGORIES: readonly AssetCategory[] = [
  'water',
  'shore',
  'woodland',
  'farm',
  'village',
  'town',
  'decoration',
];
const SEASONS: readonly Exclude<AssetSeason, 'all'>[] = ['winter', 'spring', 'summer', 'autumn'];

export function isAssetType(value: string): value is AssetType {
  return Object.hasOwn(ASSET_RENDERERS, value);
}

export function getAssetCatalogEntry(id: AssetType): AssetCatalogEntry {
  const displayName =
    LABELS[id] ??
    id.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (letter) => letter.toUpperCase());
  const category = CATEGORIES.find((value) => CATEGORY_MEMBERS[value].includes(id)) ?? 'decoration';
  const season = SEASONS.find((value) => SEASON_MEMBERS[value].includes(id)) ?? 'all';
  const style = KOREAN_DESCRIPTIONS[id] ? 'korean' : 'classic';
  return {
    id,
    displayName,
    category,
    season,
    style,
    bounds: ASSET_BOUNDS[id],
    description:
      KOREAN_DESCRIPTIONS[id] ??
      `${displayName}, a ${category} asset${season === 'all' ? ' available throughout the year' : ` for ${season}`}.`,
  };
}

export const ASSET_CATALOG: readonly AssetCatalogEntry[] = Object.keys(ASSET_RENDERERS)
  .filter(isAssetType)
  .map(getAssetCatalogEntry);
export const ASSET_CATALOG_COUNTS = Object.freeze({
  total: ASSET_CATALOG.length,
  classic: ASSET_CATALOG.filter((entry) => entry.style === 'classic').length,
  korean: ASSET_CATALOG.filter((entry) => entry.style === 'korean').length,
});
