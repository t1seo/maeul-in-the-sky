import { describe, expect, it } from 'vitest';
import {
  computeSharedNormalization,
  createArchive,
  selectComparisonSnapshots,
  upsertArchiveSnapshot,
} from '../../src/core/archive/comparison.js';
import { parseArchive } from '../../src/core/archive/parse.js';
import { serializeArchive } from '../../src/core/archive/serialize.js';
import { normalizeCount100 } from '../../src/core/settings/normalization.js';
import { annualSnapshot } from './settings/archive-fixtures.js';

describe('portable archive comparison', () => {
  it('computes one P90 from all selected positive days instead of per-year percentiles', () => {
    // Given
    const snapshots = [
      annualSnapshot(2024, [0, 1, 2, 3, 4, 5, 6, 7, 8]),
      annualSnapshot(2025, [9, 10, 999]),
    ];
    // When
    const normalization = computeSharedNormalization(snapshots);
    // Then
    expect(normalization).toEqual({ kind: 'fixed', maxCount: 10 });
    expect(snapshots.map(() => normalizeCount100(5, normalization.maxCount))).toEqual([70, 70]);
  });

  it('lets an explicit fixed maximum override the pooled P90', () => {
    // Given
    const snapshots = [annualSnapshot(2024), annualSnapshot(2025)];
    // When
    const normalization = computeSharedNormalization(snapshots, { kind: 'fixed', maxCount: 40 });
    // Then
    expect(normalization).toEqual({ kind: 'fixed', maxCount: 40 });
  });

  it('roundtrips sorted snapshots and selections while preserving original per-year settings and source', () => {
    // Given
    const snapshots = [annualSnapshot(2025), annualSnapshot(2024)];
    // When
    const archive = createArchive(snapshots, [2025, 2024]);
    const json = serializeArchive(archive);
    // Then
    expect(serializeArchive(parseArchive(json))).toBe(json);
    expect(archive.snapshots.map((snapshot) => snapshot.year)).toEqual([2024, 2025]);
    expect(archive.comparison).toEqual({
      normalization: { kind: 'fixed', maxCount: 10 },
      years: [2024, 2025],
    });
    expect(archive.snapshots[0].settings.normalization).toEqual({ kind: 'relative' });
    expect(archive.snapshots[0].source).toEqual({ kind: 'sample' });
  });

  it.each([[2024], [2024, 2024], [2024, 2026], [2020, 2021, 2022, 2023, 2024, 2025]])(
    'rejects invalid comparison selections %j',
    (...years) => {
      // Given
      const snapshots = [annualSnapshot(2024), annualSnapshot(2025)];
      // When
      const select = () => selectComparisonSnapshots(snapshots, years);
      // Then
      expect(select).toThrow(/comparison.years/);
    },
  );

  it('rejects different users even with distinct selected years', () => {
    // Given
    const snapshots = [annualSnapshot(2024), annualSnapshot(2025, [1], 'someone')];
    // When
    const select = () => selectComparisonSnapshots(snapshots, [2024, 2025]);
    // Then
    expect(select).toThrow(/same username/);
  });

  it('accepts the same username with different letter case', () => {
    // Given
    const snapshots = [annualSnapshot(2024), annualSnapshot(2025, [1], 'OctoCat')];
    // When
    const selected = selectComparisonSnapshots(snapshots, [2024, 2025]);
    // Then
    expect(selected).toHaveLength(2);
  });

  it('requires explicit replacement and leaves existing snapshots intact after rejection', () => {
    // Given
    const original = annualSnapshot(2024, [1]);
    const replacement = annualSnapshot(2024, [999], 'OctoCat');
    const snapshots = [original];
    // When
    const upsert = () => upsertArchiveSnapshot(snapshots, replacement);
    // Then
    expect(upsert).toThrow(/replacement/);
    expect(snapshots[0]).toBe(original);
  });

  it('replaces exactly one matching username and year when requested', () => {
    // Given
    const snapshots = [annualSnapshot(2024), annualSnapshot(2025)];
    const replacement = annualSnapshot(2024, [999]);
    // When
    const result = upsertArchiveSnapshot(snapshots, replacement, true);
    // Then
    expect(result).toHaveLength(2);
    expect(result[0].weeks[0].days[0].count).toBe(999);
    expect(snapshots[0].weeks[0].days[0].count).toBe(1);
  });
});
