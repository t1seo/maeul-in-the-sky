import { DAY_MS, dateTime, monthEnd, shiftDate } from '../model/dates.js';
import type { WorldRange } from '../model/types.js';
import type { ContributionBucket, Granularity, Observation } from './types.js';

export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
export const dayCount = (range: WorldRange): number =>
  (dateTime(range.to) - dateTime(range.from)) / DAY_MS + 1;

function period(date: string, granularity: Granularity): WorldRange {
  switch (granularity) {
    case 'day':
      return { from: date, to: date };
    case 'week': {
      const weekday = new Date(dateTime(date)).getUTCDay();
      return {
        from: shiftDate(date, -weekday) ?? '0001-01-01',
        to: shiftDate(date, 6 - weekday) ?? '9999-12-31',
      };
    }
    case 'month':
      return { from: `${date.slice(0, 7)}-01`, to: monthEnd(date.slice(0, 7)) };
    default:
      return granularity satisfies never;
  }
}

function gap(from: string, to: string): ContributionBucket {
  return {
    from,
    to,
    label: from === to ? from : `${from} – ${to}`,
    total: null,
    observedDays: 0,
    missingDays: dayCount({ from, to }),
    partial: true,
  };
}

export function contributionSeries(
  observations: readonly Observation[],
  range: WorldRange | undefined,
  granularity: Granularity,
): readonly ContributionBucket[] {
  if (!range) return [];
  const groups = new Map<string, ContributionBucket>();
  for (const day of observations) {
    const interval = period(day.date, granularity);
    const from = interval.from < range.from ? range.from : interval.from;
    const to = interval.to > range.to ? range.to : interval.to;
    const previous = groups.get(from);
    const observedDays = (previous?.observedDays ?? 0) + 1;
    const missingDays = dayCount({ from, to }) - observedDays;
    groups.set(from, {
      from,
      to,
      label: from === to ? from : `${from} – ${to}`,
      total: (previous?.total ?? 0) + day.count,
      observedDays,
      missingDays,
      partial: missingDays > 0 || from !== interval.from || to !== interval.to,
    });
  }
  const result: ContributionBucket[] = [];
  let next: string | undefined = range.from;
  for (const bucket of groups.values()) {
    if (next && next < bucket.from) {
      const end = shiftDate(bucket.from, -1);
      if (end) result.push(gap(next, end));
    }
    result.push(bucket);
    next = shiftDate(bucket.to, 1);
  }
  if (next && next <= range.to) result.push(gap(next, range.to));
  return result;
}

export function weekdaySeries(
  observations: readonly Observation[],
  range: WorldRange | undefined,
): readonly ContributionBucket[] {
  if (!range) return [];
  const length = dayCount(range);
  const first = new Date(dateTime(range.from)).getUTCDay();
  return WEEKDAYS.map((label, index) => {
    const days = observations.filter((day) => new Date(dateTime(day.date)).getUTCDay() === index);
    const expected = Math.floor(length / 7) + ((index - first + 7) % 7 < length % 7 ? 1 : 0);
    return {
      ...range,
      label,
      total: days.length ? days.reduce((sum, day) => sum + day.count, 0) : null,
      observedDays: days.length,
      missingDays: expected - days.length,
      partial: expected !== days.length,
    };
  });
}
