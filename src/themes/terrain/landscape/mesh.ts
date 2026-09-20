import { seededRandom } from '../../../utils/math.js';
import { classifyBiome, type LandscapeHeightField } from './heightfield.js';
import type { LandscapeCoast, LandscapePoint, LandscapeTriangle } from './types.js';

type Face = readonly [number, number, number];
export interface LandscapeMesh {
  readonly vertices: readonly LandscapePoint[];
  readonly faces: readonly Face[];
  readonly neighbors: readonly (readonly number[])[];
}

export function landComponents(mesh: LandscapeMesh): readonly number[] {
  const components = mesh.vertices.map(() => -1);
  const groups: number[][] = [];
  for (const [index, point] of mesh.vertices.entries()) {
    if (point.elevation <= 0 || components[index] >= 0) continue;
    const id = groups.length;
    const group = [index];
    components[index] = id;
    for (let next = 0; next < group.length; next++) {
      for (const neighbor of mesh.neighbors[group[next]]) {
        if (components[neighbor] >= 0 || mesh.vertices[neighbor].elevation <= 0) continue;
        components[neighbor] = id;
        group.push(neighbor);
      }
    }
    groups.push(group);
  }
  const order = groups
    .map((group, id) => ({ size: group.length, id }))
    .sort((a, b) => b.size - a.size);
  const ordered = new Map(order.map((group, index) => [group.id, index]));
  return components.map((id) => ordered.get(id) ?? -1);
}

export function createMesh(field: LandscapeHeightField, seed: number): LandscapeMesh {
  const random = seededRandom(seed + 317);
  const columns = 76,
    rows = 60,
    spacing = 0.9;
  const vertices: LandscapePoint[] = [],
    faces: Face[] = [];
  for (let row = 0; row <= rows; row++) {
    for (let column = 0; column <= columns; column++) {
      const x = (column - columns / 2) * spacing + (random() - 0.5) * 0.32;
      const z = (row - rows / 2) * spacing + (random() - 0.5) * 0.32;
      vertices.push({ x, z, elevation: field.elevation(x, z) });
      if (row === rows || column === columns) continue;
      const a = row * (columns + 1) + column,
        b = a + 1,
        c = a + columns + 1,
        d = c + 1;
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
  const mesh = { vertices, faces, neighbors: neighbors.map((set) => [...set]) };
  const components = landComponents(mesh);
  const sizes = new Map<number, number>();
  for (const component of components) sizes.set(component, (sizes.get(component) ?? 0) + 1);
  return {
    ...mesh,
    vertices: vertices.map((point, index) =>
      components[index] >= 0 && (sizes.get(components[index]) ?? 0) < 8
        ? { ...point, elevation: -point.elevation }
        : point,
    ),
  };
}

export function seaIntersection(a: LandscapePoint, b: LandscapePoint): LandscapePoint {
  const [first, second] = a.x < b.x || (a.x === b.x && a.z < b.z) ? [a, b] : [b, a];
  const fraction = -first.elevation / (second.elevation - first.elevation);
  return {
    x: first.x + (second.x - first.x) * fraction,
    z: first.z + (second.z - first.z) * fraction,
    elevation: 0,
  };
}

function clipFace(points: readonly LandscapePoint[]): {
  readonly polygon: readonly LandscapePoint[];
  readonly shore: readonly LandscapePoint[];
} {
  const polygon: LandscapePoint[] = [],
    shore: LandscapePoint[] = [];
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

export function faceSlope(
  points: readonly [LandscapePoint, LandscapePoint, LandscapePoint],
): number {
  const [a, b, c] = points;
  const determinant = (b.x - a.x) * (c.z - a.z) - (c.x - a.x) * (b.z - a.z);
  const dx =
    ((b.elevation - a.elevation) * (c.z - a.z) - (c.elevation - a.elevation) * (b.z - a.z)) /
    determinant;
  const dz =
    ((c.elevation - a.elevation) * (b.x - a.x) - (b.elevation - a.elevation) * (c.x - a.x)) /
    determinant;
  return Math.hypot(dx, dz);
}

export function buildSurface(
  mesh: LandscapeMesh,
  moistureAt: (point: LandscapePoint) => number,
  relief: number,
): {
  readonly triangles: readonly LandscapeTriangle[];
  readonly coast: readonly LandscapeCoast[];
} {
  const triangles: LandscapeTriangle[] = [],
    coast: LandscapeCoast[] = [];
  const components = landComponents(mesh);
  for (const face of mesh.faces) {
    const { polygon, shore } = clipFace(face.map((index) => mesh.vertices[index]));
    if (shore.length === 2) coast.push({ a: shore[0], b: shore[1] });
    const component = Math.max(...face.map((index) => components[index]));
    for (let index = 1; index + 1 < polygon.length; index++) {
      const points = [polygon[0], polygon[index], polygon[index + 1]] as const;
      const [a, b, c] = points;
      if (Math.abs((b.x - a.x) * (c.z - a.z) - (c.x - a.x) * (b.z - a.z)) < 1e-7) continue;
      const elevation = (a.elevation + b.elevation + c.elevation) / 3;
      const moisture = (moistureAt(a) + moistureAt(b) + moistureAt(c)) / 3;
      triangles.push({
        points,
        moisture,
        component,
        biome: classifyBiome(elevation, faceSlope(points), moisture, relief),
      });
    }
  }
  return { triangles, coast };
}
