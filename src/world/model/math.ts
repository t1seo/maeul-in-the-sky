import type { Vec3, WorldBounds } from './types.js';

export function hashKey(key: string): number {
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1)
    hash = Math.imul(hash ^ key.charCodeAt(index), 16777619);
  return hash >>> 0;
}

export function digest(value: unknown): string {
  const text = JSON.stringify(value);
  return `${hashKey(text).toString(16).padStart(8, '0')}${hashKey(`world-v1:${text}`).toString(16).padStart(8, '0')}`;
}

export function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
}

export function pathLength(points: readonly Vec3[]): number {
  return points.slice(1).reduce((sum, point, index) => sum + distance(points[index], point), 0);
}

export function boundsOf(points: readonly Vec3[], padding = 0): WorldBounds {
  return {
    min: {
      x: Math.min(...points.map((point) => point.x)) - padding,
      y: Math.min(...points.map((point) => point.y)) - padding,
      z: Math.min(...points.map((point) => point.z)) - padding,
    },
    max: {
      x: Math.max(...points.map((point) => point.x)) + padding,
      y: Math.max(...points.map((point) => point.y)) + padding,
      z: Math.max(...points.map((point) => point.z)) + padding,
    },
  };
}

export function centerOf(bounds: WorldBounds): Vec3 {
  return {
    x: (bounds.min.x + bounds.max.x) / 2,
    y: (bounds.min.y + bounds.max.y) / 2,
    z: (bounds.min.z + bounds.max.z) / 2,
  };
}
