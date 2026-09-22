import type { TerrainScene } from '../../core/scene-types.js';
import { getAssetCatalogEntry, isAssetType } from '../../themes/terrain/assets/catalog.js';
import type { AssetType } from '../../themes/terrain/assets/types.js';
import type { TourCell, TourStop } from '../types.js';

const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
const LABELS = {
  spring: 'Spring garden',
  summer: 'Summer riverside',
  autumn: 'Autumn village',
  winter: 'Winter grove',
} as const;
const BUILDINGS: ReadonlySet<AssetType> = new Set([
  'hanokEstate',
  'hanok',
  'choga',
  'pavilion',
  'koreanWatermill',
  'hut',
  'house',
  'houseB',
  'houseWinter',
  'houseBWinter',
  'church',
  'churchWinter',
  'tavern',
  'bakery',
  'stable',
  'windmill',
  'watermill',
  'igloo',
  'market',
  'inn',
  'blacksmith',
  'castle',
  'tower',
  'cathedral',
  'library',
  'clocktower',
  'warehouse',
  'manor',
  'barn',
  'barnWinter',
  'lighthouse',
]);

export function seasonalStops(
  scene: TerrainScene,
  cells: readonly TourCell[],
): readonly TourStop[] {
  const buildingDates = new Set(
    scene.placements.flatMap((placement) =>
      isAssetType(placement.catalogId) && BUILDINGS.has(placement.catalogId)
        ? [placement.anchorDate]
        : [],
    ),
  );
  const focalDates = new Set(
    scene.placements.flatMap((placement) => {
      if (!isAssetType(placement.catalogId)) return [];
      const category = getAssetCatalogEntry(placement.catalogId).category;
      return category === 'village' || category === 'town' ? [placement.anchorDate] : [];
    }),
  );
  const assetDates = new Set(scene.placements.map((placement) => placement.anchorDate));
  return SEASONS.flatMap((season) => {
    const seasonal = cells.filter((cell) => cell.season === season);
    if (seasonal.length === 0) return [];
    const seasonalLand = seasonal.filter((cell) => cell.surface !== 'water');
    const candidates = seasonalLand.length ? seasonalLand : seasonal;
    const centerX = seasonal.reduce((total, cell) => total + cell.x, 0) / seasonal.length;
    const centerZ = seasonal.reduce((total, cell) => total + cell.z, 0) / seasonal.length;
    const buildings = seasonal.filter((cell) => buildingDates.has(cell.source.date));
    const focal = buildings.length
      ? buildings
      : seasonal.filter((cell) => focalDates.has(cell.source.date));
    const score = (cell: TourCell): number => {
      const distance = focal.length
        ? Math.min(...focal.map((target) => Math.hypot(target.x - cell.x, target.z - cell.z)))
        : Math.hypot(centerX - cell.x, centerZ - cell.z);
      return distance + (assetDates.has(cell.source.date) ? 1 : 0);
    };
    const target = [...candidates].sort(
      (a, b) => score(a) - score(b) || a.source.date.localeCompare(b.source.date),
    )[0];
    if (!target) return [];
    return [
      {
        id: season,
        label: LABELS[season],
        date: target.source.date,
        position: { x: target.x, y: 0, z: target.z },
      },
    ];
  });
}
