import { Box3, Mesh, Raycaster, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { createPrimitiveGeometry } from '../../../../src/world/three/geometry/primitives.js';

describe('exportable unit primitives', () => {
  it.each(['box', 'cylinder', 'cone', 'sphere', 'roof'] as const)(
    'keeps %s centered with exact unit dimensions and finite normals',
    (primitive) => {
      // Given
      const geometry = createPrimitiveGeometry(primitive, 'hanok:0');
      // When
      const mesh = new Mesh(geometry);
      const bounds = new Box3().setFromObject(mesh);
      // Then
      for (const axis of ['x', 'y', 'z'] as const) {
        expect(bounds.min[axis]).toBeCloseTo(-0.5, 5);
        expect(bounds.max[axis]).toBeCloseTo(0.5, 5);
      }
      const normals = geometry.getAttribute('normal');
      for (let index = 0; index < normals.count; index += 1)
        expect(
          Math.hypot(normals.getX(index), normals.getY(index), normals.getZ(index)),
        ).toBeCloseTo(1, 4);
      const hits = new Raycaster(new Vector3(0, 2, 0), new Vector3(0, -1, 0)).intersectObject(mesh);
      expect(hits.length).toBeGreaterThan(0);
      geometry.dispose();
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material])
        material.dispose();
    },
  );

  it('gives classic gables a separate planar silhouette from curved giwa', () => {
    // Given
    const classic = createPrimitiveGeometry('roof', 'house:1');
    const korean = createPrimitiveGeometry('roof', 'hanok:1');
    // When
    const counts = [classic.getAttribute('position').count, korean.getAttribute('position').count];
    // Then
    expect(counts[0]).toBeLessThan(counts[1]);
    classic.computeBoundingBox();
    expect(classic.boundingBox?.max.y).toBeCloseTo(0.5);
    classic.dispose();
    korean.dispose();
  });
});
