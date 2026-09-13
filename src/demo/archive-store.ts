import { z } from 'zod';
import {
  createArchive,
  selectComparisonSnapshots,
  upsertArchiveSnapshot,
} from '../core/archive/comparison.js';
import { readJsonInput } from '../core/settings/boundary.js';
import { parseSnapshot } from '../core/settings/parse.js';
import type { ArchiveV1, SnapshotV1 } from '../core/snapshot-types.js';

export const LIBRARY_KEY = 'maeul-library-v1';
export type SavedComparison = {
  readonly username: string;
  readonly years: readonly number[];
  readonly maxCount: number;
};
export type Library = {
  readonly snapshots: readonly SnapshotV1[];
  readonly comparison?: SavedComparison;
};
export type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
export type SaveResult = { readonly ok: true } | { readonly ok: false; readonly message: string };
const librarySchema = z.object({
  schemaVersion: z.literal(1),
  kind: z.literal('maeul-library'),
  snapshots: z.array(z.unknown()).max(20),
  comparison: z
    .object({
      username: z.string(),
      years: z.array(z.number().int()).min(2).max(5),
      maxCount: z.number().positive(),
    })
    .optional(),
});

export function loadLibrary(storage: StoragePort): Library {
  const raw = storage.getItem(LIBRARY_KEY);
  if (raw === null) return { snapshots: [] };
  const parsed = librarySchema.parse(readJsonInput(raw));
  let snapshots: readonly SnapshotV1[] = [];
  for (const snapshot of parsed.snapshots)
    snapshots = upsertArchiveSnapshot(snapshots, parseSnapshot(snapshot));
  if (parsed.comparison) {
    createArchive(
      snapshots.filter(
        (snapshot) => snapshot.username.toLowerCase() === parsed.comparison?.username.toLowerCase(),
      ),
      parsed.comparison.years,
      { kind: 'fixed', maxCount: parsed.comparison.maxCount },
    );
  }
  return { snapshots, ...(parsed.comparison ? { comparison: parsed.comparison } : {}) };
}

export function saveLibrary(storage: StoragePort, library: Library): SaveResult {
  try {
    storage.setItem(
      LIBRARY_KEY,
      JSON.stringify({ schemaVersion: 1, kind: 'maeul-library', ...library }),
    );
    return { ok: true };
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    return {
      ok: false,
      message: `Could not save in this browser (${error.name}). Existing archive kept. Free browser storage or download your snapshots, then try again.`,
    };
  }
}

export function mergeSnapshots(
  library: Library,
  incoming: readonly SnapshotV1[],
  replace: boolean,
): Library {
  let snapshots = library.snapshots;
  for (const snapshot of incoming) snapshots = upsertArchiveSnapshot(snapshots, snapshot, replace);
  return { ...library, snapshots };
}

export function matchingSnapshots(
  library: Library,
  incoming: readonly SnapshotV1[],
): readonly SnapshotV1[] {
  return incoming.filter((snapshot) =>
    library.snapshots.some(
      (stored) =>
        stored.username.toLowerCase() === snapshot.username.toLowerCase() &&
        stored.year === snapshot.year,
    ),
  );
}

export function comparisonLibrary(library: Library, archive: ArchiveV1): Library {
  const username = selectComparisonSnapshots(archive.snapshots, archive.comparison.years)[0]
    ?.username;
  if (!username) return library;
  return {
    ...library,
    comparison: {
      username,
      years: archive.comparison.years,
      maxCount: archive.comparison.normalization.maxCount,
    },
  };
}
