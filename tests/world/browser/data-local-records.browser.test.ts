import { afterEach, expect, it } from 'vitest';
import { createWorldLocalRecords } from '../../../src/world/data/local-records.js';
import { createWorldDatabase } from '../../../src/world/data/database.js';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';

const names: string[] = [];
function options() {
  const databaseName = `data-local-${crypto.randomUUID()}`;
  names.push(databaseName);
  return { databaseName };
}
afterEach(async () => {
  for (const name of names.splice(0))
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Test leaked a database connection'));
    });
});

it('preserves bookmarks until replacement is explicit and validates metadata first', async () => {
  const records = createWorldLocalRecords(options());
  const bookmark = { title: 'B friend', url: 'https://octocat.github.io/world.json' };
  try {
    await records.addBookmark(bookmark, { addedAt: '2026-09-19T00:00:00Z' });
    await expect(records.addBookmark({ ...bookmark, title: 'changed' })).rejects.toMatchObject({
      code: 'replace_required',
    });
    await expect(records.addBookmark({ ...bookmark, title: '  ' })).rejects.toMatchObject({
      code: 'invalid_input',
    });
    expect((await records.listBookmarks())[0].title).toBe('B friend');
    await records.addBookmark({ ...bookmark, title: 'A friend' }, { replace: true });
    await records.addBookmark({ title: 'C friend', url: 'https://another.github.io/world.json' });
    expect((await records.listBookmarks()).map((item) => item.title)).toEqual([
      'A friend',
      'C friend',
    ]);
  } finally {
    await records.close();
  }
});

it('bounds bookmarks and world journals without evicting existing local records', async () => {
  const records = createWorldLocalRecords(options());
  const discoveryId = TINY_WORLD_SCENE.discoveries[0].id;
  try {
    for (let index = 0; index < 100; index++) {
      await records.addBookmark({
        title: `Friend ${index}`,
        url: `https://friend-${index}.github.io/world.json`,
      });
      await records.markDiscovery({ ...TINY_WORLD_SCENE, worldId: `world-${index}` }, discoveryId);
    }
    await expect(
      records.addBookmark({ title: 'Overflow', url: 'https://overflow.github.io/world.json' }),
    ).rejects.toMatchObject({ code: 'library_full' });
    await expect(records.markDiscovery(TINY_WORLD_SCENE, discoveryId)).rejects.toMatchObject({
      code: 'library_full',
    });
    await expect(records.recordVisit(TINY_WORLD_SCENE)).rejects.toMatchObject({
      code: 'library_full',
    });
    expect(await records.listBookmarks()).toHaveLength(100);
    expect((await records.readDiscoveries('world-0')).entries).toHaveLength(1);
  } finally {
    await records.close();
  }
});

it('keeps the first discovery timestamp and rejects invalid visit metadata', async () => {
  const records = createWorldLocalRecords(options());
  const scene = TINY_WORLD_SCENE;
  const id = scene.discoveries[0].id;
  try {
    expect(await records.newSinceVisit(scene)).toEqual([]);
    await records.markDiscovery(scene, id, '2026-09-18T00:00:00Z');
    await records.markDiscovery(scene, id, '2026-09-19T00:00:00Z');
    await expect(records.markDiscovery(scene, id, 'yesterday')).rejects.toMatchObject({
      code: 'invalid_input',
    });
    await expect(records.recordVisit(scene, scene.range.to, 'yesterday')).rejects.toMatchObject({
      code: 'invalid_input',
    });
    expect((await records.readDiscoveries(scene.worldId)).entries).toEqual([
      { discoveryId: id, firstSeenAt: '2026-09-18T00:00:00Z' },
    ]);
  } finally {
    await records.close();
  }
});

it('reports corrupt local rows and preserves a full discovery journal on overflow', async () => {
  const config = options();
  const database = createWorldDatabase(config);
  const records = createWorldLocalRecords(config);
  const scene = TINY_WORLD_SCENE;
  try {
    await database.update('bookmarks', 'broken', () => ({ invalid: true }));
    await database.update('journal', scene.worldId, () => ({ invalid: true }));
    await expect(records.listBookmarks()).rejects.toMatchObject({ code: 'storage' });
    await expect(records.readDiscoveries(scene.worldId)).rejects.toMatchObject({ code: 'storage' });
    const availableIds = Array.from({ length: 20000 }, (_, index) => `old-${index}`);
    await database.update('journal', scene.worldId, () => ({
      worldId: scene.worldId,
      availableIds,
      entries: availableIds.map((discoveryId) => ({
        discoveryId,
        firstSeenAt: '2026-09-19T00:00:00Z',
      })),
    }));
    await expect(records.markDiscovery(scene, scene.discoveries[0].id)).rejects.toMatchObject({
      code: 'library_full',
    });
    await expect(records.recordVisit(scene)).rejects.toMatchObject({ code: 'library_full' });
    expect((await records.readDiscoveries(scene.worldId)).entries).toHaveLength(20000);
  } finally {
    await database.close();
    await records.close();
  }
});
