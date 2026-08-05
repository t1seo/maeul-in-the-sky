import { describe, expect, it } from 'vitest';

import { getContributionDayOfWeek, normalizeContributionWeeks } from '../../src/core/calendar.js';
import type { ContributionWeek } from '../../src/core/types.js';

describe('normalizeContributionWeeks', () => {
  it('sorts partial weeks and anchors firstDay to Sunday', () => {
    const weeks: ContributionWeek[] = [
      {
        firstDay: '2025-01-01',
        days: [
          { date: '2025-01-04', count: 4, level: 2 },
          { date: '2025-01-01', count: 1, level: 1 },
        ],
      },
    ];

    expect(normalizeContributionWeeks(weeks)).toEqual([
      {
        firstDay: '2024-12-29',
        days: [
          { date: '2025-01-01', count: 1, level: 1 },
          { date: '2025-01-04', count: 4, level: 2 },
        ],
      },
    ]);
  });

  it('regroups days by their calendar week and preserves a 53rd week', () => {
    const weeks: ContributionWeek[] = Array.from({ length: 53 }, (_, week) => ({
      firstDay: new Date(Date.UTC(2024, 11, 29 + week * 7)).toISOString().slice(0, 10),
      days: [
        {
          date: new Date(Date.UTC(2024, 11, 29 + week * 7)).toISOString().slice(0, 10),
          count: week,
          level: week === 0 ? (0 as const) : (1 as const),
        },
      ],
    }));

    const normalized = normalizeContributionWeeks(weeks);

    expect(normalized).toHaveLength(53);
    expect(normalized[52].firstDay).toBe(weeks[52].firstDay);
  });

  it('rejects invalid calendar dates at the normalization seam', () => {
    const weeks: ContributionWeek[] = [
      {
        firstDay: 'invalid',
        days: [{ date: '2025-02-30', count: 1, level: 1 }],
      },
    ];

    expect(() => normalizeContributionWeeks(weeks)).toThrow('Invalid contribution date');
  });
});

describe('getContributionDayOfWeek', () => {
  it('uses the UTC calendar day instead of array position', () => {
    expect(getContributionDayOfWeek('2025-01-01')).toBe(3);
    expect(getContributionDayOfWeek('2025-01-05')).toBe(0);
  });
});
