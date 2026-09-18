import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../src/core/animation.js';
import { ASSET_BOUNDS } from '../../src/themes/terrain/assets/bounds.js';
import type { AssetType } from '../../src/themes/terrain/assets/types.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import type { AssetColors } from '../../src/themes/terrain/palette.js';
import * as village from '../../src/themes/terrain/assets/renderers/village-tent.js';
import * as shrine from '../../src/themes/terrain/assets/renderers/village-shrine.js';
import * as city from '../../src/themes/terrain/assets/renderers/town-city-market.js';
import { svgManor } from '../../src/themes/terrain/assets/renderers/town-city-manor.js';
import * as props from '../../src/themes/terrain/assets/renderers/cross-level-cart.js';

type Renderer = (x: number, y: number, c: AssetColors, v: number) => string;
const owned = [
  ['tent', village.svgTent],
  ['hut', village.svgHut],
  ['house', village.svgHouse],
  ['houseB', village.svgHouseB],
  ['church', village.svgChurch],
  ['windmill', village.svgWindmill],
  ['well', village.svgWell],
  ['tavern', village.svgTavern],
  ['bakery', village.svgBakery],
  ['stable', village.svgStable],
  ['garden', village.svgGarden],
  ['laundry', village.svgLaundry],
  ['doghouse', village.svgDoghouse],
  ['shrine', shrine.svgShrine],
  ['wagon', shrine.svgWagon],
  ['market', city.svgMarket],
  ['inn', city.svgInn],
  ['blacksmith', city.svgBlacksmith],
  ['castle', city.svgCastle],
  ['tower', city.svgTower],
  ['bridge', city.svgBridge],
  ['cathedral', city.svgCathedral],
  ['library', city.svgLibrary],
  ['clocktower', city.svgClocktower],
  ['statue', city.svgStatue],
  ['park', city.svgPark],
  ['warehouse', city.svgWarehouse],
  ['gatehouse', city.svgGatehouse],
  ['manor', svgManor],
  ['cart', props.svgCart],
  ['barrel', props.svgBarrel],
  ['torch', props.svgTorch],
  ['flag', props.svgFlag],
  ['cobblePath', props.svgCobblePath],
  ['smoke', props.svgSmoke],
  ['signpost', props.svgSignpost],
  ['lantern', props.svgLantern],
  ['woodpile', props.svgWoodpile],
  ['puddle', props.svgPuddle],
  ['campfire', props.svgCampfire],
] as const satisfies readonly (readonly [AssetType, Renderer])[];

function raster(fragment: string, scale = 8) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${32 * scale}" height="${24 * scale}" viewBox="-12 -18 32 24">${fragment}</svg>`;
  return new Resvg(svg, { font: { loadSystemFonts: false } }).render();
}

function mask(fragment: string): number[] {
  const { pixels } = raster(fragment);
  return Array.from({ length: pixels.length / 4 }, (_, index) =>
    pixels[index * 4 + 3] > 127 ? 1 : 0,
  );
}

