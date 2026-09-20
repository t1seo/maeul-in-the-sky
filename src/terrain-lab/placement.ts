import type { ContributionDay } from '../core/types.js';
import { clamp, hash } from '../utils/math.js';
import { classifyBiome, type HeightField } from './heightfield.js';
import type { TerrainMesh } from './mesh.js';
import type { DayPlot, TerrainPoint, TerrainRiver, TerrainSite } from './types.js';

const squaredDistance = (a: TerrainPoint, b: TerrainPoint): number =>
  (a.x - b.x) ** 2 + (a.z - b.z) ** 2;

export function createMoistureField(
  field: HeightField,
  rivers: readonly TerrainRiver[],
): (point: TerrainPoint) => number {
  const water = rivers.flatMap((river) => river.points);
  return (point) => {
    const distance = Math.sqrt(
      water.reduce(
        (nearest, sample) => Math.min(nearest, squaredDistance(point, sample)),
        Infinity,
      ),
    );
    return clamp(field.moisture(point.x, point.z) + Math.exp(-distance / 3) * 0.24, 0, 1);
  };
}

export function createSites(
  mesh: TerrainMesh,
  moistureAt: (point: TerrainPoint) => number,
): readonly TerrainSite[] {
  return mesh.vertices.flatMap((point, index) => {
    if (point.elevation <= 0.12) return [];
    const neighbors = mesh.neighbors[index].map((other) => mesh.vertices[other]);
    const slope = Math.max(
      ...neighbors.map(
        (neighbor) =>
          Math.abs(neighbor.elevation - point.elevation) /
          Math.sqrt(squaredDistance(neighbor, point)),
      ),
    );
    const moisture = moistureAt(point);
    return [{ ...point, moisture, slope, biome: classifyBiome(point.elevation, slope, moisture) }];
  });
}

function spreadSites(
  candidates: readonly TerrainSite[],
  count: number,
  separation: number,
): readonly TerrainSite[] {
  const selected: TerrainSite[] = [];
  for (const site of candidates) {
    if (selected.every((other) => squaredDistance(site, other) >= separation ** 2))
      selected.push(site);
    if (selected.length === count) break;
  }
  return selected;
}

export function findLandmarks(sites: readonly TerrainSite[]): {
  readonly settlements: readonly TerrainSite[];
  readonly peaks: readonly TerrainSite[];
} {
  const lowlands = sites
    .filter((site) => site.elevation > 0.5 && site.elevation < 3 && site.slope < 0.9)
    .sort((a, b) => a.slope - a.moisture * 0.12 - (b.slope - b.moisture * 0.12));
  return {
    settlements: spreadSites(lowlands, 3, 10),
    peaks: spreadSites(
      [...sites].sort((a, b) => b.elevation - a.elevation),
      4,
      12,
    ),
  };
}

export function placeDays(
  days: readonly ContributionDay[],
  sites: readonly TerrainSite[],
  seed: number,
): readonly DayPlot[] {
  if (days.length === 0) return [];
  const candidates = [...sites].sort(
    (a, b) => hash(`${seed}:${a.x}:${a.z}`) - hash(`${seed}:${b.x}:${b.z}`),
  );
  const nearest = candidates.map(() => Infinity);
  const anchors: TerrainSite[] = [];
  let selected = 0;
  for (let index = 0; index < days.length; index++) {
    const anchor = candidates[selected];
    if (!anchor) break;
    anchors.push(anchor);
    let farthest = -1;
    for (const [candidateIndex, candidate] of candidates.entries()) {
      nearest[candidateIndex] = Math.min(
        nearest[candidateIndex],
        squaredDistance(anchor, candidate),
      );
      if (nearest[candidateIndex] > farthest) {
        farthest = nearest[candidateIndex];
        selected = candidateIndex;
      }
    }
  }
  return [...days]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day, index) => ({ date: day.date, count: day.count, position: anchors[index] }));
}
