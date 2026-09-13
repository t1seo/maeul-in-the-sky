import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { ASSET_CATALOG, renderCatalogAsset } from '../../src/themes/terrain/assets.js';
import { EPIC_CATALOG, EPIC_RENDERERS } from '../../src/themes/terrain/epics.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import type { AssetBounds } from '../../src/themes/terrain/assets.js';

function visibleBounds(fragment: string): AssetBounds {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="-32 -48 64 64">${fragment}</svg>`;
  const pixels = new Resvg(svg, { font: { loadSystemFonts: false } }).render().pixels;
  let left = 128,
    right = 0,
    top = 128,
    bottom = 0;
  for (let y = 0; y < 128; y++)
    for (let x = 0; x < 128; x++)
      if (pixels[(y * 128 + x) * 4 + 3] > 0) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
  return {
    x: left / 2 - 32,
    y: top / 2 - 48,
    width: (right - left + 1) / 2,
    height: (bottom - top + 1) / 2,
  };
}
function expectContains(bounds: AssetBounds, painted: AssetBounds) {
  expect(painted.width).toBeGreaterThan(0);
  expect(painted.height).toBeGreaterThan(0);
  expect(painted.x).toBeGreaterThanOrEqual(bounds.x);
  expect(painted.y).toBeGreaterThanOrEqual(bounds.y);
  expect(painted.x + painted.width).toBeLessThanOrEqual(bounds.x + bounds.width);
  expect(painted.y + painted.height).toBeLessThanOrEqual(bounds.y + bounds.height);
}

describe('catalog bounds against actual SVG rasterization', () => {
  it.each(['dark', 'light'] as const)('contains every ordinary variant in %s mode', (mode) => {
    const colors = getTerrainPalette100(mode).assets;
    for (const entry of ASSET_CATALOG)
      for (const variant of [0, 1, 2]) {
        expectContains(entry.bounds, visibleBounds(renderCatalogAsset(entry.id, colors, variant)));
      }
  });
  it('contains all 30 separate Wonder silhouettes', () => {
    const colors = getTerrainPalette100('dark').assets;
    for (const entry of EPIC_CATALOG) {
      expectContains(entry.bounds, visibleBounds(EPIC_RENDERERS[entry.id](0, 0, colors)));
    }
  });
});
