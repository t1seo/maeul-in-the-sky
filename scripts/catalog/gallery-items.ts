import { withMotionContext } from '../../src/core/animation.js';
import type { ArtStyle } from '../../src/core/render-options.js';
import { ASSET_CATALOG, renderCatalogAsset } from '../../src/themes/terrain/assets.js';
import { EPIC_CATALOG, renderCatalogEpic } from '../../src/themes/terrain/epics.js';
import type { AssetColors } from '../../src/themes/terrain/palette.js';
import { buildAssetRecord, buildWonderRecord } from './model.js';
import type { CatalogRecord } from './types.js';

export type GalleryItem = {
  readonly record: CatalogRecord;
  readonly render: (colors: AssetColors) => string;
};

export function createGalleryItems(artStyle: ArtStyle = 'miniature'): readonly GalleryItem[] {
  return [
    ...ASSET_CATALOG.map((entry): GalleryItem => ({
      record: buildAssetRecord(entry),
      render: (colors) =>
        withMotionContext({ mode: 'off', namespace: `catalog-${entry.id}` }, () =>
          renderCatalogAsset(entry.id, colors, 0, artStyle),
        ),
    })),
    ...EPIC_CATALOG.map((entry): GalleryItem => ({
      record: buildWonderRecord(entry),
      render: (colors) =>
        withMotionContext({ mode: 'off', namespace: `catalog-${entry.id}` }, () =>
          renderCatalogEpic(entry.id, colors, artStyle),
        ),
    })),
  ];
}
