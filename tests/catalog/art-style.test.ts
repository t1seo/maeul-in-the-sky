import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { createGalleryItems } from '../../scripts/catalog/gallery-items.js';
import { paddedViewBox } from '../../scripts/catalog/render.js';
import { renderCatalogSprite } from '../../scripts/catalog/sprite.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';

function raster(fragment: string): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="-32 -48 64 64">${fragment}</svg>`;
  return Buffer.from(new Resvg(svg, { font: { loadSystemFonts: false } }).render().pixels);
}

describe('catalog art styles', () => {
  it('keeps one identical record for each identity when selecting pixel art', () => {
    // Given
    const miniature = createGalleryItems();

    // When
    const pixel = createGalleryItems('pixel');

    // Then
    expect(pixel.map((item) => item.record)).toEqual(miniature.map((item) => item.record));
    expect(pixel).toHaveLength(240);
    expect(new Set(pixel.map((item) => item.record.id)).size).toBe(240);
  });

  it.each(['pine', 'hanok', 'worldTree'])(
    'selects visibly different pixel geometry for %s',
    (id) => {
      // Given
      const colors = getTerrainPalette100('light').assets;
      const miniature = createGalleryItems().find((item) => item.record.id === id);
      const pixel = createGalleryItems('pixel').find((item) => item.record.id === id);
      if (!miniature || !pixel) throw new TypeError(`Missing gallery item ${id}`);

      // When
      const pixelImage = raster(pixel.render(colors));

      // Then
      expect(pixelImage.equals(raster(miniature.render(colors)))).toBe(false);
      expect(pixel.render(colors)).not.toMatch(/<animate|<filter|<image|<foreignObject/);
    },
  );

  it.each(['light', 'dark'] as const)(
    'paints every pixel preview inside its card in %s',
    (mode) => {
      // Given
      const items = createGalleryItems('pixel');
      const colors = getTerrainPalette100(mode).assets;

      // When / Then
      for (const item of items) {
        const pixels = raster(item.render(colors));
        let left = 256,
          top = 256,
          right = 0,
          bottom = 0,
          visible = 0;
        for (let y = 0; y < 256; y++) {
          for (let x = 0; x < 256; x++) {
            if (pixels[(y * 256 + x) * 4 + 3] === 0) continue;
            visible++;
            left = Math.min(left, x);
            top = Math.min(top, y);
            right = Math.max(right, x + 1);
            bottom = Math.max(bottom, y + 1);
          }
        }
        const bounds = paddedViewBox(item.record.bounds);
        expect(visible, item.record.id).toBeGreaterThan(0);
        expect(left / 4 - 32, item.record.id).toBeGreaterThanOrEqual(bounds.x);
        expect(right / 4 - 32, item.record.id).toBeLessThanOrEqual(bounds.x + bounds.width);
        expect(top / 4 - 48, item.record.id).toBeGreaterThanOrEqual(bounds.y);
        expect(bottom / 4 - 48, item.record.id).toBeLessThanOrEqual(bounds.y + bounds.height);
      }
    },
  );

  it('keeps the same symbol identities across both lighting and art style choices', () => {
    // Given
    const styles = ['miniature', 'pixel'] as const;

    // When
    const sprites = styles.flatMap((style) =>
      ['dark', 'light'].map((mode) =>
        renderCatalogSprite(createGalleryItems(style), mode === 'dark' ? 'dark' : 'light'),
      ),
    );

    // Then
    const ids = sprites.map((sprite) =>
      [...sprite.matchAll(/<g id="((?:asset|wonder)-[^"]+)"/g)].map((match) => match[1]),
    );
    expect(ids[0]).toHaveLength(240);
    for (const symbols of ids) expect(symbols).toEqual(ids[0]);
  });
});
