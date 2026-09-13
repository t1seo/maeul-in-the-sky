import { withMotionContext } from '../../src/core/animation.js';
import { ASSET_CATALOG, renderCatalogAsset } from '../../src/themes/terrain/assets.js';
import { EPIC_CATALOG, EPIC_RENDERERS } from '../../src/themes/terrain/epics.js';
import type { AssetColors } from '../../src/themes/terrain/palette.js';
import { buildAssetRecord, buildWonderRecord } from './model.js';
import type { CatalogRecord } from './types.js';

export type GalleryItem = {
  readonly record: CatalogRecord;
  readonly render: (colors: AssetColors) => string;
};

export function createGalleryItems(): readonly GalleryItem[] {
  return [
    ...ASSET_CATALOG.map((entry): GalleryItem => ({
      record: buildAssetRecord(entry),
      render: (colors) =>
        withMotionContext({ mode: 'off', namespace: `catalog-${entry.id}` }, () =>
          renderCatalogAsset(entry.id, colors),
        ),
    })),
    ...EPIC_CATALOG.map((entry): GalleryItem => ({
      record: buildWonderRecord(entry),
      render: (colors) =>
        withMotionContext({ mode: 'off', namespace: `catalog-${entry.id}` }, () =>
          EPIC_RENDERERS[entry.id](0, 0, colors),
        ),
    })),
  ];
}
