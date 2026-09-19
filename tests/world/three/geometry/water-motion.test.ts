import { DataTexture, Mesh, MeshStandardMaterial } from 'three';
import { describe, expect, it } from 'vitest';
import {
  createWorldDocument,
  parseWorldDocument,
  serializeWorldDocument,
} from '../../../../src/world/data/document.js';
import { TINY_WORLD_INPUT } from '../../../../src/world/model/fixture.js';
import { buildWorld, defaultWorldView, frameWorld } from '../../../../src/world/model/index.js';
import type { WorldScene } from '../../../../src/world/model/types.js';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { frameFor, scene, view } from './fixtures.js';

const river: WorldScene = {
  ...scene,
  terrain: {
    ...scene.terrain,
    waterways: [
      {
        id: 'river',
        islandId: 'island:2024-02',
        kind: 'river',
        width: 0.8,
        points: [
          { x: -1, y: 0, z: -2 },
          { x: -0.7, y: 0, z: 0 },
          { x: -1, y: 0, z: 2 },
        ],
      },
    ],
  },
};

function water(world: ReturnType<typeof createWorldGeometry>, name = 'waterways') {
  const mesh = world.content.getObjectByName(name);
  if (!(mesh instanceof Mesh) || !(mesh.material instanceof MeshStandardMaterial))
    throw new TypeError('Water requires a standard material');
  return mesh;
}

describe('gentle river flow', () => {
  it('keeps waterfall current layers physically separated in standard material exports', () => {
    // Given
    const waterfall: WorldScene = {
      ...river,
      terrain: {
        ...river.terrain,
        waterways: [
          ...river.terrain.waterways,
          {
            id: 'fall',
            islandId: 'island:2024-02',
            kind: 'waterfall',
            width: 0.8,
            points: [
              { x: -1, y: 0, z: 2 },
              { x: -1, y: -1.5, z: 2 },
            ],
          },
        ],
      },
    };
    const world = createWorldGeometry(waterfall);
    const surface = water(world).geometry;
    const current = water(world, 'waterways:current').geometry;
    expect(current.hasAttribute('color')).toBe(false);
    const position = surface.getAttribute('position');
    const overlay = current.getAttribute('position');
    const normal = surface.getAttribute('normal');
    // Then
    for (let index = 0; index < position.count; index += 1) {
      const separation =
        (overlay.getX(index) - position.getX(index)) * normal.getX(index) +
        (overlay.getY(index) - position.getY(index)) * normal.getY(index) +
        (overlay.getZ(index) - position.getZ(index)) * normal.getZ(index);
      expect(separation).toBeGreaterThan(0.003);
    }
    world.dispose();
  });

  it('advects the current texture with elapsed time without rebuilding or moving terrain', () => {
    // Given
    const world = createWorldGeometry(river);
    world.update(frameFor(river), { ...view, motion: 'full', elapsedSeconds: 2 });
    const current = water(world, 'waterways:current');
    const map = current.material.map;
    expect(map).toBeInstanceOf(DataTexture);
    const before = map?.offset.clone();
    const geometry = water(world).geometry;
    const positions = Array.from(geometry.getAttribute('position').array);
    const normal = Array.from(geometry.getAttribute('normal').array);
    // When
    world.update(frameFor(river), { ...view, motion: 'full', elapsedSeconds: 8 });
    // Then
    expect(map?.offset.equals(before ?? map.offset)).toBe(false);
    expect(water(world).geometry).toBe(geometry);
    expect(Array.from(geometry.getAttribute('position').array)).toEqual(positions);
    expect(Array.from(geometry.getAttribute('normal').array)).toEqual(normal);
    world.dispose();
  });

  it.each(['off', 'subtle'] as const)(
    'restores the saved elapsed water pose in %s mode',
    (motion) => {
      // Given
      const savedScene = buildWorld(TINY_WORLD_INPUT);
      const savedView = { ...defaultWorldView(savedScene), motion, elapsedSeconds: 8 };
      const world = createWorldGeometry(savedScene);
      world.update(frameWorld(savedScene, savedView), { ...savedView, motion: 'full' });
      const before = water(world, 'waterways:current').material.map?.offset.toArray();
      // When
      const document = parseWorldDocument(
        serializeWorldDocument(
          createWorldDocument({
            scene: savedScene,
            sourceSnapshot: TINY_WORLD_INPUT.snapshot,
            view: savedView,
            savedAt: '2026-09-19T00:00:00Z',
          }),
        ),
      );
      world.update(frameWorld(savedScene, savedView), savedView);
      const reopened = createWorldGeometry(document.scene);
      reopened.update(frameWorld(document.scene, document.view), document.view);
      // Then
      expect(water(world, 'waterways:current').material.map?.offset.toArray()).toEqual(before);
      expect(water(reopened, 'waterways:current').material.map?.offset.toArray()).toEqual(before);
      reopened.dispose();
      world.dispose();
    },
  );

  it('keeps local flow UVs when monthly river coordinates rotate by a quarter turn', () => {
    // Given
    const rotated: WorldScene = {
      ...river,
      terrain: {
        ...river.terrain,
        waterways: river.terrain.waterways.map((item) => ({
          ...item,
          points: item.points.map((p) => ({ x: -p.z, y: p.y, z: p.x })),
        })),
      },
    };
    const a = createWorldGeometry(river);
    const b = createWorldGeometry(rotated);
    // When
    const uvA = water(a).geometry.getAttribute('uv');
    const uvB = water(b).geometry.getAttribute('uv');
    const color = water(a).geometry.getAttribute('color');
    // Then
    expect(uvA).toBeDefined();
    expect(Array.from(uvA?.array ?? [])).toEqual(Array.from(uvB?.array ?? []));
    expect(color).toBeDefined();
    expect(new Set(color?.array).size).toBeGreaterThan(3);
    a.dispose();
    b.dispose();
  });
});
