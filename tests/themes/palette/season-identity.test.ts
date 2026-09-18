import { describe, expect, it } from 'vitest';
import { svgPine } from '../../../src/themes/terrain/assets/renderers/grassland-pine.js';
import { svgPalm } from '../../../src/themes/terrain/assets/renderers/forest-willow.js';
import {
  getSeasonalPalette100,
  getTerrainPalette100,
} from '../../../src/themes/terrain/palette.js';

function channels(hex: string): readonly number[] {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

describe('seasonal material identity', () => {
  it.each([svgPine, svgPalm])('preserves every evergreen crown material in autumn', (render) => {
    for (const mode of ['dark', 'light'] as const) {
      const summer = getSeasonalPalette100(mode, 28).assets;
      const autumn = getSeasonalPalette100(mode, 42).assets;
      for (const variant of [0, 1, 2]) {
        expect(render(0, 0, autumn, variant)).toBe(render(0, 0, summer, variant));
      }
    }
  });
  it.each(['dark', 'light'] as const)(
    'gives Korean %s roofs snow without recoloring timber',
    (mode) => {
      const base = getTerrainPalette100(mode).assets;
      const summer = getSeasonalPalette100(mode, 28).assets;
      const winter = getSeasonalPalette100(mode, 0).assets;
      expect(summer.giwa).toBe(base.anvil);
      expect(summer.thatch).toBe(base.haystack);
      for (const roof of [winter.giwa, winter.thatch]) {
        const [r, g, b] = channels(roof);
        expect(Math.min(r, g, b)).toBeGreaterThan(215);
        expect(b).toBeGreaterThanOrEqual(r);
      }
      expect(winter.trunk).toBe(base.trunk);
    },
  );
  it.each(['dark', 'light'] as const)(
    'preserves authored %s flowers, snow and building materials',
    (mode) => {
      const base = getTerrainPalette100(mode).assets;
      for (const week of [0, 16, 28, 42]) {
        const colors = getSeasonalPalette100(mode, week).assets;
        for (const key of [
          'cherryPetalPink',
          'cherryPetalWhite',
          'mapleRed',
          'ginkgoYellow',
          'snowCap',
          'snowmanCoal',
          'roofA',
          'wall',
          'trunk',
          'cow',
          'smoke',
          'spiderWeb',
        ] as const) {
          expect(colors[key], `${mode}/${week}/${key}`).toBe(base[key]);
        }
      }
    },
  );

  it.each(['dark', 'light'] as const)('makes four %s foliage seasons visibly distinct', (mode) => {
    const leaves = [0, 16, 28, 42].map((week) =>
      channels(getSeasonalPalette100(mode, week).assets.leaf),
    );
    for (const [i, first] of leaves.entries()) {
      for (const second of leaves.slice(i + 1)) {
        const distance = Math.hypot(...first.map((value, index) => value - second[index]));
        expect(distance).toBeGreaterThan(40);
      }
    }
    const [winter, spring, summer, autumn] = leaves;
    expect(spring[1]).toBeGreaterThan(summer[1]);
    expect(autumn[0]).toBeGreaterThan(autumn[1]);
    expect(winter[2]).toBeGreaterThan(summer[2] + 100);
  });

  it('keeps evergreen needles green in autumn and blends at the season boundaries', () => {
    const autumn = getSeasonalPalette100('dark', 42).assets;
    const pine = channels(autumn.pine);
    expect(pine[1]).toBeGreaterThan(pine[0]);
    for (const [transition, peak] of [
      [13, 14],
      [27, 28],
      [40, 41],
      [51, 0],
    ]) {
      expect(getSeasonalPalette100('dark', transition).assets).toEqual(
        getSeasonalPalette100('dark', peak).assets,
      );
    }
    expect(getSeasonalPalette100('dark', 16, 26).assets).toEqual(autumn);
  });
});
