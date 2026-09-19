import { Box3, Euler, Matrix4, Quaternion, Raycaster, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { createModelRecipe } from '../../../../src/world/model/recipes/index.js';
import { branch, type Triple } from '../../../../src/world/model/recipes/primitives.js';
import { RECIPE_CASES } from './families.js';
import { createRecipeObject } from './three-model.js';

describe('recipes rendered as actual Three geometry', () => {
  it('keeps roof tile ribs against the curved giwa surface', () => {
    const recipe = createModelRecipe('hanok', 0);
    const model = createRecipeObject(recipe);
    try {
      model.group.updateMatrixWorld(true);
      const roofs = model.group.children.filter(
        (_, index) => recipe.parts[index]?.primitive === 'roof',
      );
      const ribs = recipe.parts.filter(
        (part) => part.primitive === 'cylinder' && Math.abs(part.rotation.x) > 0.1,
      );
      const gaps = ribs.map(({ position }) => {
        const ray = new Raycaster(
          new Vector3(position.x, position.y + 2, position.z),
          new Vector3(0, -1, 0),
        );
        const hit = ray.intersectObjects(roofs, false)[0];
        return hit ? position.y - hit.point.y : Number.POSITIVE_INFINITY;
      });
      expect(gaps.length).toBeGreaterThan(0);
      expect(Math.max(...gaps)).toBeLessThan(0.018);
    } finally {
      model.dispose();
    }
  });

  it.each(RECIPE_CASES)(
    '$family:$variant stays grounded and inside the agreed tile envelope',
    ({ family, variant }) => {
      // Given a full recipe meshed through the production primitive factory.
      const model = createRecipeObject(createModelRecipe(family, variant));
      try {
        // When actual transformed vertices determine its bounds.
        const bounds = new Box3().setFromObject(model.group, true);
        const size = bounds.getSize(new Vector3());
        // Then props fit the tile contract from every viewing angle.
        expect(bounds.min.y, 'buried geometry').toBeGreaterThanOrEqual(-0.035);
        expect(bounds.min.y, 'floating geometry').toBeLessThanOrEqual(0.04);
        expect(bounds.max.y, 'maximum model height').toBeLessThanOrEqual(1.8);
        expect(size.x, 'horizontal width').toBeLessThanOrEqual(1);
        expect(size.z, 'horizontal depth').toBeLessThanOrEqual(1);
        expect(size.x).toBeGreaterThan(0.07);
        expect(size.y).toBeGreaterThan(0.05);
        expect(size.z).toBeGreaterThan(0.06);
      } finally {
        model.dispose();
      }
    },
  );
});

describe('organic branch geometry', () => {
  const directions = [
    [0.3, 0.2, -0.4],
    [-0.3, 0.7, 0.2],
    [0, -0.3, 0],
    [0.3, 0, 0],
  ] as const satisfies readonly Triple[];
  it.each(directions)('joins both requested endpoints for direction %j', (...destination) => {
    // Given a branch with an arbitrary three-dimensional direction.
    const start: Triple = [0.03, 0.04, 0.05];
    const item = branch(start, destination, 0.03);
    const { position, rotation, size } = item;
    // When the same Euler transform used by Three is applied.
    const matrix = new Matrix4().compose(
      new Vector3(position.x, position.y, position.z),
      new Quaternion().setFromEuler(new Euler(rotation.x, rotation.y, rotation.z)),
      new Vector3(size.x, size.y, size.z),
    );
    const actualStart = new Vector3(0, -0.5, 0).applyMatrix4(matrix);
    const actualEnd = new Vector3(0, 0.5, 0).applyMatrix4(matrix);
    // Then the limb meets both joints without an orientation gap.
    expect(actualStart.distanceTo(new Vector3(...start))).toBeLessThan(1e-12);
    expect(actualEnd.distanceTo(new Vector3(...destination))).toBeLessThan(1e-12);
  });
});
