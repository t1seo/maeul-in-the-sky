import type { AssetPool, AssetType, VillageStyle } from './types.js';

const KOREAN_REPLACEMENTS: Partial<Record<AssetType, AssetType>> = {
  house: 'hanok',
  houseB: 'hanok',
  houseWinter: 'hanok',
  houseBWinter: 'hanok',
  hut: 'hanok',
  tavern: 'hanok',
  inn: 'hanok',
  manor: 'hanok',
  church: 'pavilion',
  churchWinter: 'pavilion',
  shrine: 'pavilion',
  fence: 'stoneWall',
  gatehouse: 'stoneWall',
  barrel: 'onggi',
  well: 'onggi',
};

export function applyVillageStyle(pool: AssetPool, style: VillageStyle): AssetPool {
  if (style === 'classic') return pool;
  const types = pool.types.map((type) => KOREAN_REPLACEMENTS[type] ?? type);
  if (types.includes('hanok') || types.includes('pavilion')) {
    if (!types.includes('stoneWall')) types.push('stoneWall');
    if (!types.includes('onggi')) types.push('onggi');
  }
  return { ...pool, types };
}
