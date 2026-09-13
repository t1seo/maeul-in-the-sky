import { describe, expect, it } from 'vitest';
import { createArchive, upsertArchiveSnapshot } from '../../src/core/archive/comparison.js';
import { parseArchive } from '../../src/core/archive/parse.js';
import { parseSnapshot } from '../../src/core/settings/parse.js';
import { annualSnapshot } from './settings/archive-fixtures.js';

function manyDaysSnapshot(year: number, count: number) {
  const first = Date.parse('2000-01-01T00:00:00Z');
  return {
    schemaVersion: 1,
    kind: 'maeul-snapshot',
    username: 'octocat',
    year,
    weeks: Array.from({ length: Math.ceil(count / 7) }, (_, week) => ({
      firstDay: '2000-01-01',
      days: Array.from({ length: Math.min(7, count - week * 7) }, (_, day) => ({
        date: new Date(first + (week * 7 + day) * 86_400_000).toISOString().slice(0, 10),
        count: 1,
        level: 1,
      })),
    })),
    settings: {},
    source: { kind: 'import' },
  };
}

function archiveInput(snapshots: readonly unknown[]) {
  return {
    schemaVersion: 1,
    kind: 'maeul-archive',
    snapshots,
    comparison: { normalization: { kind: 'fixed', maxCount: 10 }, years: [2024, 2025] },
  };
}

describe('archive trust and resource boundaries', () => {
  it('rejects an unknown archive version', () => {
    // Given
    const input = {
      ...archiveInput([annualSnapshot(2024), annualSnapshot(2025)]),
      schemaVersion: 2,
    };
    // When
    const parse = () => parseArchive(input);
    // Then
    expect(parse).toThrow(/schemaVersion/);
  });

  it('rejects case-insensitive duplicate username/year entries', () => {
    // Given
    const input = archiveInput([annualSnapshot(2024), annualSnapshot(2024, [1], 'OctoCat')]);
    // When
    const parse = () => parseArchive(input);
    // Then
    expect(parse).toThrow(/snapshots.1.*Duplicate/);
  });

  it('rejects an ambiguous selected year across different users', () => {
    // Given
    const input = archiveInput([
      annualSnapshot(2024),
      annualSnapshot(2025),
      annualSnapshot(2024, [1], 'other'),
    ]);
    // When
    const parse = () => parseArchive(input);
    // Then
    expect(parse).toThrow(/comparison.years.*exactly one/);
  });

  it('stores unselected snapshots without mixing their scale into the comparison', () => {
    // Given
    const snapshots = [
      annualSnapshot(2023, [999]),
      annualSnapshot(2024, [1]),
      annualSnapshot(2025, [2]),
    ];
    // When
    const archive = createArchive(snapshots, [2024, 2025]);
    // Then
    expect(archive.comparison.normalization.maxCount).toBe(2);
    expect(archive.snapshots).toHaveLength(3);
  });

  it('accepts 20 stored snapshots but rejects the 21st without mutating storage', () => {
    // Given
    const snapshots = Array.from({ length: 20 }, (_, index) => annualSnapshot(2006 + index));
    const accepted = createArchive(snapshots, [2024, 2025]);
    // When
    const insert = () => upsertArchiveSnapshot(accepted.snapshots, annualSnapshot(2026));
    // Then
    expect(insert).toThrow(/snapshots/);
    expect(accepted.snapshots).toHaveLength(20);
  });

  it('accepts exactly 20,000 contribution days in one snapshot', () => {
    // Given
    const input = manyDaysSnapshot(2024, 20_000);
    // When
    const snapshot = parseSnapshot(input);
    // Then
    expect(snapshot.weeks.reduce((sum, week) => sum + week.days.length, 0)).toBe(20_000);
  });

  it('rejects 20,001 contribution days in one snapshot', () => {
    // Given
    const input = manyDaysSnapshot(2024, 20_001);
    // When
    const parse = () => parseSnapshot(input);
    // Then
    expect(parse).toThrow(/weeks.*20,000/);
  });

  it('rejects aggregate counts over 20,000 days even when individual snapshots fit', () => {
    // Given
    const input = archiveInput([manyDaysSnapshot(2024, 10_000), manyDaysSnapshot(2025, 10_001)]);
    // When
    const parse = () => parseArchive(input);
    // Then
    expect(parse).toThrow(/snapshots.*20,000/);
  });

  it.each([0, -1, Infinity, NaN])('rejects invalid comparison maxCount %s', (maxCount) => {
    // Given
    const input = {
      ...archiveInput([annualSnapshot(2024), annualSnapshot(2025)]),
      comparison: { years: [2024, 2025], normalization: { kind: 'fixed', maxCount } },
    };
    // When
    const parse = () => parseArchive(input);
    // Then
    expect(parse).toThrow(/comparison.normalization.maxCount/);
  });

  it('defaults the shared maximum to 1 when all selected counts are zero', () => {
    // Given
    const snapshots = [annualSnapshot(2024, [0]), annualSnapshot(2025, [0])];
    // When
    const archive = createArchive(snapshots);
    // Then
    expect(archive.comparison.normalization.maxCount).toBe(1);
  });
});
