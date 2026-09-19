import { ShapeUtils, Vector2 } from 'three';
import type { Vec3, WorldWaterway } from '../../model/types.js';
import type { WaterBuffer, WaterVertex } from './water-buffer.js';

export function addStream(
  buffer: WaterBuffer,
  points: readonly Vec3[],
  width: number,
  elevation: number,
  offset = 0,
  bands: readonly number[] = [-0.5, -0.32, 0, 0.32, 0.5],
  fallback: readonly [number, number] = [0, 1],
): void {
  const distinct = points.filter((point, index) => {
    const previous = points[index - 1];
    return (
      !previous ||
      Math.hypot(point.x - previous.x, point.y - previous.y, point.z - previous.z) > 0.00001
    );
  });
  let length = 0;
  let previous: readonly WaterVertex[] = [];
  for (const [index, point] of distinct.entries()) {
    const before = distinct[index - 1] ?? point;
    const after = distinct[index + 1] ?? point;
    length += Math.hypot(point.x - before.x, point.y - before.y, point.z - before.z);
    const dx = after.x - before.x;
    const dz = after.z - before.z;
    const distance = Math.hypot(dx, dz);
    const x = distance ? dz / distance : fallback[1];
    const z = distance ? -dx / distance : -fallback[0];
    const section = bands.map((side): WaterVertex => ({
      point: {
        x: point.x + x * (side * width + offset),
        y: point.y + elevation,
        z: point.z + z * (side * width + offset),
      },
      uv: [side + 0.5, length / 2.8],
      depth: Math.max(0, 1 - Math.abs(side) * 2) ** 0.55,
    }));
    for (let band = 0; band < section.length - 1; band += 1) {
      const a = previous[band];
      const b = section[band];
      const c = section[band + 1];
      const d = previous[band + 1];
      if (a && b && c && d) buffer.quad(a, b, c, d);
    }
    previous = section;
  }
}

export function addPond(buffer: WaterBuffer, waterway: WorldWaterway): void {
  const first = waterway.points[0];
  const points = waterway.points.filter(
    (point, index) =>
      index === 0 ||
      index !== waterway.points.length - 1 ||
      !first ||
      Math.hypot(point.x - first.x, point.z - first.z) > 0.000001,
  );
  const center = points.reduce(
    (sum, point) => ({
      x: sum.x + point.x / points.length,
      y: sum.y + point.y / points.length,
      z: sum.z + point.z / points.length,
    }),
    { x: 0, y: 0, z: 0 },
  );
  const radius = Math.max(
    ...points.map((point) => Math.hypot(point.x - center.x, point.z - center.z)),
  );
  const vertex = (point: Vec3, depth: number): WaterVertex => ({
    point: { ...point, y: point.y + 0.055 },
    uv: [(point.x - center.x) / (radius * 2) + 0.5, (point.z - center.z) / 2.8],
    depth,
  });
  const ring = ShapeUtils.isClockWise(points.map((point) => new Vector2(point.x, point.z)))
    ? points
    : [...points].reverse();
  const inner = ring.map((point) => ({
    x: center.x + (point.x - center.x) * 0.7,
    y: point.y,
    z: center.z + (point.z - center.z) * 0.7,
  }));
  for (let index = 0; index < ring.length; index += 1) {
    const a = ring[index];
    const b = ring[(index + 1) % ring.length];
    const c = inner[(index + 1) % inner.length];
    const d = inner[index];
    if (a && b && c && d)
      buffer.quad(vertex(a, 0.08), vertex(b, 0.08), vertex(c, 0.85), vertex(d, 0.85));
  }
  for (const face of ShapeUtils.triangulateShape(
    inner.map((point) => new Vector2(point.x, point.z)),
    [],
  )) {
    const a = inner[face[0]];
    const b = inner[face[1]];
    const c = inner[face[2]];
    if (!a || !b || !c) continue;
    const upward = (b.z - a.z) * (c.x - a.x) - (b.x - a.x) * (c.z - a.z) > 0;
    buffer.triangle(vertex(a, 0.85), vertex(upward ? b : c, 0.85), vertex(upward ? c : b, 0.85));
  }
}
