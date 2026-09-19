import { InstancedMesh, Mesh, MeshStandardMaterial } from 'three';
import type { Group } from 'three';
import type { WorldScene } from '../../../../src/world/model/types.js';
import { scene } from './fixtures.js';

export const waterfallScene: WorldScene = {
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
          { x: 0, y: 0, z: 0 },
          { x: 0, y: 0, z: 2 },
        ],
      },
      {
        id: 'waterfall',
        islandId: 'island:2024-02',
        kind: 'waterfall',
        width: 0.8,
        points: [
          { x: 0, y: 0, z: 2 },
          { x: 0, y: -0.6, z: 2.2 },
          { x: 0, y: -5, z: 2.6 },
        ],
      },
    ],
  },
};

export function waterfallMesh(content: Group, name: string) {
  const object = content.getObjectByName(name);
  if (!(object instanceof Mesh) || !(object.material instanceof MeshStandardMaterial))
    throw new TypeError(`Missing standard water mesh: ${name}`);
  return object;
}

export function waterfallBatch(content: Group, name: string): InstancedMesh {
  const object = waterfallMesh(content, `waterfalls:${name}`);
  if (!(object instanceof InstancedMesh)) throw new TypeError(`Missing waterfall batch: ${name}`);
  return object;
}
