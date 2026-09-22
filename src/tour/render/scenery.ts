import { Color, DoubleSide, InstancedMesh, MeshStandardMaterial, Group } from 'three';
import { part } from '../../world/model/recipes/primitives.js';
import { seededRandom } from '../../utils/math.js';
import { transform } from '../../world/three/geometry/placements.js';
import type { GeometryResources } from '../../world/three/geometry/resources.js';
import type { TourModel } from '../types.js';
import type { createBatches } from './batches.js';
import { cellColor } from './land.js';
import type { ForestWind } from './wind.js';
import { createGrassGeometry } from './wind-grass.js';
import { WIND_PROFILES, windMargin } from './wind-profiles.js';

const ANIMALS = new Set<string>([
  'squirrel',
  'rabbit',
  'lamb',
  'chicken',
  'bird',
  'owl',
  'robinBird',
  'winterBird',
  'cow',
  'deer',
  'fox',
  'horse',
  'donkey',
  'sheep',
  'pigpen',
  'goat',
]);

export function addScenery(
  model: TourModel,
  batches: ReturnType<typeof createBatches>,
  resources: GeometryResources,
  wind?: ForestWind,
): Group {
  const group = new Group();
  const random = seededRandom(7301);
  const grassy = model.cells.filter((cell) => cell.surface === 'grass' || cell.surface === 'earth');
  const geometry = resources.geometry(createGrassGeometry());
  const base = resources.material(
    new MeshStandardMaterial({
      color: '#ffffff',
      roughness: 1,
      side: DoubleSide,
      vertexColors: true,
    }),
  );
  const material = wind ? wind.material(base, 'grass') : base;
  const grass = new InstancedMesh(geometry, material, grassy.length * 24);
  grass.name = 'Meadow grass';
  resources.instance(grass);
  let index = 0;
  for (const cell of grassy) {
    const clearings = model.placements.filter(
      ({ position }) => Math.abs(position.x - cell.x) < 2.6 && Math.abs(position.z - cell.z) < 2.6,
    );
    const density = cell.surface === 'grass' ? 24 : 14;
    for (let blade = 0; blade < density; blade++) {
      const position = {
        x: cell.x + (random() - 0.5) * 3.7,
        y: 0.015,
        z: cell.z + (random() - 0.5) * 3.7,
      };
      const height = 0.65 + random() * 0.7;
      if (
        random() > 0.9 ||
        clearings.some(({ source, position: anchor }) => {
          const radius = ANIMALS.has(source.catalogId) ? 0.55 : 0.4;
          return Math.hypot(position.x - anchor.x, position.z - anchor.z) < radius;
        })
      )
        continue;
      grass.setMatrixAt(
        index,
        transform(position, { x: 0, y: random() * 6.28, z: 0 }, { x: 1, y: height, z: 1 }),
      );
      grass.setColorAt(index, cellColor(cell).multiplyScalar(0.72 + random() * 0.25));
      index++;
      if (blade < 2 && cell.season === 'spring') {
        batches.add(
          part('sphere', blade === 0 ? '#efbdd0' : '#f8e6ac', [0, 0.23, 0], [0.14, 0.09, 0.14]),
          'flower',
          position,
          1,
          cell.source.date,
          false,
          'flower',
        );
        batches.add(
          part('cylinder', '#648853', [0, 0.11, 0], [0.018, 0.22, 0.018]),
          'flower-stem',
          position,
          1,
          cell.source.date,
          false,
          'flower',
        );
      }
    }
  }
  grass.count = index;
  grass.castShadow = true;
  grass.receiveShadow = true;
  grass.computeBoundingSphere();
  if (wind) {
    grass.customDepthMaterial = wind.depth('grass');
    const margin = windMargin(WIND_PROFILES.grass);
    if (grass.boundingSphere) grass.boundingSphere.radius += margin;
    grass.computeBoundingBox();
    grass.boundingBox?.expandByScalar(margin);
  }
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
