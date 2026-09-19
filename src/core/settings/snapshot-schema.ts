import { z } from 'zod';
import { MAX_CONTRIBUTION_DAYS } from './boundary.js';
import { renderSettingsInputSchema, usernameSchema, yearSchema } from './schema.js';
import { resolveRenderSettings } from './resolve.js';
import { normalizeContributionWeeks } from '../calendar.js';
import type { SnapshotV1 } from '../snapshot-types.js';
import { activityMatchesCalendar, activitySchema } from './activity-schema.js';

export const contributionDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((date) => {
    const timestamp = Date.parse(`${date}T00:00:00.000Z`);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === date;
  }, 'Invalid calendar date');

const contributionDaySchema = z.object({
  date: contributionDateSchema.refine(
    (date) => date >= '0001-01-01',
    'Contribution dates require a year from 1 to 9999',
  ),
  count: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

const contributionWeeksSchema = z
  .array(
    z.object({
      firstDay: contributionDateSchema,
      days: z.array(contributionDaySchema).max(7),
    }),
  )
  .max(MAX_CONTRIBUTION_DAYS)
  .superRefine((weeks, context) => {
    let count = 0;
    let total = 0;
    const dates = new Set<string>();
    for (const [weekIndex, week] of weeks.entries()) {
      count += week.days.length;
      for (const [dayIndex, day] of week.days.entries()) {
        total += day.count;
        if (dates.has(day.date)) {
          context.addIssue({
            code: 'custom',
            path: [weekIndex, 'days', dayIndex, 'date'],
            message: 'Duplicate contribution date',
          });
        }
        dates.add(day.date);
      }
    }
    if (count > MAX_CONTRIBUTION_DAYS) {
      context.addIssue({ code: 'custom', message: 'Import exceeds 20,000 contribution days' });
    }
    if (!Number.isSafeInteger(total)) {
      context.addIssue({
        code: 'custom',
        message: 'Contribution total exceeds the safe integer limit',
      });
    }
  });

export const sourceSchema = z.object({
  kind: z.enum(['github', 'import', 'sample']),
  fetchedAt: z.iso
    .datetime({ offset: true })
    .transform((value) => new Date(value).toISOString())
    .optional(),
});

export const settingsEnvelopeSchema = z.object({
  schemaVersion: z.literal(1),
  kind: z.literal('maeul-settings'),
  username: usernameSchema,
  year: yearSchema.optional(),
  settings: renderSettingsInputSchema,
});

export const snapshotSchema = z
  .object({
    schemaVersion: z.literal(1),
    kind: z.literal('maeul-snapshot'),
    username: usernameSchema,
    year: yearSchema,
    weeks: contributionWeeksSchema,
    settings: renderSettingsInputSchema,
    source: sourceSchema,
    activity: activitySchema.optional(),
  })
  .superRefine((snapshot, context) => {
    if (
      snapshot.activity &&
      !activityMatchesCalendar(
        snapshot.activity,
        snapshot.weeks.flatMap((week) => week.days.map((day) => day.date)),
      )
    )
      context.addIssue({
        code: 'custom',
        path: ['activity'],
        message: 'Activity evidence requires observed calendar dates throughout its range',
      });
  })
  .transform((parsed): SnapshotV1 => ({
    schemaVersion: 1,
    kind: 'maeul-snapshot',
    username: parsed.username,
    year: parsed.year,
    weeks: normalizeContributionWeeks(parsed.weeks),
    settings: resolveRenderSettings(parsed.settings, {}, parsed.username),
    source: {
      kind: parsed.source.kind,
      ...(parsed.source.fetchedAt === undefined ? {} : { fetchedAt: parsed.source.fetchedAt }),
    },
    ...(parsed.activity === undefined ? {} : { activity: parsed.activity }),
  }));
