import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../src/core/animation.js';
import { ASSET_BOUNDS } from '../../src/themes/terrain/assets/bounds.js';
import { ASSET_RENDERERS } from '../../src/themes/terrain/assets/renderers.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import { svgChicken, svgHorse } from '../../src/themes/terrain/assets/renderers/farm-chicken.js';
import {
  svgDonkey,
  svgGoat,
  svgRicePaddy,
  svgSilo,
} from '../../src/themes/terrain/assets/renderers/farm-donkey.js';
import {
  svgPearTree,
  svgPeachTree,
  svgBeeFarm,
  svgPumpkin,
} from '../../src/themes/terrain/assets/renderers/farm-pear-tree.js';
import {
  svgPigpen,
  svgTrough,
  svgHaystack,
  svgOrchard,
  svgAppleTree,
  svgOliveTree,
  svgLemonTree,
  svgOrangeTree,
} from '../../src/themes/terrain/assets/renderers/farm-pigpen.js';
import { svgSheep, svgCow } from '../../src/themes/terrain/assets/renderers/farm-sheep.js';
import {
  svgWheat,
  svgFence,
  svgScarecrow,
  svgBarn,
} from '../../src/themes/terrain/assets/renderers/farm-wheat.js';

const farm = [
  ['chicken', svgChicken],
  ['horse', svgHorse],
  ['donkey', svgDonkey],
  ['goat', svgGoat],
  ['ricePaddy', svgRicePaddy],
  ['silo', svgSilo],
  ['pearTree', svgPearTree],
  ['peachTree', svgPeachTree],
  ['beeFarm', svgBeeFarm],
  ['pumpkin', svgPumpkin],
  ['pigpen', svgPigpen],
  ['trough', svgTrough],
  ['haystack', svgHaystack],
  ['orchard', svgOrchard],
  ['appleTree', svgAppleTree],
  ['oliveTree', svgOliveTree],
  ['lemonTree', svgLemonTree],
  ['orangeTree', svgOrangeTree],
  ['sheep', svgSheep],
  ['cow', svgCow],
  ['wheat', svgWheat],
  ['fence', svgFence],
  ['scarecrow', svgScarecrow],
  ['barn', svgBarn],
] as const;
const colors = getTerrainPalette100('light').assets;
const scale = 8;
const size = 192;

function raster(fragment: string) {
  return new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-12 -14 24 24">${fragment}</svg>`,
    { font: { loadSystemFonts: false } },
  ).render().pixels;
}

function alpha(pixels: Uint8Array) {
  return pixels.filter((_, index) => index % 4 === 3);
}

function ink(pixels: Uint8Array, x: number, y: number, width: number, height: number): number {
  let count = 0;
  for (let py = Math.ceil((y + 14) * scale); py < (y + height + 14) * scale; py++) {
    for (let px = Math.ceil((x + 12) * scale); px < (x + width + 12) * scale; px++) {
      if (pixels[(py * size + px) * 4 + 3] > 180) count++;
    }
  }
  return count;
}

function connected(pixels: Uint8Array, start: number, target: number): boolean {
  if (pixels[start * 4 + 3] <= 180) return false;
  const queue = [start];
  const seen = new Set(queue);
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const pixel = queue[cursor];
    if (pixel === target) return true;
    for (const neighbor of [pixel - 1, pixel + 1, pixel - size, pixel + size]) {
      if (neighbor < 0 || neighbor >= size * size || seen.has(neighbor)) continue;
      if (pixels[neighbor * 4 + 3] <= 180) continue;
      seen.add(neighbor);
      queue.push(neighbor);
    }
  }
  return false;
}

