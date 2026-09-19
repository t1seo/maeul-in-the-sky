import { afterEach, expect, it, vi } from 'vitest';
import { createWorldDatabase } from '../../../src/world/data/database.js';

const names: string[] = [];
function options() {
  const databaseName = `data-db-${crypto.randomUUID()}`;
  names.push(databaseName);
  return { databaseName };
}
function openNative(name: string, version: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
afterEach(async () => {
  vi.restoreAllMocks();
  for (const name of names.splice(0))
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Test leaked a database connection'));
    });
});

it('fails cleanly after close, including a close racing the initial native open', async () => {
  const database = createWorldDatabase(options());
  const read = database.read('worlds');
  const close = database.close();
  await expect(read).rejects.toMatchObject({ code: 'storage' });
  await expect(close).resolves.toBeUndefined();
  await expect(database.read('worlds')).rejects.toMatchObject({ code: 'storage' });
});

it('reports disabled browser storage and closes an unsuccessful connection safely', async () => {
  vi.spyOn(IDBFactory.prototype, 'open').mockImplementationOnce(() => {
    throw new DOMException('Denied', 'SecurityError');
  });
  const database = createWorldDatabase(options());
  await expect(database.list('worlds')).rejects.toMatchObject({ code: 'storage' });
  await expect(database.close()).resolves.toBeUndefined();
});

it('releases a native connection when another tab upgrades the database', async () => {
  const config = options();
  const database = createWorldDatabase(config);
  await database.update('worlds', 'keep', () => 'original');
  const newer = await openNative(config.databaseName, 2);
  newer.close();
  await expect(database.read('worlds', 'keep')).rejects.toMatchObject({ code: 'storage' });
  await expect(database.close()).resolves.toBeUndefined();
});

it('maps native transaction aborts without losing existing data', async () => {
  const database = createWorldDatabase(options());
  try {
    await database.update('worlds', 'keep', () => 'original');
    const original = IDBDatabase.prototype.transaction;
    vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementationOnce(function (
      this: IDBDatabase,
      ...args
    ) {
      const transaction = original.apply(this, args);
      queueMicrotask(() => transaction.abort());
      return transaction;
    });
    await expect(database.read('worlds', 'keep')).rejects.toMatchObject({ code: 'storage' });
    expect(await database.read('worlds', 'keep')).toBe('original');
  } finally {
    await database.close();
  }
});
