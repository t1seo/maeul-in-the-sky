import { Mesh, Raycaster, Vector3 } from 'three';
import { expect, it } from 'vitest';
import type { WorldScene } from '../../../../src/world/model/types.js';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { frameFor, scene, view } from './fixtures.js';

it('separates a crossing river from the pond surface and keeps pond foam above both', () => {
  // Given
  const crossing: WorldScene = {
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
            { x: 0, y: 0, z: -2 },
            { x: 0, y: 0, z: 2 },
          ],
        },
        {
          id: 'pond',
          islandId: 'island:2024-02',
          kind: 'pond',
          width: 2,
          points: [
            { x: -1, y: 0, z: -1 },
            { x: -1, y: 0, z: 1 },
            { x: 1, y: 0, z: 1 },
            { x: 1, y: 0, z: -1 },
            { x: -1, y: 0, z: -1 },
          ],
        },
      ],
    },
  };
  const world = createWorldGeometry(crossing);
  world.update(frameFor(crossing), view);
  const sample = (name: string, x: number, z: number) => {
    const mesh = world.content.getObjectByName(name);
    if (!(mesh instanceof Mesh)) throw new TypeError('Water surface is missing');
    return new Raycaster(new Vector3(x, 4, z), new Vector3(0, -1, 0))
      .intersectObject(mesh)
      .map((hit) => hit.point.y);
  };
  // When
  const base = sample('waterways', 0.12, 0.15);
  const current = sample('waterways:current', 0.12, 0.15);
  const shore = sample('waterways:foam', 0.995, 0.16)[0];
  const pond = base[0];
  const river = base[1];
  const pondCurrent = current[0];
  const riverCurrent = current[1];
  if (
    pond === undefined ||
    river === undefined ||
    pondCurrent === undefined ||
    riverCurrent === undefined ||
    shore === undefined
  )
    throw new TypeError('Crossing water layers are missing');
  // Then
  expect(pond - river).toBeGreaterThan(0.015);
  expect(pond - riverCurrent).toBeGreaterThan(0.01);
  expect(shore - pondCurrent).toBeGreaterThan(0.003);
  expect(
    crossing.terrain.waterways.every((waterway) => waterway.points.every((point) => point.y === 0)),
  ).toBe(true);
  world.dispose();
});
