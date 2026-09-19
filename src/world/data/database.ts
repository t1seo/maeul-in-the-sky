import { z } from 'zod';
import { WorldDataError } from './errors.js';

export type WorldStoreName = 'worlds' | 'bookmarks' | 'journal';
export type WorldDatabaseOptions = {
  readonly databaseName?: string;
  readonly indexedDB?: IDBFactory;
};

export function storageError(error: unknown): WorldDataError {
  if (error instanceof WorldDataError) return error;
  if (error instanceof Error && error.name === 'QuotaExceededError')
    return new WorldDataError(
      'quota',
      'Browser storage is full. Download your world or remove an older save. Existing saves were kept.',
    );
  return new WorldDataError(
    'storage',
    'Browser storage is unavailable. Your current world is still open; download it to keep a copy.',
  );
}

export function createWorldDatabase(options: WorldDatabaseOptions = {}) {
  let connection: Promise<IDBDatabase> | undefined;
  let closed = false;
  function open(): Promise<IDBDatabase> {
    if (closed) return Promise.reject(storageError(undefined));
    if (connection) return connection;
    connection = new Promise<IDBDatabase>((resolve, reject) => {
      const factory = options.indexedDB ?? globalThis.indexedDB;
      if (!factory) {
        reject(storageError(undefined));
        return;
      }
      let request: IDBOpenDBRequest;
      try {
        request = factory.open(options.databaseName ?? 'maeul-world-library-v1', 1);
      } catch (error) {
        reject(storageError(error));
        return;
      }
      let rejected = false;
      request.onupgradeneeded = () => {
        for (const name of ['worlds', 'bookmarks', 'journal'])
          if (!request.result.objectStoreNames.contains(name))
            request.result.createObjectStore(name);
      };
      request.onerror = () => {
        rejected = true;
        reject(storageError(request.error));
      };
      request.onblocked = () => {
        rejected = true;
        reject(
          new WorldDataError(
            'storage',
            'Close other world explorer tabs, then reopen this library.',
          ),
        );
      };
      request.onsuccess = () => {
        if (rejected || closed) {
          request.result.close();
          reject(storageError(undefined));
          return;
        }
        request.result.onversionchange = () => {
          request.result.close();
          connection = undefined;
        };
        resolve(request.result);
      };
    });
    return connection;
  }

  async function read(storeName: WorldStoreName, key?: string): Promise<unknown> {
    try {
      const database = await open();
      return await new Promise<unknown>((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = key === undefined ? store.getAll() : store.get(key);
        let value: unknown;
        request.onsuccess = () => {
          value = request.result;
        };
        transaction.oncomplete = () => resolve(value);
        transaction.onabort = () => reject(storageError(transaction.error));
        transaction.onerror = () => reject(storageError(transaction.error));
      });
    } catch (error) {
      throw storageError(error);
    }
  }

  return {
    read,
    async list(storeName: WorldStoreName): Promise<readonly unknown[]> {
      return z.array(z.unknown()).parse(await read(storeName));
    },
    async update(
      storeName: WorldStoreName,
      key: string,
      change: (previous: unknown, count: number) => unknown,
    ): Promise<void> {
      try {
        const database = await open();
        await new Promise<void>((resolve, reject) => {
          const transaction = database.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const current = store.get(key);
          const size = store.count();
          let currentReady = false;
          let countReady = false;
          let failure: WorldDataError | undefined;
          const apply = (): void => {
            if (!currentReady || !countReady) return;
            try {
              const previous: unknown = current.result;
              const next = change(previous, size.result);
              if (next === undefined) store.delete(key);
              else store.put(next, key);
            } catch (error) {
              failure = storageError(error);
              transaction.abort();
            }
          };
          current.onsuccess = () => {
            currentReady = true;
            apply();
          };
          size.onsuccess = () => {
            countReady = true;
            apply();
          };
          transaction.oncomplete = () => resolve();
          transaction.onabort = () => reject(failure ?? storageError(transaction.error));
          transaction.onerror = () => reject(failure ?? storageError(transaction.error));
        });
      } catch (error) {
        throw storageError(error);
      }
    },
    async close(): Promise<void> {
      closed = true;
      try {
        if (connection) (await connection).close();
      } catch (error) {
        if (!(error instanceof WorldDataError)) throw error;
      }
    },
  };
}

export type WorldDatabase = ReturnType<typeof createWorldDatabase>;
