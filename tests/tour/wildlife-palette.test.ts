import { NodeIO } from '@gltf-transform/core';
import { expect, it } from 'vitest';

it('ships the jellyfish in a restrained pearl-blue palette while preserving its opaque source alpha', async () => {
  // Given the real published jellyfish rather than a synthetic color fixture.
  const document = await new NodeIO().read('docs/demo/tour/models/jellyfish.glb');
  const root = document.getRoot();
  // When its optimized vertex colors and material alpha are inspected.
  const colors = root
    .listMeshes()
    .flatMap((mesh) => mesh.listPrimitives())
    .flatMap((primitive) => {
      const attribute = primitive.getAttribute('COLOR_0');
      if (!attribute) throw new Error('Expected preserved jellyfish surface colors');
      return Array.from({ length: attribute.getCount() }, (_, index) =>
        attribute.getElement(index, []),
      );
    });
  // Then intense magenta is replaced without introducing transparency or changing alpha.
  expect(colors.length).toBeGreaterThan(1000);
  for (const [red, green, blue, alpha] of colors) {
    expect(red).toBeLessThanOrEqual(green);
    expect(Math.max(red, green, blue) - Math.min(red, green, blue)).toBeLessThan(0.35);
    expect(alpha).toBe(1);
  }
  expect(
    root
      .listMaterials()
      .every(
        (material) =>
          material.getAlphaMode() === 'OPAQUE' && material.getBaseColorFactor()[3] === 1,
      ),
  ).toBe(true);
});
