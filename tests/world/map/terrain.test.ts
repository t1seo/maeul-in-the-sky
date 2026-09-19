import { expect, it } from 'vitest';
import { terrainMesh } from '../../../src/world/map/terrain.js';
import { mapScene } from './fixtures.js';

it.each([
  ['water', 0],
  ['path', 0.5],
] as const)('keeps %s transport ground level beside a high contribution ridge', (surface, y) => {
  const tile = mapScene.terrain.tiles[0];
  const corridor = {
    ...tile,
    id: 'corridor',
    source: 'scenery' as const,
    surface,
    activityHeight: 0,
    position: { x: 0, y, z: 0 },
  };
  const ridge = { ...tile, id: 'ridge', activityHeight: 1, position: { x: 1, y: 2, z: 0 } };
  const mesh = terrainMesh([corridor, ridge]);
  expect(mesh.get('corridor')?.map((point) => point.y)).toEqual([y, y, y, y]);
  const shared = mesh.get('ridge')?.filter((point) => point.x === 0.5);
  expect(shared?.map((point) => point.y)).toEqual([y, y]);
});
