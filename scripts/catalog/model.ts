import type { AssetCatalogEntry, AssetCategory } from '../../src/themes/terrain/assets.js';
import type { EpicCatalogEntry } from '../../src/themes/terrain/epics.js';
import type {
  CatalogFamily,
  CatalogFamilyCounts,
  CatalogFilters,
  CatalogRecord,
  RuntimeAssetCatalog,
  RuntimeWonderCatalog,
} from './types.js';

function assertNever(value: never): never {
  throw new TypeError(`Unexpected asset category: ${String(value)}`);
}

function familyForCategory(category: AssetCategory): CatalogFamily {
  switch (category) {
    case 'water':
    case 'shore':
    case 'woodland':
    case 'farm':
      return 'nature';
    case 'village':
    case 'town':
      return 'building';
    case 'decoration':
      return 'decoration';
    default:
      return assertNever(category);
  }
}

export function buildCatalogRecords(
  assets: RuntimeAssetCatalog,
  wonders: RuntimeWonderCatalog,
): readonly CatalogRecord[] {
  return [...assets.map(buildAssetRecord), ...wonders.map(buildWonderRecord)];
}

export function buildAssetRecord(entry: AssetCatalogEntry): CatalogRecord {
  return {
    id: entry.id,
    kind: 'asset',
    displayName: entry.displayName,
    description: entry.description,
    family: entry.style === 'korean' ? 'korean' : familyForCategory(entry.category),
    style: entry.style,
    season: entry.season,
    category: entry.category,
    bounds: entry.bounds,
  };
}

export function buildWonderRecord(entry: EpicCatalogEntry): CatalogRecord {
  return {
    id: entry.id,
    kind: 'wonder',
    displayName: entry.displayName,
    description: entry.description,
    family: 'wonder',
    style: 'wonder',
    season: 'all',
    category: entry.category,
    bounds: entry.bounds,
  };
}

export function countCatalogFamilies(records: readonly CatalogRecord[]): CatalogFamilyCounts {
  const counts: Record<CatalogFamily, number> = {
    nature: 0,
    building: 0,
    decoration: 0,
    wonder: 0,
    korean: 0,
  };
  for (const record of records) counts[record.family] += 1;
  return counts;
}

export function filterCatalogRecords(
  records: readonly CatalogRecord[],
  filters: CatalogFilters,
): readonly CatalogRecord[] {
  const query = filters.query.trim().toLocaleLowerCase('en-US');
  return records.filter((record) => {
    const matchesFamily = filters.family === 'all' || record.family === filters.family;
    const matchesStyle = filters.style === 'all' || record.style === filters.style;
    const matchesSeason =
      filters.season === 'all' || record.season === 'all' || record.season === filters.season;
    const haystack = [
      record.id,
      record.displayName,
      record.description,
      record.family,
      record.style,
      record.season,
      record.category,
    ]
      .join(' ')
      .toLocaleLowerCase('en-US');
    return matchesFamily && matchesStyle && matchesSeason && haystack.includes(query);
  });
}
