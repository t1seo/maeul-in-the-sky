import { circleKey } from './circular-layout.js';
import type { CircleCell } from './circular-layout.js';
import { WorldModelError } from './errors.js';
import type { WorldRegionKind } from './types.js';

export type CirclePlots = {
  readonly cells: readonly CircleCell[];
  readonly days: ReadonlyMap<string, number>;
  readonly plots: ReadonlyMap<string, CircleCell>;
  readonly kinds: ReadonlyMap<string, WorldRegionKind>;
  readonly reserved: ReadonlySet<string>;
};

const HOUSE_PLOTS = [
  ['8,8', 0, 0],
  ['9,8', 1, 0],
  ['9,7', 1, -1],
  ['8,9', 0, 1],
] as const;
const OTHER_PLOTS = [
  '3,0',
  '2,9',
  '4,8',
  '10,2',
  '3,9',
  '4,9',
  '5,9',
  '6,0',
  '7,0',
  '8,0',
] as const;

export function circularPlots(cells: readonly CircleCell[]): CirclePlots {
  const land = cells.filter((cell) => cell.surface !== 'water' && cell.surface !== 'path');
  const byLocal = new Map(land.map((cell) => [`${cell.u},${cell.v}`, cell]));
  const home = land.find((cell) =>
    HOUSE_PLOTS.every(([, du, dv]) => byLocal.has(`${cell.u + du},${cell.v + dv}`)),
  );
  if (!home)
    throw new WorldModelError('INVALID_WORLD', 'The circular month has no connected home plot');
  const plots = new Map<string, CircleCell>();
  const reserved = new Set<string>();
  for (const [id, du, dv] of HOUSE_PLOTS) {
    const cell = byLocal.get(`${home.u + du},${home.v + dv}`);
    if (!cell) throw new WorldModelError('INVALID_WORLD', 'A circular home attachment is missing');
    plots.set(id, cell);
    reserved.add(circleKey(cell));
  }
  const nearHome = [...land].sort(
    (a, b) =>
      (a.u - home.u) ** 2 + (a.v - home.v) ** 2 - (b.u - home.u) ** 2 - (b.v - home.v) ** 2 ||
      a.v - b.v ||
      a.u - b.u,
  );
  const available = nearHome.filter((cell) => !reserved.has(circleKey(cell)));
  for (const [index, id] of OTHER_PLOTS.entries()) {
    const cell = available[index];
    if (!cell) throw new WorldModelError('INVALID_WORLD', 'The circular month has no reward plot');
    plots.set(id, cell);
    reserved.add(circleKey(cell));
  }
  const daily = land
    .filter((cell) => !reserved.has(circleKey(cell)))
    .sort((a, b) => a.v - b.v || a.u - b.u)
    .slice(0, 31);
  if (daily.length !== 31)
    throw new WorldModelError('INVALID_WORLD', 'The circular month has fewer than 31 date slots');
  const days = new Map(daily.map((cell, index) => [circleKey(cell), index + 1]));
  for (const cell of daily) reserved.add(circleKey(cell));
  const city = Math.round(land.length * 0.07);
  const town = Math.round(land.length * 0.18);
  const kinds = new Map(
    nearHome.map((cell, index): readonly [string, WorldRegionKind] => [
      circleKey(cell),
      index < city ? 'city' : index < city + town ? 'town' : 'nature',
    ]),
  );
  return { cells: land, days, plots, kinds, reserved };
}
