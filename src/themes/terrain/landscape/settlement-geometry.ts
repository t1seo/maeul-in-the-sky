import { sampleLandscape } from './sampling.js';
import type { LandscapeModel, LandscapePoint, LandscapeSite } from './types.js';

export const groundDistance = (a: LandscapePoint, b: LandscapePoint): number =>
  Math.hypot(a.x - b.x, a.z - b.z);

export function segmentDistance(
  point: LandscapePoint,
  a: LandscapePoint,
  b: LandscapePoint,
): number {
  const dx = b.x - a.x,
    dz = b.z - a.z;
  const length = dx * dx + dz * dz;
  const t =
    length === 0
      ? 0
      : Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.z - a.z) * dz) / length));
  return Math.hypot(point.x - a.x - dx * t, point.z - a.z - dz * t);
}

export function riverDistance(model: LandscapeModel, point: LandscapePoint): number {
  let nearest = Number.POSITIVE_INFINITY;
  for (const river of model.rivers) {
    for (let i = 1; i < river.points.length; i++) {
      nearest = Math.min(
        nearest,
        segmentDistance(point, river.points[i - 1], river.points[i]) - river.width * 0.5,
      );
    }
  }
  return nearest;
}

export function groundLine(
  model: LandscapeModel,
  from: LandscapeSite,
  to: LandscapeSite,
): readonly LandscapeSite[] {
  if (from.component !== to.component) return [];
  const steps = Math.max(1, Math.ceil(groundDistance(from, to) / 0.35));
  const points: LandscapeSite[] = [];
  for (let i = 0; i <= steps; i++) {
    const point = sampleLandscape(
      model,
      from.x + ((to.x - from.x) * i) / steps,
      from.z + ((to.z - from.z) * i) / steps,
    );
    if (!point || point.elevation <= 0.025 || point.component !== from.component) return [];
    points.push(point);
  }
  return points;
}

export function groundPolygon(
  model: LandscapeModel,
  center: LandscapeSite,
  offsets: readonly (readonly [number, number])[],
): readonly LandscapeSite[] {
  const points: LandscapeSite[] = [];
  for (const [x, z] of offsets) {
    const point = sampleLandscape(model, center.x + x, center.z + z);
    if (!point || point.component !== center.component || point.elevation < 0.12) return [];
    points.push(point);
  }
  return points.every(
    (point, index) => groundLine(model, point, points[(index + 1) % points.length]).length > 0,
  )
    ? points
    : [];
}
