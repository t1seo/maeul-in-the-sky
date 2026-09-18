import type { AssetPool, AssetType, VillageStyle } from './types.js';

const KOREAN_REPLACEMENTS: Readonly<Partial<Record<AssetType, AssetType>>> = {
  house: 'hanok',
  houseB: 'hanok',
  houseWinter: 'hanok',
  houseBWinter: 'hanok',
  hut: 'choga',
  barn: 'choga',
  barnWinter: 'choga',
  bakery: 'choga',
  stable: 'choga',
  tavern: 'hanok',
  inn: 'hanokEstate',
  manor: 'hanokEstate',
  castle: 'hanokEstate',
  cathedral: 'hanokEstate',
  library: 'hanokEstate',
  warehouse: 'hanok',
  blacksmith: 'hanok',
  market: 'pavilion',
  church: 'pavilion',
  churchWinter: 'pavilion',
  shrine: 'pavilion',
  fence: 'stoneWall',
  gatehouse: 'hanokGate',
  tower: 'hanokGate',
  clocktower: 'hanokGate',
  barrel: 'onggi',
  ricePaddy: 'riceTerrace',
  watermill: 'koreanWatermill',
  windmill: 'koreanWatermill',
  garden: 'kimchiGarden',
  gardenBed: 'kimchiGarden',
  bridge: 'stoneBridge',
  statue: 'jangseung',
  signpost: 'sotdae',
};

export function mapVillageAsset(type: AssetType, style: VillageStyle): AssetType {
  return style === 'korean' ? (KOREAN_REPLACEMENTS[type] ?? type) : type;
}

export function applyVillageStyle(pool: AssetPool, style: VillageStyle): AssetPool {
  if (style === 'classic') return pool;
  return { ...pool, types: pool.types.map((type) => mapVillageAsset(type, style)) };
}
