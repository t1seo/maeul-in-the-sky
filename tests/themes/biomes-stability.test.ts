import { describe, expect, it } from 'vitest';
import { generateBiomeMap } from '../../src/themes/terrain/biomes.js';

describe('absolute-week biomes', () => {
  it('preserves interior context when the supplied calendar window shifts', () => {
    // Given a calendar window and its shifted overlap.
    const original = generateBiomeMap(54, 7, 12345, 2800);
    // When generating the shifted window from absolute weeks.
    const shifted = generateBiomeMap(53, 7, 12345, 2801);
    // Then spatial context including forest and water halos is unchanged.
    for (let week = 2; week < 51; week++) {
      for (let day = 0; day < 7; day++) {
        expect(shifted.get(`${week - 1},${day}`)).toEqual(original.get(`${week},${day}`));
      }
    }
  });
});
