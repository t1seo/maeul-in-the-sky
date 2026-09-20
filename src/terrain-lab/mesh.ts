import { seededRandom } from '../utils/math.js';
import { classifyBiome, type HeightField } from './heightfield.js';
import type { CoastEdge, TerrainPoint, TerrainTriangle } from './types.js';

type Face = readonly [number, number, number];
export type TerrainMesh = {
  readonly vertices: readonly TerrainPoint[];
  readonly faces: readonly Face[];
  readonly neighbors: readonly (readonly number[])[];
};

export function createMesh(field: HeightField, seed: number): TerrainMesh {
  const random = seededRandom(seed + 317);
  const columns = 72;
  const rows = 54;
  const vertices: TerrainPoint[] = [];
  const faces: Face[] = [];
  for (let row = 0; row <= rows; row++) {
    for (let column = 0; column <= columns; column++) {
      const x = (column - columns / 2) * 0.9 + (random() - 0.5) * 0.27;
      const z = (row - rows / 2) * 0.9 + (random() - 0.5) * 0.27;
      vertices.push({ x, z, elevation: field.elevation(x, z) });
      if (row === rows || column === columns) continue;
      const a = row * (columns + 1) + column;
      const b = a + 1;
      const c = a + columns + 1;
      const d = c + 1;
      if (random() > 0.5) faces.push([a, b, d], [a, d, c]);
      else faces.push([a, b, c], [b, d, c]);
    }
  }
  const neighbors = vertices.map(() => new Set<number>());
  for (const [a, b, c] of faces) {
    neighbors[a].add(b).add(c);
    neighbors[b].add(a).add(c);
    neighbors[c].add(a).add(b);
  }
  return { vertices, faces, neighbors: neighbors.map((set) => [...set]) };
}

export function seaIntersection(a: TerrainPoint, b: TerrainPoint): TerrainPoint {
  const [first, second] = a.x < b.x || (a.x === b.x && a.z < b.z) ? [a, b] : [b, a];
  const fraction = -first.elevation / (second.elevation - first.elevation);
  return {
    x: first.x + (second.x - first.x) * fraction,
    z: first.z + (second.z - first.z) * fraction,
    elevation: 0,
  };
}

function clipFace(points: readonly TerrainPoint[]): {
  readonly polygon: readonly TerrainPoint[];
  readonly shore: readonly TerrainPoint[];
} {
  const polygon: TerrainPoint[] = [];
  const shore: TerrainPoint[] = [];
  for (const [index, point] of points.entries()) {
    const next = points[(index + 1) % points.length];
    if (point.elevation > 0) polygon.push(point);
    if (point.elevation > 0 !== next.elevation > 0) {
      const crossing = seaIntersection(point, next);
      polygon.push(crossing);
      shore.push(crossing);
    }
  }
  return { polygon, shore };
}

export function buildSurface(
  mesh: TerrainMesh,
  moistureAt: (point: TerrainPoint) => number,
): { readonly triangles: readonly TerrainTriangle[]; readonly coast: readonly CoastEdge[] } {
  const triangles: TerrainTriangle[] = [];
  const coast: CoastEdge[] = [];
  for (const face of mesh.faces) {
    const { polygon, shore } = clipFace(face.map((index) => mesh.vertices[index]));
    if (shore.length === 2) coast.push({ a: shore[0], b: shore[1] });
    for (let index = 1; index + 1 < polygon.length; index++) {
      const points = [polygon[0], polygon[index], polygon[index + 1]] as const;
      const [a, b, c] = points;
      const determinant = (b.x - a.x) * (c.z - a.z) - (c.x - a.x) * (b.z - a.z);
      if (Math.abs(determinant) < 0.0000001) continue;
      const dx =
        ((b.elevation - a.elevation) * (c.z - a.z) - (c.elevation - a.elevation) * (b.z - a.z)) /
        determinant;
      const dz =
        ((c.elevation - a.elevation) * (b.x - a.x) - (b.elevation - a.elevation) * (c.x - a.x)) /
        determinant;
      const elevation = (a.elevation + b.elevation + c.elevation) / 3;
      const moisture = (moistureAt(a) + moistureAt(b) + moistureAt(c)) / 3;
      triangles.push({
        points,
        moisture,
        biome: classifyBiome(elevation, Math.hypot(dx, dz), moisture),
      });
    }
  }
  return { triangles, coast };
}
