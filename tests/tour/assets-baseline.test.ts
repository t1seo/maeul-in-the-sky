import { describe, expect, it } from 'vitest';
import { createModelRecipe } from '../../src/world/model/recipes/index.js';
import { createTourAsset } from '../../src/tour/assets/index.js';
import { roofProfile } from '../../src/world/three/geometry/roof.js';

describe('Korean miniature foundations', () => {
  it('keeps giwa roof curvature when the Korean stone wall enters the tour', () => {
    const asset = createTourAsset('stoneWall', 0, 'spring');
    expect(roofProfile(asset.recipe.key)).toBe('giwa');
  });
  it('retains swept tiled roofing and framed windows when a hanok is built', () => {
    // Given the existing canonical hanok.
    // When its recipe is requested.
    const recipe = createModelRecipe('hanok', 0);
    // Then its close-view architectural features remain available for the tour.
    expect(recipe.parts.filter((part) => part.primitive === 'roof')).toHaveLength(1);
    expect(recipe.parts.filter((part) => part.color === '#e3b564').length).toBeGreaterThan(3);
    expect(recipe.parts.some((part) => part.color === '#e9dcc0')).toBe(true);
  });

  it('keeps an open raised pavilion when the existing recipe is requested', () => {
    // Given the canonical four-column pavilion.
    // When its structural parts are inspected.
    const recipe = createModelRecipe('pavilion', 0);
    // Then columns and curved eaves survive without a solid room filling the interior.
    expect(recipe.parts.filter((part) => part.color === '#b96750')).toHaveLength(4);
    expect(recipe.parts.filter((part) => part.primitive === 'roof')).toHaveLength(1);
    expect(recipe.parts.some((part) => part.color === '#e9dcc0')).toBe(false);
  });
});
