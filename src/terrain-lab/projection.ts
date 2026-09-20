import type { TerrainModel, TerrainPoint } from './types.js';

export type Lighting = 'day' | 'night';
export interface Point2 {
  readonly x: number;
  readonly y: number;
}
export interface Projection {
  readonly scale: number;
  readonly point: (point: TerrainPoint) => Point2;
}
export interface DrawItem {
  readonly depth: number;
  readonly layer: number;
  readonly markup: string;
}

export const number = (value: number): string => value.toFixed(2);
const raw = (point: TerrainPoint): Point2 => ({
  x: (point.x - point.z) * 11,
  y: (point.x + point.z) * 5.5 - point.elevation * 10,
});

export function createProjection(model: TerrainModel): Projection {
  const vertices = [
    ...model.triangles.flatMap((face) => face.points),
    ...model.coast.map((edge) => ({ ...edge.a, elevation: -9 })),
  ].map(raw);
  const left = Math.min(...vertices.map((point) => point.x));
  const right = Math.max(...vertices.map((point) => point.x));
  const top = Math.min(...vertices.map((point) => point.y)) - 85;
  const bottom = Math.max(...vertices.map((point) => point.y)) + 20;
  const scale = Math.min(1090 / (right - left + 50), 700 / (bottom - top));
  return {
    scale,
    point: (point) => {
      const projected = raw(point);
      return {
        x: 600 + (projected.x - (left + right) / 2) * scale,
        y: 415 + (projected.y - (top + bottom) / 2) * scale,
      };
    },
  };
}

export function pointsAttribute(points: readonly TerrainPoint[], projection: Projection): string {
  return points
    .map((point) => {
      const p = projection.point(point);
      return `${number(p.x)},${number(p.y)}`;
    })
    .join(' ');
}

export function segmentPath(points: readonly TerrainPoint[], projection: Projection): string {
  return points
    .map((point, index) => {
      const p = projection.point(point);
      return `${index ? 'L' : 'M'}${number(p.x)},${number(p.y)}`;
    })
    .join(' ');
}

export function depth(point: TerrainPoint): number {
  return point.x + point.z;
}

export function shade(hex: string, multiplier: number): string {
  const channels = [1, 3, 5].map((offset) =>
    Math.max(
      0,
      Math.min(255, Math.round(parseInt(hex.slice(offset, offset + 2), 16) * multiplier)),
    ),
  );
  return `rgb(${channels.join(',')})`;
}
