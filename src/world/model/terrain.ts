import { boundsOf, centerOf } from './math.js';
import { groundHeight, monthPoint, pondProfile } from './landform.js';
import { monthLayout } from './layout.js';
import { allocateLandUse } from './regions.js';
import { connectMonths } from './seasonal-joins.js';
import type { PreparedWorldInput } from './input.js';
import type {
  Vec3,
  WorldDay,
  WorldIsland,
  WorldRegion,
  WorldTerrain,
  WorldTile,
  WorldWaterway,
} from './types.js';

export type MonthTerrain = {
  readonly monthKey: string;
  readonly islandId: string;
  readonly origin: Vec3;
  readonly rotation: number;
  readonly tiles: readonly WorldTile[];
  readonly regions: readonly WorldRegion[];
  readonly waterways: readonly WorldWaterway[];
  readonly plotLookup?: ReadonlyMap<string, WorldTile>;
  readonly reservedTileIds?: ReadonlySet<string>;
};

export type WorldGeography = {
  readonly months: readonly MonthTerrain[];
  readonly terrain: WorldTerrain;
  readonly islands: readonly WorldIsland[];
  readonly regions: readonly WorldRegion[];
  readonly projectTiles?: readonly WorldTile[];
};

function prepareMonth(
  monthKey: string,
  days: readonly WorldDay[],
  input: PreparedWorldInput,
): MonthTerrain {
  const { origin, islandId, seed, rotation, cells } = monthLayout(monthKey, input);
  const records = new Map(days.map((day) => [Number(day.date.slice(8)), day]));
  const kindByCell = allocateLandUse(cells);
  const tiles = cells.map(({ x, z, surface }): WorldTile => {
    const slot = x >= 2 && x <= 8 && z >= 3 && z <= 7 ? (z - 3) * 7 + x - 1 : 0;
    const day = records.get(slot);
    const regionId = `region:${monthKey}:${kindByCell.get(`${x},${z}`) ?? 'nature'}`;
    return {
      id: day?.tileId ?? `tile:${monthKey}:scenery:${x}:${z}`,
      islandId,
      regionId,
      position: monthPoint(origin, rotation, x, z, groundHeight(x, z, surface, seed)),
      size: 1,
      surface,
      source: day ? 'day' : 'scenery',
      ...(day ? { date: day.date } : {}),
      activityHeight: day?.kind === 'observed' ? Math.min(day.count / 50, 1) : 0,
    };
  });
  const regions = (['nature', 'town', 'city'] as const).map((kind): WorldRegion => {
    const id = `region:${monthKey}:${kind}`;
    const owned = tiles.filter((tile) => tile.regionId === id);
    const bounds = boundsOf(
      owned.map((tile) => tile.position),
      0.5,
    );
    return {
      id,
      islandId,
      monthKey,
      kind,
      tileIds: owned.map((tile) => tile.id),
      boundary: [
        { x: bounds.min.x, y: 0, z: bounds.min.z },
        { x: bounds.max.x, y: 0, z: bounds.min.z },
        { x: bounds.max.x, y: 0, z: bounds.max.z },
        { x: bounds.min.x, y: 0, z: bounds.max.z },
      ],
    };
  });
  const point = (x: number, z: number, y = 0): Vec3 => monthPoint(origin, rotation, x, z, y);
  const riverCells = cells.filter((cell) => cell.x === 0);
  const river = riverCells.map((cell, index) =>
    point(-0.3 + Math.sin(index * 0.65 + (seed % 11)) * 0.2, cell.z),
  );
  const mouth = river[river.length - 1];
  const pond = pondProfile(seed);
  const pondPoints = Array.from({ length: 13 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2;
    return point(
      pond.x + Math.cos(angle) * pond.radius * 0.7,
      pond.z + Math.sin(angle) * pond.radius,
    );
  });
  const waterways: readonly WorldWaterway[] = [
    { id: `water:${monthKey}:river`, islandId, kind: 'river', points: river, width: 0.7 },
    {
      id: `water:${monthKey}:pond`,
      islandId,
      kind: 'pond',
      points: pondPoints,
      width: 0.7,
    },
    {
      id: `water:${monthKey}:waterfall`,
      islandId,
      kind: 'waterfall',
      points: [mouth, { ...mouth, y: -1.5 }],
      width: 0.65,
    },
  ];
  return { monthKey, islandId, origin, rotation, tiles, regions, waterways };
}

export function prepareTerrain(
  days: readonly WorldDay[],
  input: PreparedWorldInput,
): WorldGeography {
  const keys = [...new Set(days.map((day) => day.monthKey))];
  const months = connectMonths(
    keys.map((key) =>
      prepareMonth(
        key,
        days.filter((day) => day.monthKey === key),
        input,
      ),
    ),
    input.settings.layout,
  );
  const islands = [...new Set(months.map((month) => month.islandId))].map((id): WorldIsland => {
    const group = months.filter((month) => month.islandId === id);
    const bounds = boundsOf(
      group.flatMap((month) => month.tiles.map((tile) => tile.position)),
      1.5,
    );
    return {
      id,
      monthKeys: group.map((month) => month.monthKey),
      center: centerOf(bounds),
      bounds,
      regionIds: group.flatMap((month) => month.regions.map((region) => region.id)),
    };
  });
  return {
    months,
    islands,
    regions: months.flatMap((month) => month.regions),
    terrain: {
      tiles: months.flatMap((month) => month.tiles),
      waterways: months.flatMap((month) => month.waterways),
      waterLevel: 0,
    },
  };
}
