import { Box3, Mesh, Raycaster, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import type { WorldScene } from '../../../../src/world/model/types.js';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { createPrimitiveGeometry } from '../../../../src/world/three/geometry/primitives.js';
import { frameFor, scene, view } from './fixtures.js';

export const landscapeScene: WorldScene = {
  ...scene,
  routes: [
    {
      id: 'route:rail',
      kind: 'rail',
      nodeIds: [],
      points: [
        { x: 0, y: 2, z: 2 },
        { x: 2, y: 2, z: 2 },
        { x: 3, y: 2.5, z: 3 },
      ],
      length: 3.5,
      visibleFrom: '2024-02-29',
      loop: false,
    },
    {
      id: 'route:walk',
      kind: 'walk',
      nodeIds: [],
      points: [
        { x: 0, y: 0.4, z: -1 },
        { x: 2, y: 0.4, z: -1 },
      ],
      length: 2,
      visibleFrom: '2024-02-28',
      loop: false,
    },
  ],
  terrain: {
    ...scene.terrain,
    waterways: [
      {
        id: 'river',
        islandId: 'island:2024-02',
        kind: 'river',
        points: [
          { x: -1, y: 0, z: -1 },
          { x: -1, y: 0, z: 1 },
        ],
        width: 0.4,
      },
      {
        id: 'fall',
        islandId: 'island:2024-02',
        kind: 'waterfall',
        points: [
          { x: -1, y: 0, z: 1 },
          { x: -1, y: -1.5, z: 1 },
        ],
        width: 0.4,
      },
      {
        id: 'pond',
        islandId: 'island:2024-02',
        kind: 'pond',
        points: [
          { x: -1, y: 0, z: 0 },
          { x: -2, y: 0, z: 0 },
          { x: -2, y: 0, z: 1 },
          { x: -1, y: 0, z: 1 },
          { x: -1, y: 0, z: 0 },
        ],
        width: 1,
      },
    ],
  },
};

describe('continuous landscape', () => {
  it('renders paired rails and walk paths at the persisted route coordinates', () => {
    // Given
    const world = createWorldGeometry(landscapeScene);
    // When
    world.update(frameFor(landscapeScene), view);
    // Then
    const rail = world.content.getObjectByName('route:rail');
    const walk = world.content.getObjectByName('route:walk');
    expect(rail).toBeDefined();
    expect(walk).toBeDefined();
    if (rail) {
      const bounds = new Box3().setFromObject(rail);
      expect(bounds.min.x).toBeLessThanOrEqual(0);
      expect(bounds.max.x).toBeGreaterThanOrEqual(3);
      expect(bounds.max.y).toBeGreaterThan(2.5);
      expect(rail.children.length).toBeGreaterThanOrEqual(2);
    }
    world.dispose();
  });

  it('hides future route meshes during reverse replay', () => {
    // Given
    const world = createWorldGeometry(landscapeScene);
    world.update(frameFor(landscapeScene), view);
    // When
    world.update(frameFor(landscapeScene, '2024-02-28'), { ...view, cursorDate: '2024-02-28' });
    // Then
    expect(world.content.getObjectByName('route:rail')?.visible).toBe(false);
    expect(world.content.getObjectByName('route:walk')?.visible).toBe(true);
    world.dispose();
  });

  it('builds river, pond and vertical waterfall surfaces with finite unit normals', () => {
    // Given
    const world = createWorldGeometry(landscapeScene);
    // When
    world.update(frameFor(landscapeScene), view);
    // Then
    const waters = world.content.getObjectByName('waterways');
    expect(waters).toBeInstanceOf(Mesh);
    if (waters instanceof Mesh) {
      expect(new Box3().setFromObject(waters).min.y).toBeLessThan(-1.4);
      const normal = waters.geometry.getAttribute('normal');
      for (let index = 0; index < normal.count; index += 1) {
        expect(Math.hypot(normal.getX(index), normal.getY(index), normal.getZ(index))).toBeCloseTo(
          1,
          5,
        );
      }
    }
    world.dispose();
  });

  it('joins adjacent tile heights without cracks while preserving day picks', () => {
    // Given
    const sloped: WorldScene = {
      ...scene,
      entities: [],
      terrain: {
        ...scene.terrain,
        tiles: scene.terrain.tiles.map((tile, index) => ({
          ...tile,
          position: { ...tile.position, y: index + 0.4 },
        })),
      },
    };
    const world = createWorldGeometry(sloped);
    // When
    world.update(frameFor(sloped), view);
    // Then
    const ray = new Raycaster(new Vector3(0.4999, 8, 0.25), new Vector3(0, -1, 0));
    const before = ray.intersectObject(world.content, true)[0];
    ray.set(new Vector3(0.5001, 8, 0.25), new Vector3(0, -1, 0));
    const after = ray.intersectObject(world.content, true)[0];
    expect(before && after && Math.abs(before.point.y - after.point.y)).toBeLessThan(0.001);
    expect(before && world.identify(before)).toBe('day:2024-02-28');
    expect(after && world.identify(after)).toBe('day:2024-02-29');
    world.dispose();
  });
});

describe('primitive silhouettes', () => {
  it('makes giwa eaves turn upward within centered unit bounds', () => {
    // Given
    const roof = createPrimitiveGeometry('roof', 'hanok:2');
    // When
    roof.computeBoundingBox();
    const positions = roof.getAttribute('position');
    const atCenter: { readonly y: number; readonly z: number }[] = [];
    for (let index = 0; index < positions.count; index += 1) {
      if (Math.abs(positions.getX(index)) < 0.0001)
        atCenter.push({ y: positions.getY(index), z: Math.abs(positions.getZ(index)) });
    }
    // Then
    const eave = Math.max(...atCenter.filter((point) => point.z > 0.499).map((point) => point.y));
    const inset = Math.max(
      ...atCenter.filter((point) => Math.abs(point.z - 5 / 12) < 0.001).map((point) => point.y),
    );
    expect(eave).toBeGreaterThan(inset);
    expect(roof.boundingBox?.min.y).toBeCloseTo(-0.5, 5);
    expect(roof.boundingBox?.max.y).toBeCloseTo(0.5, 5);
    roof.dispose();
  });
});
