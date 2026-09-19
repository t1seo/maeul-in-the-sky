import { afterEach, expect, it } from 'vitest';
import { createWorldLibrary, worldRevisionKey } from '../../../src/world/data/library.js';
import { createWorldLocalRecords } from '../../../src/world/data/local-records.js';
import { createWorldDatabase } from '../../../src/world/data/database.js';
import { worldDocumentFixture } from '../data/world-fixture.js';

const names: string[] = [];
function options() {
  const databaseName = `data-library-${crypto.randomUUID()}`;
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

it('reloads a frozen world after reopening and requires explicit replacement', async () => {
  const config = options();
  const document = worldDocumentFixture();
  const first = createWorldLibrary(config);
  const saved = await first.save(document);
  await first.close();
  const library = createWorldLibrary(config);
  try {
    expect(await library.load(saved.key)).toEqual(document);
    await expect(
      library.save({ ...document, view: { ...document.view, lighting: 'night' } }),
    ).rejects.toMatchObject({ code: 'replace_required' });
    expect((await library.load(saved.key))?.view.lighting).toBe('day');
    await library.save(
      { ...document, view: { ...document.view, lighting: 'night' } },
      { replace: true },
    );
    expect((await library.load(saved.key))?.view.lighting).toBe('night');
    expect(Object.isFrozen((await library.load(saved.key))?.scene)).toBe(true);
    await library.delete(saved.key);
    expect(await library.load(saved.key)).toBeUndefined();
  } finally {
    await library.close();
  }
});

it('bounds the library at 20 entries and keeps all existing worlds on overflow', async () => {
  const library = createWorldLibrary(options());
  const input = worldDocumentFixture();
  try {
    for (let revision = 0; revision < 20; revision++)
      await library.save({
        ...input,
        scene: { ...input.scene, sourceDigest: `revision-${revision}` },
      });
    await expect(library.save(input)).rejects.toMatchObject({ code: 'library_full' });
    const existing = await library.list();
    expect(existing).toHaveLength(20);
    const replacement = {
      ...input,
      scene: { ...input.scene, sourceDigest: 'revision-0' },
      savedAt: '2026-09-20T00:00:00Z',
    };
    await library.save(replacement, { replace: true });
    expect((await library.list())[0].key).toBe(worldRevisionKey(replacement));
    await library.delete(existing[0].key);
    await library.save(input);
    expect(await library.list()).toHaveLength(20);
  } finally {
    await library.close();
  }
});

it('keeps bookmarks and journals outside the saved public world document', async () => {
  const config = options();
  const library = createWorldLibrary(config);
  const records = createWorldLocalRecords(config);
  const input = worldDocumentFixture();
  try {
    await records.addBookmark({
      title: 'Private label',
      url: 'https://octocat.github.io/world.json',
    });
    await records.markDiscovery(input.scene, input.scene.discoveries[0].id);
    await library.save(input);
    const loaded = await library.load(worldRevisionKey(input));
    expect(loaded).toEqual(input);
    expect(JSON.stringify(loaded)).not.toContain('Private label');
    expect(loaded).not.toHaveProperty('journal');
  } finally {
    await library.close();
    await records.close();
  }
});

it('reports corrupted saved data as a friendly storage error', async () => {
  const config = options();
  const database = createWorldDatabase(config);
  await database.update('worlds', 'broken', () => ({ invalid: true }));
  await database.close();
  const library = createWorldLibrary(config);
  try {
    await expect(library.load('broken')).rejects.toMatchObject({ code: 'storage' });
    await expect(library.list()).rejects.toMatchObject({ code: 'storage' });
    const editor = createWorldDatabase(config);
    try {
      await editor.update('worlds', 'broken', () => '{invalid JSON');
    } finally {
      await editor.close();
    }
    await expect(library.load('broken')).rejects.toMatchObject({ code: 'storage' });
  } finally {
    await library.close();
  }
});
