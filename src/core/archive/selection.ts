import type { SnapshotV1 } from '../snapshot-types.js';
import { parseBoundary } from '../settings/boundary.js';
import { InputValidationError } from '../settings/errors.js';
import { comparisonYearsSchema } from './schema.js';

export function selectComparisonSnapshots(
  snapshots: readonly SnapshotV1[],
  years: readonly number[],
): readonly SnapshotV1[] {
  const selection = parseBoundary(comparisonYearsSchema, years, 'comparison.years');
  const selected = selection.map((year) => {
    const matches = snapshots.filter((snapshot) => snapshot.year === year);
    const [snapshot] = matches;
    if (matches.length !== 1 || snapshot === undefined) {
      throw new InputValidationError([
        {
          path: 'comparison.years',
          message: `Year ${year} must identify exactly one stored snapshot`,
        },
      ]);
    }
    return snapshot;
  });
  if (new Set(selected.map((snapshot) => snapshot.username.toLowerCase())).size !== 1) {
    throw new InputValidationError([
      { path: 'comparison.years', message: 'Compare snapshots from the same username' },
    ]);
  }
  return selected;
}
