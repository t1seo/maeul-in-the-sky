import { WorldModelError } from './errors.js';
import { datesIn } from './dates.js';
import { rewardTier } from './calendar.js';
import type { Vec3, WorldBounds, WorldScene } from './types.js';

export function requireWorld(condition: boolean, message: string): asserts condition {
  if (!condition) throw new WorldModelError('INVALID_WORLD', message);
}

export function uniqueIds<T extends { readonly id: string }>(
  items: readonly T[],
  kind: string,
): ReadonlyMap<string, T> {
  const map = new Map(items.map((item) => [item.id, item]));
  requireWorld(map.size === items.length, `Duplicate ${kind} identity`);
  return map;
}

export function contains(bounds: WorldBounds, point: Vec3): boolean {
  return (
    point.x >= bounds.min.x &&
    point.x <= bounds.max.x &&
    point.y >= bounds.min.y &&
    point.y <= bounds.max.y &&
    point.z >= bounds.min.z &&
    point.z <= bounds.max.z
  );
}

export function validateSpace(scene: WorldScene): void {
  const islands = uniqueIds(scene.islands, 'island');
  const regions = uniqueIds(scene.regions, 'region');
  const tiles = uniqueIds(scene.terrain.tiles, 'terrain');
  const days = uniqueIds(scene.days, 'day');
  uniqueIds(scene.terrain.waterways, 'waterway');
  const dates = datesIn(scene.range);
  requireWorld(
    scene.days.length === dates.length,
    'World day slots do not cover the declared range',
  );
  const ownership = new Set<string>();
  for (const region of regions.values()) {
    const island = islands.get(region.islandId);
    requireWorld(
      island !== undefined &&
        island.regionIds.includes(region.id) &&
        island.monthKeys.includes(region.monthKey),
      `Unknown owner for ${region.id}`,
    );
    for (const tileId of region.tileIds) {
      requireWorld(!ownership.has(tileId), `Tile ${tileId} belongs to multiple regions`);
      ownership.add(tileId);
      const tile = tiles.get(tileId);
      requireWorld(
        tile !== undefined && tile.regionId === region.id && tile.islandId === region.islandId,
        `Region tile reference mismatch: ${tileId}`,
      );
    }
  }
  requireWorld(ownership.size === tiles.size, 'Every terrain tile needs exactly one region');
  const allMonths = scene.islands.flatMap((island) => island.monthKeys);
  requireWorld(
    new Set(allMonths).size === allMonths.length,
    'A month cannot belong to two islands',
  );
  for (const island of islands.values()) {
    requireWorld(
      new Set(island.regionIds).size === island.regionIds.length &&
        island.regionIds.every((id) => regions.get(id)?.islandId === island.id),
      `Invalid region references on ${island.id}`,
    );
    requireWorld(
      contains(scene.bounds, island.center),
      `Island ${island.id} lies outside world bounds`,
    );
  }
  let total = 0;
  for (const [index, day] of scene.days.entries()) {
    const tile = tiles.get(day.tileId);
    requireWorld(
      day.id === `day:${day.date}` &&
        day.date === dates[index] &&
        day.monthKey === day.date.slice(0, 7),
      `Invalid calendar identity: ${day.id}`,
    );
    requireWorld(
      tile !== undefined && tile.source === 'day' && tile.date === day.date,
      `Date/tile mismatch: ${day.id}`,
    );
    if (day.kind === 'observed') {
      total += day.count;
      const progress = day.consistency;
      requireWorld(
        day.rewardTier === rewardTier(day.count) &&
          tile.activityHeight === Math.min(day.count / 50, 1),
        `Invalid activity height or reward: ${day.date}`,
      );
      requireWorld(
        progress.activeDays <= progress.observedDays &&
          progress.complete === (progress.observedDays === 28) &&
          progress.tier ===
            (progress.activeDays >= 20
              ? 3
              : progress.activeDays >= 12
                ? 2
                : progress.activeDays >= 5
                  ? 1
                  : 0),
        `Invalid consistency: ${day.date}`,
      );
    } else requireWorld(tile.activityHeight === 0, `Missing day has activity: ${day.date}`);
  }
  requireWorld(Number.isSafeInteger(total), 'Contribution sum exceeds safe integer range');
  for (const tile of tiles.values()) {
    const island = islands.get(tile.islandId);
    requireWorld(
      island !== undefined &&
        regions.get(tile.regionId)?.islandId === island.id &&
        contains(scene.bounds, tile.position) &&
        contains(island.bounds, tile.position),
      `Invalid terrain ownership or bounds: ${tile.id}`,
    );
    requireWorld(
      tile.source === 'day'
        ? tile.date !== undefined && days.get(`day:${tile.date}`)?.tileId === tile.id
        : tile.date === undefined && tile.activityHeight === 0,
      `Invalid terrain source: ${tile.id}`,
    );
  }
  for (const water of scene.terrain.waterways) {
    requireWorld(
      islands.has(water.islandId) && water.points.every((point) => contains(scene.bounds, point)),
      `Invalid waterway: ${water.id}`,
    );
  }
}
