import { calendarSeason } from './dates.js';
import {
  CIRCLE_ISLAND,
  CIRCLE_SEASONS,
  circleCells,
  circleHeight,
  circleKey,
  circleMonthSlot,
} from './circular-layout.js';
import { circularPlots } from './circular-plots.js';
import { circularWaterways } from './circular-water.js';
import { WorldModelError } from './errors.js';
import { boundsOf, centerOf, hashKey } from './math.js';
import type { PreparedWorldInput } from './input.js';
import type { MonthTerrain, WorldGeography } from './terrain.js';
import type { WorldDay, WorldRegion, WorldRegionKind, WorldTile } from './types.js';

function region(
  id: string,
  monthKey: string,
  kind: WorldRegionKind,
  tiles: readonly WorldTile[],
): WorldRegion {
  const bounds = boundsOf(
    tiles.map((tile) => tile.position),
    0.5,
  );
  return {
    id,
    islandId: CIRCLE_ISLAND,
    monthKey,
    kind,
    tileIds: tiles.map((tile) => tile.id),
    boundary: [
      { x: bounds.min.x, y: 0, z: bounds.min.z },
      { x: bounds.max.x, y: 0, z: bounds.min.z },
      { x: bounds.max.x, y: 0, z: bounds.max.z },
      { x: bounds.min.x, y: 0, z: bounds.max.z },
    ],
  };
}

export function prepareCircularTerrain(
  days: readonly WorldDay[],
  input: PreparedWorldInput,
): WorldGeography {
  const cells = circleCells();
  const seed = hashKey(`${input.snapshot.username}:${input.settings.layoutSeed}:circle`);
  const keys = [...new Set(days.map((day) => day.monthKey))];
  const owners = new Map<string, string>();
  for (const month of keys) {
    const slot = circleMonthSlot(month, input.settings.hemisphere);
    if (owners.has(slot))
      throw new WorldModelError('INVALID_INPUT', 'Circular calendar slots overlap');
    owners.set(slot, month);
  }
  const groups = new Map(
    CIRCLE_SEASONS.flatMap((season) =>
      Array.from({ length: 9 }, (_, slot) => {
        const id = `${season}:${slot}`;
        return [
          id,
          circularPlots(cells.filter((cell) => cell.season === season && cell.slot === slot)),
        ] as const;
      }),
    ),
  );
  const dayByDate = new Map(days.map((day) => [day.date, day]));
  const tiles = cells.map((cell): WorldTile => {
    const key = circleKey(cell);
    const plots = groups.get(`${cell.season}:${cell.slot}`);
    const owner =
      cell.surface === 'water' || cell.surface === 'path'
        ? undefined
        : owners.get(`${cell.season}:${cell.slot}`);
    const slot = plots?.days.get(key);
    const day =
      owner && slot ? dayByDate.get(`${owner}-${String(slot).padStart(2, '0')}`) : undefined;
    const kind = plots?.kinds.get(key) ?? 'nature';
    return {
      id: day?.tileId ?? `tile:circle:scenery:${cell.x}:${cell.z}`,
      islandId: CIRCLE_ISLAND,
      regionId: owner
        ? `region:${owner}:${kind}`
        : `region:seasonal-circle:scaffold:${cell.season}:nature`,
      position: { x: cell.x, y: circleHeight(cell, seed), z: cell.z },
      size: 1,
      surface: owner && plots?.plots.get('4,8') === cell ? 'field' : cell.surface,
      source: day ? 'day' : 'scenery',
      ...(day ? { date: day.date } : {}),
      activityHeight: day?.kind === 'observed' ? Math.min(day.count / 50, 1) : 0,
    };
  });
  const tileByCell = new Map(tiles.map((tile) => [circleKey(tile.position), tile]));
  const months = keys.map((monthKey): MonthTerrain => {
    const plot = groups.get(circleMonthSlot(monthKey, input.settings.hemisphere));
    if (!plot) throw new WorldModelError('INVALID_WORLD', 'Circular month plots are missing');
    const owned = tiles.filter((tile) => tile.regionId.startsWith(`region:${monthKey}:`));
    const regions = (['nature', 'town', 'city'] as const).flatMap((kind) => {
      const id = `region:${monthKey}:${kind}`;
      const grouped = owned.filter((tile) => tile.regionId === id);
      return grouped.length ? [region(id, monthKey, kind, grouped)] : [];
    });
    const plotLookup = new Map(
      [...plot.plots].map(([id, cell]) => {
        const tile = tileByCell.get(circleKey(cell));
        if (!tile)
          throw new WorldModelError('INVALID_WORLD', 'A circular reserved tile is missing');
        return [id, tile] as const;
      }),
    );
    return {
      monthKey,
      islandId: CIRCLE_ISLAND,
      origin: centerOf(boundsOf(owned.map((tile) => tile.position))),
      rotation: 0,
      tiles: owned,
      regions,
      waterways: [],
      plotLookup,
      reservedTileIds: new Set(
        owned.filter((tile) => plot.reserved.has(circleKey(tile.position))).map((tile) => tile.id),
      ),
    };
  });
  const scaffold = CIRCLE_SEASONS.map((season, index) => {
    const month =
      input.settings.hemisphere === 'south' ? [9, 12, 3, 6][index] : [3, 6, 9, 12][index];
    const monthKey =
      keys.find((key) => calendarSeason(`${key}-01`, input.settings.hemisphere) === season) ??
      `${String(input.snapshot.year).padStart(4, '0')}-${String(month).padStart(2, '0')}`;
    const id = `region:seasonal-circle:scaffold:${season}:nature`;
    return region(
      id,
      monthKey,
      'nature',
      tiles.filter((tile) => tile.regionId === id),
    );
  });
  const regions = [...months.flatMap((month) => month.regions), ...scaffold];
  const bounds = boundsOf(
    tiles.map((tile) => tile.position),
    1.5,
  );
  const reserved = new Set([...groups.values()].flatMap((plot) => [...plot.reserved]));
  return {
    months,
    regions,
    islands: [
      {
        id: CIRCLE_ISLAND,
        monthKeys: [...new Set([...keys, ...scaffold.map((item) => item.monthKey)])].sort(),
        center: centerOf(bounds),
        bounds,
        regionIds: regions.map((item) => item.id),
      },
    ],
    terrain: { tiles, waterways: circularWaterways(), waterLevel: 0 },
    projectTiles: tiles.filter(
      (tile) =>
        !reserved.has(circleKey(tile.position)) &&
        tile.surface !== 'water' &&
        tile.surface !== 'path',
    ),
  };
}
