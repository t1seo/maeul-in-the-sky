import type { AssetType } from '../../themes/terrain/assets/types.js';
import { calendarSeason } from './dates.js';
import { hashKey } from './math.js';
import type { WorldDay, WorldEntity, WorldModelFamily, WorldSettings, WorldTile } from './types.js';

type AssetChoice = readonly [WorldModelFamily, AssetType];
const NATURE = [
  ['conifer', 'pine'],
  ['broadleaf', 'deciduous'],
  ['bamboo', 'bambooThicket'],
  ['willow', 'willow'],
  ['grove', 'cedarGrove'],
  ['meadow', 'wildflowerMeadow'],
  ['reeds', 'reedMarsh'],
  ['rocks', 'alpineRocks'],
  ['broadleaf', 'ancientOak'],
  ['orchard', 'orchard'],
  ['meadow', 'wildflowerPatch'],
  ['grove', 'birch'],
] as const satisfies readonly AssetChoice[];
const KOREAN = [
  ['hanok', 'hanok'],
  ['choga', 'choga'],
  ['pavilion', 'pavilion'],
  ['rice-terrace', 'riceTerrace'],
] as const satisfies readonly AssetChoice[];
const CLASSIC = [
  ['house', 'house'],
  ['house', 'houseB'],
  ['barn', 'barn'],
  ['market', 'market'],
] as const satisfies readonly AssetChoice[];
const CITY = [
  ['tower', 'clocktower'],
  ['library', 'library'],
  ['tower', 'tower'],
  ['market', 'inn'],
] as const satisfies readonly AssetChoice[];
const SEASONAL = {
  spring: ['blossoms', 'cherryBlossom'],
  summer: ['meadow', 'wildflowerMeadow'],
  autumn: ['orchard', 'appleTree'],
  winter: ['conifer', 'snowPine'],
} as const satisfies Readonly<Record<string, AssetChoice>>;
const SAPLINGS = [
  ['conifer', 'pine'],
  ['broadleaf', 'deciduous'],
  ['bamboo', 'bambooThicket'],
  ['meadow', 'wildflowerPatch'],
  ['rocks', 'rock'],
  ['broadleaf', 'birch'],
] as const satisfies readonly AssetChoice[];

export function chooseDayAsset(
  day: WorldDay & { readonly kind: 'observed' },
  tile: WorldTile,
  settings: WorldSettings,
  seed: string,
): AssetChoice {
  const hash = hashKey(`${seed}:${day.date}:asset`);
  if (tile.regionId.endsWith(':city')) return CITY[hash % CITY.length];
  if (tile.regionId.endsWith(':town')) {
    const pool = settings.culture === 'korean' ? KOREAN : CLASSIC;
    return pool[hash % pool.length];
  }
  if (hash % 5 === 0) return SEASONAL[calendarSeason(day.date, settings.hemisphere)];
  if (day.rewardTier === 1) return SAPLINGS[hash % SAPLINGS.length];
  return NATURE[hash % NATURE.length];
}

export function entityOnTile(
  id: string,
  kind: WorldEntity['kind'],
  tile: WorldTile,
  family: WorldModelFamily,
  visibleFrom: string,
  seed: string,
  extra: Partial<
    Pick<WorldEntity, 'date' | 'catalogId' | 'repoId' | 'releaseId' | 'parentId' | 'label'>
  > = {},
): WorldEntity {
  const hash = hashKey(`${seed}:${id}`);
  const variant = hash % 3;
  return {
    id,
    kind,
    islandId: tile.islandId,
    regionId: tile.regionId,
    position: {
      ...tile.position,
      y: tile.position.y + (kind === 'asset' ? tile.activityHeight : 0),
    },
    yaw: ((hash % 4) * Math.PI) / 2,
    scale: { x: 0.75, y: 0.75, z: 0.75 },
    modelKey: `${family}:${variant}`,
    variant,
    visibleFrom,
    ...extra,
  };
}

export function dayEntities(
  days: readonly WorldDay[],
  tiles: readonly WorldTile[],
  settings: WorldSettings,
  seed: string,
): readonly WorldEntity[] {
  const tileById = new Map(tiles.map((tile) => [tile.id, tile]));
  return days.flatMap((day) => {
    const tile = tileById.get(day.tileId);
    if (day.kind !== 'observed' || day.count === 0 || !tile) return [];
    const [family, catalogId] = chooseDayAsset(day, tile, settings, seed);
    const asset = entityOnTile(`asset:${day.date}`, 'asset', tile, family, day.date, seed, {
      date: day.date,
      catalogId,
    });
    const width = 0.4 + day.rewardTier * 0.08;
    const primary = { ...asset, scale: { x: width, y: 0.65 + day.rewardTier * 0.11, z: width } };
    const accents =
      day.rewardTier < 4
        ? []
        : [
            entityOnTile(`detail:${day.date}:flowers`, 'scenery', tile, 'meadow', day.date, seed, {
              date: day.date,
              catalogId: 'wildflowerPatch',
              parentId: asset.id,
            }),
          ];
    if (day.rewardTier === 5)
      accents.push(
        entityOnTile(`detail:${day.date}:stones`, 'scenery', tile, 'rocks', day.date, seed, {
          date: day.date,
          catalogId: 'rock',
          parentId: asset.id,
        }),
      );
    return [
      primary,
      ...accents.map((accent, index) => ({
        ...accent,
        position: {
          x: tile.position.x + (index === 0 ? -0.32 : 0.32),
          y: primary.position.y,
          z: tile.position.z + 0.32,
        },
        scale: { x: 0.18, y: 0.22, z: 0.18 },
      })),
    ];
  });
}
