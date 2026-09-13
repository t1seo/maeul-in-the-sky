import { describe, expect, it } from 'vitest';
import { ASSET_CATALOG } from '../../src/themes/terrain/assets.js';
import { EPIC_CATALOG } from '../../src/themes/terrain/epics.js';
import {
  buildCatalogRecords,
  countCatalogFamilies,
  filterCatalogRecords,
} from '../../scripts/catalog/model.js';

describe('generated catalog data', () => {
  it('C04-data: mirrors every runtime registry entry exactly once', () => {
    // Given
    const expectedIds = [...ASSET_CATALOG, ...EPIC_CATALOG].map((entry) => entry.id);

    // When
    const records = buildCatalogRecords(ASSET_CATALOG, EPIC_CATALOG);

    // Then
    expect(records).toHaveLength(223);
    expect(new Set(records.map((entry) => entry.id)).size).toBe(223);
    expect(records.map((entry) => entry.id)).toEqual(expectedIds);
    expect(records.filter((entry) => entry.kind === 'asset')).toHaveLength(193);
    expect(records.filter((entry) => entry.kind === 'wonder')).toHaveLength(30);
  });

  it('C04-data: keeps the four recognizable Korean catalog IDs', () => {
    // Given
    const records = buildCatalogRecords(ASSET_CATALOG, EPIC_CATALOG);

    // When
    const koreanIds = records.filter((entry) => entry.family === 'korean').map((entry) => entry.id);

    // Then
    expect(koreanIds).toEqual(['hanok', 'pavilion', 'stoneWall', 'onggi']);
  });

  it('C04-data: derives exact family totals from generated records', () => {
    // Given
    const records = buildCatalogRecords(ASSET_CATALOG, EPIC_CATALOG);

    // When
    const counts = countCatalogFamilies(records);

    // Then
    expect(Object.values(counts).reduce((sum, count) => sum + count, 0)).toBe(223);
    expect(counts.wonder).toBe(30);
    expect(counts.korean).toBe(4);
  });
});

describe('catalog filtering', () => {
  it('C04-filter: includes all-season records in a selected season', () => {
    // Given
    const records = buildCatalogRecords(ASSET_CATALOG, EPIC_CATALOG);

    // When
    const winter = filterCatalogRecords(records, {
      family: 'all',
      season: 'winter',
      style: 'all',
      query: '',
    });

    // Then
    expect(winter.length).toBeGreaterThan(0);
    expect(winter.every((entry) => entry.season === 'all' || entry.season === 'winter')).toBe(true);
    expect(winter.some((entry) => entry.season === 'all')).toBe(true);
    expect(winter.some((entry) => entry.season === 'winter')).toBe(true);
  });

  it('C04-filter: returns a clear empty subset for incompatible family and style', () => {
    // Given
    const records = buildCatalogRecords(ASSET_CATALOG, EPIC_CATALOG);

    // When
    const filtered = filterCatalogRecords(records, {
      family: 'wonder',
      season: 'all',
      style: 'korean',
      query: '',
    });

    // Then
    expect(filtered).toEqual([]);
  });

  it('C04-filter: searches IDs, names, descriptions, and metadata without case sensitivity', () => {
    // Given
    const records = buildCatalogRecords(ASSET_CATALOG, EPIC_CATALOG);

    // When
    const filtered = filterCatalogRecords(records, {
      family: 'all',
      season: 'all',
      style: 'all',
      query: 'GIWA',
    });

    // Then
    expect(filtered.map((entry) => entry.id)).toContain('hanok');
  });
});
