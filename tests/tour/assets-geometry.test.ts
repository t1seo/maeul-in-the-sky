import { afterAll, describe, expect, it } from 'vitest';
import { Box3, Euler, Matrix4, Quaternion, Vector3 } from 'three';
import type { BufferGeometry } from 'three';
import { ASSET_CATALOG } from '../../src/themes/terrain/assets/catalog.js';
import { EPIC_CATALOG } from '../../src/themes/terrain/epics/catalog.js';
import { createTourAsset } from '../../src/tour/assets/index.js';
import { createPrimitiveGeometry } from '../../src/world/three/geometry/primitives.js';
import { roofProfile } from '../../src/world/three/geometry/roof.js';

const CACHE = new Map<string, BufferGeometry>();
const CASES = [...ASSET_CATALOG, ...EPIC_CATALOG].flatMap(({ id }) =>
  [0, 1, 2, 99].map((variant) => ({ id, variant })),
);

afterAll(() => {
  for (const geometry of CACHE.values()) geometry.dispose();
  CACHE.clear();
});

describe('tour geometry in renderer coordinates', () => {
  it.each(CASES)('$id:$variant fits a finite world-space envelope', ({ id, variant }) => {
    // Given a source catalog identity, including non-base variants.
    const asset = createTourAsset(id, variant, 'summer');
    const bounds = new Box3();
    // When actual production primitive vertices receive the renderer transforms.
    for (const part of asset.recipe.parts) {
      const key =
        part.primitive === 'roof' ? `roof:${roofProfile(asset.recipe.key)}` : part.primitive;
      let geometry = CACHE.get(key);
      if (!geometry) {
        geometry = createPrimitiveGeometry(part.primitive, asset.recipe.key);
        CACHE.set(key, geometry);
      }
      const matrix = new Matrix4().compose(
        new Vector3(part.position.x, part.position.y, part.position.z).multiplyScalar(asset.scale),
        new Quaternion().setFromEuler(new Euler(part.rotation.x, part.rotation.y, part.rotation.z)),
        new Vector3(part.size.x, part.size.y, part.size.z).multiplyScalar(asset.scale),
      );
      const vertices = geometry.getAttribute('position');
      for (let vertex = 0; vertex < vertices.count; vertex += 1)
        bounds.expandByPoint(
          new Vector3().fromBufferAttribute(vertices, vertex).applyMatrix4(matrix),
        );
    }
    // Then valid variants cannot create an unbounded, empty, or zero-volume mesh.
    const size = bounds.getSize(new Vector3());
    expect(
      [size.x, size.y, size.z].every((value) => Number.isFinite(value) && value > 0 && value < 12),
    ).toBe(true);
    expect(asset.recipe.parts.length).toBeLessThanOrEqual(220);
    expect(
      asset.recipe.parts.every(
        (part) => part.roughness >= 0 && part.roughness <= 1 && part.opacity === 1,
      ),
    ).toBe(true);
  });
});
