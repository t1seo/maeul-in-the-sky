import type { Hemisphere } from '../../../core/render-options.js';
import type { IsoCell } from '../blocks.js';
import type { BiomeContext } from '../biomes.js';
import { dateSeasonZone } from '../scene/season.js';
import { currentSurfaceContext } from '../scene/surface-context.js';
import { selectEvenly } from './selection.js';

export interface WaterfallOutlet {
  readonly cell: IsoCell;
  readonly edge: 'left' | 'right';
  readonly x: number;
  readonly y: number;
  readonly drop: number;
}

export function liquidSurfaceCells(
  cells: readonly IsoCell[],
  biomes?: ReadonlyMap<string, BiomeContext>,
  hemisphere: Hemisphere = currentSurfaceContext()?.hemisphere ?? 'north',
): IsoCell[] {
  return cells.filter((cell) => {
    const natural = cell.level100 >= 9 && cell.level100 <= 22;
    if (natural && cell.date) {
      const zone = dateSeasonZone(cell.date, hemisphere);
      if (zone === 0 || zone === 1 || zone === 7) return false;
    }
    const biome = biomes?.get(`${cell.week},${cell.day}`);
    return natural || biome?.isRiver || biome?.isPond;
  });
}

export function waterfallOutlets(
  cells: readonly IsoCell[],
  biomes?: ReadonlyMap<string, BiomeContext>,
  hemisphere?: Hemisphere,
): WaterfallOutlet[] {
  const lastPosition = Math.max(...cells.map((cell) => cell.week * 7 + cell.day));
  const observed = new Set(cells.map((cell) => `${cell.week},${cell.day}`));
  const riverAt = (week: number, day: number) =>
    observed.has(`${week},${day}`) && biomes?.get(`${week},${day}`)?.isRiver;
  const rivers = liquidSurfaceCells(cells, biomes, hemisphere).filter((cell) =>
    riverAt(cell.week, cell.day),
  );
  const terminals = rivers.filter(
    (cell) =>
      (cell.week + 1) * 7 + cell.day > lastPosition &&
      ![-1, 0, 1].some((offset) => riverAt(cell.week + 1, cell.day + offset)),
  );
  const spillways = rivers.filter(
    (cell) =>
      cell.day === 6 &&
      !terminals.includes(cell) &&
      observed.has(`${cell.week + 1},6`) &&
      !riverAt(cell.week + 1, 6) &&
      (riverAt(cell.week - 1, 6) || riverAt(cell.week - 1, 5) || riverAt(cell.week, 5)),
  );
  const candidates = [
    ...selectEvenly(terminals, 4).map((cell) => ({ cell, edge: 'right' as const })),
    ...selectEvenly(spillways, 2).map((cell) => ({ cell, edge: 'left' as const })),
  ];
  const outlets: WaterfallOutlet[] = [];
  for (const { cell, edge } of candidates) {
    const x = cell.isoX + (edge === 'left' ? -4 : 4);
    const y = cell.isoY + 1.75;
    if (outlets.length >= 4) break;
    if (
      outlets.some(
        (outlet) => Math.hypot(outlet.x - x, outlet.y - y) < (edge === 'right' ? 10 : 30),
      )
    )
      continue;
    outlets.push({ cell, edge, x, y, drop: cell.height + 20 });
  }
  return outlets;
}

export function riverCurrentPath(
  cell: IsoCell,
  biomes: ReadonlyMap<string, BiomeContext>,
  outlet?: WaterfallOutlet['edge'],
): string {
  const [entry = '-2,-0.6', ...tributaries] = riverContacts(cell, biomes, -1);
  const contacts = riverContacts(cell, biomes, 1);
  const [exit = '2,0.6', ...branches] = outlet
    ? [...new Set([`${outlet === 'left' ? -4 : 4},1.75`, ...contacts])]
    : contacts;
  return (
    `M${entry}Q0,0 ${exit}` +
    tributaries.map((point) => `M${point}L0,0`).join('') +
    branches.map((point) => `M0,0L${point}`).join('')
  );
}

function riverContacts(
  cell: IsoCell,
  biomes: ReadonlyMap<string, BiomeContext>,
  direction: -1 | 1,
): string[] {
  const contacts: readonly (readonly [number, number, number, number])[] = [
    [direction, 0, direction * 4, direction * 1.75],
    [direction, direction, 0, direction * 3.5],
    [direction, -direction, direction * 8, 0],
    [0, direction, -direction * 4, direction * 1.75],
  ];
  const connected = contacts.flatMap(([week, day, x, y]) =>
    biomes.get(`${cell.week + week},${cell.day + day}`)?.isRiver ? [`${x},${y}`] : [],
  );
  return connected;
}
