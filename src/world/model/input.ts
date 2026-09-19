import { z } from 'zod';
import { snapshotSchema } from '../../core/settings/snapshot-schema.js';
import { datesIn, dateTime, DAY_MS, monthEnd, worldDateSchema } from './dates.js';
import { WorldModelError } from './errors.js';
import type { WorldInput, WorldRange } from './types.js';

export const worldSettingsSchema = z.strictObject({
  layout: z.enum(['archipelago', 'island', 'seasonal']),
  layoutSeed: z.string().max(256),
  hemisphere: z.enum(['north', 'south']),
  culture: z.enum(['classic', 'korean']),
  heightScale: z.strictObject({ kind: z.literal('fixed'), maxCount: z.literal(50) }),
  landUse: z.strictObject({ nature: z.literal(75), town: z.literal(18), city: z.literal(7) }),
});

const publicUrl = z
  .url()
  .max(2048)
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash;
  }, 'Public metadata requires a credential-free HTTPS URL');
const metadataDate = z.iso
  .datetime({ offset: true })
  .refine((value) => value.slice(0, 4) !== '0000');
const recordId = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9_.-]+$/);
export const publicRepoSchema = z.strictObject({
  id: recordId,
  fullName: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/),
  url: publicUrl,
  description: z.string().max(10000).nullable(),
  primaryLanguage: z.string().max(100).nullable().optional(),
  createdAt: metadataDate,
  visibility: z.literal('public'),
  stars: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
  releases: z
    .array(
      z.strictObject({
        id: recordId,
        tag: z.string().min(1).max(256),
        name: z.string().max(500).optional(),
        url: publicUrl,
        publishedAt: metadataDate,
      }),
    )
    .max(1000),
  retrievedAt: metadataDate,
  coverage: z.strictObject({
    complete: z.boolean(),
    truncatedReason: z.string().max(1000).optional(),
  }),
});

const inputSchema = z.strictObject({
  snapshot: snapshotSchema,
  settings: worldSettingsSchema,
  repositories: z.array(publicRepoSchema).max(12),
  range: z.strictObject({ from: worldDateSchema, to: worldDateSchema }).optional(),
  contextDays: z
    .array(
      z.strictObject({
        date: worldDateSchema,
        count: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
        level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
      }),
    )
    .max(27)
    .optional(),
});

export type PreparedWorldInput = WorldInput & { readonly range: WorldRange };

export function prepareInput(input: WorldInput): PreparedWorldInput {
  const result = inputSchema.safeParse(input);
  if (!result.success) throw new WorldModelError('INVALID_INPUT', result.error.message);
  const parsed = result.data;
  const records = parsed.snapshot.weeks
    .flatMap((week) => week.days)
    .sort((a, b) => a.date.localeCompare(b.date));
  const first = records[0]?.date;
  const last = records.at(-1)?.date;
  const year = String(parsed.snapshot.year).padStart(4, '0');
  const sameYear = first?.slice(0, 4) === last?.slice(0, 4);
  let from =
    parsed.range?.from ??
    (first && !sameYear ? `${first.slice(0, 7)}-01` : `${first?.slice(0, 4) ?? year}-01-01`);
  let to =
    parsed.range?.to ??
    (last && !sameYear ? monthEnd(last.slice(0, 7)) : `${last?.slice(0, 4) ?? year}-12-31`);
  if (from > to) throw new WorldModelError('INVALID_INPUT', 'World range starts after its end');
  if (first && first < from) from = first;
  if (last && last > to) to = last;
  const range = { from: `${from.slice(0, 7)}-01`, to: monthEnd(to.slice(0, 7)) };
  datesIn(range);
  const contextDays = [...(parsed.contextDays ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  if (
    new Set(contextDays.map((day) => day.date)).size !== contextDays.length ||
    contextDays.some(
      (day) => day.date >= range.from || dateTime(range.from) - dateTime(day.date) > 27 * DAY_MS,
    )
  ) {
    throw new WorldModelError(
      'INVALID_INPUT',
      'Context dates must be unique and within the preceding 27 days',
    );
  }
  const repositories = parsed.repositories
    .map((repo) => ({
      ...repo,
      releases: [...repo.releases].sort(
        (a, b) => a.publishedAt.localeCompare(b.publishedAt) || a.id.localeCompare(b.id),
      ),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (
    new Set(repositories.map((repo) => repo.id)).size !== repositories.length ||
    repositories.some(
      (repo) => new Set(repo.releases.map((release) => release.id)).size !== repo.releases.length,
    )
  ) {
    throw new WorldModelError('INVALID_INPUT', 'Repository and release identities must be unique');
  }
  if (repositories.reduce((total, repo) => total + repo.releases.length, 0) > 2000) {
    throw new WorldModelError('INVALID_INPUT', 'A world supports at most 2,000 release memorials');
  }
  return {
    ...parsed,
    snapshot: { ...parsed.snapshot, username: parsed.snapshot.username.toLowerCase() },
    range,
    repositories,
    contextDays,
  };
}
