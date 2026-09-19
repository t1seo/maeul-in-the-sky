import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../../src/core/animation.js';
import { renderCelestials, renderClouds } from '../../../src/themes/terrain/effects/sky.js';
import { getTerrainPalette100 } from '../../../src/themes/terrain/palette.js';

const seeds = [0, 1, 42, 99, 442, 1234] as const;

describe('sky clearance for the season timeline', () => {
  it.each(seeds)('leaves the top 24 pixels clear of clouds for seed %i', (seed) => {
    const clouds = withMotionContext({ mode: 'off', namespace: 'header-clearance' }, () =>
      renderClouds(seed, getTerrainPalette100('dark')),
    );
    const { pixels } = new Resvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="240">${clouds}</svg>`,
      { font: { loadSystemFonts: false } },
    ).render();
    let painted = 0;
    for (let index = 3; index < 24 * 840 * 4; index += 4) {
      if (pixels[index] > 0) painted++;
    }
    expect(painted).toBe(0);
  });

  it.each(['dark', 'light'] as const)(
    'keeps the %s celestial silhouette below the date labels',
    (mode) => {
      const palette = getTerrainPalette100(mode);
      const topExtent = mode === 'dark' ? 10.5 : 16.8;
      for (const seed of seeds) {
        const svg = renderCelestials(seed, palette, mode === 'dark');
        const position = /class="sky-(?:moon|sun)" transform="translate\([\d.]+ ([\d.]+)\)"/.exec(
          svg,
        );
        expect(position).not.toBeNull();
        expect(Number(position?.[1]) - topExtent).toBeGreaterThanOrEqual(24);
      }
    },
  );
});
