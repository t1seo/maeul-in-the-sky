import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../src/core/animation.js';
import { ASSET_BOUNDS } from '../../src/themes/terrain/assets/bounds.js';
import * as blend from '../../src/themes/terrain/assets/renderers/biome-blend-reeds.js';
import * as shore from '../../src/themes/terrain/assets/renderers/shore-wetland-rock.js';
import * as marine from '../../src/themes/terrain/assets/renderers/water-whale.js';
import * as coast from '../../src/themes/terrain/assets/renderers/water-turtle.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';

const renderers = {
  reeds: blend.svgReeds,
  fountain: blend.svgFountain,
  canal: blend.svgCanal,
  watermill: blend.svgWatermill,
  gardenTree: blend.svgGardenTree,
  pondLily: blend.svgPondLily,
  rock: shore.svgRock,
  boulder: shore.svgBoulder,
  flower: shore.svgFlower,
  bush: shore.svgBush,
  driftwood: shore.svgDriftwood,
  sandcastle: shore.svgSandcastle,
  tidePools: shore.svgTidePools,
  heron: shore.svgHeron,
  shellfish: shore.svgShellfish,
  cattail: shore.svgCattail,
  frog: shore.svgFrog,
  lily: shore.svgLily,
  whale: marine.svgWhale,
  fish: marine.svgFish,
  fishSchool: marine.svgFishSchool,
  boat: marine.svgBoat,
  seagull: marine.svgSeagull,
  dock: marine.svgDock,
  waves: marine.svgWaves,
  kelp: marine.svgKelp,
  coral: marine.svgCoral,
  jellyfish: marine.svgJellyfish,
  turtle: coast.svgTurtle,
  buoy: coast.svgBuoy,
  sailboat: coast.svgSailboat,
  lighthouse: coast.svgLighthouse,
  crab: coast.svgCrab,
} as const;
const colors = getTerrainPalette100('light').assets;
const variants = [
  'gardenTree',
  'rock',
  'flower',
  'bush',
  'whale',
  'fish',
  'boat',
  'seagull',
] as const;
const moving = [
  'fountain',
  'watermill',
  'cattail',
  'seagull',
  'waves',
  'jellyfish',
  'turtle',
] as const;
const size = 192;
const scale = 6;

function raster(fragment: string): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-16 -16 32 32">${fragment}</svg>`;
  return new Resvg(svg, { font: { loadSystemFonts: false } }).render().pixels;
}

function silhouette(pixels: Buffer): Buffer {
  return Buffer.from(
    pixels.filter((_, index) => index % 4 === 3).map((alpha) => (alpha > 127 ? 1 : 0)),
  );
}

function visibleBounds(pixels: Buffer) {
  let left = size,
    top = size,
    right = -1,
    bottom = -1;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      if (pixels[(py * size + px) * 4 + 3] > 0) {
        left = Math.min(left, px);
        right = Math.max(right, px);
        top = Math.min(top, py);
        bottom = Math.max(bottom, py);
      }
    }
  }
  return {
    left: left / scale - 16,
    top: top / scale - 16,
    right: (right + 1) / scale - 16,
    bottom: (bottom + 1) / scale - 16,
  };
}

