import type {
  AssetBounds,
  AssetCatalogEntry,
  AssetSeason,
} from '../../src/themes/terrain/assets.js';
import type { EpicCatalogEntry } from '../../src/themes/terrain/epics.js';

export const CATALOG_FAMILIES = ['nature', 'building', 'decoration', 'wonder', 'korean'] as const;
export type CatalogFamily = (typeof CATALOG_FAMILIES)[number];

export const CATALOG_STYLES = ['classic', 'korean', 'wonder'] as const;
export type CatalogStyle = (typeof CATALOG_STYLES)[number];

export type CatalogRecord = {
  readonly id: string;
  readonly kind: 'asset' | 'wonder';
  readonly displayName: string;
  readonly description: string;
  readonly family: CatalogFamily;
  readonly style: CatalogStyle;
  readonly season: AssetSeason;
  readonly category: string;
  readonly bounds: AssetBounds;
};

export type CatalogFilters = {
  readonly family: CatalogFamily | 'all';
  readonly style: CatalogStyle | 'all';
  readonly season: AssetSeason;
  readonly query: string;
};

export type CatalogFamilyCounts = Readonly<Record<CatalogFamily, number>>;

export type RuntimeAssetCatalog = readonly AssetCatalogEntry[];
export type RuntimeWonderCatalog = readonly EpicCatalogEntry[];
