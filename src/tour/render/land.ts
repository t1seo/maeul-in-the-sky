import { BufferGeometry, Color, Float32BufferAttribute, Mesh, MeshStandardMaterial } from 'three';
import type { TourCell, TourModel } from '../types.js';
import type { GeometryResources } from '../../world/three/geometry/resources.js';

const PALETTE = {
  grass: { spring: '#96b876', summer: '#7da468', autumn: '#b39a68', winter: '#aab7ae' },
  earth: '#b1a079',
  snow: '#e1e9de',
  water: '#688c7b',
  ice: '#afcfd1',
} as const;

export function cellColor(cell: TourCell): Color {
  const base = new Color(
    cell.surface === 'grass' ? PALETTE.grass[cell.season] : PALETTE[cell.surface],
  );
  const variation = Math.sin(cell.x * 71.37 + cell.z * 13.17) * 0.017;
  return base.offsetHSL(variation * 0.2, variation, variation);
}

export function createLand(model: TourModel, resources: GeometryResources): Mesh {
  const positions: number[] = [];
  const colors: number[] = [];
  const quad = (points: readonly (readonly number[])[], color: Color): void => {
    for (const index of [0, 1, 2, 0, 2, 3]) {
      positions.push(...points[index]);
      colors.push(color.r, color.g, color.b);
    }
  };
  const cells = new Map(model.cells.map((cell) => [`${cell.x},${cell.z}`, cell]));
  for (const cell of model.cells) {
    const { x, z } = cell;
    const depth = Math.max(0.16, cell.depth);
    const top = cell.surface === 'water' ? -0.15 : 0;
    quad(
      [
        [x - 2, top, z + 2],
        [x + 2, top, z + 2],
        [x + 2, top, z - 2],
        [x - 2, top, z - 2],
      ],
      cellColor(cell),
    );
    const corners = [
      [-2, -2],
      [2, -2],
      [2, 2],
      [-2, 2],
    ];
    for (let side = 0; side < 4; side++) {
      const [ax, az] = corners[side];
      const [bx, bz] = corners[(side + 1) % 4];
      const neighbor = cells.get(`${x + ax + bx},${z + az + bz}`);
      if (neighbor && neighbor.depth >= depth) continue;
      const from = neighbor ? -Math.max(0.16, neighbor.depth) : top;
      const soil = new Color(cell.season === 'winter' ? '#7d9391' : '#867967');
      const bands = 3;
      for (let band = 0; band < bands; band++) {
        const y1 = from + ((-depth - from) * band) / bands;
        const y2 = from + ((-depth - from) * (band + 1)) / bands;
        const tint = soil.clone().multiplyScalar(1 - band * 0.1 + Math.sin(x + z + side) * 0.06);
        quad(
          [
            [x + ax, y1, z + az],
            [x + bx, y1, z + bz],
            [x + bx, y2, z + bz],
            [x + ax, y2, z + az],
          ],
          tint,
        );
      }
    }
    quad(
      [
        [x - 2, -depth, z - 2],
        [x + 2, -depth, z - 2],
        [x + 2, -depth, z + 2],
        [x - 2, -depth, z + 2],
      ],
      new Color('#645e54'),
    );
  }
  const geometry = resources.geometry(new BufferGeometry());
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const mesh = new Mesh(
    geometry,
    resources.material(new MeshStandardMaterial({ vertexColors: true, roughness: 1 })),
  );
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  mesh.name = 'Calendar terrain';
  return mesh;
}
