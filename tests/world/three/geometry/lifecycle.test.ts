import { InstancedMesh, Mesh, ObjectLoader, Raycaster, Vector3 } from 'three';
import type { Intersection } from 'three';
import { describe, expect, it } from 'vitest';
import type { WorldScene } from '../../../../src/world/model/types.js';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { frameFor, scene, view } from './fixtures.js';

describe('geometry lifecycle and selection', () => {
  it('keeps resources inert after disposal and rejects stale intersections', () => {
    // Given
    const world = createWorldGeometry(scene);
    world.update(frameFor(), view);
    const hit = new Raycaster(new Vector3(0, 8, 0), new Vector3(0, -1, 0)).intersectObject(
      world.content,
      true,
    )[0];
    world.dispose();
    // When
    world.update(frameFor(), view);
    // Then
    expect(world.content.children).toHaveLength(0);
    expect(hit && world.identify(hit)).toBeUndefined();
  });

  it('places selected date and entity rings at their actual visible surface', () => {
    // Given
    const world = createWorldGeometry(scene);
    // When
    world.update(frameFor(), { ...view, selectedId: 'day:2024-02-28' });
    // Then
    const ring = world.content.getObjectByName('selection');
    expect(ring?.visible).toBe(true);
    expect(ring?.position.y).toBeCloseTo(0.565);
    expect(ring?.userData.exportExclude).toBe(true);
    world.dispose();
  });

  it('removes selection when a selected entity becomes unavailable', () => {
    // Given
    const world = createWorldGeometry(scene);
    world.update(frameFor(), { ...view, selectedId: 'asset:2024-02-28' });
    // When
    world.update(frameFor(scene, '2024-02-27'), {
      ...view,
      cursorDate: '2024-02-27',
      selectedId: 'asset:2024-02-28',
    });
    // Then
    expect(world.content.getObjectByName('selection')?.visible).toBe(false);
    world.dispose();
  });

  it('never reports scenery, missing faces or unrelated instances as contribution dates', () => {
    // Given
    const scenery: WorldScene = {
      ...scene,
      entities: [],
      terrain: {
        ...scene.terrain,
        tiles: scene.terrain.tiles.map((tile) => ({ ...tile, source: 'scenery' })),
      },
    };
    const world = createWorldGeometry(scenery);
    world.update(frameFor(scenery), view);
    const surface = world.content.getObjectByName('terrain:surface');
    if (!(surface instanceof Mesh)) throw new TypeError('Terrain is missing');
    // When
    const hit: Intersection = { object: surface, point: new Vector3(), distance: 1 };
    const intersections = new Raycaster(
      new Vector3(0, 8, 0),
      new Vector3(0, -1, 0),
    ).intersectObject(world.content, true);
    // Then
    expect(world.identify(hit)).toBeUndefined();
    expect(world.identify({ ...hit, faceIndex: null })).toBeUndefined();
    expect(intersections.every((intersection) => world.identify(intersection) === undefined)).toBe(
      true,
    );
    const foreign = new InstancedMesh(surface.geometry, surface.material, 1);
    expect(world.identify({ ...hit, object: foreign, instanceId: 0 })).toBeUndefined();
    foreign.dispose();
    world.dispose();
  });

  it('roundtrips standard materials and actual mesh content through Three serialization', () => {
    // Given
    const world = createWorldGeometry(scene);
    world.update(frameFor(), view);
    // When
    const restored = new ObjectLoader().parse(world.content.toJSON());
    // Then
    const meshes: Mesh[] = [];
    restored.traverse((object) => {
      if (object instanceof Mesh) meshes.push(object);
    });
    expect(meshes.length).toBeGreaterThan(2);
    expect(meshes.some((mesh) => mesh instanceof InstancedMesh && mesh.count > 0)).toBe(true);
    const geometries = new Set(meshes.map((mesh) => mesh.geometry));
    const materials = new Set(
      meshes.flatMap((mesh) => (Array.isArray(mesh.material) ? mesh.material : [mesh.material])),
    );
    for (const mesh of meshes) if (mesh instanceof InstancedMesh) mesh.dispose();
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    world.dispose();
  });
});
