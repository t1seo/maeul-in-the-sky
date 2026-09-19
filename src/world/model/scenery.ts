import { entityOnTile } from './assets.js';
import { monthPoint } from './landform.js';
import { hashKey } from './math.js';
import type { MonthTerrain } from './terrain.js';
import type { WorldEntity, WorldModelFamily } from './types.js';

const RESERVED = [
  [2, 0],
  [9, 0],
  [1, 1],
  [1, 8],
  [0, 1],
  [0, 8],
  [3, 9],
  [4, 9],
  [5, 9],
  [6, 0],
  [7, 0],
  [8, 0],
  [8, 8],
  [9, 8],
  [9, 7],
  [8, 9],
  [9, 9],
  [10, 2],
] as const;
const PLANTS = [
  ['conifer', 'pine'],
  ['bamboo', 'bambooThicket'],
  ['rocks', 'alpineRocks'],
  ['meadow', 'wildflowerPatch'],
  ['grove', 'cedarGrove'],
] as const satisfies readonly (readonly [WorldModelFamily, string])[];

export function reservedPlotKeys(month: MonthTerrain): readonly string[] {
  if (month.reservedTileIds)
    return month.tiles
      .filter((tile) => month.reservedTileIds?.has(tile.id))
      .map((tile) => `${tile.position.x}:${tile.position.z}`);
  return RESERVED.map(([x, z]) => {
    const point = monthPoint(month.origin, month.rotation, x, z);
    return `${point.x}:${point.z}`;
  });
}

export function edgeScenery(
  month: MonthTerrain,
  existing: readonly WorldEntity[],
  seed: string,
): readonly WorldEntity[] {
  const occupied = new Set([
    ...existing.map((entity) => `${entity.position.x}:${entity.position.z}`),
    ...reservedPlotKeys(month),
  ]);
  const candidates = month.tiles.filter(
    (tile) =>
      tile.source === 'scenery' &&
      tile.regionId.endsWith(':nature') &&
      (tile.surface === 'grass' || tile.surface === 'rock') &&
      !occupied.has(`${tile.position.x}:${tile.position.z}`),
  );
  return [...candidates]
    .sort((a, b) => hashKey(`${seed}:${a.id}:edge`) - hashKey(`${seed}:${b.id}:edge`))
    .slice(0, 7)
    .map((tile) => {
      const hash = hashKey(`${seed}:${tile.id}:plant`);
      const [family, catalogId] = PLANTS[hash % PLANTS.length];
      const entity = entityOnTile(
        `scenery:${month.monthKey}:edge:${tile.id}`,
        'scenery',
        tile,
        family,
        '0001-01-01',
        seed,
        { catalogId },
      );
      const width = 0.4 + (hash % 3) * 0.1;
      return { ...entity, scale: { x: width, y: 0.7, z: width } };
    });
}
