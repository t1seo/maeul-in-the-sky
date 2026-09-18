import type { SceneCell, ScenePlacement, NeighborhoodPath } from '../../../core/scene-types.js';
import type { BiomeContext } from '../biomes.js';

const RESIDENCES = new Set([
  'hut',
  'house',
  'houseB',
  'houseWinter',
  'houseBWinter',
  'inn',
  'manor',
  'hanok',
  'choga',
  'hanokEstate',
]);

function connector(id: string, cells: readonly SceneCell[], catalogId: string): NeighborhoodPath {
  const front = [...cells].sort((a, b) => b.week + b.day - a.week - a.day)[0];
  const points = cells.map((cell) => ({ x: cell.isoX + 2, y: cell.isoY + 2 }));
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    id,
    catalogId,
    anchorDate: front.date,
    week: front.week,
    day: front.day,
    drawOrder: front.week + front.day,
    points,
    footprint: {
      x: Math.min(...xs) - 2,
      y: Math.min(...ys) - 2,
      width: Math.max(...xs) - Math.min(...xs) + 4,
      height: Math.max(...ys) - Math.min(...ys) + 4,
    },
  };
}

export function neighborhoodPaths(
  cells: readonly SceneCell[],
  placements: readonly ScenePlacement[],
  biomes: ReadonlyMap<string, BiomeContext>,
): NeighborhoodPath[] {
  const byPosition = new Map(cells.map((cell) => [`${cell.week},${cell.day}`, cell]));
  const byDate = new Map(cells.map((cell) => [cell.date, cell]));
  const residences = placements
    .filter((placement) => RESIDENCES.has(placement.catalogId) && !placement.decorative)
    .sort((a, b) => a.anchorDate.localeCompare(b.anchorDate) || a.id.localeCompare(b.id));
  const used = new Set<string>();
  const paths: NeighborhoodPath[] = [];
  const dry = (cell: SceneCell) => {
    const biome = biomes.get(`${cell.week},${cell.day}`);
    return !biome?.isRiver && !biome?.isPond && !(cell.level100 >= 9 && cell.level100 <= 22);
  };
  for (const residence of residences) {
    if (used.has(residence.id)) continue;
    const origin = byDate.get(residence.anchorDate);
    if (!origin || !dry(origin)) continue;
    const routes = new Map<string, SceneCell[]>([[origin.date, [origin]]]);
    const queue = [origin];
    for (let index = 0; index < queue.length; index++) {
      const current = queue[index];
      const route = routes.get(current.date);
      if (!route || route.length >= 4) continue;
      for (const [dw, dd] of [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
      ]) {
        const next = byPosition.get(`${current.week + dw},${current.day + dd}`);
        if (
          !next ||
          routes.has(next.date) ||
          !dry(next) ||
          Math.abs(current.height - next.height) > 5
        )
          continue;
        routes.set(next.date, [...route, next]);
        queue.push(next);
      }
    }
    const neighbors = residences
      .filter(
        (candidate) =>
          candidate.anchorDate !== origin.date &&
          !used.has(candidate.id) &&
          routes.has(candidate.anchorDate),
      )
      .slice(0, 3);
    if (neighbors.length >= 2) {
      used.add(residence.id);
      for (const neighbor of neighbors) {
        const route = routes.get(neighbor.anchorDate);
        if (!route) continue;
        paths.push(connector(`path-${residence.id}-${neighbor.id}`, route, 'neighborhood:path'));
        used.add(neighbor.id);
      }
    }
    if (!biomes.get(`${origin.week},${origin.day}`)?.nearWater) continue;
    const water = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ]
      .map(([dw, dd]) => byPosition.get(`${origin.week + dw},${origin.day + dd}`))
      .find(
        (cell) =>
          cell &&
          (biomes.get(`${cell.week},${cell.day}`)?.isRiver ||
            biomes.get(`${cell.week},${cell.day}`)?.isPond),
      );
    if (water && Math.abs(origin.height - water.height) <= 5) {
      paths.push(connector(`deck-${residence.id}`, [origin, water], 'neighborhood:deck'));
    }
  }
  return paths.sort((a, b) => a.id.localeCompare(b.id));
}
