import { withMotionContext } from '../../src/core/animation.js';
import { ASSET_CATALOG } from '../../src/themes/terrain/assets/catalog.js';
import { ASSET_RENDERERS } from '../../src/themes/terrain/assets/renderers.js';
import type { AssetBounds } from '../../src/themes/terrain/assets/types.js';
import { EPIC_CATALOG } from '../../src/themes/terrain/epics/catalog.js';
import { EPIC_RENDERERS } from '../../src/themes/terrain/epics/renderers.js';
import type { AssetColors } from '../../src/themes/terrain/palette.js';

export type PixelSource = {
  readonly id: string;
  readonly group: string;
  readonly bounds: AssetBounds;
  readonly variants: number;
  readonly render: (colors: AssetColors, variant: number) => string;
};

export function pixelSources(): readonly PixelSource[] {
  return [
    ...ASSET_CATALOG.map((entry): PixelSource => ({
      id: entry.id,
      group: entry.category,
      bounds: entry.bounds,
      variants: 3,
      render: (colors, variant) =>
        withMotionContext({ mode: 'off', namespace: '' }, () =>
          ASSET_RENDERERS[entry.id](0, 0, colors, variant),
        ),
    })),
    ...EPIC_CATALOG.map((entry): PixelSource => ({
      id: entry.id,
      group: 'wonders',
      bounds: entry.bounds,
      variants: 1,
      render: (colors) =>
        withMotionContext({ mode: 'off', namespace: '' }, () =>
          EPIC_RENDERERS[entry.id](0, 0, colors),
        ),
    })),
  ].sort((a, b) => a.id.localeCompare(b.id));
}
