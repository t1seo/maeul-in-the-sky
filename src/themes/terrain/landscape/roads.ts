import { createLandscapeRouter } from './road-graph.js';
import { sampleLandscape } from './sampling.js';
import { groundDistance } from './settlement-geometry.js';
import type {
  LandscapeModel,
  LandscapePoint,
  LandscapeRoad,
  LandscapeSite,
  LandscapeTown,
} from './types.js';

function crossing(
  a: LandscapePoint,
  b: LandscapePoint,
  c: LandscapePoint,
  d: LandscapePoint,
): number | undefined {
  const denominator = (b.x - a.x) * (d.z - c.z) - (b.z - a.z) * (d.x - c.x);
  if (Math.abs(denominator) < 1e-8) return undefined;
  const t = ((c.x - a.x) * (d.z - c.z) - (c.z - a.z) * (d.x - c.x)) / denominator;
  const u = ((c.x - a.x) * (b.z - a.z) - (c.z - a.z) * (b.x - a.x)) / denominator;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? t : undefined;
}

function bridges(
  model: LandscapeModel,
  points: readonly LandscapePoint[],
): readonly (readonly [LandscapePoint, LandscapePoint])[] {
  const result: (readonly [LandscapePoint, LandscapePoint])[] = [];
  const centers: LandscapePoint[] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i];
    for (const river of model.rivers) {
      for (let j = 1; j < river.points.length; j++) {
        const c = river.points[j - 1],
          d = river.points[j];
        const t = crossing(a, b, c, d);
        if (t === undefined) continue;
        const center = {
          x: a.x + (b.x - a.x) * t,
          z: a.z + (b.z - a.z) * t,
          elevation: a.elevation + (b.elevation - a.elevation) * t,
        };
        if (centers.some((point) => groundDistance(point, center) < river.width + 0.7)) continue;
        const length = groundDistance(a, b),
          riverLength = groundDistance(c, d);
        const sine =
          Math.abs((b.x - a.x) * (d.z - c.z) - (b.z - a.z) * (d.x - c.x)) / (length * riverLength);
        const half = Math.min(3, (river.width * 0.65 + 0.35) / Math.max(0.25, sine));
        const from = sampleLandscape(
          model,
          center.x - ((b.x - a.x) * half) / length,
          center.z - ((b.z - a.z) * half) / length,
        );
        const to = sampleLandscape(
          model,
          center.x + ((b.x - a.x) * half) / length,
          center.z + ((b.z - a.z) * half) / length,
        );
        if (!from || !to || from.component !== to.component) continue;
        centers.push(center);
        result.push([
          { ...from, elevation: from.elevation + 0.12 },
          { ...to, elevation: to.elevation + 0.12 },
        ]);
      }
    }
  }
  return result;
}

export function planLandscapeRoads(
  model: LandscapeModel,
  towns: readonly LandscapeTown[],
): readonly LandscapeRoad[] {
  if (!towns.length) return [];
  const route = createLandscapeRouter(model);
  const result: LandscapeRoad[] = [];
  const add = (id: string, from: LandscapeSite, to: LandscapeSite, width: number): void => {
    const points = route(from, to);
    if (points.length > 1) result.push({ id, points, width, bridges: bridges(model, points) });
  };
  for (const [index, town] of towns.entries()) {
    const earlier = towns
      .slice(0, index)
      .filter((other) => other.center.component === town.center.component);
    const neighbor = earlier.sort(
      (a, b) => groundDistance(a.center, town.center) - groundDistance(b.center, town.center),
    )[0];
    if (neighbor) add(`road:${neighbor.id}:${town.id}`, neighbor.center, town.center, 0.62);
    for (const [dx, dz] of [
      [-6.5, 0],
      [6.5, 0],
      [0, -5.5],
      [0, 5.5],
    ] as const) {
      const end = sampleLandscape(model, town.center.x + dx, town.center.z + dz);
      if (end && end.component === town.center.component)
        add(`lane:${town.id}:${dx}:${dz}`, town.center, end, 0.38);
    }
  }
  return result;
}
