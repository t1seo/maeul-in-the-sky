import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../src/core/animation.js';
import { ASSET_BOUNDS } from '../../src/themes/terrain/assets/bounds.js';
import type { AssetRenderer, AssetType } from '../../src/themes/terrain/assets/types.js';
import * as village from '../../src/themes/terrain/assets/renderers/seasonal-winter-bare-bush.js';
import * as festive from '../../src/themes/terrain/assets/renderers/seasonal-winter-church-winter.js';
import * as ice from '../../src/themes/terrain/assets/renderers/seasonal-winter-igloo.js';
import * as forest from '../../src/themes/terrain/assets/renderers/seasonal-winter-snow-pine.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';

const WINTER = [
  ['bareBush', village.svgBareBush, 3],
  ['winterBird', village.svgWinterBird, 3],
  ['firewood', village.svgFirewood, 3],
  ['houseWinter', village.svgHouseWinter, 3],
  ['houseBWinter', village.svgHouseBWinter, 3],
  ['barnWinter', village.svgBarnWinter, 2],
  ['churchWinter', festive.svgChurchWinter, 2],
  ['christmasTree', festive.svgChristmasTree, 3],
  ['winterLantern', festive.svgWinterLantern, 2],
  ['frozenFountain', festive.svgFrozenFountain, 2],
  ['igloo', ice.svgIgloo, 3],
  ['frozenPond', ice.svgFrozenPond, 3],
  ['icicle', ice.svgIcicle, 3],
  ['sled', ice.svgSled, 3],
  ['snowCoveredRock', ice.svgSnowCoveredRock, 3],
  ['snowPine', forest.svgSnowPine, 3],
  ['snowDeciduous', forest.svgSnowDeciduous, 3],
  ['snowman', forest.svgSnowman, 3],
  ['snowdrift', forest.svgSnowdrift, 3],
] as const satisfies readonly (readonly [AssetType, AssetRenderer, number])[];
const SIZE = 256;
const SCALE = 8;
const colors = getTerrainPalette100('light').assets;

