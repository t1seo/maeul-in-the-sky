import { describe, it, expect } from 'vitest';
import { computeStats } from '../../src/core/stats.js';
import {
  createMockContributionData,
  createEmptyContributionData,
  createFullContributionData,
  createStreakTestData,
} from '../fixtures/contribution-data.js';
import { mockContributionData } from '../fixtures/mock-data.js';

describe('computeStats', () => {
  // ── Empty / edge-case inputs ──────────────────────────────────

  describe('empty inputs', () => {
    it('should return zeros for empty weeks array', () => {
      const stats = computeStats([]);

      expect(stats.total).toBe(0);
      expect(stats.longestStreak).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.mostActiveDay).toBe('Monday');
      expect(stats.activeDays).toBe(0);
      expect(stats.busiestMonth).toBe('');
      expect(stats.fromDate).toBe('');
      expect(stats.toDate).toBe('');
    });

    it('should return zeros for all-zero contribution data', () => {
      const data = createEmptyContributionData();
      const stats = computeStats(data.weeks);

      expect(stats.total).toBe(0);
      expect(stats.longestStreak).toBe(0);
      expect(stats.currentStreak).toBe(0);
    });
  });

  describe('range and activity summary', () => {
    it('counts active days and reports the covered date range', () => {
      const stats = computeStats(mockContributionData.weeks);

      expect(stats.activeDays).toBe(15);
      expect(stats.fromDate).toBe('2025-01-05');
      expect(stats.toDate).toBe('2025-02-01');
    });

    it('selects the month with the highest contribution total', () => {
      const stats = computeStats([
        {
          firstDay: '2025-01-26',
          days: [
            { date: '2025-01-31', count: 3, level: 2 },
            { date: '2025-02-01', count: 2, level: 1 },
            { date: '2025-02-02', count: 4, level: 2 },
          ],
        },
      ]);

      expect(stats.activeDays).toBe(3);
      expect(stats.busiestMonth).toBe('2025-02');
    });
  });

  // ── Total contributions ───────────────────────────────────────

  describe('total contributions', () => {
    it('should sum all day counts from mock data', () => {
      const stats = computeStats(mockContributionData.weeks);
      expect(stats.total).toBe(42);
    });

    it('should compute correct total for full contribution data', () => {
      const data = createFullContributionData();
      const stats = computeStats(data.weeks);

      // 52 weeks * 7 days * 20 count each = 7280
      expect(stats.total).toBe(52 * 7 * 20);
    });

    it('should compute correct total for streak test data', () => {
      const streakDays = 10;
      const data = createStreakTestData(streakDays);
      const stats = computeStats(data.weeks);

      // Each streak day has count=5
      expect(stats.total).toBe(streakDays * 5);
    });
  });

  // ── Longest streak ────────────────────────────────────────────

  describe('longest streak', () => {
    it('should find longest streak in mock data (7 days)', () => {
      const stats = computeStats(mockContributionData.weeks);
      expect(stats.longestStreak).toBe(7);
    });

    it('should report full year streak for all-max data', () => {
      const data = createFullContributionData();
      const stats = computeStats(data.weeks);

      // 52 weeks * 7 days = 364
      expect(stats.longestStreak).toBe(364);
    });

    it('should report zero for empty data', () => {
      const data = createEmptyContributionData();
      const stats = computeStats(data.weeks);
      expect(stats.longestStreak).toBe(0);
    });

    it('should find exact streak length from streak test data', () => {
      const data = createStreakTestData(25);
      const stats = computeStats(data.weeks);
      expect(stats.longestStreak).toBe(25);
    });

    it('should handle single-day streaks', () => {
      const data = createStreakTestData(1);
      const stats = computeStats(data.weeks);
      expect(stats.longestStreak).toBe(1);
    });
  });

  // ── Current streak ────────────────────────────────────────────

  describe('current streak', () => {
    it('should find current streak in mock data (3 days)', () => {
      const stats = computeStats(mockContributionData.weeks);
      expect(stats.currentStreak).toBe(3);
    });

    it('should report zero current streak for empty data', () => {
      const data = createEmptyContributionData();
      const stats = computeStats(data.weeks);
      expect(stats.currentStreak).toBe(0);
    });

    it('should report full-year current streak for all-max data', () => {
      const data = createFullContributionData();
      const stats = computeStats(data.weeks);
      expect(stats.currentStreak).toBe(364);
    });

    it('should match streak days when streak is at the end', () => {
      const data = createStreakTestData(15);
      const stats = computeStats(data.weeks);
      expect(stats.currentStreak).toBe(15);
    });

    it('should equal longest streak when streak runs to end', () => {
      const data = createStreakTestData(30);
      const stats = computeStats(data.weeks);
      expect(stats.currentStreak).toBe(stats.longestStreak);
    });
  });

  // ── Most active day ───────────────────────────────────────────

  describe('most active day', () => {
    it('should identify Wednesday as most active in mock data', () => {
      const stats = computeStats(mockContributionData.weeks);
      expect(stats.mostActiveDay).toBe('Wednesday');
    });

    it('should return a valid day name for realistic data', () => {
      const data = createMockContributionData();
      const stats = computeStats(data.weeks);

      const validDays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      expect(validDays).toContain(stats.mostActiveDay);
    });

    it('should return Sunday for full data (all days equal, first wins)', () => {
      const data = createFullContributionData();
      const stats = computeStats(data.weeks);

      // When all days are equal the algorithm picks index 0 = Sunday
      expect(stats.mostActiveDay).toBe('Sunday');
    });

    it('uses each date for partial-week weekday totals', () => {
      const stats = computeStats([
        {
          firstDay: '2024-12-29',
          days: [{ date: '2025-01-01', count: 10, level: 4 }],
        },
      ]);

      expect(stats.mostActiveDay).toBe('Wednesday');
    });
  });

  describe('calendar gaps', () => {
    it('breaks streaks when adjacent entries are not consecutive dates', () => {
      const stats = computeStats([
        {
          firstDay: '2024-12-29',
          days: [
            { date: '2025-01-01', count: 1, level: 1 },
            { date: '2025-01-03', count: 1, level: 1 },
          ],
        },
      ]);

      expect(stats.longestStreak).toBe(1);
      expect(stats.currentStreak).toBe(1);
    });
  });

  // ── Determinism ───────────────────────────────────────────────

  describe('determinism', () => {
    it('should produce identical stats across multiple calls', () => {
      const data = createMockContributionData();

      const stats1 = computeStats(data.weeks);
      const stats2 = computeStats(data.weeks);

      expect(stats1).toEqual(stats2);
    });

    it('should produce identical stats from independently created fixtures', () => {
      const data1 = createMockContributionData();
      const data2 = createMockContributionData();

      const stats1 = computeStats(data1.weeks);
      const stats2 = computeStats(data2.weeks);

      expect(stats1).toEqual(stats2);
    });
  });
});
