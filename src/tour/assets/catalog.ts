import type { WorldSeason } from '../../world/model/geometry-types.js';
import type { AssetType } from '../../themes/terrain/assets/types.js';
import type { EpicBuildingType } from '../../themes/terrain/epics/types.js';
import type { TourAsset } from '../types.js';
import { TourAssetError } from './errors.js';
import { NATURE_DEFINITIONS } from './definitions-nature.js';
import { VILLAGE_DEFINITIONS } from './definitions-village.js';
import { WONDER_DEFINITIONS } from './definitions-wonders.js';
import { ORDINARY_MAP } from './ordinary-map.js';
import { seasonalParts } from './palette.js';
import type { AssetDefinition } from './recipe-types.js';

const DEFINITIONS = { ...NATURE_DEFINITIONS, ...VILLAGE_DEFINITIONS };
const KOREAN_IDS = new Set<string>([
  'hanok',
  'pavilion',
  'stoneWall',
  'onggi',
  'choga',
  'jangseung',
  'sotdae',
  'riceTerrace',
  'koreanWatermill',
  'hanokGate',
  'kimchiGarden',
  'stoneBridge',
  'hanokEstate',
]);
const LABELS: Readonly<Partial<Record<AssetType | EpicBuildingType, string>>> = {
  hanok: 'Hanok house',
  choga: 'Choga cottage',
  pavilion: 'Korean pavilion',
  hanokEstate: 'Hanok courtyard estate',
  koreanWatermill: 'Korean watermill',
  onggi: 'Onggi jars',
  jangseung: 'Jangseung guardians',
  sotdae: 'Sotdae bird poles',
  stBasils: 'Saint Basil’s Cathedral',
  tajMahal: 'Taj Mahal',
  operaHouse: 'Sydney Opera House',
};

function isOrdinary(id: string): id is AssetType {
  return Object.hasOwn(ORDINARY_MAP, id);
}

function isWonder(id: string): id is EpicBuildingType {
  return Object.hasOwn(WONDER_DEFINITIONS, id);
}

function definitionFor(
  id: string,
  variant: number,
): { readonly id: AssetType | EpicBuildingType; readonly definition: AssetDefinition } {
  if (isOrdinary(id)) return { id, definition: DEFINITIONS[ORDINARY_MAP[id]] };
  if (isWonder(id)) return { id, definition: WONDER_DEFINITIONS[id] };
  throw new TourAssetError('unknown-catalog-id', id, variant);
}

export function createTourAsset(
  catalogId: string,
  variant: number,
  season: WorldSeason,
): TourAsset {
  if (!Number.isSafeInteger(variant) || variant < 0)
    throw new TourAssetError('invalid-variant', catalogId, variant);
  const { id, definition } = definitionFor(catalogId, variant);
  const remainder = variant % 3;
  const baseVariant = remainder === 1 ? 1 : remainder === 2 ? 2 : 0;
  const parts = seasonalParts(definition.build(baseVariant), definition.season ?? season);
  if (parts.length === 0) throw new TourAssetError('empty-recipe', catalogId, variant);
  return {
    label:
      LABELS[id] ??
      id.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (letter) => letter.toUpperCase()),
    kind: definition.kind,
    scale: definition.scale,
    collider:
      definition.footprint === null
        ? null
        : {
            halfX: definition.footprint[0] * definition.scale,
            halfZ: definition.footprint[1] * definition.scale,
          },
    recipe: {
      key: `tour:${KOREAN_IDS.has(id) ? 'korean:' : ''}${id}:${variant}:${season}`,
      version: 1,
      parts,
    },
  };
}
