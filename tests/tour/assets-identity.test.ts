import { describe, expect, it } from 'vitest';
import { createTourAsset } from '../../src/tour/assets/index.js';

const PAIRS = [
  ['frog', 'turtle'],
  ['shellfish', 'turtle'],
  ['silo', 'tower'],
  ['trough', 'boat'],
  ['wateringCan', 'barrel'],
  ['hotDrink', 'barrel'],
  ['rake', 'signpost'],
  ['beachTowel', 'sled'],
  ['surfboard', 'boat'],
  ['watermelon', 'pumpkin'],
  ['acorn', 'stump'],
  ['autumnWreath', 'fallenLeaves'],
  ['birdhouse', 'doghouse'],
  ['houseWinter', 'house'],
  ['whale', 'fish'],
] as const;

describe('ordinary catalog silhouette identity', () => {
  it.each(PAIRS)('%s retains its own construction instead of borrowing %s', (id, comparison) => {
    // Given two catalog entries with different physical construction.
    // When their geometry is compared without names or paint.
    const shapes = [id, comparison].map((catalogId) =>
      JSON.stringify(
        createTourAsset(catalogId, 0, 'summer').recipe.parts.map(
          ({ primitive, position, rotation, size }) => ({ primitive, position, rotation, size }),
        ),
      ),
    );
    // Then an unrelated miniature cannot silently stand in for the requested object.
    expect(shapes[0]).not.toEqual(shapes[1]);
  });
});
