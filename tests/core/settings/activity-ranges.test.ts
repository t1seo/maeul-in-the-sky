import { expect, it } from 'vitest';
import type { ActivityBreakdown } from '../../../src/core/activity-types.js';
import { activitySchema } from '../../../src/core/settings/activity-schema.js';

const counts = {
  commits: 0,
  pullRequests: 0,
  issues: 0,
  reviews: 0,
  repositories: 0,
  restricted: 0,
} as const;
const first = {
  ...counts,
  month: '2024-01',
  from: '2024-01-31T12:00:00.000Z',
  to: '2024-01-31T23:59:59.999Z',
} as const;
const second = {
  ...counts,
  month: '2024-02',
  from: '2024-02-01T00:00:00.000Z',
  to: '2024-02-01T12:00:00.000Z',
} as const;
const activity: ActivityBreakdown = {
  source: 'github-contributions',
  from: first.from,
  to: second.to,
  months: [first, second],
};

it('preserves observed zero metrics and exact partial-month coverage', () => {
  // Given complete zero-valued evidence with two partial months.
  // When its typed boundary is crossed.
  const parsed = activitySchema.parse(activity);
  // Then zero is evidence, not absence, and the intervals are unchanged.
  expect(parsed).toEqual(activity);
});

it.each([
  ['overlap', [first, { ...second, from: first.to }]],
  ['one millisecond gap', [first, { ...second, from: '2024-02-01T00:00:00.001Z' }]],
  ['wrong chronological order', [second, first]],
  ['duplicate month', [first, { ...second, month: first.month }]],
  ['crossed month boundary', [{ ...first, to: second.from }, second]],
  ['uncovered last month', [first]],
  ['uncovered first month', [second]],
])('rejects %s instead of treating partial evidence as complete', (_name, months) => {
  // Given inconsistent interval evidence.
  // When the activity schema parses it.
  const parsed = activitySchema.safeParse({ ...activity, months });
  // Then the inconsistent claim is rejected.
  expect(parsed.success).toBe(false);
});

it.each(['commits', 'pullRequests', 'issues', 'reviews', 'repositories', 'restricted'])(
  'rejects a %s period sum that would lose integer precision',
  (metric) => {
    // Given individually safe values whose full-period sum is unsafe.
    const input = {
      ...activity,
      months: [
        { ...first, [metric]: Number.MAX_SAFE_INTEGER },
        { ...second, [metric]: 1 },
      ],
    };
    // When the complete evidence is parsed.
    const parsed = activitySchema.safeParse(input);
    // Then chart aggregation cannot receive a rounded total.
    expect(parsed.success).toBe(false);
  },
);

it('normalizes exact second timestamps without applying a local timezone', () => {
  // Given equivalent UTC timestamps with and without explicit milliseconds.
  const input = {
    ...activity,
    from: '2024-01-31T12:00:00Z',
    to: '2024-02-01T12:00:00Z',
    months: [
      { ...first, from: '2024-01-31T12:00:00Z' },
      { ...second, to: '2024-02-01T12:00:00Z' },
    ],
  };
  // When the timestamp boundary canonicalizes them.
  const parsed = activitySchema.parse(input);
  // Then only their representation changes.
  expect(parsed).toEqual(activity);
});
