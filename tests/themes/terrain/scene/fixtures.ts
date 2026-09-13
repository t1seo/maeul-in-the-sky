import type { ContributionData } from '../../../../src/core/types.js';
import { computeStats } from '../../../../src/core/stats.js';
import { normalizeContributionWeeks } from '../../../../src/core/calendar.js';

export function calendarFixture(start = '2025-01-01', length = 120, count = 4): ContributionData {
  const days = Array.from({ length }, (_, index) => ({
    date: new Date(Date.parse(`${start}T00:00:00Z`) + index * 86400000).toISOString().slice(0, 10),
    count,
    level: count > 0 ? (2 as const) : (0 as const),
  }));
  const weeks = normalizeContributionWeeks([{ firstDay: start, days }]);
  return { username: 'scene-test', year: 2025, weeks, stats: computeStats(weeks) };
}
export const sceneOptions = {
  title: 'Our Village',
  width: 840,
  height: 240,
  motion: 'off' as const,
  normalization: { kind: 'fixed' as const, maxCount: 25 },
};
