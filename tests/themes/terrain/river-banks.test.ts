import { describe, expect, it } from 'vitest';
import { renderSurfaceWater } from '../../../src/themes/terrain/effects/surface-water.js';
import { renderRiverBanks, riverArtwork } from '../../../src/themes/terrain/effects/river-art.js';
import { getTerrainPalette100 } from '../../../src/themes/terrain/palette.js';
import type { IsoCell } from '../../../src/themes/terrain/blocks.js';
import type { BiomeContext } from '../../../src/themes/terrain/biomes.js';

const palette = getTerrainPalette100('light');
const cell = (week: number, day: number, level100 = 40): IsoCell => ({
  week,
  day,
  level100,
  date: `2025-07-${String(week * 7 + day + 1).padStart(2, '0')}`,
  isoX: (week - day) * 8,
  isoY: (week + day) * 3.5,
  height: 10,
  colors: palette.getElevation(level100),
});
const river: BiomeContext = {
  isRiver: true,
  isPond: false,
  nearWater: true,
  forestDensity: 0,
};

describe('natural river banks', () => {
  it('adds banks only at observed dry neighbors, leaving the river and its outlet open', () => {
    const cells = [cell(1, 2), cell(2, 2), cell(1, 1), cell(1, 3), cell(2, 1, 15)];
    const biomes = new Map([
      ['1,2', river],
      ['2,2', river],
    ]);
    const output = renderSurfaceWater(cells, palette, biomes);
    expect(output.match(/data-river-bank=/g)).toHaveLength(2);
  });

  it('does not turn missing observations, ponds or frozen water into dry banks', () => {
    const cells = [cell(1, 2), cell(1, 1), { ...cell(1, 3, 15), date: '2025-01-01' }];
    const biomes = new Map([
      ['1,2', river],
      ['1,1', { ...river, isRiver: false, isPond: true }],
    ]);
    expect(renderSurfaceWater(cells, palette, biomes)).not.toContain('data-river-bank=');
  });

  it('gives diagonal river contacts a visible throat without drawing across missing dates', () => {
    const cells = Array.from({ length: 28 }, (_, index) => cell(Math.floor(index / 7), index % 7));
    const biomes = new Map(['0,1', '1,2', '2,1', '3,2'].map((key) => [key, river]));
    const output = renderSurfaceWater(cells, palette, biomes);
    const links = output.match(/data-river-links="true" d="([^"]+)"/);
    expect(links).not.toBeNull();
    expect(links?.[1].match(/M/g)).toHaveLength(3);
    const missing = renderSurfaceWater([cell(0, 1), cell(2, 1)], palette, biomes);
    expect(missing).not.toContain('data-river-links=');
  });

  it('does not widen diagonal contacts over missing ground or frozen river cells', () => {
    const cells = [cell(0, 1), cell(1, 2), cell(0, 2), cell(1, 1)];
    const biomes = new Map(['0,1', '1,2'].map((key) => [key, river]));
    const frozen = cells.map((value) => ({ ...value, level100: 15, date: '2025-01-01' }));
    expect(renderSurfaceWater(cells.slice(0, 3), palette, biomes)).not.toContain(
      'data-river-links=',
    );
    expect(renderSurfaceWater(frozen, palette, biomes)).not.toContain('data-river-links=');
  });

  it('keeps neighboring ice intact when unfrozen rivers meet at its corner', () => {
    const cells = [cell(0, 1), cell(1, 2), cell(0, 2, 15), cell(1, 1, 15)];
    const biomes = new Map(['0,1', '1,2'].map((key) => [key, river]));
    const winter = cells.map((value) => ({ ...value, date: value.date?.replace('-07-', '-01-') }));
    expect(renderSurfaceWater(winter, palette, biomes)).not.toContain('data-river-links=');
    expect(renderSurfaceWater(cells, palette, biomes)).toContain('data-river-links=');
  });

  it('keeps all bank control points inside the tile and away from diagonal river contacts', () => {
    const center = cell(1, 2);
    const surrounding = [cell(0, 2), cell(2, 2), cell(1, 1), cell(1, 3)];
    const observed = new Map(surrounding.map((value) => [`${value.week},${value.day}`, value]));
    for (let day = 1; day <= 28; day++) {
      const output = renderRiverBanks(
        { ...center, date: `2025-07-${String(day).padStart(2, '0')}` },
        observed,
        new Map(),
      );
      const paths = [...output.matchAll(/ d="([^"]+)"/g)];
      expect(paths).toHaveLength(4);
      for (const [, path] of paths) {
        for (const [, xText, yText] of path.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)) {
          const x = Number(xText);
          const y = Number(yText);
          expect(Math.abs(x) / 8 + Math.abs(y) / 3.5).toBeLessThanOrEqual(1.002);
          for (const [vx, vy] of [
            [-8, 0],
            [8, 0],
            [0, -3.5],
            [0, 3.5],
          ]) {
            expect(Math.hypot(x - vx, y - vy)).toBeGreaterThan(0.6);
          }
        }
      }
    }
  });

  it('varies ripples by date and retains them when a rolling calendar moves the same date', () => {
    const original = cell(1, 2);
    expect(riverArtwork(original)).toEqual(riverArtwork({ ...original, week: 19 }));
    const variants = new Set(
      Array.from(
        { length: 28 },
        (_, index) =>
          riverArtwork({ ...original, date: `2025-07-${String(index + 1).padStart(2, '0')}` })
            .ripples,
      ),
    );
    expect(variants.size).toBeGreaterThanOrEqual(4);
  });
});
