import type { ArchiveV1 } from '../snapshot-types.js';
import { parseBoundary, readJsonInput } from '../settings/boundary.js';
import { archiveSchema } from './schema.js';
import { selectComparisonSnapshots } from './selection.js';

export function parseArchive(input: unknown): ArchiveV1 {
  const archive = parseBoundary(archiveSchema, readJsonInput(input));
  selectComparisonSnapshots(archive.snapshots, archive.comparison.years);
  return archive;
}
