import {
  Color,
  InstancedMesh,
  MeshStandardMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
} from 'three';
import { part } from '../../world/model/recipes/primitives.js';
import { seededRandom } from '../../utils/math.js';
import { transform } from '../../world/three/geometry/placements.js';
import type { GeometryResources } from '../../world/three/geometry/resources.js';
import type { TourModel } from '../types.js';
import type { createBatches } from './batches.js';
import { cellColor } from './land.js';

export function addScenery(
  model: TourModel,
  batches: ReturnType<typeof createBatches>,
  resources: GeometryResources,
): Group {
  const group = new Group();
  const random = seededRandom(7301);
  const grassy = model.cells.filter((cell) => cell.surface === 'grass' || cell.surface === 'earth');
  const geometry = resources.geometry(new BufferGeometry());
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(
      [
        -0.09, 0, 0, 0.05, 0.38, 0.03, 0.07, 0, 0, 0, 0, -0.09, -0.025, 0.29, 0.03, 0, 0, 0.06,
        -0.1, 0, -0.04, -0.18, 0.24, -0.13, 0.04, 0, 0.03,
      ],
      3,
    ),
  );
  geometry.computeVertexNormals();
  const material = resources.material(
    new MeshStandardMaterial({ color: '#ffffff', roughness: 1, side: 2 }),
  );
  const grass = new InstancedMesh(geometry, material, grassy.length * 12);
  resources.instance(grass);
  let index = 0;
  for (const cell of grassy) {
    for (let blade = 0; blade < 12; blade++) {
      const position = {
        x: cell.x + (random() - 0.5) * 3.9,
        y: 0.015,
        z: cell.z + (random() - 0.5) * 3.9,
      };
      const height = 0.5 + random() * 0.8;
      grass.setMatrixAt(
        index,
        transform(position, { x: 0, y: random() * 6.28, z: 0 }, { x: 1, y: height, z: 1 }),
      );
      grass.setColorAt(index, cellColor(cell).multiplyScalar(0.75 + random() * 0.2));
      index++;
      if (blade < 2 && cell.season === 'spring') {
        batches.add(
          part('sphere', blade === 0 ? '#efbdd0' : '#f8e6ac', [0, 0.17, 0], [0.14, 0.09, 0.14]),
          'flower',
          position,
          1,
          cell.source.date,
        );
      }
    }
  }
  grass.receiveShadow = true;
  group.add(grass);
  const water = new Set(
    model.cells.filter((cell) => cell.surface === 'water').map((cell) => `${cell.x},${cell.z}`),
  );
  for (const cell of model.cells) {
    if (cell.surface === 'water') continue;
    for (const [dx, dz] of [
      [4, 0],
      [-4, 0],
      [0, 4],
      [0, -4],
    ]) {
      if (!water.has(`${cell.x + dx},${cell.z + dz}`)) continue;
      for (let pebble = 0; pebble < 4; pebble++) {
        const along = (pebble - 1.5) * 0.9;
        const size = 0.16 + random() * 0.19;
        batches.add(
          part(
            'sphere',
            new Color('#a3ac9a').multiplyScalar(0.85 + random() * 0.3).getStyle(),
            [0, size * 0.23, 0],
            [size * 1.8, size * 0.75, size],
          ),
          'pebble',
          {
            x: cell.x + dx * 0.46 + (dx === 0 ? along : 0),
            y: 0,
            z: cell.z + dz * 0.46 + (dz === 0 ? along : 0),
          },
          1,
          cell.source.date,
        );
      }
    }
  }
  for (const path of model.paths) {
    path.points.forEach((end, i) => {
      if (i === 0) return;
      const start = path.points[i - 1];
      const length = Math.hypot(end.x - start.x, end.z - start.z);
      for (let distance = 0; distance < length; distance += 0.28) {
        const t = distance / length;
        batches.add(
          part(
            'box',
            '#baa587',
            [0, 0.03, 0],
            [1.1, 0.08, 0.23],
            [0, Math.atan2(end.x - start.x, end.z - start.z), 0],
          ),
          'path',
          { x: start.x + (end.x - start.x) * t, y: 0, z: start.z + (end.z - start.z) * t },
          1,
          path.source.anchorDate,
        );
      }
    });
  }
  return group;
}
