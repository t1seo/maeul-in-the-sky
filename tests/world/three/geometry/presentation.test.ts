import { Color, InstancedMesh, Matrix4, Mesh, Raycaster, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import type { WorldScene } from '../../../../src/world/model/types.js';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { frameFor, scene, view } from './fixtures.js';

describe('dated presentation', () => {
  it('raises a day surface to its persisted activity height only after its date', () => {
    // Given
    const dated: WorldScene = { ...scene, entities: [] };
    const world = createWorldGeometry(dated);
    world.update(frameFor(dated, '2024-02-27'), { ...view, cursorDate: '2024-02-27' });
    const ray = new Raycaster(new Vector3(0, 8, 0), new Vector3(0, -1, 0));
    const hidden = ray.intersectObject(world.content, true)[0]?.point.y;
    // When
    world.update(frameFor(dated), view);
    const revealed = ray.intersectObject(world.content, true)[0]?.point.y;
    // Then
    expect(hidden).toBeCloseTo(0.4);
    expect(revealed).toBeCloseTo(0.5);
    world.dispose();
  });

  it('uses distinct monthly seasons in calendar mode and a uniform explicit preview', () => {
    // Given
    const tile = scene.terrain.tiles[0];
    if (!tile) throw new TypeError('Fixture requires a tile');
    const monthly: WorldScene = {
      ...scene,
      entities: [],
      regions: [
        ...scene.regions,
        {
          ...scene.regions[0],
          id: 'region:2024-07:nature',
          islandId: tile.islandId,
          monthKey: '2024-07',
          kind: 'nature',
          boundary: [],
          tileIds: ['summer-tile'],
        },
      ],
      terrain: {
        ...scene.terrain,
        tiles: [
          tile,
          {
            ...tile,
            id: 'summer-tile',
            source: 'scenery',
            regionId: 'region:2024-07:nature',
            position: { ...tile.position, x: 2 },
          },
        ],
      },
    };
    const world = createWorldGeometry(monthly);
    world.update(frameFor(monthly), view);
    const mesh = world.content.getObjectByName('terrain:surface');
    if (!(mesh instanceof Mesh)) throw new TypeError('Terrain surface is missing');
    const winter = new Color().fromBufferAttribute(mesh.geometry.getAttribute('color'), 0);
    const summer = new Color().fromBufferAttribute(mesh.geometry.getAttribute('color'), 12);
    // When
    world.update({ ...frameFor(monthly), season: 'autumn' }, { ...view, seasonOverride: 'autumn' });
    // Then
    expect(winter.equals(summer)).toBe(false);
    const previewWinter = new Color().fromBufferAttribute(mesh.geometry.getAttribute('color'), 0);
    const previewSummer = new Color().fromBufferAttribute(mesh.geometry.getAttribute('color'), 12);
    expect(previewWinter.equals(previewSummer)).toBe(true);
    world.dispose();
  });

  it('compacts a future first entity out of instance zero and removes it again on rewind', () => {
    // Given
    const source = scene.entities[0];
    if (!source) throw new TypeError('Fixture requires an entity');
    const dated: WorldScene = {
      ...scene,
      entities: [
        { ...source, id: 'later', visibleFrom: '2024-02-29', position: { x: 4, y: 0.5, z: 0 } },
        source,
      ],
    };
    const world = createWorldGeometry(dated);
    world.update(frameFor(dated), view);
    // When
    world.update(frameFor(dated, '2024-02-28'), { ...view, cursorDate: '2024-02-28' });
    // Then
    const instances: InstancedMesh[] = [];
    world.content.traverse((object) => {
      if (object instanceof InstancedMesh) instances.push(object);
    });
    expect(instances.every((mesh) => mesh.count === 1)).toBe(true);
    expect(
      instances.every((mesh) => JSON.stringify(mesh.userData).includes('later') === false),
    ).toBe(true);
    const hit = new Raycaster(new Vector3(0, 8, 0), new Vector3(0, -1, 0)).intersectObject(
      world.content,
      true,
    )[0];
    expect(hit && world.identify(hit)).toBe(source.id);
    world.dispose();
  });

  it('applies actor sample positions and yaw without regenerating a route', () => {
    // Given
    const actor = {
      id: 'train',
      kind: 'train' as const,
      modelKey: 'tree',
      routeId: 'track',
      speed: 1,
      phase: 0,
      visibleFrom: '2024-02-28',
    };
    const moving: WorldScene = { ...scene, entities: [], actors: [actor] };
    const world = createWorldGeometry(moving);
    // When
    world.update(
      {
        ...frameFor(moving),
        actors: [{ ...actor, actorId: actor.id, position: { x: 3, y: 4, z: 5 }, yaw: Math.PI / 2 }],
      },
      view,
    );
    // Then
    const matrix = new Matrix4();
    const positions: Vector3[] = [];
    world.content.traverse((object) => {
      if (!(object instanceof InstancedMesh)) return;
      object.getMatrixAt(0, matrix);
      positions.push(new Vector3().setFromMatrixPosition(matrix));
    });
    expect(positions.length).toBeGreaterThan(0);
    expect(
      positions.every((position) => position.x === 3 && position.y > 4 && position.z === 5),
    ).toBe(true);
    world.dispose();
  });
});
