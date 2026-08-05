import { describe, expect, it, vi } from 'vitest';

import type { ContributionData } from '../../../src/core/types.js';

const { generateBiomeMap } = vi.hoisted(() => ({
  generateBiomeMap: vi.fn(() => new Map()),
}));

vi.mock('../../../src/themes/terrain/biomes.js', () => ({ generateBiomeMap }));

import { terrainTheme } from '../../../src/themes/terrain/index.js';

describe('terrain week count', () => {
  it('uses the complete 53-week calendar for generated terrain systems', () => {
    const weeks = Array.from({ length: 53 }, (_, week) => {
      const date = new Date(Date.UTC(2024, 11, 29 + week * 7)).toISOString().slice(0, 10);
      return {
        firstDay: date,
        days: [{ date, count: week + 1, level: 1 as const }],
      };
    });
    const data: ContributionData = {
      weeks,
      stats: {
        total: 1431,
        longestStreak: 1,
        currentStreak: 1,
        mostActiveDay: 'Sunday',
        activeDays: 53,
        busiestMonth: '2025-01',
        fromDate: weeks[0].days[0].date,
        toDate: weeks[weeks.length - 1].days[0].date,
      },
      year: 2025,
      username: 'fifty-three-weeks',
    };

    terrainTheme.render(data, { title: '@fifty-three-weeks', width: 840, height: 240 });

    expect(generateBiomeMap).toHaveBeenCalledTimes(2);
    expect(generateBiomeMap).toHaveBeenCalledWith(53, 7, expect.any(Number));
  });
});
