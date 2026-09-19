import type { LandCell } from './landform.js';
import type { WorldRegionKind } from './types.js';

export function allocateLandUse(cells: readonly LandCell[]): ReadonlyMap<string, WorldRegionKind> {
  const land = cells.filter((cell) => cell.surface !== 'water');
  const rankAround =
    (x: number, z: number) =>
    (a: LandCell, b: LandCell): number =>
      (a.x - x) ** 2 + (a.z - z) ** 2 - ((b.x - x) ** 2 + (b.z - z) ** 2) || a.z - b.z || a.x - b.x;
  const city = new Set(
    [...land]
      .sort(rankAround(9, 1))
      .slice(0, Math.round(land.length * 0.07))
      .map((cell) => `${cell.x},${cell.z}`),
  );
  const town = new Set(
    land
      .filter((cell) => !city.has(`${cell.x},${cell.z}`))
      .sort(rankAround(8, 8))
      .slice(0, Math.round(land.length * 0.18))
      .map((cell) => `${cell.x},${cell.z}`),
  );
  return new Map(
    land.map((cell): readonly [string, WorldRegionKind] => {
      const key = `${cell.x},${cell.z}`;
      return [key, city.has(key) ? 'city' : town.has(key) ? 'town' : 'nature'];
    }),
  );
}