function raster(fragment: string): Uint8Array {
  return new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="-16 -20 32 32">${fragment}</svg>`,
    { font: { loadSystemFonts: false } },
  ).render().pixels;
}

function area(
  pixels: Uint8Array,
  left: number,
  top: number,
  right: number,
  bottom: number,
): number {
  let coverage = 0;
  for (let y = Math.ceil((top + 20) * SCALE); y < (bottom + 20) * SCALE; y++) {
    for (let x = Math.ceil((left + 16) * SCALE); x < (right + 16) * SCALE; x++) {
      coverage += pixels[(y * SIZE + x) * 4 + 3] / 255;
    }
  }
  return coverage / SCALE ** 2;
}

describe('winter miniature geometry', () => {
  it.each(['light', 'dark'] as const)(
    'keeps all visible variants inside their catalog bounds in %s',
    (mode) => {
      // Given: the production palette and catalog bounds.
      const palette = getTerrainPalette100(mode).assets;
      for (const [id, render] of WINTER) {
        for (const variant of [0, 1, 2]) {
          // When: each renderer is rasterized with antialiased edges included.
          const pixels = raster(render(0, 0, palette, variant));
          const bounds = ASSET_BOUNDS[id];
          let visible = 0;
          let left = SIZE,
            right = 0,
            top = SIZE,
            bottom = 0;
          for (let y = 0; y < SIZE; y++) {
            for (let x = 0; x < SIZE; x++) {
              if (pixels[(y * SIZE + x) * 4 + 3] === 0) continue;
              visible++;
              left = Math.min(left, x);
              right = Math.max(right, x + 1);
              top = Math.min(top, y);
              bottom = Math.max(bottom, y + 1);
            }
          }
          // Then: every painted pixel remains in the published bounds.
          const label = `${id}/${variant}/${mode}`;
          expect(left / SCALE - 16, label).toBeGreaterThanOrEqual(bounds.x);
          expect(right / SCALE - 16, label).toBeLessThanOrEqual(bounds.x + bounds.width);
          expect(top / SCALE - 20, label).toBeGreaterThanOrEqual(bounds.y);
          expect(bottom / SCALE - 20, label).toBeLessThanOrEqual(bounds.y + bounds.height);
          expect(visible, `${id}/${variant}`).toBeGreaterThan(20);
        }
      }
    },
  );

  it.each(WINTER)('keeps %s deterministic and anchored in every motion mode', (_id, render) => {
    for (const variant of [0, 1, 2]) {
      // Given: the same material, variant and translated ground anchor.
      const reference = raster(render(0, 0, colors, variant));
      for (const mode of ['full', 'subtle', 'off'] as const) {
        // When: the real motion context wraps the renderer.
        const fragment = withMotionContext({ mode, namespace: 'winter' }, () =>
          render(2, -1, colors, variant),
        );
        // Then: visible static geometry, stable placement and a bounded SVG cost remain.
        expect(
          Buffer.from(raster(`<g transform="translate(-2,1)">${fragment}</g>`)).equals(reference),
        ).toBe(true);
        expect(render(2, -1, colors, variant)).toBe(fragment);
        expect(fragment).not.toMatch(/<defs|<filter|<foreignObject|href=|url\(/);
        expect(
          fragment.match(/<(?:path|polygon|ellipse|circle|rect|line)\b/g)?.length ?? 0,
        ).toBeLessThanOrEqual(36);
      }
    }
  });

  it.each(WINTER)('preserves visibly different meaningful %s variants', (_id, render, count) => {
    // Given / When: each meaningful variant is rasterized through the actual SVG engine.
    const images = Array.from({ length: count }, (_, variant) =>
      Buffer.from(raster(render(0, 0, colors, variant))).toString('base64'),
    );
    // Then: each variant paints a different image.
    expect(new Set(images).size).toBe(count);
  });

  it.each([0, 1, 2])('gives House B its own silhouette in variant %i', (variant) => {
    // Given / When: the two winter house identities share a palette and anchor.
    const a = raster(village.svgHouseWinter(0, 0, colors, variant));
    const b = raster(village.svgHouseBWinter(0, 0, colors, variant));
    // Then: their opaque silhouette masks differ, independently of decoration colors.
    const mask = (pixels: Uint8Array): Buffer =>
      Buffer.from(pixels.filter((_value, index) => index % 4 === 3));
    expect(mask(a).equals(mask(b))).toBe(false);
  });

  it.each([0, 1, 2])('gives the winter bird a readable tail in variant %i', (variant) => {
    // Given / When: a cardinal, robin or sparrow is rendered at its ground anchor.
    const pixels = raster(village.svgWinterBird(0, 0, colors, variant));
    // Then: the tail extends beyond the rounded body as visible filled material.
    expect(area(pixels, 1.2, -2.5, 2.7, -0.3)).toBeGreaterThan(0.35);
  });

  it('tapers a hanging icicle toward its lower tip', () => {
    // Given / When: the single icicle hangs from its frozen ledge.
    const pixels = raster(ice.svgIcicle(0, 0, colors, 0));
    // Then: the attachment is wider than the falling tip.
    expect(area(pixels, -1, -3.6, 1, -2.8)).toBeGreaterThan(area(pixels, -1, -1.6, 1, -0.8) * 1.6);
  });

  it.each([0, 1, 2])('keeps snowman volume visibly shaded in variant %i', (variant) => {
    // Given / When: the three snowman poses use the production ice material.
    const pixels = raster(forest.svgSnowman(0, 0, colors, variant));
    const rgb = [0, 2, 4].map((offset) => parseInt(colors.ice.slice(offset + 1, offset + 3), 16));
    // Then: cool shaded snow is a painted surface, not a transparent outline.
    let shaded = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if (
        rgb.every((channel, offset) => pixels[index + offset] === channel) &&
        pixels[index + 3] === 255
      ) {
        shaded++;
      }
    }
    expect(shaded / SCALE ** 2).toBeGreaterThan(0.5);
  });
});
