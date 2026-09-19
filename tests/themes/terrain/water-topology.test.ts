import { describe, expect, it } from 'vitest';
import { prepareTerrainScene } from '../../../src/themes/terrain/index.js';
import {
  waterfallOutlets,
  riverCurrentPath,
} from '../../../src/themes/terrain/effects/water-topology.js';
import { getTerrainPalette100 } from '../../../src/themes/terrain/palette.js';
import {
  withSurfaceContext,
  setSurfaceMotionLimits,
} from '../../../src/themes/terrain/scene/surface-context.js';
import { withMotionContext } from '../../../src/core/animation.js';
import { renderSurfaceRipples } from '../../../src/themes/terrain/effects/surface-water.js';
import { renderWaterfalls } from '../../../src/themes/terrain/effects/waterfalls.js';
import { calendarFixture, sceneOptions } from './scene/fixtures.js';

const palette = getTerrainPalette100('light');
const scene = prepareTerrainScene(calendarFixture('2025-07-06', 84, 4), sceneOptions);
const cells = scene.cells.map((cell) => ({ ...cell, colors: palette.getElevation(cell.level100) }));
const river = (day: number) =>
  new Map(
    cells.map((cell) => [
      `${cell.week},${cell.day}`,
      { isRiver: cell.day === day, isPond: false, nearWater: false, forestDensity: 0 },
    ]),
  );

describe('river outlet topology', () => {
  it('joins both branches when neighboring streams form an ambiguous confluence', () => {
    const junction = cells.filter(
      (cell) =>
        (cell.week === 2 && [2, 4].includes(cell.day)) ||
        (cell.week === 3 && [1, 3].includes(cell.day)),
    );
    const biomes = new Map(
      junction.map((cell) => [
        `${cell.week},${cell.day}`,
        { isRiver: true, isPond: false, nearWater: true, forestDensity: 0 },
      ]),
    );
    for (const upstream of junction.filter((cell) => cell.week === 2)) {
      expect(riverCurrentPath(upstream, biomes)).toMatch(/(?:Q0,0 |L)8,0(?:M|$)/);
    }
    for (const downstream of junction.filter((cell) => cell.week === 3)) {
      expect(riverCurrentPath(downstream, biomes)).toMatch(/M-8,0[QL]/);
    }
  });

  it.each([
    { day: 2, incoming: 'M0,-3.5', outgoing: '0,3.5' },
    { day: 0, incoming: 'M-8,0', outgoing: '8,0' },
  ])(
    'joins diagonal week bends at the shared vertex for day $day',
    ({ day, incoming, outgoing }) => {
      const first = cells.find((cell) => cell.week === 2 && cell.day === 1);
      const next = cells.find((cell) => cell.week === 3 && cell.day === day);
      if (!first || !next) throw new TypeError('Missing fixture dates');
      const biomes = new Map(
        [first, next].map((cell) => [
          `${cell.week},${cell.day}`,
          { isRiver: true, isPond: false, nearWater: true, forestDensity: 0 },
        ]),
      );
      expect(riverCurrentPath(first, biomes).endsWith(outgoing)).toBe(true);
      expect(riverCurrentPath(next, biomes).startsWith(incoming)).toBe(true);
    },
  );

  it('prioritizes the actual forward mouth over a long coastal river bank', () => {
    const outlets = waterfallOutlets(cells, river(6));
    expect(outlets.map(({ cell, edge }) => [cell.week, cell.day, edge])).toEqual([
      [11, 6, 'right'],
    ]);
    expect(riverCurrentPath(outlets[0].cell, river(6), outlets[0].edge)).toMatch(/4,1.75$/);
  });

  it('retains a mouth at a partial last week without turning internal gaps into waterfalls', () => {
    const partial = cells.filter(
      (cell) =>
        !(cell.week === 11 && cell.day > 2) &&
        cell.week !== 5 &&
        !(cell.week === 8 && cell.day === 5),
    );
    const outlets = waterfallOutlets(partial, river(5));
    expect(outlets.map(({ cell, edge }) => [cell.week, cell.day, edge])).toEqual([
      [10, 5, 'right'],
    ]);
  });

  it('does not mistake a missing coastal observation for an outward bend', () => {
    const missing = cells.filter((cell) => !(cell.week === 5 && cell.day === 6));
    expect(waterfallOutlets(missing, river(6))).toHaveLength(1);
  });

  it('adds a spaced coastal spillway at an observed bend while retaining the main mouth', () => {
    const biomes = river(5);
    for (const week of [2, 3])
      biomes.set(`${week},6`, { isRiver: true, isPond: false, nearWater: true, forestDensity: 0 });
    const outlets = waterfallOutlets(cells, biomes);
    expect(outlets[0].edge).toBe('right');
    expect(
      outlets.some(({ cell, edge }) => cell.week === 3 && cell.day === 6 && edge === 'left'),
    ).toBe(true);
  });

  it('excludes ponds, unrelated natural water, and calendars without observations', () => {
    const ponds = new Map(
      cells.map((cell) => [
        `${cell.week},${cell.day}`,
        { isRiver: false, isPond: true, nearWater: true, forestDensity: 0 },
      ]),
    );
    expect(waterfallOutlets(cells, ponds)).toEqual([]);
    expect(waterfallOutlets(cells.map((cell) => ({ ...cell, level100: 15 })))).toEqual([]);
    expect(waterfallOutlets([], river(5))).toEqual([]);
  });

  it.each([0, 1, 3])(
    'shares a constrained %i-target budget without losing the still waterfall',
    (limit) => {
      const biomes = river(5);
      const output = withSurfaceContext({ artStyle: 'miniature', hemisphere: 'north' }, () =>
        withMotionContext({ mode: 'full', namespace: 'quota' }, () => {
          setSurfaceMotionLimits(limit, 0);
          return (
            renderSurfaceRipples(cells, palette, biomes) +
            renderWaterfalls(waterfallOutlets(cells, biomes), palette)
          );
        }),
      );
      expect(output.match(/class="[^"]*(?:surface-current-|waterfall-flow)/g) ?? []).toHaveLength(
        limit,
      );
      expect(output).toContain('data-waterfall-mist="true"');
    },
  );
});
