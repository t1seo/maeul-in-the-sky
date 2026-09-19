import { Box3, Vector3 } from 'three';
import { distance, hashKey } from '../../model/math.js';
import type { Vec3, WorldScene, WorldWaterway } from '../../model/types.js';

export type WaterfallPath = {
  readonly waterway: WorldWaterway;
  readonly mouth: Vec3;
  readonly end: Vec3;
  readonly direction: readonly [number, number];
  readonly regionId: string;
  readonly phase: number;
  readonly length: number;
  readonly distances: readonly number[];
};

export type WaterfallSurface = {
  readonly path: WaterfallPath;
  readonly firstVertex: number;
  readonly vertexCount: number;
};

export function waterfallDirection(
  scene: WorldScene,
  waterway: WorldWaterway,
): readonly [number, number] {
  const mouth = waterway.points[0];
  const river = scene.terrain.waterways.find(
    (item) =>
      item.kind === 'river' &&
      item.islandId === waterway.islandId &&
      item.points.at(-1)?.x === mouth?.x &&
      item.points.at(-1)?.z === mouth?.z,
  );
  const previous = river?.points.at(-2);
  const next = waterway.points.find((point) => point.x !== mouth?.x || point.z !== mouth?.z);
  const dx = mouth && previous ? mouth.x - previous.x : next && mouth ? next.x - mouth.x : 0;
  const dz = mouth && previous ? mouth.z - previous.z : next && mouth ? next.z - mouth.z : 1;
  const length = Math.hypot(dx, dz);
  return length ? [dx / length, dz / length] : [0, 1];
}

export function waterfallPath(
  scene: WorldScene,
  waterway: WorldWaterway,
  direction: readonly [number, number],
): WaterfallPath | undefined {
  const mouth = waterway.points[0];
  const end = waterway.points.at(-1);
  if (!mouth || !end || end.y >= mouth.y) return undefined;
  let nearest = Infinity;
  let regionId = '';
  for (const tile of scene.terrain.tiles) {
    if (tile.islandId !== waterway.islandId) continue;
    const separation = Math.hypot(tile.position.x - mouth.x, tile.position.z - mouth.z);
    if (separation < nearest) {
      nearest = separation;
      regionId = tile.regionId;
    }
  }
  let length = 0;
  const distances = waterway.points.map((point, index) => {
    const previous = waterway.points[index - 1];
    if (previous) length += distance(previous, point);
    return length;
  });
  return {
    waterway,
    mouth,
    end,
    direction,
    regionId,
    length,
    distances,
    phase: hashKey(waterway.id) / 0x100000000,
  };
}

export function sampleWaterfall(
  path: WaterfallPath,
  progress: number,
  side = 0,
  forward = 0,
): Vec3 {
  const target = Math.min(1, Math.max(0, progress)) * path.length;
  let point = path.end;
  for (let index = 1; index < path.waterway.points.length; index += 1) {
    const from = path.waterway.points[index - 1];
    const to = path.waterway.points[index];
    const start = path.distances[index - 1];
    const end = path.distances[index];
    if (!from || !to || start === undefined || end === undefined || end <= start || end < target)
      continue;
    const fraction = (target - start) / (end - start);
    point = {
      x: from.x + (to.x - from.x) * fraction,
      y: from.y + (to.y - from.y) * fraction,
      z: from.z + (to.z - from.z) * fraction,
    };
    break;
  }
  const [dx, dz] = path.direction;
  return {
    x: point.x + dz * side + dx * forward,
    y: point.y,
    z: point.z - dx * side + dz * forward,
  };
}

export function waterfallBounds(paths: readonly WaterfallPath[]): Box3 {
  const bounds = new Box3();
  for (const path of paths) {
    const envelope = new Box3();
    for (const point of path.waterway.points)
      envelope.expandByPoint(new Vector3(point.x, point.y, point.z));
    // Includes the full particle cycle, mist radius and lip ice before camera fitting.
    envelope.expandByVector(
      new Vector3(
        Math.max(2, path.waterway.width * 1.8),
        1.2,
        Math.max(2, path.waterway.width * 1.8),
      ),
    );
    bounds.union(envelope);
  }
  return bounds;
}
