import type { LandscapeModel, LandscapePoint } from './types.js';

export interface Point2 {
  readonly x: number;
  readonly y: number;
}

export interface Projection {
  readonly scale: number;
  readonly point: (point: LandscapePoint) => Point2;
}

export interface DrawItem {
  readonly depth: number;
  readonly layer: number;
  readonly markup: string;
}

export const number = (value: number): string => String(Math.round(value * 100) / 100);
export const depth = (point: LandscapePoint): number => point.x + point.z;

const rawPoint = (point: LandscapePoint): Point2 => ({
  x: (point.x - point.z) * 11,
  y: (point.x + point.z) * 5.5 - point.elevation * 10,
});

export function createLandscapeProjection(model: LandscapeModel): Projection {
  const vertices = model.triangles.flatMap((triangle) => triangle.points).map(rawPoint);
  const extent = vertices.reduce(
    (bounds, point) => ({
      left: Math.min(bounds.left, point.x),
      right: Math.max(bounds.right, point.x),
      top: Math.min(bounds.top, point.y),
      bottom: Math.max(bounds.bottom, point.y),
    }),
    { left: 0, right: 0, top: 0, bottom: 0 },
  );
  const top = extent.top - 100;
  const bottom = extent.bottom + 65;
  const scale = Math.min(1090 / (extent.right - extent.left + 60), 620 / (bottom - top));
  return {
    scale,
    point: (point) => {
      const projected = rawPoint(point);
      return {
        x: 600 + (projected.x - (extent.left + extent.right) / 2) * scale,
        y: 430 + (projected.y - (top + bottom) / 2) * scale,
      };
    },
  };
}

export function pointsAttribute(points: readonly LandscapePoint[], projection: Projection): string {
  return points
    .map((point) => {
      const projected = projection.point(point);
      return `${number(projected.x)},${number(projected.y)}`;
    })
    .join(' ');
}

export function segmentPath(points: readonly LandscapePoint[], projection: Projection): string {
  return points
    .map((point, index) => {
      const projected = projection.point(point);
      return `${index ? 'L' : 'M'}${number(projected.x)},${number(projected.y)}`;
    })
    .join('');
}
