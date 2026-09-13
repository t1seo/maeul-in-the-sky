import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseSnapshot } from '../../src/core/settings/parse.js';
import {
  LIBRARY_KEY,
  comparisonLibrary,
  loadLibrary,
  matchingSnapshots,
  mergeSnapshots,
  saveLibrary,
} from '../../src/demo/archive-store.js';
import { createArchive } from '../../src/core/archive/comparison.js';

const snapshot = parseSnapshot(readFileSync('tests/fixtures/improvements/full-2024.json', 'utf8'));

describe('C12 archive persistence', () => {
  it('roundtrips a versioned one-year library when saved before comparison', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };
    saveLibrary(storage, { snapshots: [snapshot] });
    expect(loadLibrary(storage)).toEqual({ snapshots: [snapshot] });
  });

  it('preserves the old persisted value when quota rejects a new library', () => {
    const old = 'existing archive';
    const storage = {
      getItem: () => old,
      setItem: () => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      },
    };
    const result = saveLibrary(storage, { snapshots: [snapshot] });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain('Existing archive kept');
    expect(storage.getItem()).toBe(old);
  });

  it('requires explicit replacement when the same username and year already exist', () => {
    const library = { snapshots: [snapshot] };
    expect(matchingSnapshots(library, [snapshot])).toHaveLength(1);
    expect(() => mergeSnapshots(library, [snapshot], false)).toThrow('replacement');
    expect(mergeSnapshots(library, [snapshot], true).snapshots).toHaveLength(1);
  });

  it('rejects malformed persisted JSON without removing the original data', () => {
    const values = new Map([[LIBRARY_KEY, '{broken']]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };
    expect(() => loadLibrary(storage)).toThrow('Malformed JSON');
    expect(values.get(LIBRARY_KEY)).toBe('{broken');
  });

  it('persists and reloads the selected comparison identity when an unrelated snapshot is first', () => {
    // Given: stored history begins with another user who is not selected for comparison.
    const unrelated = { ...snapshot, username: 'someone-else', year: 2022 };
    const selected2023 = { ...snapshot, year: 2023 };
    const selected2024 = { ...snapshot, year: 2024 };
    const snapshots = [unrelated, selected2023, selected2024];
    const archive = createArchive(snapshots, [2023, 2024], { kind: 'fixed', maxCount: 40 });
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };

    // When: the selected comparison is persisted and loaded into a new session.
    const library = comparisonLibrary({ snapshots }, archive);
    expect(saveLibrary(storage, library)).toEqual({ ok: true });
    const reloaded = loadLibrary(storage);

    // Then: the saved identity belongs to the selected snapshots, not the first stored entry.
    expect(reloaded.comparison).toEqual({
      username: selected2023.username,
      years: [2023, 2024],
      maxCount: 40,
    });
  });
});
