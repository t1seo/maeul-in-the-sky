import { describe, expect, it } from 'vitest';
import {
  getSeasonalPalette100,
  getTerrainPalette100,
} from '../../../src/themes/terrain/palette.js';

describe('winter ground readability', () => {
  it.each(['dark', 'light'] as const)('uses cool snow instead of pink ground in %s', (mode) => {
    const winter = getSeasonalPalette100(mode, 0);
    const base = getTerrainPalette100(mode);
    for (const level of [0, 10, 25, 50, 75, 99]) {
      const color = winter.getElevation(level).top;
      const [r, g, b] = [1, 3, 5].map((offset) =>
        Number.parseInt(color.slice(offset, offset + 2), 16),
      );
      expect(b).toBeGreaterThanOrEqual(r);
      expect(g).toBeGreaterThanOrEqual(r);
      expect(Math.min(r, g, b)).toBeGreaterThan(175);
      expect(winter.getHeight(level)).toBe(base.getHeight(level));
    }
  });
});
