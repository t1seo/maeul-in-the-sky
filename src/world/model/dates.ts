import { z } from 'zod';
import { WorldModelError } from './errors.js';
import type { WorldRange, WorldSeason } from './types.js';

export const DAY_MS = 86_400_000;
export const MAX_WORLD_DAYS = 800;
export const worldDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const time = Date.parse(`${value}T00:00:00Z`);
    return (
      value >= '0001-01-01' &&
      Number.isFinite(time) &&
      new Date(time).toISOString().slice(0, 10) === value
    );
  }, 'Expected a real UTC date in years 1–9999');

export function dateTime(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

export function shiftDate(date: string, days: number): string | undefined {
  const time = dateTime(date) + days * DAY_MS;
  if (time < dateTime('0001-01-01') || time > dateTime('9999-12-31')) return undefined;
  return new Date(time).toISOString().slice(0, 10);
}

export function monthEnd(monthKey: string): string {
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7));
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const length = month === 2 ? (leap ? 29 : 28) : [4, 6, 9, 11].includes(month) ? 30 : 31;
  return `${monthKey}-${length}`;
}

export function datesIn(range: WorldRange): readonly string[] {
  const length = (dateTime(range.to) - dateTime(range.from)) / DAY_MS + 1;
  if (!Number.isInteger(length) || length < 1 || length > MAX_WORLD_DAYS) {
    throw new WorldModelError(
      'INVALID_INPUT',
      `World ranges must contain 1–${MAX_WORLD_DAYS} dates`,
    );
  }
  return Array.from({ length }, (_, offset) =>
    new Date(dateTime(range.from) + offset * DAY_MS).toISOString().slice(0, 10),
  );
}

export function calendarSeason(date: string, hemisphere: 'north' | 'south'): WorldSeason {
  const month = (Number(date.slice(5, 7)) - 1 + (hemisphere === 'south' ? 6 : 0)) % 12;
  if (month < 2 || month === 11) return 'winter';
  if (month < 5) return 'spring';
  if (month < 8) return 'summer';
  return 'autumn';
}
