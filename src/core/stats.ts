import type { ContributionWeek, ContributionStats } from './types.js';

/**
 * Computes contribution statistics from weekly contribution data.
 *
 * @param weeks - Array of contribution weeks (each week has 7 days, Sunday-Saturday)
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
    };
  }

  // Flatten all days from all weeks into a single array
  const allDays = weeks.flatMap((week) => week.days);

  // 1. Compute total contributions
  const total = allDays.reduce((sum, day) => sum + day.count, 0);

  // 2. Compute longest streak
  let longestStreak = 0;
  let currentStreakCount = 0;

  for (const day of allDays) {
    if (day.count > 0) {
      currentStreakCount++;
      longestStreak = Math.max(longestStreak, currentStreakCount);
    } else {
      currentStreakCount = 0;
    }
  }

  // 3. Compute current streak (counting backwards from the last day)
  let currentStreak = 0;
  for (let i = allDays.length - 1; i >= 0; i--) {
    if (allDays[i].count > 0) {
      currentStreak++;
    } else {
      break; // Stop at the first day with 0 contributions
    }
  }

  // 4. Compute most active day of the week
  // Accumulate contributions by day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  const dayTotals: number[] = [0, 0, 0, 0, 0, 0, 0];

  for (const week of weeks) {
    for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
      dayTotals[dayIndex] += week.days[dayIndex].count;
    }
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
  };
}
