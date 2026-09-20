import { faceSlope } from './mesh.js';
import type { LandscapeModel, LandscapeSite, LandscapeTriangle } from './types.js';

const CELL_SIZE = 2;
const indexes = new WeakMap<LandscapeModel, ReadonlyMap<string, readonly LandscapeTriangle[]>>();
const cellKey = (x: number, z: number): string =>
  `${Math.floor(x / CELL_SIZE)}:${Math.floor(z / CELL_SIZE)}`;

export function sampleTriangle(
  face: LandscapeTriangle,
  x: number,
  z: number,
): LandscapeSite | undefined {
  const [a, b, c] = face.points;
  const determinant = (b.z - c.z) * (a.x - c.x) + (c.x - b.x) * (a.z - c.z);
  const wa = ((b.z - c.z) * (x - c.x) + (c.x - b.x) * (z - c.z)) / determinant;
  const wb = ((c.z - a.z) * (x - c.x) + (a.x - c.x) * (z - c.z)) / determinant;
  const wc = 1 - wa - wb;
  if (wa < -1e-8 || wb < -1e-8 || wc < -1e-8) return undefined;
  return {
    x,
    z,
    elevation: Math.max(0, a.elevation * wa + b.elevation * wb + c.elevation * wc),
    slope: faceSlope(face.points),
    moisture: face.moisture,
    biome: face.biome,
    component: face.component,
  };
}

function spatialIndex(model: LandscapeModel): ReadonlyMap<string, readonly LandscapeTriangle[]> {
  const cached = indexes.get(model);
  if (cached) return cached;
  const index = new Map<string, LandscapeTriangle[]>();
  for (const face of model.triangles) {
    const minX = Math.floor(Math.min(...face.points.map((point) => point.x)) / CELL_SIZE);
    const maxX = Math.floor(Math.max(...face.points.map((point) => point.x)) / CELL_SIZE);
    const minZ = Math.floor(Math.min(...face.points.map((point) => point.z)) / CELL_SIZE);
    const maxZ = Math.floor(Math.max(...face.points.map((point) => point.z)) / CELL_SIZE);
    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        const key = `${x}:${z}`,
          faces = index.get(key) ?? [];
        faces.push(face);
        index.set(key, faces);
      }
    }
  }
  indexes.set(model, index);
  return index;
}

export function sampleLandscape(
  model: LandscapeModel,
  x: number,
  z: number,
): LandscapeSite | undefined {
  const candidates = spatialIndex(model).get(cellKey(x, z)) ?? [];
  for (const triangle of candidates) {
    const site = sampleTriangle(triangle, x, z);
    if (site) return site;
  }
  return undefined;
}
