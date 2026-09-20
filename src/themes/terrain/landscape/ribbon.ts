import { number, type Point2, type Projection } from './projection.js';
import type { LandscapePoint } from './types.js';

interface Station {
  readonly point: Point2;
  readonly normal: Point2;
  readonly width: number;
}

export interface LandscapeRibbon {
  readonly border: string;
  readonly body: string;
  readonly center: string;
}

function strip(a: Station, b: Station, extra: number, fraction: number): string {
  const edges: readonly (readonly [Station, number])[] = [
    [a, -1],
    [b, -1],
    [b, 1],
    [a, 1],
  ];
  return edges
    .map(([station, side]) => {
      const radius = (station.width * fraction + extra) / 2;
      return `${number(station.point.x + station.normal.x * radius * side)},${number(station.point.y + station.normal.y * radius * side)}`;
    })
    .join(' ');
}

export function surfaceRibbons(
  source: readonly LandscapePoint[],
  projection: Projection,
  widthAt: (index: number, total: number) => number,
  border: number,
): readonly LandscapeRibbon[] {
  const points = source.map(projection.point);
  const stations = points.map((point, index): Station => {
    const before = points[Math.max(0, index - 1)],
      after = points[Math.min(points.length - 1, index + 1)];
    const dx = after.x - before.x,
      dy = after.y - before.y,
      length = Math.hypot(dx, dy) || 1;
    return {
      point,
      normal: { x: -dy / length, y: dx / length },
      width: widthAt(index, points.length),
    };
  });
  return stations.slice(1).map((station, index) => ({
    border: strip(stations[index], station, border, 1),
    body: strip(stations[index], station, 0, 1),
    center: strip(stations[index], station, 0, 0.12),
  }));
}
