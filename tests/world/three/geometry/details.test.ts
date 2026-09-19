import { InstancedMesh, MeshStandardMaterial } from 'three';
import { describe, expect, it } from 'vitest';
import type { WorldScene } from '../../../../src/world/model/types.js';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { frameFor, scene, view } from './fixtures.js';

const detailed: WorldScene = {
  ...scene,
  modelRecipes: scene.modelRecipes.map((recipe) => ({
    ...recipe,
    parts: [
      ...recipe.parts,
      {
        primitive: 'sphere',
        position: { x: 0, y: 0.8, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        size: { x: 0.6, y: 0.7, z: 0.6 },
        color: '#65854e',
        roughness: 0.86,
        opacity: 1,
      },
      {
        primitive: 'box',
        position: { x: 0, y: 0.2, z: 0.1 },
        rotation: { x: 0, y: 0, z: 0 },
        size: { x: 0.1, y: 0.15, z: 0.017 },
        color: '#e3b564',
        roughness: 0.5,
        opacity: 1,
      },
    ],
  })),
};

describe('seasonal miniature details', () => {
  it('adds snow volumes and flowering details at the frozen canopy transforms', () => {
    // Given
    const world = createWorldGeometry(detailed);
    const before = JSON.stringify(detailed);
    // When
    world.update(frameFor(detailed), { ...view, seasonOverride: 'winter' });
    const snow: InstancedMesh[] = [];
    world.content.traverseVisible((object) => {
      if (object instanceof InstancedMesh && object.name.includes('snow')) snow.push(object);
    });
    world.update(frameFor(detailed), { ...view, seasonOverride: 'spring' });
    const flowers: InstancedMesh[] = [];
    world.content.traverseVisible((object) => {
      if (object instanceof InstancedMesh && object.name.includes('flowers')) flowers.push(object);
    });
    // Then
    expect(snow.length).toBeGreaterThan(0);
    expect(flowers.length).toBeGreaterThan(0);
    expect(snow.every((mesh) => mesh.count === 0 && mesh.visible === false)).toBe(true);
    expect(JSON.stringify(detailed)).toBe(before);
    world.dispose();
  });

  it('lights warm recipe windows at night without adding a light for every building', () => {
    // Given
    const world = createWorldGeometry(detailed);
    // When
    world.update(frameFor(detailed), { ...view, lighting: 'night' });
    // Then
    const materials: MeshStandardMaterial[] = [];
    world.content.traverseVisible((object) => {
      if (object instanceof InstancedMesh && object.material instanceof MeshStandardMaterial)
        materials.push(object.material);
    });
    expect(
      materials.some(
        (material) => material.emissiveIntensity > 0 && material.emissive.getHex() !== 0,
      ),
    ).toBe(true);
    world.dispose();
  });
});
