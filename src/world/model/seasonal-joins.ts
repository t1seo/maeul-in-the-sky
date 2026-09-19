import { boundsOf } from './math.js';
import type { MonthTerrain } from './terrain.js';
import type { WorldRegion, WorldSettings, WorldTile } from './types.js';

function includeJoins(month: MonthTerrain, joins: readonly WorldTile[]): MonthTerrain {
  const tiles = [...month.tiles, ...joins];
  const regions = month.regions.map((region): WorldRegion => {
    if (region.kind !== 'nature') return region;
    const owned = tiles.filter((tile) => tile.regionId === region.id);
    const bounds = boundsOf(
      owned.map((tile) => tile.position),
      0.5,
    );
    return {
      ...region,
      tileIds: owned.map((tile) => tile.id),
      boundary: [
        { x: bounds.min.x, y: 0, z: bounds.min.z },
        { x: bounds.max.x, y: 0, z: bounds.min.z },
        { x: bounds.max.x, y: 0, z: bounds.max.z },
        { x: bounds.min.x, y: 0, z: bounds.max.z },
      ],
    };
  });
  return { ...month, tiles, regions };
}

export function connectMonths(
  months: readonly MonthTerrain[],
  layout: WorldSettings['layout'],
): readonly MonthTerrain[] {
  switch (layout) {
    case 'archipelago':
    case 'island':
      return months;
    case 'seasonal': {
      const occupied = new Set(
        months.flatMap((month) =>
          month.tiles.map((tile) => `${tile.position.x},${tile.position.z}`),
        ),
      );
      const previousByIsland = new Map<string, MonthTerrain>();
      const joinsByMonth = new Map<string, WorldTile[]>();
      for (const month of months) {
        const previous = previousByIsland.get(month.islandId);
        previousByIsland.set(month.islandId, month);
        if (!previous || previous.origin.x === month.origin.x) continue;
        const joins: WorldTile[] = [];
        // Alternating year columns put December/January and other yearly joins on
        // the same row. The top-bank corridor never replaces an existing water tile.
        for (let x = previous.origin.x + 10; x < month.origin.x + 2; x += 1) {
          const z = month.origin.z;
          if (occupied.has(`${x},${z}`)) continue;
          occupied.add(`${x},${z}`);
          joins.push({
            id: `tile:${previous.monthKey}:join:${x}:${z}`,
            islandId: month.islandId,
            regionId: `region:${previous.monthKey}:nature`,
            position: { x, y: 0.5, z },
            size: 1,
            surface: 'path',
            source: 'scenery',
            activityHeight: 0,
          });
        }
        joinsByMonth.set(previous.monthKey, joins);
      }
      return months.map((month) => {
        const joins = joinsByMonth.get(month.monthKey);
        return joins ? includeJoins(month, joins) : month;
      });
    }
  }
}
