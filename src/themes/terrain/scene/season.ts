import type { Hemisphere } from '../../../core/render-options.js';
import { getSeasonZone } from '../seasons.js';

export function dateSeasonPosition(date: string, hemisphere: Hemisphere): number {
  if (!date) return hemisphere === 'south' ? 26 : 0;
  const timestamp = Date.parse(`${date}T00:00:00.000Z`);
  const reference = new Date(timestamp);
  reference.setUTCMonth(11, 1);
  if (timestamp < reference.getTime()) reference.setUTCFullYear(reference.getUTCFullYear() - 1);
  return (
    (Math.floor((timestamp - reference.getTime()) / 604800000) +
      (hemisphere === 'south' ? 26 : 0)) %
    52
  );
}

export function dateSeasonZone(date: string, hemisphere: Hemisphere) {
  return getSeasonZone(0, dateSeasonPosition(date, hemisphere));
}
