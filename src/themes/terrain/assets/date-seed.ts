import type { IsoCell } from '../blocks.js';
import { hash } from '../../../utils/math.js';

export function assetCellIdentity(cell: IsoCell): string {
  return cell.date ?? `cell:${cell.week},${cell.day}`;
}

export function assetDateSeed(seed: number, date: string, purpose: string): number {
  return hash(`${seed}:${date}:${purpose}`);
}

/** A date maps to its seasonal week without depending on the visible calendar range. */
export function dateSeasonWeek(date: string, hemisphere: 'north' | 'south'): number {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  const value = new Date(timestamp);
  const winterYear =
    value.getUTCMonth() === 11 ? value.getUTCFullYear() : value.getUTCFullYear() - 1;
  const week = Math.floor((timestamp - Date.UTC(winterYear, 11, 1)) / (7 * 86_400_000));
  return (week + (hemisphere === 'south' ? 26 : 0)) % 52;
}
