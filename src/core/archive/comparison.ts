import type { NormalizationOptions } from '../render-options.js';
import type { ArchiveV1, SnapshotV1 } from '../snapshot-types.js';
import { InputValidationError } from '../settings/errors.js';
import { parseBoundary, readJsonInput } from '../settings/boundary.js';
import { normalizationSchema } from '../settings/schema.js';
import { computeP90Max } from '../settings/normalization.js';
import { parseSnapshot } from '../settings/parse.js';
import { archiveSnapshotsSchema } from './schema.js';
import { selectComparisonSnapshots } from './selection.js';

export { selectComparisonSnapshots } from './selection.js';

export function computeSharedNormalization(
  snapshots: readonly SnapshotV1[],
  normalization: NormalizationOptions = { kind: 'relative' },
): { readonly kind: 'fixed'; readonly maxCount: number } {
  const selected = selectComparisonSnapshots(
    snapshots,
    snapshots.map((snapshot) => snapshot.year),
  );
  const option = parseBoundary(normalizationSchema, normalization, 'comparison.normalization');
  switch (option.kind) {
    case 'fixed':
      return option;
    case 'relative':
      return {
        kind: 'fixed',
        maxCount: computeP90Max(
          selected.flatMap((snapshot) =>
            snapshot.weeks.flatMap((week) => week.days.map((day) => day.count)),
          ),
        ),
      };
    default:
      return option satisfies never;
  }
}

export function createArchive(
  snapshots: readonly SnapshotV1[],
  years: readonly number[] = snapshots.map((snapshot) => snapshot.year),
  normalization: NormalizationOptions = { kind: 'relative' },
): ArchiveV1 {
  const stored = parseBoundary(archiveSnapshotsSchema, readJsonInput(snapshots), 'snapshots');
  const selected = selectComparisonSnapshots(stored, years);
  return {
    schemaVersion: 1,
    kind: 'maeul-archive',
    snapshots: stored,
    comparison: {
      normalization: computeSharedNormalization(selected, normalization),
      years: selected.map((snapshot) => snapshot.year),
    },
  };
}

export function upsertArchiveSnapshot(
  snapshots: readonly SnapshotV1[],
  snapshot: SnapshotV1,
  replace = false,
): readonly SnapshotV1[] {
  const incoming = parseSnapshot(snapshot);
  const matching = (stored: SnapshotV1) =>
    stored.username.toLowerCase() === incoming.username.toLowerCase() &&
    stored.year === incoming.year;
  if (snapshots.some(matching) && !replace) {
    throw new InputValidationError([
      { path: 'snapshots', message: 'Duplicate username/year requires explicit replacement' },
    ]);
  }
  const updated = [...snapshots.filter((stored) => !matching(stored)), incoming];
  return parseBoundary(archiveSnapshotsSchema, readJsonInput(updated), 'snapshots');
}
