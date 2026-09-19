import { calendarSeason } from './dates.js';
import type { Vec3, WorldSeason, WorldSettings, WorldTile } from './types.js';

export const CIRCLE_RADIUS = 32;
export const CIRCLE_ISLAND = 'island:seasonal-circle';
export const CIRCLE_SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;

export type CircleCell = {
  readonly x: number;
  readonly z: number;
  readonly u: number;
  readonly v: number;
  readonly season: WorldSeason;
  readonly slot: number;
  readonly surface: WorldTile['surface'];
};

export function circlePoint(season: WorldSeason, u: number, v: number, y = 0): Vec3 {
  switch (season) {
    case 'spring':
      return { x: -u, y, z: -v };
    case 'summer':
      return { x: v, y, z: -u };
    case 'autumn':
      return { x: u, y, z: v };
    case 'winter':
      return { x: -v, y, z: u };
  }
}

export function circleSeason(point: Pick<Vec3, 'x' | 'z'>): WorldSeason {
  return point.x < 0 ? (point.z < 0 ? 'spring' : 'winter') : point.z < 0 ? 'summer' : 'autumn';
}

export function circleKey(point: Pick<Vec3, 'x' | 'z'>): string {
  return `${point.x},${point.z}`;
}

function surface(u: number, v: number): WorldTile['surface'] {
  if ((u === 9.5 && v >= 11.5) || (u >= 8.5 && u <= 10.5 && v >= 10.5 && v <= 12.5)) return 'water';
  if (
    (u <= 1.5 && v <= 24.5) ||
    (v <= 1.5 && u <= 24.5) ||
    (v === 2.5 && (u === 3.5 || u === 24.5)) ||
    ((u === 10.5 || u === 11.5) && (v === 13.5 || v === 20.5))
  )
    return 'path';
  if ((u + 1) ** 2 + v * v > CIRCLE_RADIUS ** 2 || u * u + (v + 1) ** 2 > CIRCLE_RADIUS ** 2)
    return 'sand';
  return u > 18 && v > 18 ? 'rock' : 'grass';
}

export function circleCells(): readonly CircleCell[] {
  const sectors: { readonly u: number; readonly v: number }[][] = [[], [], []];
  for (let v = 0.5; v < CIRCLE_RADIUS; v += 1) {
    for (let u = 0.5; u < CIRCLE_RADIUS; u += 1) {
      if (u * u + v * v > CIRCLE_RADIUS ** 2) continue;
      const sector = Math.min(2, Math.floor(Math.atan2(v, u) / (Math.PI / 6)));
      sectors[sector]?.push({ u, v });
    }
  }
  return CIRCLE_SEASONS.flatMap((season) =>
    sectors.flatMap((cells, sector) =>
      [...cells]
        .sort((a, b) => a.u * a.u + a.v * a.v - b.u * b.u - b.v * b.v || a.v - b.v || a.u - b.u)
        .map(({ u, v }, index): CircleCell => ({
          ...circlePoint(season, u, v),
          u,
          v,
          season,
          slot: sector * 3 + Math.floor((index * 3) / cells.length),
          surface: surface(u, v),
        })),
    ),
  );
}

export function circleMonthSlot(month: string, hemisphere: WorldSettings['hemisphere']): string {
  const adjusted = (Number(month.slice(5, 7)) - 1 + (hemisphere === 'south' ? 6 : 0)) % 12;
  const slot = ((adjusted + 1) % 3) * 3 + (Number(month.slice(0, 4)) % 3);
  return `${calendarSeason(`${month}-01`, hemisphere)}:${slot}`;
}

export function circleHeight(cell: CircleCell, seed: number): number {
  if (cell.surface === 'water') return 0;
  if (cell.surface === 'path') return 0.5;
  if (cell.surface === 'sand') return 0.25;
  const ridge = 0.7 * Math.exp(-((cell.u - 19) ** 2 + (cell.v - 18) ** 2) / 70);
  return (
    Math.round(
      (0.7 + ridge + Math.sin(cell.u * 0.22 + (seed % 7)) * Math.sin(cell.v * 0.19) * 0.16) * 1000,
    ) / 1000
  );
}