describe('farm miniature geometry', () => {
  it('connects the raised horse head to its chest with a solid neck', () => {
    const head = 7 * scale * size + 10 * scale;
    const chest = 10 * scale * size + 12 * scale;
    const pixels = raster(svgHorse(0, 0, colors, 2));
    expect(connected(pixels, head, chest)).toBe(true);
  });

  it.each(farm)(
    '%s stays visibly inside its declared bounds in both palettes and every variant',
    (id, render) => {
      // Given an unchanged catalog envelope and the complete renderer variant inputs.
      const bounds = ASSET_BOUNDS[id];
      for (const mode of ['light', 'dark'] as const)
        for (const variant of [0, 1, 2]) {
          // When the real SVG renderer paints at eight pixels per world unit.
          const pixels = raster(render(0, 0, getTerrainPalette100(mode).assets, variant));
          // Then all visible pixels fit the envelope, with a meaningful occupied area.
          let painted = 0;
          let left = size,
            right = 0,
            top = size,
            bottom = 0;
          for (let py = 0; py < size; py++)
            for (let px = 0; px < size; px++) {
              if (pixels[(py * size + px) * 4 + 3] === 0) continue;
              painted++;
              left = Math.min(left, px);
              top = Math.min(top, py);
              right = Math.max(right, px + 1);
              bottom = Math.max(bottom, py + 1);
            }
          expect(painted).toBeGreaterThan(30);
          expect(left / scale - 12).toBeGreaterThanOrEqual(bounds.x);
          expect(top / scale - 14).toBeGreaterThanOrEqual(bounds.y);
          expect(right / scale - 12).toBeLessThanOrEqual(bounds.x + bounds.width);
          expect(bottom / scale - 14).toBeLessThanOrEqual(bounds.y + bounds.height);
        }
    },
  );

  it.each(farm)(
    '%s preserves its deterministic visible form with motion off and a different palette',
    (id, render) => {
      // Given both lighting modes and motion modes.
      for (const variant of [0, 1, 2]) {
        const full = ASSET_RENDERERS[id](0, 0, colors, variant);
        // When motion is disabled and when the same geometry uses dark material tokens.
        const off = withMotionContext({ mode: 'off', namespace: 'farm' }, () =>
          render(0, 0, colors, variant),
        );
        const dark = render(0, 0, getTerrainPalette100('dark').assets, variant);
        // Then placement, silhouettes and static details remain intact.
        expect(off).toBe(full);
        expect(render(0, 0, colors, variant)).toBe(full);
        expect(
          Buffer.from(alpha(raster(dark))).equals(alpha(raster(full))),
          `${id}/${variant} silhouette`,
        ).toBe(true);
        expect(full).not.toMatch(/<(?:defs|filter|image|foreignObject|animate)\b/);
        expect(
          (full.match(/<(?:path|polygon|rect|circle|ellipse|line)\b/g) ?? []).length,
        ).toBeLessThanOrEqual(36);
      }
    },
  );

  it.each([
    ['apple', svgAppleTree],
    ['olive', svgOliveTree],
    ['lemon', svgLemonTree],
    ['orange', svgOrangeTree],
    ['pear', svgPearTree],
    ['peach', svgPeachTree],
  ] as const)('%s crowns connect visibly to the trunk', (_, render) => {
    // Given each fruit-tree silhouette, including mature/harvest variants.
    for (const variant of [0, 1, 2]) {
      // When rasterized, the transition between the old disconnected crown and trunk is visible.
      const pixels = raster(render(0, 0, colors, variant));
      // Then a solid trunk/branch occupies the gap, rather than a floating crown.
      expect(ink(pixels, -0.6, -1.8, 1.2, 0.5)).toBeGreaterThan(5);
    }
  });

  it.each([
    ['horse', svgHorse],
    ['donkey', svgDonkey],
    ['goat', svgGoat],
    ['sheep', svgSheep],
    ['cow', svgCow],
    ['chicken', svgChicken],
    ['wheat', svgWheat],
    ['fence', svgFence],
    ['scarecrow', svgScarecrow],
    ['barn', svgBarn],
  ] as const)('%s variants change the visible silhouette', (_, render) => {
    // Given standing/default and its named alternative pose or construction.
    const normal = alpha(raster(render(0, 0, colors, 0)));
    // When the first alternative is selected.
    const alternative = alpha(raster(render(0, 0, colors, 1)));
    // Then at least half a square world unit changes, beyond a new eye or color patch.
    const changed = normal.reduce(
      (sum, value, index) => sum + (Math.abs(value - alternative[index]) > 100 ? 1 : 0),
      0,
    );
    expect(changed).toBeGreaterThan(32);
  });

  it('keeps harvested wheat short and the resting sheep low', () => {
    // Given the deliberately lower harvest/resting variants.
    const fragments = [svgWheat(0, 0, colors, 2), svgSheep(0, 0, colors, 2)];
    // When their upper silhouettes are sampled.
    const upperInk = fragments.map((fragment) => ink(raster(fragment), -4, -6, 8, 3));
    // Then their recognizable low profiles stay clear of the standing-height band.
    expect(upperInk).toEqual([0, 0]);
  });
});
