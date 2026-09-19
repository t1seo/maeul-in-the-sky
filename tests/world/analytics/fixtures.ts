import type { ActivityBreakdown } from '../../../src/core/activity-types.js';
import type { SnapshotV1 } from '../../../src/core/snapshot-types.js';
import { TINY_WORLD_INPUT } from '../../../src/world/model/fixture.js';

export function snapshot(
  records: readonly (readonly [string, number])[],
  activity?: ActivityBreakdown,
): SnapshotV1 {
  return {
    ...TINY_WORLD_INPUT.snapshot,
    weeks: records.map(([date, count]) => ({
      firstDay: date,
      days: [{ date, count, level: 0 }],
    })),
    ...(activity ? { activity } : {}),
  };
}

export const activity: ActivityBreakdown = {
  source: 'github-contributions',
  from: '2024-01-30T00:00:00.000Z',
  to: '2024-02-02T23:59:59.999Z',
  months: [
    {
      month: '2024-01',
      from: '2024-01-30T00:00:00.000Z',
      to: '2024-01-31T23:59:59.999Z',
      commits: 2,
      pullRequests: 0,
      issues: 1,
      reviews: 3,
      repositories: 0,
      restricted: 1,
    },
    {
      month: '2024-02',
      from: '2024-02-01T00:00:00.000Z',
      to: '2024-02-02T23:59:59.999Z',
      commits: 0,
      pullRequests: 4,
      issues: 0,
      reviews: 2,
      repositories: 1,
      restricted: 0,
    },
  ],
};

export const records = [
  ['2024-01-30', 2],
  ['2024-01-31', 0],
  ['2024-02-02', 5],
] as const;
