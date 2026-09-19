import { z } from 'zod';
import type { ActivityBreakdown } from '../activity-types.js';

export const MAX_ACTIVITY_MONTHS = 13;
const DAY_MS = 86_400_000;
const countSchema = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const countKeys = [
  'commits',
  'pullRequests',
  'issues',
  'reviews',
  'repositories',
  'restricted',
] as const;

export const activityTimestampSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/)
  .refine((value) => {
    const time = Date.parse(value);
    if (!Number.isFinite(time) || value < '0001-01-01') return false;
    const canonical = new Date(time).toISOString();
    return value === canonical || value === canonical.replace('.000Z', 'Z');
  }, 'Expected an exact UTC timestamp in years 1–9999')
  .transform((value) => new Date(value).toISOString());

const activityMonthSchema = z.object({
  month: z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/),
  from: activityTimestampSchema,
  to: activityTimestampSchema,
  commits: countSchema,
  pullRequests: countSchema,
  issues: countSchema,
  reviews: countSchema,
  repositories: countSchema,
  restricted: countSchema,
});

export const activitySchema = z
  .object({
    source: z.literal('github-contributions'),
    from: activityTimestampSchema,
    to: activityTimestampSchema,
    months: z.array(activityMonthSchema).min(1).max(MAX_ACTIVITY_MONTHS),
  })
  .superRefine((activity, context) => {
    let cursor = Date.parse(activity.from);
    const end = Date.parse(activity.to);
    const seen = new Set<string>();
    for (const [index, month] of activity.months.entries()) {
      const nextMonth = new Date(`${month.from.slice(0, 7)}-01T00:00:00.000Z`);
      nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
      const expectedEnd = Math.min(end, nextMonth.getTime() - 1);
      if (
        seen.has(month.month) ||
        month.month !== month.from.slice(0, 7) ||
        month.month !== month.to.slice(0, 7) ||
        Date.parse(month.from) !== cursor ||
        Date.parse(month.to) !== expectedEnd ||
        expectedEnd < cursor
      )
        context.addIssue({
          code: 'custom',
          path: ['months', index],
          message: 'Activity months must exactly partition their UTC range in calendar order',
        });
      seen.add(month.month);
      cursor = Date.parse(month.to) + 1;
    }
    if (cursor !== end + 1)
      context.addIssue({
        code: 'custom',
        path: ['months'],
        message: 'Activity evidence must cover the entire requested range',
      });
    for (const key of countKeys)
      if (!Number.isSafeInteger(activity.months.reduce((sum, month) => sum + month[key], 0)))
        context.addIssue({
          code: 'custom',
          path: ['months'],
          message: `Activity ${key} total exceeds the safe integer limit`,
        });
  });

export function activityMatchesCalendar(
  activity: ActivityBreakdown,
  dates: readonly string[],
): boolean {
  const observed = new Set(dates);
  const end = Date.parse(activity.to);
  for (
    let time = Date.parse(`${activity.from.slice(0, 10)}T00:00:00.000Z`);
    time <= end;
    time += DAY_MS
  )
    if (!observed.has(new Date(time).toISOString().slice(0, 10))) return false;
  return true;
}
