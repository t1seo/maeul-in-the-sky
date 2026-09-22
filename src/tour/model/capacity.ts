import { WorldDataError } from '../../world/data/errors.js';

const MAX_TOUR_DAYS = 800;
const DAY_MS = 86_400_000;

export function assertTourDates(dates: readonly string[]): void {
  if (dates.length === 0)
    throw new WorldDataError('invalid_input', 'A village tour needs at least one observed date.');
  if (dates.length > MAX_TOUR_DAYS)
    throw new WorldDataError('too_large', 'A village tour supports at most 800 observed dates.');
  let first = Infinity;
  let last = -Infinity;
  for (const date of dates) {
    const timestamp = Date.parse(`${date}T00:00:00.000Z`);
    first = Math.min(first, timestamp);
    last = Math.max(last, timestamp);
  }
  if ((last - first) / DAY_MS + 1 > MAX_TOUR_DAYS)
    throw new WorldDataError(
      'too_large',
      'A village tour supports a span of at most 800 calendar days.',
    );
}
