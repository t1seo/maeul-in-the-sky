import type { ContributionWeek, ContributionStats } from './types.js';
import { getContributionDayOfWeek, normalizeContributionWeeks } from './calendar.js';

const DAY_MS = 86_400_000;

/**
 * Computes contribution statistics from weekly contribution data.
 *
 * @param weeks - Sunday-based contribution weeks; edge weeks may be partial
 * @returns Computed statistics including total, streaks, and most active day
 */
export function computeStats(weeks: ContributionWeek[]): ContributionStats {
  // Handle empty input
  if (weeks.length === 0) {
    return {
      total: 0,
      longestStreak: 0,
      currentStreak: 0,
      mostActiveDay: 'Monday', // Default for empty data
      activeDays: 0,
      busiestMonth: '',
      fromDate: '',
      toDate: '',
    };
  }

  const allDays = normalizeContributionWeeks(weeks).flatMap((week) => week.days);

  if (allDays.length === 0) {
    return {
      total: 0,
      longestStreak: 0,
      currentStreak: 0,
      mostActiveDay: 'Monday',
      activeDays: 0,
      busiestMonth: '',
      fromDate: '',
      toDate: '',
    };
  }

  // 1. Compute total contributions
  const total = allDays.reduce((sum, day) => sum + day.count, 0);
  const activeDays = allDays.filter((day) => day.count > 0).length;

  const monthTotals = new Map<string, number>();
  for (const day of allDays) {
    if (day.count > 0) {
      const month = day.date.slice(0, 7);
      monthTotals.set(month, (monthTotals.get(month) ?? 0) + day.count);
    }
  }

  let busiestMonth = '';
  let busiestMonthTotal = 0;
  for (const [month, monthTotal] of monthTotals) {
    if (monthTotal > busiestMonthTotal) {
      busiestMonth = month;
      busiestMonthTotal = monthTotal;
    }
  }

  // 2. Compute longest streak
  let longestStreak = 0;
  let currentStreakCount = 0;
  let previousTimestamp: number | undefined;

  for (const day of allDays) {
    const timestamp = Date.parse(`${day.date}T00:00:00.000Z`);
    if (day.count > 0) {
      currentStreakCount =
        previousTimestamp !== undefined && timestamp - previousTimestamp === DAY_MS
          ? currentStreakCount + 1
          : 1;
      longestStreak = Math.max(longestStreak, currentStreakCount);
    } else {
      currentStreakCount = 0;
    }
    previousTimestamp = timestamp;
  }

  // 3. Compute current streak (counting backwards from the last day)
  let currentStreak = 0;
  let laterTimestamp: number | undefined;
  for (let i = allDays.length - 1; i >= 0; i--) {
    const day = allDays[i];
    const timestamp = Date.parse(`${day.date}T00:00:00.000Z`);
    if (day.count <= 0 || (laterTimestamp !== undefined && laterTimestamp - timestamp !== DAY_MS)) {
      break;
    }
    currentStreak++;
    laterTimestamp = timestamp;
  }

  // 4. Compute most active day of the week
  // Accumulate contributions by day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  const dayTotals: number[] = [0, 0, 0, 0, 0, 0, 0];

  for (const day of allDays) {
    dayTotals[getContributionDayOfWeek(day.date)] += day.count;
  }

  // Find the day with the maximum contributions
  let maxDayIndex = 0;
  let maxContributions = dayTotals[0];

  for (let i = 1; i < dayTotals.length; i++) {
    if (dayTotals[i] > maxContributions) {
      maxContributions = dayTotals[i];
      maxDayIndex = i;
    }
  }

  // Map day index to day name
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mostActiveDay = dayNames[maxDayIndex];

  return {
    total,
    longestStreak,
    currentStreak,
    mostActiveDay,
    activeDays,
    busiestMonth,
    fromDate: allDays[0].date,
    toDate: allDays[allDays.length - 1].date,
  };
}
