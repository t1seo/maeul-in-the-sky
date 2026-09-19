import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../../src/core/animation.js';
import { renderBlock } from '../../../src/themes/terrain/scene/block-shape.js';
import { getTerrainPalette100 } from '../../../src/themes/terrain/palette.js';
import {
  currentSurfaceContext,
  withSurfaceContext,
} from '../../../src/themes/terrain/scene/surface-context.js';
import { renderSurfaceRipples } from '../../../src/themes/terrain/effects/surface-water.js';
import { renderSurfaceMotionCSS } from '../../../src/themes/terrain/effects/surface-motion.js';
import { renderWaterfalls } from '../../../src/themes/terrain/effects/waterfalls.js';
import { waterfallOutlets } from '../../../src/themes/terrain/effects/water-topology.js';
import { renderSeasonalWeather } from '../../../src/themes/terrain/effects/seasonal-weather.js';
import type { IsoCell } from '../../../src/themes/terrain/blocks.js';

const palette = getTerrainPalette100('light');
const miniature = { artStyle: 'miniature', hemisphere: 'north' } as const;
const cell = (level100: number, index: number, month = '07'): IsoCell => ({
  week: index,
  day: 0,
  date: `2025-${month}-${String((index % 28) + 1).padStart(2, '0')}`,
  level100,
  height: palette.getHeight(level100),
  isoX: index * 8,
  isoY: index * 3.5,
  colors: palette.getElevation(level100),
});

describe('miniature surface details and limits', () => {
  it.each([
    { level: 0, material: 'soil' },
    { level: 30, material: 'grass' },
    { level: 90, material: 'stone' },
    { level: 15, material: 'ice' },
  ])('keeps $material strokes inside top faces', ({ level, material }) => {
    // Given: a full month of one material, including frozen water without a liquid flag.
    const cells = Array.from({ length: 28 }, (_, index) => cell(level, index));
    // When: miniature blocks are rendered.
    const output = withSurfaceContext(miniature, () =>
      cells.map((value) => renderBlock(value)).join(''),
    );
    // Then: one compact material path replaces neither source color nor geometry.
    expect(output).toContain(`data-surface="${material}"`);
    expect(output).toContain(`fill="${palette.getElevation(level).top}"`);
    expect(output).not.toMatch(/<filter|<pattern|<image/);
  });

  it.each([
    { mode: 'full', limit: 15 },
    { mode: 'subtle', limit: 4 },
    { mode: 'off', limit: 0 },
  ] as const)('shares the $mode water limit across natural water and rivers', ({ mode, limit }) => {
    // Given: many natural-water and elevated river cells.
    const cells = Array.from({ length: 32 }, (_, index) => cell(index % 2 ? 15 : 50, index));
    const biomes = new Map(
      cells.map((value) => [
        `${value.week},${value.day}`,
        { isRiver: true, isPond: false, nearWater: true, forestDensity: 0 },
      ]),
    );
    // When: motion policy controls both the CSS and its real current paths.
    const output = withSurfaceContext(miniature, () =>
      withMotionContext(
        { mode, namespace: 'surface:test' },
        () =>
          renderSurfaceMotionCSS(cells, biomes) +
          renderSurfaceRipples(cells, palette, biomes) +
          renderWaterfalls(waterfallOutlets(cells, biomes), palette),
      ),
    );
    // Then: only the bounded set of small paths receives movement.
    expect(output.match(/class="[^"]*(?:surface-current-|waterfall-flow)/g) ?? []).toHaveLength(
      limit,
    );
    expect(output.match(/data-water-current=/g)).toHaveLength(32);
    expect(output).not.toMatch(/<polygon/);
    if (mode === 'off') expect(output).not.toMatch(/@keyframes|animation:/);
  });

  it('retains still ice while the opposite hemisphere has liquid currents', () => {
    // Given: January natural water has season-dependent ice shading.
    const cells = [cell(15, 1, '01')];
    // When: each hemisphere renders the same dated surface.
    const outputs = (['north', 'south'] as const).map((hemisphere) =>
      withSurfaceContext({ ...miniature, hemisphere }, () =>
        renderSurfaceRipples(cells, palette, new Map()),
      ),
    );
    // Then: highlights never move over a frozen top face.
    expect(outputs[0]).toBe('');
    expect(outputs[1]).toContain('data-water-current="true"');
  });

  it('restores a caller context after nested styles and a failed render', () => {
    // Given: a northern surface render can nest a different style.
    const before = currentSurfaceContext();
    // When: a pixel child throws and a southern child finishes.
    withSurfaceContext(miniature, () => {
      expect(() =>
        withSurfaceContext({ ...miniature, artStyle: 'pixel' }, () => {
          throw new TypeError('fixture');
        }),
      ).toThrow(TypeError);
      withSurfaceContext({ ...miniature, hemisphere: 'south' }, () => '');
      // Then: both scopes restore their caller without leaking seasonal caches.
      expect(currentSurfaceContext()?.hemisphere).toBe('north');
      return '';
    });
    expect(currentSurfaceContext()).toBe(before);
  });

  it('omits weather when there are no dated observations', () => {
    // Given: no dates are supplied, rather than an invented seasonal observation.
    // When: the weather helper renders the empty calendar.
    const output = withSurfaceContext(miniature, () => renderSeasonalWeather([], 42, palette));
    // Then: no weather geometry is attributed to that calendar.
    expect(output).toBe('');
  });
});
