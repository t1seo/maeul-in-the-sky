import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { ASSET_CATALOG, renderCatalogAsset } from '../../src/themes/terrain/assets.js';
import { EPIC_CATALOG, renderCatalogEpic } from '../../src/themes/terrain/epics.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import type { AssetBounds } from '../../src/themes/terrain/assets.js';

function visibleBounds(fragment: string): AssetBounds {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="-64 -80 128 128">${fragment}</svg>`;
  const pixels = new Resvg(svg, { font: { loadSystemFonts: false } }).render().pixels;
  let left = 256,
    right = 0,
    top = 256,
    bottom = 0;
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 256; x++)
      if (pixels[(y * 256 + x) * 4 + 3] > 0) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
  expect(left).toBeGreaterThan(0);
  expect(top).toBeGreaterThan(0);
  expect(right).toBeLessThan(255);
  expect(bottom).toBeLessThan(255);
  return {
    x: left / 2 - 64,
    y: top / 2 - 80,
    width: (right - left + 1) / 2,
    height: (bottom - top + 1) / 2,
  };
}
function expectContains(bounds: AssetBounds, painted: AssetBounds, label: string) {
  expect(painted.width, label).toBeGreaterThan(0);
  expect(painted.height, label).toBeGreaterThan(0);
  expect(painted.x, label).toBeGreaterThanOrEqual(bounds.x);
  expect(painted.y, label).toBeGreaterThanOrEqual(bounds.y);
  expect(painted.x + painted.width, label).toBeLessThanOrEqual(bounds.x + bounds.width);
  expect(painted.y + painted.height, label).toBeLessThanOrEqual(bounds.y + bounds.height);
}

describe.each(['miniature', 'pixel'] as const)(
  '%s catalog bounds against actual SVG rasterization',
  (artStyle) => {
    it.each(['dark', 'light'] as const)('contains every ordinary variant in %s mode', (mode) => {
      const colors = getTerrainPalette100(mode).assets;
      for (const entry of ASSET_CATALOG)
        for (const variant of [0, 1, 2]) {
          expectContains(
            entry.bounds,
            visibleBounds(renderCatalogAsset(entry.id, colors, variant, artStyle)),
            `${entry.id}/${variant}/${mode}/${artStyle}`,
          );
        }
    });
    it.each(['dark', 'light'] as const)(
      'contains all 30 separate Wonder silhouettes in %s mode',
      (mode) => {
        const colors = getTerrainPalette100(mode).assets;
        for (const entry of EPIC_CATALOG) {
          expectContains(
            entry.bounds,
            visibleBounds(renderCatalogEpic(entry.id, colors, artStyle)),
            `${entry.id}/${mode}/${artStyle}`,
          );
        }
      },
    );
  },
);
