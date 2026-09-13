import { createSnapshot } from '../core/settings/parse.js';
import { computeStats } from '../core/stats.js';
import type { SnapshotV1 } from '../core/snapshot-types.js';
import type { ContributionDay, ContributionWeek } from '../core/types.js';

export function sampleSnapshot(): SnapshotV1 {
  let seed = 77;
  const random = (): number => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const start = Date.UTC(2025, 0, 5);
  const weeks: ContributionWeek[] = Array.from({ length: 52 }, (_, weekIndex) => {
    const days: ContributionDay[] = Array.from({ length: 7 }, (_, dayIndex) => {
      const weekday = dayIndex >= 1 && dayIndex <= 5;
      const active = random() > (weekday ? 0.2 : 0.5);
      const count = active ? Math.floor(random() * (weekday ? 12 : 6)) + 1 : 0;
      const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
      return {
        date: new Date(start + (weekIndex * 7 + dayIndex) * 86_400_000).toISOString().slice(0, 10),
        count,
        level,
      };
    });
    return {
      firstDay: new Date(start + weekIndex * 7 * 86_400_000).toISOString().slice(0, 10),
      days,
    };
  });
  return createSnapshot(
    { weeks, stats: computeStats(weeks), year: 2025, username: 'maeul-sky' },
    { title: '@maeul-sky · Sample village' },
    { kind: 'sample' },
  );
}
