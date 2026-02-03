import type { ContributionData } from '../../src/core/types.js';

/**
 * Minimal but realistic mock contribution data for theme snapshot tests.
 *
 * 4 weeks of data with mixed contribution levels (0-4).
 * computeStats() recomputes stats from the week data; see expected values below.
 *
 * Day index mapping: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
 *
 * Computed stats from this data:
 *   total:          42
 *   longestStreak:   7
 *   currentStreak:   3
 *   mostActiveDay:  'Wednesday'
 */
export const mockContributionData: ContributionData = {
  weeks: [
    // ── Week 1: scattered activity ─────────────────────────────
    {
      firstDay: '2025-01-05',
      days: [
        { date: '2025-01-05', count: 0, level: 0 }, // Sun
        { date: '2025-01-06', count: 2, level: 1 }, // Mon
        { date: '2025-01-07', count: 0, level: 0 }, // Tue  (break)
        { date: '2025-01-08', count: 5, level: 2 }, // Wed
        { date: '2025-01-09', count: 3, level: 2 }, // Thu
        { date: '2025-01-10', count: 0, level: 0 }, // Fri  (break)
        { date: '2025-01-11', count: 1, level: 1 }, // Sat
      ],
    },
    // ── Week 2: contains longest streak (7 days: Sat-W1 → Fri-W2) ──
    {
      firstDay: '2025-01-12',
      days: [
        { date: '2025-01-12', count: 1, level: 1 }, // Sun  (streak continues from W1 Sat)
        { date: '2025-01-13', count: 3, level: 2 }, // Mon
        { date: '2025-01-14', count: 1, level: 1 }, // Tue
        { date: '2025-01-15', count: 6, level: 3 }, // Wed
        { date: '2025-01-16', count: 2, level: 1 }, // Thu
        { date: '2025-01-17', count: 1, level: 1 }, // Fri  (streak = 7: W1-Sat + W2-Sun..Fri)
        { date: '2025-01-18', count: 0, level: 0 }, // Sat  (break)
      ],
    },
    // ── Week 3: sparse, high Wednesday ─────────────────────────
    {
      firstDay: '2025-01-19',
      days: [
        { date: '2025-01-19', count: 0, level: 0 }, // Sun
        { date: '2025-01-20', count: 0, level: 0 }, // Mon
        { date: '2025-01-21', count: 0, level: 0 }, // Tue
        { date: '2025-01-22', count: 8, level: 4 }, // Wed  (peak day)
        { date: '2025-01-23', count: 0, level: 0 }, // Thu
        { date: '2025-01-24', count: 0, level: 0 }, // Fri
        { date: '2025-01-25', count: 0, level: 0 }, // Sat
      ],
    },
    // ── Week 4: ends with 3-day current streak ─────────────────
    {
      firstDay: '2025-01-26',
      days: [
        { date: '2025-01-26', count: 0, level: 0 }, // Sun
        { date: '2025-01-27', count: 1, level: 1 }, // Mon
        { date: '2025-01-28', count: 0, level: 0 }, // Tue
        { date: '2025-01-29', count: 0, level: 0 }, // Wed  (break before current streak)
        { date: '2025-01-30', count: 3, level: 2 }, // Thu  (current streak start)
        { date: '2025-01-31', count: 2, level: 1 }, // Fri  (current streak)
        { date: '2025-02-01', count: 3, level: 2 }, // Sat  (current streak end)
      ],
    },
  ],
  // Stats are recomputed by computeStats() inside theme.render().
  // The placeholder values here match the expected computed output.
  stats: { total: 42, longestStreak: 7, currentStreak: 3, mostActiveDay: 'Wednesday' },
  year: 2025,
  username: 'testuser',
};
