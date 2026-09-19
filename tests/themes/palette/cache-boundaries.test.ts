import { describe, expect, it } from 'vitest';
import {
  getSeasonalPalette100,
  getTerrainPalette100,
} from '../../../src/themes/terrain/palette/cache.js';

describe('palette cache input boundary', () => {
  it.each(['sepia', '', 42, null, undefined])('rejects unsupported color mode %j', (mode) => {
    for (const read of [getTerrainPalette100, getSeasonalPalette100]) {
      expect(() => Reflect.apply(read, undefined, [mode, 12, 0])).toThrowError(
        'Unsupported color mode',
      );
    }
  });

  it('keeps both valid seasonal caches isolated from returned palette edits', () => {
    for (const mode of ['dark', 'light'] as const) {
      const expected = getSeasonalPalette100(mode, 12);
      const edited = getSeasonalPalette100(mode, 12);
      edited.assets.leaf = '#000000';
      edited.elevations[0].top = '#000000';
      expect(getSeasonalPalette100(mode, 12)).toEqual(expected);
    }
  });
});
