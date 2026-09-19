import type { SnapshotV1 } from '../../core/snapshot-types.js';
import { DAY_MS, dateTime, monthEnd, shiftDate } from '../model/dates.js';
import type { WorldRange } from '../model/types.js';
import { contributionSeries, dayCount, weekdaySeries } from './series.js';
import type { AnalyticsModel, Granularity, Observation } from './types.js';

function monthsIn(
  range: WorldRange | undefined,
  observations: readonly Observation[],
): readonly string[] {
  if (!range) return [];
  const months = new Set(observations.map((day) => day.date.slice(0, 7)));
  if (dayCount(range) <= 36_600) {
    let next: string | undefined = `${range.from.slice(0, 7)}-01`;
    while (next && next <= range.to) {
      months.add(next.slice(0, 7));
      next = shiftDate(monthEnd(next.slice(0, 7)), 1);
    }
  }
  return [...months].sort();
}

export function buildAnalytics(
  snapshot: SnapshotV1,
  month = '',
  granularity: Granularity = 'week',
): AnalyticsModel {
  const original = snapshot.weeks
    .flatMap((week) => week.days)
    .sort((a, b) => a.date.localeCompare(b.date));
  const first = original[0]?.date;
  const last = original.at(-1)?.date;
  const fullRange = first && last ? { from: first, to: last } : undefined;
  const from = month && first && first < `${month}-01` ? `${month}-01` : first;
  const to = month && last && last > monthEnd(month) ? monthEnd(month) : last;
  const range: WorldRange | undefined = from && to && from <= to ? { from, to } : undefined;
  const observations = range
    ? original.filter((day) => day.date >= range.from && day.date <= range.to)
    : [];
  let longestStreak = 0;
  let currentStreak = 0;
  let previous: Observation | undefined;
  for (const day of observations) {
    currentStreak =
      day.count > 0
        ? previous && dateTime(day.date) - dateTime(previous.date) === DAY_MS
          ? currentStreak + 1
          : 1
        : 0;
    longestStreak = Math.max(longestStreak, currentStreak);
    previous = day;
  }
  if (previous?.date !== range?.to) currentStreak = 0;
  const months = monthsIn(fullRange, original);
  const selectedMonths = month ? [month] : months;
  const breakdown = selectedMonths.map((key) => ({
    month: key,
    activity: snapshot.activity?.months.find((item) => item.month === key),
  }));
  const available = breakdown.flatMap((item) => (item.activity ? [item.activity] : []));
  return {
    username: snapshot.username,
    source: snapshot.source,
    range,
    months,
    summary: {
      contributions: observations.length
        ? observations.reduce((sum, day) => sum + day.count, 0)
        : null,
      activeDays: observations.length ? observations.filter((day) => day.count > 0).length : null,
      observedDays: observations.length,
      missingDays: range ? dayCount(range) - observations.length : 0,
      longestStreak,
      currentStreak,
    },
    monthlySums: available.length
      ? {
          commits: available.reduce((sum, item) => sum + item.commits, 0),
          pullRequests: available.reduce((sum, item) => sum + item.pullRequests, 0),
          months: available.length,
        }
      : undefined,
    trend: contributionSeries(observations, range, granularity),
    weekdays: weekdaySeries(observations, range),
    breakdown,
  };
}
