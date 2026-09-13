import type { IsoCell } from '../blocks.js';
import type { AssetColors } from '../palette.js';
import type { BiomeContext } from '../biomes.js';
import type { AssetType } from './asset-types.js';
export type { AssetType } from './asset-types.js';

export type VillageStyle = 'classic' | 'korean';
export type AssetCategory =
  'water' | 'shore' | 'woodland' | 'farm' | 'village' | 'town' | 'decoration';
export type AssetSeason = 'all' | 'winter' | 'spring' | 'summer' | 'autumn';
export type AssetBounds = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export interface PlacedAsset {
  readonly id: string;
  readonly date: string | undefined;
  readonly catalogId: AssetType;
  readonly cell: IsoCell;
  readonly type: AssetType;
  readonly cx: number;
  readonly cy: number;
  readonly ox: number;
  readonly oy: number;
  readonly variant: number;
  /** Budget affects motion only; identity, geometry and variant stay unchanged. */
  readonly animated: boolean;
}

export interface AssetSelectionOptions {
  readonly villageStyle?: VillageStyle;
  readonly hemisphere?: 'north' | 'south';
  readonly variantSeed?: number;
  readonly biomeMap?: ReadonlyMap<string, BiomeContext>;
  readonly seasonRotation?: number;
  readonly density?: number;
  readonly excludeCells?: ReadonlySet<string>;
}

export interface AssetCatalogEntry {
  readonly id: AssetType;
  readonly displayName: string;
  readonly category: AssetCategory;
  readonly bounds: AssetBounds;
  readonly style: VillageStyle;
  readonly season: AssetSeason;
  readonly description: string;
}

export interface AssetPool {
  readonly types: readonly AssetType[];
  readonly chance: number;
}
export type AssetRenderer = (x: number, y: number, colors: AssetColors, variant: number) => string;
