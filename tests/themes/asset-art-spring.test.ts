import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../src/core/animation.js';
import { ASSET_BOUNDS } from '../../src/themes/terrain/assets/bounds.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import {
  svgCherryBlossom,
  svgCherryBlossomSmall,
  svgCherryPetals,
  svgTulip,
  svgTulipField,
  svgSprout,
} from '../../src/themes/terrain/assets/renderers/seasonal-spring-cherry-blossom.js';
import {
  svgCherryBlossomFull,
  svgCherryBlossomBranch,
  svgPeachBlossom,
  svgFlowerBed,
  svgWateringCan,
  svgSeedling,
} from '../../src/themes/terrain/assets/renderers/seasonal-spring-cherry-blossom-full.js';
import {
  svgNest,
  svgLamb,
  svgCrocus,
  svgRainPuddle,
  svgBirdhouse,
  svgGardenBed,
} from '../../src/themes/terrain/assets/renderers/seasonal-spring-nest.js';
import {
  svgRobinBird,
  svgButterflyGarden,
  svgUmbrella,
} from '../../src/themes/terrain/assets/renderers/seasonal-spring-robin-bird.js';

const spring = [
  ['cherryBlossom', svgCherryBlossom],
  ['cherryBlossomSmall', svgCherryBlossomSmall],
  ['cherryPetals', svgCherryPetals],
  ['tulip', svgTulip],
  ['tulipField', svgTulipField],
  ['sprout', svgSprout],
  ['cherryBlossomFull', svgCherryBlossomFull],
  ['cherryBlossomBranch', svgCherryBlossomBranch],
  ['peachBlossom', svgPeachBlossom],
  ['flowerBed', svgFlowerBed],
  ['wateringCan', svgWateringCan],
  ['seedling', svgSeedling],
  ['nest', svgNest],
  ['lamb', svgLamb],
  ['crocus', svgCrocus],
  ['rainPuddle', svgRainPuddle],
  ['birdhouse', svgBirdhouse],
  ['gardenBed', svgGardenBed],
  ['robinBird', svgRobinBird],
  ['butterflyGarden', svgButterflyGarden],
  ['umbrella', svgUmbrella],
] as const;
const size = 160;
const scale = 10;
const colors = getTerrainPalette100('light').assets;

function raster(fragment: string, offset = 0): Uint8Array {
  return new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-8 + offset} ${-10 + offset} 16 16">${fragment}</svg>`,
    { font: { loadSystemFonts: false } },
  ).render().pixels;
}

function alpha(pixels: Uint8Array): Uint8Array {
  return pixels.filter((_, i) => i % 4 === 3);
}

function paintedBounds(pixels: Uint8Array) {
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
    left: left / scale - 8,
    top: top / scale - 10,
    right: (right + 1) / scale - 8,
    bottom: (bottom + 1) / scale - 10,
    count,
  };
}

function solidInk(fragment: string, x: number, y: number, width: number, height: number) {
  const pixels = raster(fragment);
  let count = 0;
  for (let py = Math.round((y + 10) * scale); py < (y + height + 10) * scale; py++)
    for (let px = Math.round((x + 8) * scale); px < (x + width + 8) * scale; px++)
      if (pixels[(py * size + px) * 4 + 3] > 245) count++;
  return count;
}

describe('spring miniature artwork', () => {
  it.each(spring)('%s fits its existing envelope for every variant and palette', (id, render) => {
    // Given the unchanged placement envelope.
    const bounds = ASSET_BOUNDS[id];
    for (const mode of ['light', 'dark'] as const)
      for (const variant of [0, 1, 2]) {
        // When the actual SVG is rasterized with transparent surroundings.
        const painted = paintedBounds(
          raster(render(0, 0, getTerrainPalette100(mode).assets, variant)),
        );
        // Then no visible sample leaves the envelope and the object has visible substance.
        expect(painted.left).toBeGreaterThanOrEqual(bounds.x);
        expect(painted.top).toBeGreaterThanOrEqual(bounds.y);
        expect(painted.right).toBeLessThanOrEqual(bounds.x + bounds.width);
        expect(painted.bottom).toBeLessThanOrEqual(bounds.y + bounds.height);
        expect(painted.count).toBeGreaterThan(30);
      }
  });

  it.each(spring)('%s keeps deterministic placement and visible static geometry', (_, render) => {
    // Given every public variant and a nonzero scene anchor.
    for (const variant of [0, 1, 2]) {
      const normal = render(0, 0, colors, variant);
      // When lighting, motion policy, and origin change independently.
      const off = withMotionContext({ mode: 'off', namespace: 'spring-art' }, () =>
        render(0, 0, colors, variant),
      );
      const dark = render(0, 0, getTerrainPalette100('dark').assets, variant);
      const moved = render(23, 23, colors, variant);
      // Then the raster shape is stable and translation moves the entire object together.
      expect(render(0, 0, colors, variant)).toBe(normal);
      const pixels = raster(normal);
      expect(Buffer.compare(raster(off), pixels)).toBe(0);
      expect(Buffer.compare(alpha(raster(dark)), alpha(pixels))).toBe(0);
      expect(Buffer.compare(raster(moved, 23), pixels)).toBe(0);
      expect(normal).not.toMatch(/<(?:defs|filter|image|foreignObject|animate)\b/);
      expect(
        (normal.match(/<(?:path|polygon|rect|circle|ellipse|line)\b/g) ?? []).length,
      ).toBeLessThanOrEqual(32);
    }
  });

  it.each([
    ['cherry', svgCherryBlossom],
    ['small cherry', svgCherryBlossomSmall],
    ['full cherry', svgCherryBlossomFull],
    ['peach', svgPeachBlossom],
  ] as const)(
    '%s has solid blossom volume rather than translucent overlapping circles',
    (_, render) => {
      // Given each bloom stage, including the sparse and weeping forms.
      for (const variant of [0, 1, 2]) {
        // When the canopy band is sampled above the exposed lower trunk.
        const ink = solidInk(render(0, 0, colors, variant), -5, -9, 10, 7);
        // Then enough opaque crown survives at thumbnail scale.
        expect(ink).toBeGreaterThan(75);
      }
    },
  );

  it.each([
    ['tulip', svgTulip],
    ['crocus', svgCrocus],
    ['robin', svgRobinBird],
    ['butterflies', svgButterflyGarden],
    ['garden', svgGardenBed],
    ['lamb', svgLamb],
    ['seedling', svgSeedling],
    ['flower bed', svgFlowerBed],
  ] as const)('%s alternative changes the silhouette, not only its color', (_, render) => {
    // Given the normal pose and its first meaningful alternative.
    const normal = alpha(raster(render(0, 0, colors, 0)));
    // When the alternate pose is rendered in the same palette.
    const alternate = alpha(raster(render(0, 0, colors, 1)));
    // Then a measurable visible area changes.
    const changed = normal.reduce(
      (sum, value, i) => sum + (Math.abs(value - alternate[i]) > 100 ? 1 : 0),
      0,
    );
    expect(changed).toBeGreaterThan(12);
  });

  it('gives the robin a separate pointed tail and a grounded pair of feet', () => {
    // Given the standing robin.
    const bird = svgRobinBird(0, 0, colors, 0);
    // When the silhouette is sampled behind the body and below the breast.
    const features = [solidInk(bird, -1.7, -0.8, 0.7, 0.7), solidInk(bird, -0.7, 0.55, 1.5, 0.6)];
    // Then both recognizable body features have real opaque geometry.
    expect(features.every((count) => count > 8)).toBe(true);
  });
});
