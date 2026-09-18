import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../src/core/animation.js';
import { ASSET_BOUNDS } from '../../src/themes/terrain/assets/bounds.js';
import type { AssetType } from '../../src/themes/terrain/assets/types.js';
import * as woodland from '../../src/themes/terrain/assets/renderers/grassland-pine.js';
import * as meadow from '../../src/themes/terrain/assets/renderers/grassland-rabbit.js';
import * as forest from '../../src/themes/terrain/assets/renderers/forest-willow.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import type { AssetColors } from '../../src/themes/terrain/palette.js';

type Renderer = (x: number, y: number, colors: AssetColors, variant: number) => string;
const NATURE = [
  ['pine', woodland.svgPine],
  ['deciduous', woodland.svgDeciduous],
  ['mushroom', woodland.svgMushroom],
  ['stump', woodland.svgStump],
  ['deer', woodland.svgDeer],
  ['rabbit', meadow.svgRabbit],
  ['fox', meadow.svgFox],
  ['butterfly', meadow.svgButterfly],
  ['beehive', meadow.svgBeehive],
  ['wildflowerPatch', meadow.svgWildflowerPatch],
  ['tallGrass', meadow.svgTallGrass],
  ['birch', meadow.svgBirch],
  ['haybale', meadow.svgHaybale],
  ['willow', forest.svgWillow],
  ['palm', forest.svgPalm],
  ['bird', forest.svgBird],
  ['owl', forest.svgOwl],
  ['squirrel', forest.svgSquirrel],
  ['moss', forest.svgMoss],
  ['fern', forest.svgFern],
  ['deadTree', forest.svgDeadTree],
  ['log', forest.svgLog],
  ['berryBush', forest.svgBerryBush],
  ['spider', forest.svgSpider],
] as const satisfies readonly (readonly [AssetType, Renderer])[];
const POSES = [
  'pine',
  'deciduous',
  'mushroom',
  'stump',
  'deer',
  'rabbit',
  'fox',
  'birch',
  'willow',
  'palm',
  'bird',
] as const;
const colors = getTerrainPalette100('light').assets;
const SIZE = 192;
const SCALE = 8;

function raster(fragment: string): Uint8Array {
  return new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="-12 -18 24 24">${fragment}</svg>`,
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
  for (let y = Math.ceil((top + 18) * SCALE); y < (bottom + 18) * SCALE; y++) {
    for (let x = Math.ceil((left + 12) * SCALE); x < (right + 12) * SCALE; x++) {
      coverage += pixels[(y * SIZE + x) * 4 + 3] / 255;
    }
  }
  return coverage / SCALE ** 2;
}

describe('nature miniature geometry', () => {
  it.each(['light', 'dark'] as const)(
    'keeps every visible variant inside its existing bounds in %s',
    (mode) => {
      const palette = getTerrainPalette100(mode).assets;
      for (const [id, render] of NATURE) {
        for (const variant of [0, 1, 2]) {
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
          expect(visible, `${id}/${variant}`).toBeGreaterThan(15);
          const label = `${id}/${variant}/${mode}`;
          expect(left / SCALE - 12, label).toBeGreaterThanOrEqual(bounds.x);
          expect(right / SCALE - 12, label).toBeLessThanOrEqual(bounds.x + bounds.width);
          expect(top / SCALE - 18, label).toBeGreaterThanOrEqual(bounds.y);
          expect(bottom / SCALE - 18, label).toBeLessThanOrEqual(bounds.y + bounds.height);
        }
      }
    },
  );

  it.each(NATURE)('renders %s deterministically at a translated anchor', (_id, render) => {
    for (const variant of [0, 1, 2]) {
      const first = render(2, -1, colors, variant);
      expect(render(2, -1, colors, variant)).toBe(first);
      expect(
        Buffer.from(raster(`<g transform="translate(-2,1)">${first}</g>`)).equals(
          raster(render(0, 0, colors, variant)),
        ),
      ).toBe(true);
      expect(first).not.toMatch(/<defs|<filter|<foreignObject|href=|url\(/);
    }
  });

  it.each(POSES)('keeps visibly distinct %s variants', (id) => {
    const entry = NATURE.find(([candidate]) => candidate === id);
    if (!entry) throw new TypeError(`Missing nature renderer: ${id}`);
    const images = [0, 1, 2].map((variant) =>
      Buffer.from(raster(entry[1](0, 0, colors, variant))).toString('base64'),
    );
    expect(images[0]).not.toEqual(images[1]);
    expect(images[1]).not.toEqual(images[2]);
    expect(images[0]).not.toEqual(images[2]);
  });

  it.each([
    ['fox tail', meadow.svgFox, 0, 1.8, -3, 4, -0.3, 1.2],
    ['squirrel tail', forest.svgSquirrel, 0, 0.8, -3.5, 2.6, -0.5, 1.3],
    ['willow curtain', forest.svgWillow, 0, -3.4, -4, -1.8, -1, 1.1],
    ['second rabbit ears', meadow.svgRabbit, 2, 0.9, -3, 2.4, -1.8, 0.18],
  ] as const)(
    'gives the %s a readable filled silhouette',
    (_name, render, variant, left, top, right, bottom, minimum) => {
      const pixels = raster(render(0, 0, colors, variant));
      expect(area(pixels, left, top, right, bottom)).toBeGreaterThan(minimum);
    },
  );

  it.each([woodland.svgPine, woodland.svgDeciduous, meadow.svgBirch])(
    'lights tree crowns with visible upper-left material',
    (render) => {
      const pixels = raster(render(0, 0, colors, 0));
      const hex = colors.leafLight.slice(1);
      const rgb = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
      let count = 0;
      let sumX = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        if (
          rgb.every((channel, offset) => pixels[index + offset] === channel) &&
          pixels[index + 3] === 255
        ) {
          count++;
          sumX += ((index / 4) % SIZE) / SCALE - 12;
        }
      }
      expect(count).toBeGreaterThan(16);
      expect(sumX / count).toBeLessThan(0);
    },
  );

  it.each([
    ['butterfly', meadow.svgButterfly, 0],
    ['tallGrass', meadow.svgTallGrass, 0],
    ['bird', forest.svgBird, 0],
    ['bird pair', forest.svgBird, 2],
  ] as const)('retains all visible %s geometry with motion off', (_id, render, variant) => {
    const full = withMotionContext({ mode: 'full', namespace: 'nature' }, () =>
      render(0, 0, colors, variant),
    );
    const off = withMotionContext({ mode: 'off', namespace: 'nature' }, () =>
      render(0, 0, colors, variant),
    );
    expect(full).toMatch(/animateTransform|sway-gentle/);
    expect(off).not.toMatch(/animateTransform|sway-gentle/);
    expect(Buffer.from(raster(off)).equals(raster(full))).toBe(true);
    expect(area(raster(off), -10, -15, 10, 4)).toBeGreaterThan(1);
  });
});
