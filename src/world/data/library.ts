import { createWorldDatabase, type WorldDatabaseOptions } from './database.js';
import { parseWorldDocument, serializeWorldDocument } from './document.js';
import { WorldDataError } from './errors.js';
import type { WorldDocumentV1, WorldSaveSummary } from './types.js';

export const MAX_SAVED_WORLDS = 20;

export function worldRevisionKey(document: WorldDocumentV1): string {
  return `${encodeURIComponent(document.scene.worldId)}::${encodeURIComponent(document.scene.sourceDigest)}`;
}

export function createWorldLibrary(options: WorldDatabaseOptions = {}) {
  const database = createWorldDatabase(options);
  return {
    async save(
      document: WorldDocumentV1,
      options: { readonly replace?: boolean } = {},
    ): Promise<WorldSaveSummary> {
      const serialized = serializeWorldDocument(document);
      const key = worldRevisionKey(document);
      await database.update('worlds', key, (previous, count) => {
        if (previous !== undefined && !options.replace)
          throw new WorldDataError(
            'replace_required',
            'This world revision is already saved. Confirm replacement to update its view.',
          );
        if (previous === undefined && count >= MAX_SAVED_WORLDS)
          throw new WorldDataError(
            'library_full',
            'The world library holds 20 saves. Download or remove one before adding another.',
          );
        return serialized;
      });
      return summary(document);
    },
    async list(): Promise<readonly WorldSaveSummary[]> {
      const entries = await database.list('worlds');
      return entries
        .map((entry) => summary(readSavedDocument(entry)))
        .sort((a, b) => b.savedAt.localeCompare(a.savedAt) || a.key.localeCompare(b.key));
    },
    async load(key: string): Promise<WorldDocumentV1 | undefined> {
      const entry = await database.read('worlds', key);
      return entry === undefined ? undefined : readSavedDocument(entry);
    },
    async delete(key: string): Promise<void> {
      await database.update('worlds', key, () => undefined);
    },
    close: database.close,
  };
}

function readSavedDocument(input: unknown): WorldDocumentV1 {
  if (typeof input !== 'string')
    throw new WorldDataError(
      'storage',
      'A saved world could not be read. Other saves are unchanged.',
    );
  try {
    return parseWorldDocument(input);
  } catch (error) {
    if (error instanceof WorldDataError)
      throw new WorldDataError(
        'storage',
        'A saved world is invalid or unsupported. Other saves are unchanged.',
      );
    throw error;
  }
}

function summary(document: WorldDocumentV1): WorldSaveSummary {
  return {
    key: worldRevisionKey(document),
    worldId: document.scene.worldId,
    revision: document.scene.sourceDigest,
    username: document.scene.username,
    year: document.scene.year,
    savedAt: document.savedAt,
  };
}

export type WorldLibrary = ReturnType<typeof createWorldLibrary>;
