import { groundDistance, groundPolygon, riverDistance } from './settlement-geometry.js';
import type { LandscapeModel, LandscapePoint, LandscapeSite } from './types.js';

interface LandSuitability {
  readonly riverClearance: (point: LandscapePoint) => number;
  readonly buildable: (site: LandscapeSite, radius: number) => boolean;
  readonly buildingSites: (radius: number, component?: number) => readonly LandscapeSite[];
  readonly habitatSites: (component: number, water: boolean) => readonly LandscapeSite[];
}
const suitability = new WeakMap<LandscapeModel, LandSuitability>();

export function landSuitability(model: LandscapeModel): LandSuitability {
  const previous = suitability.get(model);
  if (previous) return previous;
  const riverDistances = new WeakMap<LandscapePoint, number>();
  const pools = new Map<string, readonly LandscapeSite[]>();
  const riverClearance = (point: LandscapePoint): number => {
    const known = riverDistances.get(point);
    if (known !== undefined) return known;
    const distance = riverDistance(model, point);
    riverDistances.set(point, distance);
    return distance;
  };
  const buildable = (site: LandscapeSite, radius: number): boolean => {
    if (site.slope > 0.95 || site.elevation < 0.25 || riverClearance(site) < radius + 0.2)
      return false;
    const corners = groundPolygon(model, site, [
      [-radius, 0],
      [0, -radius],
      [radius, 0],
      [0, radius],
    ]);
    return (
      corners.length > 0 &&
      corners.every((point) => Math.abs(point.elevation - site.elevation) < 0.65)
    );
  };
  const cached = (
    key: string,
    select: (point: LandscapeSite) => boolean,
  ): readonly LandscapeSite[] => {
    const known = pools.get(key);
    if (known) return known;
    const candidates = model.sites.filter(select);
    pools.set(key, candidates);
    return candidates;
  };
  const result = {
    riverClearance,
    buildable,
    buildingSites: (radius: number, component?: number): readonly LandscapeSite[] =>
      cached(
        `build:${radius}:${component ?? '*'}`,
        (point) =>
          (component === undefined || point.component === component) && buildable(point, radius),
      ),
    habitatSites: (component: number, water: boolean): readonly LandscapeSite[] =>
      cached(
        `habitat:${component}:${water}`,
        (point) =>
          point.component === component &&
          (water ? riverClearance(point) < 0.6 : riverClearance(point) > 0.35),
      ),
  };
  suitability.set(model, result);
  return result;
}

export interface ParcelClearance {
  readonly available: (point: LandscapePoint, radius: number) => boolean;
  readonly reserve: (point: LandscapePoint, radius: number) => void;
  readonly version: () => number;
}

export function createParcelClearance(): ParcelClearance {
  const buckets = new Map<string, { readonly point: LandscapePoint; readonly radius: number }[]>();
  let largestRadius = 0,
    version = 0;
  const key = (x: number, z: number): string => `${x}:${z}`;
  return {
    version: () => version,
    reserve: (point, radius) => {
      const cell = key(Math.floor(point.x / 4), Math.floor(point.z / 4));
      const entries = buckets.get(cell) ?? [];
      entries.push({ point, radius });
      buckets.set(cell, entries);
      largestRadius = Math.max(largestRadius, radius);
      version++;
    },
    available: (point, radius) => {
      const extent = Math.ceil((radius + largestRadius) / 4);
      const x = Math.floor(point.x / 4),
        z = Math.floor(point.z / 4);
      for (let dx = -extent; dx <= extent; dx++) {
        for (let dz = -extent; dz <= extent; dz++) {
          if (
            (buckets.get(key(x + dx, z + dz)) ?? []).some(
              (other) => groundDistance(other.point, point) <= other.radius + radius,
            )
          )
            return false;
        }
      }
      return true;
    },
  };
}

export function nearestSite(
  candidates: readonly LandscapeSite[],
  target: LandscapePoint,
  available: (point: LandscapeSite) => boolean = () => true,
): LandscapeSite | undefined {
  let chosen: LandscapeSite | undefined,
    nearest = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    const distance = groundDistance(candidate, target);
    if (distance < nearest && available(candidate)) {
      chosen = candidate;
      nearest = distance;
    }
  }
  return chosen;
}