describe('water miniature art', () => {
  it.each(['light', 'dark'] as const)(
    'paints every form inside its catalog bounds in %s',
    (mode) => {
      // Given: each owned renderer, its published bounds, and the requested palette.
      const palette = getTerrainPalette100(mode).assets;
      for (const [id, render] of Object.entries(renderers)) {
        const entry = Object.entries(ASSET_BOUNDS).find(([key]) => key === id);
        expect(entry).toBeDefined();
        if (!entry) continue;
        for (const variant of [0, 1, 2]) {
          // When: the real renderer is rasterized with animation disabled.
          const svg = withMotionContext({ mode: 'off', namespace: '' }, () =>
            render(0, 0, palette, variant),
          );
          const painted = visibleBounds(raster(svg));
          const bounds = entry[1];
          // Then: nonempty visible pixels are contained without clipping or padding changes.
          expect(painted.right, `${id}/${variant}`).toBeGreaterThan(painted.left);
          expect(painted.bottom, `${id}/${variant}`).toBeGreaterThan(painted.top);
          expect(painted.left, `${id}/${variant}`).toBeGreaterThanOrEqual(bounds.x);
          expect(painted.top, `${id}/${variant}`).toBeGreaterThanOrEqual(bounds.y);
          expect(painted.right, `${id}/${variant}`).toBeLessThanOrEqual(bounds.x + bounds.width);
          expect(painted.bottom, `${id}/${variant}`).toBeLessThanOrEqual(bounds.y + bounds.height);
        }
      }
    },
  );

  it.each(variants)('gives %s variants different physical silhouettes', (id) => {
    // Given: the three established forms of this asset.
    const render = renderers[id];
    // When: only alpha coverage is retained, removing all color differences.
    const masks = [0, 1, 2].map((variant) => silhouette(raster(render(0, 0, colors, variant))));
    // Then: every variant has a distinct silhouette rather than a recolor.
    expect(new Set(masks.map((mask) => mask.toString('base64'))).size).toBe(3);
  });

  it.each(moving)('retains the complete resting %s when motion is off', (id) => {
    // Given: identical palette, variant and anchor in each motion context.
    const render = renderers[id];
    for (const variant of [0, 1, 2]) {
      // When: both supported contexts are rendered using the actual motion helper.
      const full = withMotionContext({ mode: 'full', namespace: 'water-test' }, () =>
        render(0, 0, colors, variant),
      );
      const off = withMotionContext({ mode: 'off', namespace: 'water-test' }, () =>
        render(0, 0, colors, variant),
      );
      // Then: static pixels survive unchanged and disabled output contains no animation hook.
      expect(raster(off).equals(raster(full))).toBe(true);
      expect(off).not.toMatch(/<animate|sway-gentle/);
      if (id !== 'seagull' || variant !== 1) expect(full).toMatch(/<animate|sway-gentle/);
    }
  });

  it('keeps every anchor, variant and palette deterministic', () => {
    // Given: all owned renderers and a second palette.
    const dark = getTerrainPalette100('dark').assets;
    for (const render of Object.values(renderers)) {
      for (const variant of [0, 1, 2]) {
        // When: repeated and relocated renderings are drawn in the same coordinate system.
        const original = render(0, 0, colors, variant);
        const relocated = `<g transform="translate(-11,7)">${render(11, -7, colors, variant)}</g>`;
        // Then: placement is stable and lighting never changes the physical shape.
        expect(render(0, 0, colors, variant)).toBe(original);
        expect(raster(original).equals(raster(relocated))).toBe(true);
        expect(
          silhouette(raster(original)).equals(silhouette(raster(render(0, 0, dark, variant)))),
        ).toBe(true);
        expect(original).not.toMatch(/<filter|<defs|<image|<foreignObject|url\(/);
      }
    }
  });

  it('gives the resting turtle flippers beyond its domed shell', () => {
    // Given: a turtle with motion disabled.
    const svg = withMotionContext({ mode: 'off', namespace: '' }, () =>
      coast.svgTurtle(0, 0, colors, 0),
    );
    // When: its visible physical outline is measured.
    const bounds = visibleBounds(raster(svg));
    // Then: flippers project above and below the body instead of a floating oval.
    expect(bounds.top).toBeLessThan(-2.5);
    expect(bounds.bottom).toBeGreaterThan(0.7);
  });

  it('contains moving marine silhouettes at their travel extremes', () => {
    // Given: translation extrema and the two-degree shared cattail sway.
    const poses = [
      ['turtle', 'translate(3,0)'],
      ['jellyfish', 'translate(0,-.7)'],
      ['seagull', 'translate(-3,-2)'],
      ['seagull', 'translate(3,2)'],
      ['cattail', 'rotate(-2)'],
      ['cattail', 'rotate(2)'],
    ] as const;
    for (const [id, transform] of poses) {
      for (const variant of id === 'seagull' ? [0, 2] : [0]) {
        // When: the complete resting geometry is rasterized at the motion extreme.
        const fragment = withMotionContext({ mode: 'off', namespace: '' }, () =>
          renderers[id](0, 0, colors, variant),
        );
        const painted = visibleBounds(raster(`<g transform="${transform}">${fragment}</g>`));
        const bounds = ASSET_BOUNDS[id];
        // Then: motion remains within the existing published allowance.
        expect(painted.left, id).toBeGreaterThanOrEqual(bounds.x);
        expect(painted.top, id).toBeGreaterThanOrEqual(bounds.y);
        expect(painted.right, id).toBeLessThanOrEqual(bounds.x + bounds.width);
        expect(painted.bottom, id).toBeLessThanOrEqual(bounds.y + bounds.height);
      }
    }
  });
});
