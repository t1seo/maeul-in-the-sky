import { describe, expect, it } from 'vitest';
import {
  getSeasonalPalette100,
  getTerrainPalette100,
} from '../../../src/themes/terrain/palette.js';
import { modes, paletteChecksum, paletteSnapshot } from './snapshot.js';

const originalChecksums = {
  dark: 'e8c27932deca2537676af29569f5e8e18b580e0eca5d648f87692947a33a5966',
  light: 'befe26e6e219ea51baac06ef585fcd4a729c6352b5a0e75c0421a9a9bff138e2',
} as const;

describe('palette compatibility', () => {
  it.each(modes)('preserves every original %s color and height across rotations', (mode) => {
    // Given: original output for integer, fractional, clamped, and rotated inputs.
    // When: every supported elevation and palette field is serialized.
    const actual = paletteChecksum(mode);
    // Then: memoization and module extraction preserve byte-for-byte color output.
    expect(actual).toBe(originalChecksums[mode]);
  });

  it.each(modes)('isolates mutable %s base assets between callers', (mode) => {
    // Given: independently requested base palettes.
    const first = getTerrainPalette100(mode);
    const expected = first.assets.pine;
    const second = getTerrainPalette100(mode);
    // When: a caller customizes its palette.
    first.assets.pine = '#abcdef';
    const actual = second.assets.pine;
    first.assets.pine = expected;
    // Then: another caller retains its original color.
    expect(actual).toBe(expected);
  });

  it.each(modes.flatMap((mode) => [4, 4.5, 8, 8.25, 30].map((week) => ({ mode, week }))))(
    'isolates mutable $mode seasonal fields and returned elevations at week $week',
    ({ mode, week }) => {
      // Given: a seasonal request whose original values are known.
      const first = getSeasonalPalette100(mode, week, 26);
      const expected = paletteSnapshot(first);
      // When: callers mutate nested fields, arrays, methods, and elevation results.
      first.assets.pine = '#abcdef';
      first.text.primary = '#abcdef';
      first.bg.subtle = '#abcdef';
      first.cloud.fill = '#abcdef';
      first.getElevation(50).top = '#abcdef';
      const sampled = first.elevations[0];
      if (sampled) sampled.top = '#abcdef';
      first.elevations.pop();
      first.heights[0] = 999;
      first.getHeight = () => 999;
      // Then: another request has the complete original palette.
      expect(paletteSnapshot(getSeasonalPalette100(mode, week, 26))).toBe(expected);
    },
  );

  it.each(modes)('keeps %s integer cache outputs correct after fractional churn', (mode) => {
    // Given: the exact original request output.
    const expected = paletteSnapshot(getSeasonalPalette100(mode, 8, 0));
    // When: callers request many distinct fractional weeks.
    for (let request = 0; request < 512; request++) {
      getSeasonalPalette100(mode, 5 + request / 1024, 0);
    }
    // Then: the original integer request retains its exact color output.
    expect(paletteSnapshot(getSeasonalPalette100(mode, 8, 0))).toBe(expected);
  });
});
