import { z } from 'zod';
import { parseSnapshot } from '../../core/settings/parse.js';
import { parseArchive } from '../../core/archive/parse.js';
import { MAX_IMPORT_BYTES } from '../../core/settings/boundary.js';
import { InputValidationError } from '../../core/settings/errors.js';
import { buildWorld, defaultWorldSettings } from '../model/index.js';
import type { WorldSettings } from '../model/types.js';
import { WorldDataError } from './errors.js';
import { createWorldDocument, parseWorldDocument } from './document.js';
import { MAX_WORLD_BYTES, readBoundedText, readWorldJson } from './json.js';
import type { ImportedWorlds } from './types.js';

export type WorldImportOptions = {
  readonly settings?: Partial<WorldSettings>;
  readonly savedAt?: string;
};

export function importWorldData(input: unknown, options: WorldImportOptions = {}): ImportedWorlds {
  const raw = readWorldJson(input);
  const header = z
    .object({ kind: z.enum(['maeul-world', 'maeul-snapshot', 'maeul-archive']) })
    .safeParse(raw);
  if (!header.success)
    throw new WorldDataError(
      'invalid_input',
      'Choose a world, contribution snapshot or archive JSON file.',
    );
  const version = z.object({ schemaVersion: z.number() }).safeParse(raw);
  if (version.success && version.data.schemaVersion !== 1)
    throw new WorldDataError('unsupported_version', 'This file uses an unsupported version.');
  try {
    switch (header.data.kind) {
      case 'maeul-world':
        return { kind: 'world', documents: [parseWorldDocument(raw)] };
      case 'maeul-snapshot':
      case 'maeul-archive': {
        readWorldJson(input, MAX_IMPORT_BYTES);
        const snapshots =
          header.data.kind === 'maeul-snapshot'
            ? [parseSnapshot(raw)]
            : parseArchive(raw).snapshots;
        return {
          kind: header.data.kind === 'maeul-snapshot' ? 'snapshot' : 'archive',
          documents: snapshots.map((snapshot) =>
            createWorldDocument({
              scene: buildWorld({
                snapshot,
                repositories: [],
                settings: { ...defaultWorldSettings(snapshot), ...options.settings },
              }),
              sourceSnapshot: snapshot,
              savedAt: options.savedAt,
            }),
          ),
        };
      }
      default:
        return header.data.kind satisfies never;
    }
  } catch (error) {
    if (error instanceof InputValidationError)
      throw new WorldDataError('invalid_input', 'The contribution snapshot or archive is invalid.');
    throw error;
  }
}

export async function readWorldFile(
  file: Blob,
  options: WorldImportOptions = {},
): Promise<ImportedWorlds> {
  if (file.size > MAX_WORLD_BYTES)
    throw new WorldDataError('too_large', 'World files must be no larger than 8 MiB.');
  const text = await readBoundedText(file.stream(), MAX_WORLD_BYTES);
  const header = z.object({ kind: z.string() }).safeParse(readWorldJson(text));
  if (file.size > MAX_IMPORT_BYTES && header.success && header.data.kind !== 'maeul-world')
    throw new WorldDataError(
      'too_large',
      'Contribution snapshots and archives must be no larger than 2 MiB.',
    );
  return importWorldData(text, options);
}
