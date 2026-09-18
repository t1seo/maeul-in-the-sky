import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { ASSET_CATALOG, renderCatalogAsset } from '../../src/themes/terrain/assets.js';
import { withMotionContext } from '../../src/core/animation.js';
import { getSeasonalPalette100, getTerrainPalette100 } from '../../src/themes/terrain/palette.js';

function raster(fragment: string) {
  return new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-24 -28 48 40" width="384" height="320">${fragment}</svg>`,
    { font: { loadSystemFonts: false } },
  ).render();
}

function alphaPixels(pixels: Uint8Array): Buffer {
  const result = Buffer.alloc(pixels.length / 4);
  for (let index = 0; index < result.length; index++) result[index] = pixels[index * 4 + 3];
  return result;
}

function alpha(fragment: string): Buffer {
  return alphaPixels(raster(fragment).pixels);
}

describe('Korean miniature art', () => {
  it.each(['dark', 'light'] as const)('uses seasonal roof materials in %s', (mode) => {
    const winter = getSeasonalPalette100(mode, 0, 0).assets;
    const summer = getSeasonalPalette100(mode, 28, 0).assets;
    for (const [id, role] of [
      ['hanok', 'giwa'],
      ['choga', 'thatch'],
    ] as const) {
      expect(winter[role]).not.toBe(summer[role]);
      expect(renderCatalogAsset(id, winter, 0)).toContain(`fill="${winter[role]}"`);
      expect(
        Buffer.from(alpha(renderCatalogAsset(id, winter, 0))).equals(
          Buffer.from(alpha(renderCatalogAsset(id, summer, 0))),
        ),
      ).toBe(true);
    }
  });

  it.each(['dark', 'light'] as const)(
    'contains every visible variant within declared bounds in %s',
    (mode) => {
      // Given every cultural entry and three variants, when rasterized, then all painted pixels fit.
      const entries = ASSET_CATALOG.filter(({ style }) => style === 'korean');
      expect(entries).toHaveLength(13);
      for (const entry of entries)
        for (const variant of [0, 1, 2]) {
          const art = withMotionContext({ mode: 'off', namespace: '' }, () =>
            renderCatalogAsset(entry.id, getTerrainPalette100(mode).assets, variant),
          );
          const { pixels, width, height } = raster(art);
          let area = 0;
          let left = width,
            right = 0,
            top = height,
            bottom = 0;
          for (let y = 0; y < height; y++)
            for (let x = 0; x < width; x++) {
              if (pixels[(y * width + x) * 4 + 3] === 0) continue;
              area++;
              left = Math.min(left, x);
              right = Math.max(right, x);
              top = Math.min(top, y);
              bottom = Math.max(bottom, y);
            }
          expect(left / 8 - 24, `${entry.id} v${variant} left`).toBeGreaterThanOrEqual(
            entry.bounds.x,
          );
          expect(top / 8 - 28, `${entry.id} v${variant} top`).toBeGreaterThanOrEqual(
            entry.bounds.y,
          );
          expect((right + 1) / 8 - 24, `${entry.id} v${variant} right`).toBeLessThanOrEqual(
            entry.bounds.x + entry.bounds.width,
          );
          expect((bottom + 1) / 8 - 28, `${entry.id} v${variant} bottom`).toBeLessThanOrEqual(
            entry.bounds.y + entry.bounds.height,
          );
          expect(area, entry.id).toBeGreaterThan(200);
          expect(art).not.toMatch(/<filter|<image|foreignObject|url\(|NaN|undefined/);
        }
    },
  );

  it.each(ASSET_CATALOG.filter(({ style }) => style === 'korean'))(
    'gives $id three silhouette variants rather than recolors',
    (entry) => {
      // Given one palette, when variants change, then actual painted alpha changes.
      const silhouettes = [0, 1, 2].map((v) =>
        Buffer.from(
          alpha(renderCatalogAsset(entry.id, getTerrainPalette100('dark').assets, v)),
        ).toString('base64'),
      );
      expect(new Set(silhouettes).size, entry.id).toBe(3);
    },
  );

  it.each([0, 1, 2])('keeps the stone bridge v%s opening clear below the arch', (variant) => {
    const art = renderCatalogAsset('stoneBridge', getTerrainPalette100('dark').assets, variant);
    const { pixels, width } = raster(art);
    expect(pixels[((5 + 28) * 8 * width + 24 * 8) * 4 + 3]).toBe(0);
  });

  it.each(ASSET_CATALOG.filter(({ style }) => style === 'korean'))(
    'retains $id geometry in both lighting and motion modes',
    (entry) => {
      // Given a fixed ID and variant, when lighting/motion changes, then geometry stays stable.
      for (const variant of [0, 1, 2]) {
        const dark = renderCatalogAsset(entry.id, getTerrainPalette100('dark').assets, variant);
        const light = renderCatalogAsset(entry.id, getTerrainPalette100('light').assets, variant);
        const off = withMotionContext({ mode: 'off', namespace: '' }, () =>
          renderCatalogAsset(entry.id, getTerrainPalette100('dark').assets, variant),
        );
        const darkPixels = raster(dark).pixels;
        const lightPixels = raster(light).pixels;
        const offPixels = raster(off).pixels;
        expect(alphaPixels(darkPixels).equals(alphaPixels(lightPixels)), entry.id).toBe(true);
        expect(darkPixels.equals(offPixels), entry.id).toBe(true);
      }
    },
  );
});