describe('buildings miniature art', () => {
  it.each(['light', 'dark'] as const)(
    'paints every variant inside its published bounds in %s',
    (mode) => {
      // Given every owned renderer and its existing catalog envelope.
      const colors = getTerrainPalette100(mode).assets;
      for (const [id, render] of owned)
        for (const variant of [0, 1, 2]) {
          const bounds = ASSET_BOUNDS[id];
          // When rendered through the real SVG rasterizer with motion disabled.
          const fragment = withMotionContext({ mode: 'off', namespace: '' }, () =>
            render(0, 0, colors, variant),
          );
          const { pixels, width, height } = raster(fragment);
          let painted = 0;
          let outside = 0;
          for (let row = 0; row < height; row++)
            for (let col = 0; col < width; col++) {
              if (pixels[(row * width + col) * 4 + 3] === 0) continue;
              painted++;
              const x = (col + 0.5) / 8 - 12;
              const y = (row + 0.5) / 8 - 18;
              if (
                x < bounds.x ||
                x > bounds.x + bounds.width ||
                y < bounds.y ||
                y > bounds.y + bounds.height
              )
                outside++;
            }
          // Then visible geometry exists and no antialiased pixel exceeds the envelope.
          expect(painted, `${id}/${variant}`).toBeGreaterThan(20);
          expect(outside, `${id}/${variant}`).toBe(0);
        }
    },
  );

  it.each([0, 1, 2])('gives the cottage its own silhouette for variant %i', (variant) => {
    // Given the two house families under identical palette and placement.
    const colors = getTerrainPalette100('light').assets;
    const house = mask(village.svgHouse(0, 0, colors, variant));
    // When the cottage is rasterized.
    const cottage = mask(village.svgHouseB(0, 0, colors, variant));
    // Then changing the family changes the occupied outline, not only its paint.
    const difference = house.reduce(
      (sum, pixel, index) => sum + Math.abs(pixel - cottage[index]),
      0,
    );
    expect(difference / house.filter(Boolean).length).toBeGreaterThan(0.12);
  });

  it.each(['light', 'dark'] as const)('keeps motion-off forms deterministic in %s', (mode) => {
    // Given all moving renderers in this lane.
    const colors = getTerrainPalette100(mode).assets;
    for (const render of [
      village.svgWindmill,
      village.svgBakery,
      village.svgLaundry,
      city.svgClocktower,
      props.svgSmoke,
      props.svgCampfire,
    ]) {
      const full = withMotionContext({ mode: 'full', namespace: 'buildings' }, () =>
        render(0, 0, colors, 0),
      );
      // When reduced to a motion-off render and then repeated.
      const off = withMotionContext({ mode: 'off', namespace: 'buildings' }, () =>
        render(0, 0, colors, 0),
      );
      const repeated = withMotionContext({ mode: 'off', namespace: 'buildings' }, () =>
        render(0, 0, colors, 0),
      );
      // Then the real raster retains the same initial geometry without active animation.
      expect(off).not.toMatch(/<animate|class="sway/);
      expect(raster(off).pixels.equals(raster(full).pixels)).toBe(true);
      expect(off).toBe(repeated);
    }
  });

  it('preserves coordinate translation and dark/light placement for all variants', () => {
    // Given integer offsets to avoid subpixel sampling differences.
    const colors = getTerrainPalette100('light').assets;
    const dark = getTerrainPalette100('dark').assets;
    for (const [id, render] of owned)
      for (const variant of [0, 1, 2]) {
        const atOrigin = render(0, 0, colors, variant);
        expect(render(0, 0, colors, variant), id).toBe(atOrigin);
        // When a translated fragment is brought back to its local anchor.
        const translated = `<g transform="translate(-2,-1)">${render(2, 1, colors, variant)}</g>`;
        // Then placement is exact and independent of the lighting palette.
        expect(raster(translated).pixels.equals(raster(atOrigin).pixels), id).toBe(true);
        expect(render(0, 0, dark, variant).replace(/(?:fill|stroke)="[^"]*"/g, ''), id).toBe(
          atOrigin.replace(/(?:fill|stroke)="[^"]*"/g, ''),
        );
      }
  });

  it.each([
    ['hut', village.svgHut],
    ['house', village.svgHouse],
    ['houseB', village.svgHouseB],
    ['church', village.svgChurch],
    ['market', city.svgMarket],
    ['inn', city.svgInn],
    ['torch', props.svgTorch],
    ['flag', props.svgFlag],
    ['cobblePath', props.svgCobblePath],
  ] as const)(
    'keeps the three %s variants visibly distinct with matching paints',
    (_id, render) => {
      // Given matching roof and flag paints so recoloring cannot satisfy the test.
      const base = getTerrainPalette100('light').assets;
      const colors = {
        ...base,
        roofA: base.roofB,
        pine: base.roofB,
        water: base.roofB,
        flag: base.roofB,
      };
      // When each meaningful variant is rendered through Resvg.
      const images = [0, 1, 2].map((variant) => raster(render(0, 0, colors, variant)).pixels);
      // Then every pair differs in its rendered geometry or accessories.
      for (let first = 0; first < images.length; first++)
        for (let second = first + 1; second < images.length; second++)
          expect(images[first].equals(images[second])).toBe(false);
    },
  );

  it('preserves openings in the gatehouse arch and the open market stall', () => {
    // Given front-facing openings that should show the terrain through the object.
    const colors = getTerrainPalette100('light').assets;
    const openings = [
      { fragment: city.svgGatehouse(0, 0, colors, 0), x: 0.2, y: -1 },
      { fragment: city.svgMarket(0, 0, colors, 2), x: 2.8, y: -2.3 },
      { fragment: city.svgMarket(0, 0, colors, 0), x: 2.8, y: -2.3 },
    ];
    // When the actual alpha channel is sampled within each opening.
    const alpha = openings.map(({ fragment, x, y }) => {
      const { pixels, width } = raster(fragment);
      return pixels[(Math.floor((y + 18) * 8) * width + Math.floor((x + 12) * 8)) * 4 + 3];
    });
    // Then the openings are real negative space, not dark painted rectangles.
    expect(alpha).toEqual([0, 0, 255]);
  });
});
