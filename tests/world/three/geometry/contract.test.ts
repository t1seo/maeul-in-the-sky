import { Box3, InstancedMesh, Mesh, MeshStandardMaterial, Raycaster, Vector3 } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { frameFor, scene, view } from './fixtures.js';

describe('world geometry contract', () => {
  it('builds volumetric terrain and instanced recipe geometry from the canonical scene', () => {
    // Given
    const world = createWorldGeometry(scene);
    // When
    world.update(frameFor(), view);
    // Then
    const meshes: Mesh[] = [];
    world.content.traverse((object) => {
      if (object instanceof Mesh) meshes.push(object);
    });
    expect(meshes.some((mesh) => mesh instanceof InstancedMesh)).toBe(true);
    expect(meshes.every((mesh) => mesh.material instanceof MeshStandardMaterial)).toBe(true);
    const bounds = new Box3().setFromObject(world.content);
    expect(bounds.min.y).toBeLessThan(-0.5);
    expect(bounds.max.y).toBeGreaterThan(1);
    world.dispose();
  });

  it('identifies the first visible recipe instance with a real ray intersection', () => {
    // Given
    const world = createWorldGeometry(scene);
    world.update(frameFor(), view);
    world.content.updateMatrixWorld(true);
    // When
    const hits = new Raycaster(new Vector3(0, 8, 0), new Vector3(0, -1, 0)).intersectObject(
      world.content,
      true,
    );
    // Then
    expect(
      hits.some((hit) => hit.instanceId === 0 && world.identify(hit) === 'asset:2024-02-28'),
    ).toBe(true);
    world.dispose();
  });

  it('does not identify future days when replay moves before their date', () => {
    // Given
    const world = createWorldGeometry(scene);
    world.update(frameFor(), view);
    // When
    world.update(frameFor(scene, '2024-02-28'), { ...view, cursorDate: '2024-02-28' });
    world.content.updateMatrixWorld(true);
    const hits = new Raycaster(new Vector3(1, 8, 0), new Vector3(0, -1, 0)).intersectObject(
      world.content,
      true,
    );
    // Then
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((hit) => world.identify(hit) === undefined)).toBe(true);
    world.dispose();
  });

  it('disposes every unique shared geometry and material exactly once', () => {
    // Given
    const world = createWorldGeometry(scene);
    world.update(frameFor(), view);
    const resources = new Set<{ dispose: () => void }>();
    world.content.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      resources.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material])
        resources.add(material);
    });
    const spies = [...resources].map((resource) => vi.spyOn(resource, 'dispose'));
    // When
    world.dispose();
    world.dispose();
    // Then
    expect(spies.length).toBeGreaterThan(0);
    expect(spies.every((spy) => spy.mock.calls.length === 1)).toBe(true);
    expect(world.content.children).toHaveLength(0);
  });
});
