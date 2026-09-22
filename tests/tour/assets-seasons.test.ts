import { describe, expect, it } from 'vitest';
import { createTourAsset } from '../../src/tour/assets/index.js';
import { TOUR_COLORS } from '../../src/tour/assets/palette.js';

describe('seasonal miniature identity', () => {
  it.each(['pine', 'giantSequoia'])('%s stays evergreen in every summer variant', (id) => {
    // Given the same evergreen species with its three structural variants.
    // When the village is displayed in summer.
    for (const variant of [0, 1, 2]) {
      const { parts } = createTourAsset(id, variant, 'summer').recipe;
      // Then a variant cannot introduce winter snow into the summer landscape.
      expect(parts.some((part) => part.color === TOUR_COLORS.snow)).toBe(false);
    }
  });

  it.each([0, 1, 2])('snow pine variant %i retains several snow-covered branches', (variant) => {
    const { parts } = createTourAsset('snowPine', variant, 'summer').recipe;
    expect(parts.filter((part) => part.color === TOUR_COLORS.snow).length).toBeGreaterThanOrEqual(
      3,
    );
  });

  it('frozen ponds retain an ice surface without live flowers emerging through it', () => {
    const { parts } = createTourAsset('frozenPond', 1, 'winter').recipe;
    expect(parts.some((part) => part.color === TOUR_COLORS.ice)).toBe(true);
    expect(parts.some((part) => part.color === TOUR_COLORS.pink)).toBe(false);
    expect(parts.some((part) => part.color === TOUR_COLORS.leaf)).toBe(false);
  });
});
