import { z } from 'zod';
import { contributionDateSchema } from '../../core/settings/snapshot-schema.js';
import type { WorldDiscovery, WorldScene } from '../model/types.js';
import { createWorldDatabase, type WorldDatabaseOptions } from './database.js';
import { WorldDataError } from './errors.js';
import { timestampSchema } from './repository-schema.js';
import { parseWorldSourceUrl } from './urls.js';

const bookmarkSchema = z
  .object({
    id: z.string(),
    url: z.string(),
    title: z.string().min(1).max(160),
    addedAt: timestampSchema,
  })
  .strict();
const journalSchema = z
  .object({
    worldId: z.string(),
    entries: z
      .array(z.object({ discoveryId: z.string(), firstSeenAt: timestampSchema }).strict())
      .max(20000),
    availableIds: z.array(z.string()).max(20000),
    lastVisitAt: timestampSchema.optional(),
    lastRevision: z.string().optional(),
  })
  .strict();
export type VisitBookmark = Readonly<z.infer<typeof bookmarkSchema>>;
export type DiscoveryJournal = {
  readonly worldId: string;
  readonly entries: readonly { readonly discoveryId: string; readonly firstSeenAt: string }[];
  readonly availableIds: readonly string[];
  readonly lastVisitAt?: string;
  readonly lastRevision?: string;
};

function checkCursor(scene: WorldScene, cursorDate: string): void {
  if (
    !contributionDateSchema.safeParse(cursorDate).success ||
    cursorDate < scene.range.from ||
    cursorDate > scene.range.to
  )
    throw new WorldDataError('invalid_input', 'The visit date is outside this world.');
}

function journal(value: unknown, worldId: string): DiscoveryJournal {
  if (value === undefined) return { worldId, entries: [], availableIds: [] };
  const parsed = journalSchema.safeParse(value);
  if (!parsed.success || parsed.data.worldId !== worldId)
    throw new WorldDataError(
      'storage',
      'The local discovery journal is invalid. Your saved worlds are unchanged.',
    );
  return parsed.data;
}

export function createWorldLocalRecords(options: WorldDatabaseOptions = {}) {
  const database = createWorldDatabase(options);
  async function readDiscoveries(worldId: string): Promise<DiscoveryJournal> {
    return journal(await database.read('journal', worldId), worldId);
  }
  return {
    async addBookmark(
      input: { readonly url: string; readonly title: string },
      options: { readonly replace?: boolean; readonly addedAt?: string } = {},
    ): Promise<VisitBookmark> {
      const url = parseWorldSourceUrl(input.url);
      const parsed = bookmarkSchema.safeParse({
        id: url,
        url,
        title: input.title.trim(),
        addedAt: options.addedAt ?? new Date().toISOString(),
      });
      if (!parsed.success)
        throw new WorldDataError('invalid_input', 'Give this public bookmark a short title.');
      await database.update('bookmarks', url, (previous, count) => {
        if (previous !== undefined && !options.replace)
          throw new WorldDataError('replace_required', 'This public world is already bookmarked.');
        if (previous === undefined && count >= 100)
          throw new WorldDataError(
            'library_full',
            'Remove an older bookmark before adding more than 100 visits.',
          );
        return parsed.data;
      });
      return parsed.data;
    },
    async listBookmarks(): Promise<readonly VisitBookmark[]> {
      const parsed = z.array(bookmarkSchema).safeParse(await database.list('bookmarks'));
      if (!parsed.success)
        throw new WorldDataError('storage', 'A local bookmark could not be read.');
      for (const bookmark of parsed.data) parseWorldSourceUrl(bookmark.url);
      return parsed.data.sort((a, b) => a.title.localeCompare(b.title));
    },
    async removeBookmark(id: string): Promise<void> {
      await database.update('bookmarks', id, () => undefined);
    },
    readDiscoveries,
    async markDiscovery(
      scene: WorldScene,
      discoveryId: string,
      firstSeenAt = new Date().toISOString(),
    ): Promise<void> {
      if (
        !scene.discoveries.some((item) => item.id === discoveryId) ||
        !timestampSchema.safeParse(firstSeenAt).success
      )
        throw new WorldDataError('invalid_input', 'Choose a discovery that exists in this world.');
      await database.update('journal', scene.worldId, (previous, count) => {
        if (previous === undefined && count >= 100)
          throw new WorldDataError(
            'library_full',
            'The local journal has reached its 100-world limit.',
          );
        const current = journal(previous, scene.worldId);
        if (
          current.entries.length >= 20000 &&
          !current.entries.some((item) => item.discoveryId === discoveryId)
        )
          throw new WorldDataError('library_full', 'This journal has reached its discovery limit.');
        return current.entries.some((item) => item.discoveryId === discoveryId)
          ? current
          : { ...current, entries: [...current.entries, { discoveryId, firstSeenAt }] };
      });
    },
    async recordVisit(
      scene: WorldScene,
      cursorDate = scene.range.to,
      visitedAt = new Date().toISOString(),
    ): Promise<void> {
      checkCursor(scene, cursorDate);
      if (!timestampSchema.safeParse(visitedAt).success)
        throw new WorldDataError('invalid_input', 'The visit date is outside this world.');
      await database.update('journal', scene.worldId, (previous, count) => {
        if (previous === undefined && count >= 100)
          throw new WorldDataError(
            'library_full',
            'The local journal has reached its 100-world limit.',
          );
        const current = journal(previous, scene.worldId);
        const availableIds = [
          ...new Set([
            ...current.availableIds,
            ...scene.discoveries
              .filter((item) => item.availableFrom <= cursorDate)
              .map((item) => item.id),
          ]),
        ];
        if (availableIds.length > 20000)
          throw new WorldDataError('library_full', 'This journal has reached its discovery limit.');
        return {
          ...current,
          availableIds,
          lastVisitAt: visitedAt,
          lastRevision: scene.sourceDigest,
        };
      });
    },
    async newSinceVisit(
      scene: WorldScene,
      cursorDate = scene.range.to,
    ): Promise<readonly WorldDiscovery[]> {
      checkCursor(scene, cursorDate);
      const current = await readDiscoveries(scene.worldId);
      if (!current.lastVisitAt) return [];
      const known = new Set(current.availableIds);
      return scene.discoveries.filter(
        (item) => item.availableFrom <= cursorDate && !known.has(item.id),
      );
    },
    close: database.close,
  };
}

export type WorldLocalRecords = ReturnType<typeof createWorldLocalRecords>;
