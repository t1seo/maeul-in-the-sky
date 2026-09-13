import { z } from 'zod';
import { MAX_ARCHIVE_SNAPSHOTS, MAX_CONTRIBUTION_DAYS } from '../settings/boundary.js';
import { fixedNormalizationSchema, yearSchema } from '../settings/schema.js';
import { snapshotSchema } from '../settings/snapshot-schema.js';

export const comparisonYearsSchema = z
  .array(yearSchema)
  .min(2)
  .max(5)
  .refine((years) => new Set(years).size === years.length, 'Comparison years must be unique')
  .transform((years) => [...years].sort((a, b) => a - b));

export const archiveSnapshotsSchema = z
  .array(snapshotSchema)
  .max(MAX_ARCHIVE_SNAPSHOTS)
  .superRefine((snapshots, context) => {
    const identities = new Set<string>();
    let days = 0;
    for (const [index, snapshot] of snapshots.entries()) {
      const identity = `${snapshot.username.toLowerCase()}:${snapshot.year}`;
      if (identities.has(identity)) {
        context.addIssue({
          code: 'custom',
          path: [index],
          message: 'Duplicate username/year requires explicit replacement',
        });
      }
      identities.add(identity);
      days += snapshot.weeks.reduce((sum, week) => sum + week.days.length, 0);
    }
    if (days > MAX_CONTRIBUTION_DAYS) {
      context.addIssue({
        code: 'custom',
        message: 'Import exceeds 20,000 contribution days across snapshots',
      });
    }
  })
  .transform((snapshots) =>
    [...snapshots].sort(
      (a, b) => a.year - b.year || a.username.toLowerCase().localeCompare(b.username.toLowerCase()),
    ),
  );

export const archiveSchema = z.object({
  schemaVersion: z.literal(1),
  kind: z.literal('maeul-archive'),
  snapshots: archiveSnapshotsSchema,
  comparison: z.object({
    normalization: fixedNormalizationSchema,
    years: comparisonYearsSchema,
  }),
});
