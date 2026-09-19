import { describe, expect, it } from 'vitest';
import { createModelRecipe } from '../../../../src/world/model/recipes/index.js';
import { FAMILIES, RECIPE_CASES, VARIANTS } from './families.js';

describe('frozen miniature recipe contract', () => {
  it.each(RECIPE_CASES)(
    '$family:$variant has bounded real geometry when requested',
    ({ family, variant }) => {
      // Given a supported family and one of its three variants.
      // When the renderer-neutral recipe is prepared.
      const recipe = createModelRecipe(family, variant);
      // Then its identity is portable and its geometry budget is bounded.
      expect(recipe.key).toBe(`${family}:${variant}`);
      expect(recipe.version).toBe(1);
      expect(recipe.parts.length).toBeGreaterThanOrEqual(8);
      expect(recipe.parts.length).toBeLessThanOrEqual(80);
    },
  );

  it.each(RECIPE_CASES)(
    '$family:$variant has finite opaque material and transform data',
    ({ family, variant }) => {
      // Given a supported recipe request.
      // When the geometry is materialized.
      const recipe = createModelRecipe(family, variant);
      // Then every primitive can be serialized and rendered without repairs.
      for (const part of recipe.parts) {
        for (const vector of [part.position, part.rotation, part.size]) {
          expect(Object.values(vector).every(Number.isFinite)).toBe(true);
        }
        expect(Object.values(part.size).every((value) => value > 0)).toBe(true);
        expect(part.color).toMatch(/^#[\da-f]{6}$/i);
        expect(part.roughness).toBeGreaterThanOrEqual(0);
        expect(part.roughness).toBeLessThanOrEqual(1);
        expect(part.opacity).toBe(1);
      }
      expect(JSON.parse(JSON.stringify(recipe))).toEqual(recipe);
    },
  );

  it.each(FAMILIES)(
    '%s retains three geometric variants when material colors are ignored',
    (family) => {
      // Given all supported variants of a family.
      // When their geometry-only descriptions are compared.
      const shapes = VARIANTS.map((variant) =>
        JSON.stringify(
          createModelRecipe(family, variant).parts.map(
            ({ primitive, position, rotation, size }) => ({ primitive, position, rotation, size }),
          ),
        ),
      );
      // Then recoloring alone cannot satisfy the variant contract.
      expect(new Set(shapes).size).toBe(3);
    },
  );

  it.each(RECIPE_CASES)(
    '$family:$variant is deeply frozen and deterministic across other requests',
    ({ family, variant }) => {
      // Given an existing generated recipe.
      const first = createModelRecipe(family, variant);
      createModelRecipe('pagoda', 2);
      // When the same request is generated again.
      const second = createModelRecipe(family, variant);
      // Then prior requests cannot alter serialized or nested geometry.
      expect(second).toEqual(first);
      expect(Object.isFrozen(second)).toBe(true);
      expect(Object.isFrozen(second.parts)).toBe(true);
      for (const part of second.parts) {
        expect([part, part.position, part.rotation, part.size].every(Object.isFrozen)).toBe(true);
      }
    },
  );
});
