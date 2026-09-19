import { Color, Mesh, Raycaster, Triangle, Vector3 } from 'three';
import { expect, it } from 'vitest';
import type { WorldScene } from '../../../../src/world/model/types.js';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { frameFor, scene, view } from './fixtures.js';

it('keeps a calm deep pond interior and a continuous shallow shore without triangular patches', () => {
  // Given
  const pond: WorldScene = {
    ...scene,
    terrain: {
      ...scene.terrain,
      waterways: [
        {
          id: 'pond',
          islandId: 'island:2024-02',
          kind: 'pond',
          width: 2,
          points: [
            { x: -1, y: 0, z: -1 + 1e-14 },
            { x: -1, y: 0, z: 1 },
            { x: 1, y: 0, z: 1 },
            { x: 1, y: 0, z: -1 },
            { x: -1, y: 0, z: -1 },
          ],
        },
      ],
    },
  };
  const world = createWorldGeometry(pond);
  world.update(frameFor(pond), view);
  const water = world.content.getObjectByName('waterways');
  if (!(water instanceof Mesh)) throw new TypeError('Water surface is missing');
  const normal = water.geometry.getAttribute('normal');
  for (let index = 0; index < normal.count; index += 1)
    expect(Math.hypot(normal.getX(index), normal.getY(index), normal.getZ(index))).toBeCloseTo(
      1,
      5,
    );
  const sample = (x: number, z: number) => {
    const hit = new Raycaster(new Vector3(x, 4, z), new Vector3(0, -1, 0)).intersectObject(
      water,
    )[0];
    if (!hit?.face) throw new TypeError('Pond surface is missing');
    const indices = [hit.face.a, hit.face.b, hit.face.c];
    const vertices = indices.map((index) =>
      new Vector3().fromBufferAttribute(water.geometry.getAttribute('position'), index),
    );
    const a = vertices[0],
      b = vertices[1],
      c = vertices[2];
    if (!a || !b || !c) throw new TypeError('Pond triangle is missing');
    const weights = Triangle.getBarycoord(hit.point, a, b, c, new Vector3());
    if (!weights) throw new TypeError('Pond triangle is degenerate');
    const color = new Color(0, 0, 0);
    for (const [offset, index] of indices.entries())
      color.add(
        new Color()
          .fromBufferAttribute(water.geometry.getAttribute('color'), index)
          .multiplyScalar(weights.getComponent(offset)),
      );
    return color;
  };
  // When
  const center = sample(0, 0);
  const nearby = sample(0.3, -0.2);
  const edge = sample(0.97, 0);
  // Then
  expect(
    Math.abs(center.r - nearby.r) + Math.abs(center.g - nearby.g) + Math.abs(center.b - nearby.b),
  ).toBeLessThan(0.002);
  expect(edge.r).toBeGreaterThan(center.r + 0.05);
  world.dispose();
});
