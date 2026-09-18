import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../src/core/animation.js';
import { ASSET_BOUNDS } from '../../src/themes/terrain/assets/bounds.js';
import { ASSET_RENDERERS } from '../../src/themes/terrain/assets/renderers.js';
import { renderCatalogAsset } from '../../src/themes/terrain/assets/rendering.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';

const ids = [
  'lemonade',
  'fireflies',
  'swimmingPool',
  'parasol',
  'beachTowel',
  'sandcastleSummer',
  'surfboard',
  'iceCreamCart',
  'hammock',
  'sunflower',
  'watermelon',
  'sprinkler',
  'appleBasket',
  'rake',
  'autumnMaple',
  'autumnOak',
  'autumnBirch',
  'autumnGinkgo',
  'fallenLeaves',
  'leafSwirl',
  'acorn',
  'cornStalk',
  'scarecrowAutumn',
  'harvestBasket',
  'hotDrink',
  'autumnWreath',
  'pumpkinPatch',
  'hayMaze',
] as const;
const scale = 8;
const light = getTerrainPalette100('light').assets;
const dark = getTerrainPalette100('dark').assets;

function raster(fragment: string, offset = 0, pixelsPerUnit = scale): Uint8Array {
  const size = 20 * pixelsPerUnit;
  return new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-10 + offset} ${-12 + offset} 20 20">${fragment}</svg>`,
    { font: { loadSystemFonts: false } },
  ).render().pixels;
}

function alpha(pixels: Uint8Array): Uint8Array {
  return pixels.filter((_, i) => i % 4 === 3);
}

function paintedBounds(pixels: Uint8Array, pixelsPerUnit = scale) {
  const size = Math.sqrt(pixels.length / 4);
  let left = size,
    top = size,
    right = -1,
    bottom = -1,
    count = 0;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      if (pixels[(py * size + px) * 4 + 3] === 0) continue;
      left = Math.min(left, px);
      top = Math.min(top, py);
      right = Math.max(right, px);
      bottom = Math.max(bottom, py);
      count++;
    }
  }
  return {
    left: left / pixelsPerUnit - 10,
    top: top / pixelsPerUnit - 12,
    right: (right + 1) / pixelsPerUnit - 10,
    bottom: (bottom + 1) / pixelsPerUnit - 12,
    count,
  };
}

function opaqueArea(fragment: string, x: number, y: number, w: number, h: number) {
  const pixels = raster(fragment);
  const size = 20 * scale;
  let count = 0;
  for (let py = Math.ceil((y + 12) * scale); py < (y + h + 12) * scale; py++)
    for (let px = Math.ceil((x + 10) * scale); px < (x + w + 10) * scale; px++)
      if (pixels[(py * size + px) * 4 + 3] > 245) count++;
  return count;
}

describe('summer and autumn miniature artwork', () => {
  it.each(ids)('%s keeps all visible variants inside its placement envelope', (id) => {
    // Given the existing envelope and both supported lighting palettes.
    const bounds = ASSET_BOUNDS[id];
    for (const colors of [light, dark])
      for (const variant of [0, 1, 2])
        for (const pixelsPerUnit of [2, 8]) {
          // When the public catalog surface rasterizes the actual artwork.
          const painted = paintedBounds(
            raster(renderCatalogAsset(id, colors, variant), 0, pixelsPerUnit),
            pixelsPerUnit,
          );
          // Then the full painted geometry fits and is nonempty.
          expect(painted.left).toBeGreaterThanOrEqual(bounds.x);
          expect(painted.top).toBeGreaterThanOrEqual(bounds.y);
          expect(painted.right).toBeLessThanOrEqual(bounds.x + bounds.width);
          expect(painted.bottom).toBeLessThanOrEqual(bounds.y + bounds.height);
          expect(painted.count / pixelsPerUnit ** 2).toBeGreaterThan(15 / scale ** 2);
        }
  });

  it.each(ids)(
    '%s retains deterministic geometry when motion, palette, or origin changes',
    (id) => {
      // Given a registered renderer and each of its variants.
      const render = ASSET_RENDERERS[id];
      for (const variant of [0, 1, 2]) {
        const normal = render(0, 0, light, variant);
        // When the same asset is rendered under each context.
        const off = withMotionContext({ mode: 'off', namespace: 'summer-autumn' }, () =>
          renderCatalogAsset(id, light, variant),
        );
        const moved = raster(render(17, 17, light, variant), 17);
        const pixels = raster(normal);
        // Then all static parts and placement stay identical.
        expect(render(0, 0, light, variant)).toBe(normal);
        expect(Buffer.compare(raster(off), pixels)).toBe(0);
        expect(Buffer.compare(moved, pixels)).toBe(0);
        expect(Buffer.compare(alpha(raster(render(0, 0, dark, variant))), alpha(pixels))).toBe(0);
        expect(normal).not.toMatch(/<(?:defs|filter|image|foreignObject|animate)\b/);
        expect(
          (normal.match(/<(?:path|polygon|rect|circle|ellipse|line)\b/g) ?? []).length,
        ).toBeLessThanOrEqual(32);
      }
    },
  );

  it.each(ids)('%s gives every variant a visible silhouette or accessory change', (id) => {
    // Given the three alternatives in one palette.
    const variants = [0, 1, 2].map((v) => alpha(raster(renderCatalogAsset(id, light, v))));
    // When each pair of rendered alpha masks is compared.
    const pairs = [
      [0, 1],
      [1, 2],
      [0, 2],
    ] as const;
    const differences = pairs.map(([a, b]) =>
      variants[a].reduce(
        (sum, value, i) => sum + (Math.abs(value - variants[b][i]) > 100 ? 1 : 0),
        0,
      ),
    );
    // Then color substitution alone cannot satisfy the visual variant contract.
    expect(differences.every((count) => count > 4)).toBe(true);
  });

  it.each(['autumnMaple', 'autumnOak', 'autumnBirch', 'autumnGinkgo'] as const)(
    '%s has solid leaf masses above its branching trunk',
    (id) => {
      // Given every seasonal foliage stage, including partially bare trees.
      for (const variant of [0, 1, 2]) {
        // When the crown band is sampled independently of the lower trunk.
        const area = opaqueArea(renderCatalogAsset(id, light, variant), -4, -8, 8, 5);
        // Then the crown reads as actual volume rather than translucent circles.
        expect(area).toBeGreaterThan(75);
      }
    },
  );

  it('retains a solid woven hammock sling when motion is disabled', () => {
    // Given a static hammock with no pillow masking its central fabric.
    const fragment = withMotionContext({ mode: 'off', namespace: '' }, () =>
      renderCatalogAsset('hammock', light, 0),
    );
    // When its hanging seat is sampled between the support posts.
    const area = opaqueArea(fragment, -1.5, -2, 3, 1.6);
    // Then a broad, opaque fabric surface remains visible.
    expect(area).toBeGreaterThan(80);
  });

  it('gives the lemonade counter a substantial visible side plane', () => {
    // Given the smallest stand variant.
    const fragment = renderCatalogAsset('lemonade', light, 0);
    // When the right-hand side beyond the old flat counter is rasterized.
    const area = opaqueArea(fragment, 1.9, -1, 0.7, 1.2);
    // Then a solid side face establishes the counter depth.
    expect(area).toBeGreaterThan(15);
  });
});
