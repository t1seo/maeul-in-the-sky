import { afterEach, expect, it, vi } from 'vitest';
import { createWorldDatabase } from '../../../src/world/data/database.js';
import { WorldDataError } from '../../../src/world/data/errors.js';
import { createWorldLocalRecords } from '../../../src/world/data/local-records.js';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';

const names: string[] = [];
function options() {
  const databaseName = `data-test-${crypto.randomUUID()}`;
  names.push(databaseName);
  return { databaseName };
}

it('rejects invalid replay dates and unknown discoveries without creating a journal', async () => {
  const records = createWorldLocalRecords(options());
  try {
    await expect(records.recordVisit(TINY_WORLD_SCENE, '2024-02-28x')).rejects.toMatchObject({
      code: 'invalid_input',
    });
    await expect(records.newSinceVisit(TINY_WORLD_SCENE, '2024-02-28x')).rejects.toMatchObject({
      code: 'invalid_input',
    });
    await expect(records.markDiscovery(TINY_WORLD_SCENE, 'absent')).rejects.toMatchObject({
      code: 'invalid_input',
    });
    expect((await records.readDiscoveries(TINY_WORLD_SCENE.worldId)).entries).toEqual([]);
  } finally {
    await records.close();
  }
});

afterEach(async () => {
  vi.restoreAllMocks();
  for (const name of names.splice(0)) {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Test leaked a database connection'));
    });
  }
});

it('roundtrips a real IndexedDB record across closed browser connections', async () => {
  const config = options();
  const first = createWorldDatabase(config);
  await first.update('worlds', 'year-2024', () => ({ year: 2024, dates: ['2024-02-29'] }));
  await first.close();
  const reopened = createWorldDatabase(config);
  try {
    expect(await reopened.read('worlds', 'year-2024')).toEqual({
      year: 2024,
      dates: ['2024-02-29'],
    });
    expect(await reopened.list('bookmarks')).toEqual([]);
  } finally {
    await reopened.close();
  }
});

it('preserves the existing record when a replacement transaction fails', async () => {
  const database = createWorldDatabase(options());
  try {
    await database.update('worlds', 'keep', () => 'original');
    await expect(
      database.update('worlds', 'keep', () => {
        throw new WorldDataError('replace_required', 'Confirm replacement');
      }),
    ).rejects.toMatchObject({ code: 'replace_required' });
    expect(await database.read('worlds', 'keep')).toBe('original');
  } finally {
    await database.close();
  }
});

it('returns friendly quota feedback without overwriting existing browser data', async () => {
  const database = createWorldDatabase(options());
  try {
    await database.update('worlds', 'keep', () => 'original');
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementationOnce(() => {
      throw new DOMException('Fixture exhausted quota', 'QuotaExceededError');
    });
    await expect(database.update('worlds', 'keep', () => 'replacement')).rejects.toMatchObject({
      code: 'quota',
    });
    expect(await database.read('worlds', 'keep')).toBe('original');
  } finally {
    await database.close();
  }
});

it('counts capacity atomically when two browser saves overlap', async () => {
  const database = createWorldDatabase(options());
  const insert = (key: string) =>
    database.update('worlds', key, (_previous, count) => {
      if (count >= 1) throw new WorldDataError('library_full', 'Full');
      return key;
    });
  try {
    const results = await Promise.allSettled([insert('a'), insert('b')]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(await database.list('worlds')).toHaveLength(1);
  } finally {
    await database.close();
  }
});

it('keeps visit bookmarks local and preserves discovery history through replay and reload', async () => {
  const config = options();
  const records = createWorldLocalRecords(config);
  const scene = TINY_WORLD_SCENE;
  const discovery = scene.discoveries[0];
  const bookmark = await records.addBookmark({
    title: 'A friend',
    url: 'https://octocat.github.io/world.json',
  });
  await records.markDiscovery(scene, discovery.id, '2026-09-19T00:00:00Z');
  await records.recordVisit(scene, scene.range.from, '2026-09-19T00:00:00Z');
  await records.close();
  const reopened = createWorldLocalRecords(config);
  try {
    expect((await reopened.listBookmarks())[0].id).toBe(bookmark.id);
    expect((await reopened.readDiscoveries(scene.worldId)).entries).toEqual([
      { discoveryId: discovery.id, firstSeenAt: '2026-09-19T00:00:00Z' },
    ]);
    const expanded = {
      ...scene,
      discoveries: [
        ...scene.discoveries,
        { ...discovery, id: 'new-discovery', availableFrom: '2024-02-29' },
      ],
    };
    expect((await reopened.newSinceVisit(expanded)).map((item) => item.id)).toEqual([
      'new-discovery',
    ]);
    await reopened.recordVisit(expanded);
    await reopened.recordVisit(expanded, scene.range.from);
    expect(await reopened.newSinceVisit(expanded)).toEqual([]);
    await reopened.removeBookmark(bookmark.id);
    expect(await reopened.listBookmarks()).toEqual([]);
    expect((await reopened.readDiscoveries(scene.worldId)).entries).toHaveLength(1);
  } finally {
    await reopened.close();
  }
});
