import { z } from 'zod';
import { parseArchive } from '../core/archive/parse.js';
import { MAX_IMPORT_BYTES, readJsonInput } from '../core/settings/boundary.js';
import { InputValidationError } from '../core/settings/errors.js';
import { parseSnapshot } from '../core/settings/parse.js';
import type { ArchiveV1, SnapshotV1 } from '../core/snapshot-types.js';

const importKind = z.object({ kind: z.enum(['maeul-snapshot', 'maeul-archive']) });
export type ImportedData = {
  readonly snapshots: readonly SnapshotV1[];
  readonly archive?: ArchiveV1;
};

export function parseImportedData(input: unknown): ImportedData {
  const raw = readJsonInput(input);
  const { kind } = importKind.parse(raw);
  switch (kind) {
    case 'maeul-snapshot':
      return { snapshots: [parseSnapshot(raw)] };
    case 'maeul-archive': {
      const archive = parseArchive(raw);
      return { snapshots: archive.snapshots, archive };
    }
    default:
      return kind satisfies never;
  }
}

export async function readImportFile(file: File): Promise<string> {
  if (file.size > MAX_IMPORT_BYTES)
    throw new InputValidationError([
      {
        path: 'file',
        message: 'Import exceeds 2 MiB limit. Choose a smaller snapshot or archive.',
      },
    ]);
  return file.text();
}
