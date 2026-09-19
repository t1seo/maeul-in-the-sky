import { calendarSeason } from './dates.js';
import { landCells } from './landform.js';
import type { LandCell } from './landform.js';
import { hashKey } from './math.js';
import { WorldModelError } from './errors.js';
import type { PreparedWorldInput } from './input.js';
import type { Vec3, WorldSeason } from './types.js';

const SEASON_ANCHORS = {
  spring: { x: 0, z: 0 },
  summer: { x: 60, z: 0 },
  autumn: { x: 0, z: 48 },
  winter: { x: 60, z: 48 },
} as const satisfies Readonly<Record<WorldSeason, { readonly x: number; readonly z: number }>>;

type MonthLayout = {
  readonly origin: Vec3;
  readonly rotation: number;
  readonly islandId: string;
  readonly seed: number;
  readonly cells: readonly LandCell[];
};

export function monthLayout(monthKey: string, input: PreparedWorldInput): MonthLayout {
  const month = Number(monthKey.slice(5, 7)) - 1;
  const year = Number(monthKey.slice(0, 4));
  const seed = hashKey(`${input.snapshot.username}:${input.settings.layoutSeed}:${monthKey}`);
  const layout = input.settings.layout;
  switch (layout) {
    case 'seasonal-circle':
      throw new WorldModelError('INVALID_INPUT', 'Circular terrain uses its shared disk layout');
    case 'archipelago':
    case 'island': {
      const pitch = layout === 'island' ? 12 : 20;
      const row = Math.floor(month / 4) + (year - input.snapshot.year) * 3;
      const column = layout === 'island' && Math.abs(row % 2) === 1 ? 3 - (month % 4) : month % 4;
      return {
        origin: { x: column * pitch, y: 0, z: row * pitch },
        rotation: layout === 'archipelago' ? seed % 4 : 0,
        islandId: layout === 'island' ? 'island:unified' : `island:${monthKey}`,
        seed,
        cells: landCells(layout, seed),
      };
    }
    case 'seasonal': {
      const season = calendarSeason(`${monthKey}-01`, input.settings.hemisphere);
      const anchor = SEASON_ANCHORS[season];
      const slot = month === 11 ? 2 : month < 2 ? month : (month + 1) % 3;
      const row = year % 2 === 0 ? slot : 2 - slot;
      // Absolute year columns never reflow. An 800-day range spans at most four columns
      // (48 units), leaving at least 12 units between the fixed season anchors.
      const origin = { x: anchor.x + (year - 2000) * 12, y: 0, z: anchor.z + row * 10 };
      const cells = landCells('island', seed).filter(
        ({ x, z }) =>
          z >= 0 &&
          z <= 9 &&
          (x <= 9 || z === 2) &&
          !(x < 2 && ((row === 0 && z === 0) || (row === 2 && z === 9))),
      );
      return { origin, rotation: 0, islandId: `island:season:${season}`, seed, cells };
    }
  }
}
