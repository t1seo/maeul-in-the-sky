import type { GridCell100 } from '../../shared.js';
import type { TerrainPalette100, ElevationColors } from '../palette.js';
import { InputValidationError } from '../../../core/settings/errors.js';
import { getContributionDayOfWeek } from '../../../core/calendar.js';
export const THW = 8;
export const THH = 3.5;
const DAY_MS = 86_400_000;
export interface IsoCell {
  /** Calendar week index from the first available week's Sunday */
  week: number;
  /** Grid day index (0–6) */
  day: number;
  /** Source contribution date, optional for manually constructed cells */
  date?: string;
  count?: number;
  absoluteWeek?: number;
  /** 100-level intensity (0–99) */
  level100: number;
  /** Block height in pixels */
  height: number;
  /** Screen X of the isometric diamond center */
  isoX: number;
  /** Screen Y of the isometric diamond center */
  isoY: number;
  /** Pre-computed elevation colors for this cell */
  colors: ElevationColors;
}

/**
 * Convert grid cells to isometric coordinates with elevation.
 * Cells are sorted in drawing order (back to front).
 */
export function toIsoCells(
  cells: readonly GridCell100[],
  palette: TerrainPalette100,
  originX: number,
  originY: number,
): IsoCell[] {
  const dates = new Set<string>();
  for (const cell of cells) {
    if (dates.has(cell.date))
      throw new InputValidationError([
        { path: 'cells', message: `Duplicate contribution date: "${cell.date}"` },
      ]);
    dates.add(cell.date);
  }
  const calendarCells = cells.map((cell) => ({
    cell,
    day: getContributionDayOfWeek(cell.date),
    timestamp: Date.parse(cell.date),
  }));
  const firstSunday = calendarCells.reduce(
    (first, { timestamp, day }) => Math.min(first, timestamp - day * DAY_MS),
    Infinity,
  );
  const isoCells: IsoCell[] = calendarCells.map(({ cell, day, timestamp }) => {
    const week = cell.week ?? Math.floor((timestamp - firstSunday) / (7 * DAY_MS));
    return {
      week,
      day,
      date: cell.date,
      count: cell.count,
      absoluteWeek: Math.floor((timestamp - day * DAY_MS - Date.UTC(1970, 0, 4)) / (7 * DAY_MS)),
      level100: cell.level100,
      height: palette.getHeight(cell.level100),
      isoX: originX + (week - day) * THW,
      isoY: originY + (week + day) * THH,
      colors: palette.getElevation(cell.level100),
    };
  });

  // Sort by drawing order: back to front
  isoCells.sort((a, b) => {
    const sumA = a.week + a.day;
    const sumB = b.week + b.day;
    if (sumA !== sumB) return sumA - sumB;
    return a.week - b.week;
  });

  return isoCells;
}
