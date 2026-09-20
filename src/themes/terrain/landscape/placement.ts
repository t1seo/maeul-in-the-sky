import { clamp, hash } from '../../../utils/math.js';
import { classifyBiome, type LandscapeHeightField } from './heightfield.js';
import { landComponents, type LandscapeMesh } from './mesh.js';
import { sampleTriangle } from './sampling.js';
import type {
  LandscapePlot,
  LandscapePoint,
  LandscapeRiver,
  LandscapeSite,
  LandscapeTriangle,
} from './types.js';

const distance = (a: LandscapePoint, b: LandscapePoint): number => Math.hypot(a.x - b.x, a.z - b.z);
const fraction = (value: number): number => value - Math.floor(value);

export function createMoistureField(
  field: LandscapeHeightField,
  rivers: readonly LandscapeRiver[],
): (point: LandscapePoint) => number {
  const water = rivers.flatMap((river) => river.points);
  return (point) => {
    const nearest = water.reduce(
      (best, sample) => Math.min(best, distance(point, sample)),
      Infinity,
    );
    return clamp(field.moisture(point.x, point.z) + Math.exp(-nearest / 2.7) * 0.38, 0, 1);
  };
}

export function createSites(
  mesh: LandscapeMesh,
  moistureAt: (point: LandscapePoint) => number,
  relief: number,
): readonly LandscapeSite[] {
  const components = landComponents(mesh);
  return mesh.vertices.flatMap((point, index) => {
    if (point.elevation <= 0.12 * relief) return [];
    const slope = Math.max(
      ...mesh.neighbors[index].map((neighbor) => {
        const other = mesh.vertices[neighbor];
        return Math.abs(other.elevation - point.elevation) / distance(point, other);
      }),
    );
    const moisture = moistureAt(point);
    return [
      {
        ...point,
        slope,
        moisture,
        component: components[index],
        biome: classifyBiome(point.elevation, slope, moisture, relief),
      },
    ];
  });
}

function spreadSites(
  candidates: readonly LandscapeSite[],
  count: number,
  separation: number,
): readonly LandscapeSite[] {
  const selected: LandscapeSite[] = [];
  for (const site of candidates) {
    if (selected.every((other) => distance(site, other) >= separation)) selected.push(site);
    if (selected.length === count) break;
  }
  return selected;
}

export function findLandmarks(
  sites: readonly LandscapeSite[],
  rivers: readonly LandscapeRiver[],
  relief: number,
): {
  readonly settlements: readonly LandscapeSite[];
  readonly peaks: readonly LandscapeSite[];
} {
  const riverPoints = rivers.flatMap((river) => river.points);
  const scored = sites
    .flatMap((site) => {
      if (
        site.slope > 0.3 * relief ||
        site.elevation < 0.48 * relief ||
        site.elevation > 2.5 * relief
      )
        return [];
      const riverDistance = riverPoints.reduce(
        (best, point) => Math.min(best, distance(site, point)),
        Infinity,
      );
      if (riverDistance < 2.2) return [];
      const neighborhood = sites.filter((other) => distance(site, other) < 3.2);
      const broad =
        neighborhood.length >= 25 && neighborhood.every((other) => other.slope <= 0.55 * relief);
      const compact = neighborhood.filter((other) => distance(site, other) < 2.5);
      if (!broad && (compact.length < 14 || compact.some((other) => other.slope > 0.55 * relief)))
        return [];
      const score =
        site.slope * 9 +
        Math.abs(riverDistance - 4) * 0.08 +
        Math.max(0, -site.x - site.z) * 0.025 +
        (broad ? 0 : 10);
      return [{ site, score }];
    })
    .sort((a, b) => a.score - b.score);
  const settlements = spreadSites(
    scored.map((entry) => entry.site),
    3,
    10,
  );
  return {
    settlements,
    peaks: spreadSites(
      [...sites].sort((a, b) => b.elevation - a.elevation),
      5,
      7,
    ),
  };
}

export function placeDays(
  days: readonly { readonly date: string; readonly count: number }[],
  triangles: readonly LandscapeTriangle[],
  seed: number,
): readonly LandscapePlot[] {
  if (days.length === 0) return [];
  const candidates = triangles.filter((face) =>
    face.points.every((point) => point.elevation > 0.12),
  );
  const cumulative: number[] = [];
  let totalArea = 0;
  for (const face of candidates) {
    const [a, b, c] = face.points;
    totalArea += Math.abs((b.x - a.x) * (c.z - a.z) - (c.x - a.x) * (b.z - a.z)) / 2;
    cumulative.push(totalArea);
  }
  const seedOffset = hash(`landscape-days:${seed}`) / 0x100000000;
  return [...days]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => {
      const ordinal = Date.parse(`${day.date}T00:00:00.000Z`) / 86_400_000;
      const target = fraction(ordinal * 0.6180339887498949 + seedOffset) * totalArea;
      let low = 0,
        high = cumulative.length - 1;
      while (low < high) {
        const middle = (low + high) >>> 1;
        if (cumulative[middle] < target) low = middle + 1;
        else high = middle;
      }
      const triangle = candidates[low];
      const [a, b, c] = triangle.points;
      const u = 0.05 + fraction(ordinal * 0.7548776662466927 + seedOffset) * 0.9;
      const v = 0.05 + fraction(ordinal * 0.5698402909980532 + seedOffset) * 0.9;
      const root = Math.sqrt(u),
        wa = 1 - root,
        wb = root * (1 - v),
        wc = root * v;
      const x = a.x * wa + b.x * wb + c.x * wc,
        z = a.z * wa + b.z * wb + c.z * wc;
      const position = sampleTriangle(triangle, x, z);
      if (!position) throw new RangeError('A barycentric date anchor escaped its land triangle');
      return { date: day.date, count: day.count, position };
    });
}
