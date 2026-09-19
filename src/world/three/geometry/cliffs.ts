import { Color } from 'three';
import type { Vec3, WorldScene } from '../../model/types.js';
import { SurfaceBuffer } from './buffer.js';
import type { TerrainPatch } from './terrain-grid.js';

type CoastEdge = { readonly islandId: string; readonly a: Vec3; readonly b: Vec3 };

export function createCliffs(scene: WorldScene, patches: readonly TerrainPatch[]): SurfaceBuffer {
  const edges = new Map<string, CoastEdge>();
  for (const patch of patches) {
    for (let index = 0; index < 4; index += 1) {
      const a = patch.corners[index];
      const b = patch.corners[(index + 1) % 4];
      if (!a || !b) continue;
      const keys = [
        `${a.x.toFixed(6)},${a.z.toFixed(6)}`,
        `${b.x.toFixed(6)},${b.z.toFixed(6)}`,
      ].sort();
      const key = `${patch.tile.islandId}:${keys.join(':')}`;
      if (edges.has(key)) edges.delete(key);
      else edges.set(key, { islandId: patch.tile.islandId, a, b });
    }
  }
  const islands = new Map(scene.islands.map((island) => [island.id, island]));
  const colors = ['#b7a88b', '#b6a08d', '#947f74', '#766969'].map((hex) => new Color(hex));
  const circular = scene.settings.layout === 'seasonal-circle';
  const rings = circular
    ? [
        { scale: 1, y: -0.45 },
        { scale: 0.97, y: -3 },
        { scale: 0.83, y: -4.4 },
        { scale: 0.45, y: -5.6 },
      ]
    : ([
        { scale: 1, y: -0.22 },
        { scale: 0.96, y: -0.75 },
        { scale: 0.77, y: -1.6 },
        { scale: 0.45, y: -2.25 },
      ] as const);
  const buffer = new SurfaceBuffer();
  for (const edge of edges.values()) {
    const island = islands.get(edge.islandId);
    if (!island) continue;
    const center = island.center;
    const ringPoint = (point: Vec3, ring: (typeof rings)[number]): Vec3 => ({
      x: center.x + (point.x - center.x) * ring.scale,
      y: Math.min(point.y - 0.14, scene.terrain.waterLevel + ring.y),
      z: center.z + (point.z - center.z) * ring.scale,
    });
    let a = edge.a;
    let b = edge.b;
    for (const [index, ring] of rings.entries()) {
      const nextA = ringPoint(edge.a, ring);
      const nextB = ringPoint(edge.b, ring);
      buffer.quad(b, a, nextA, nextB, colors[index]);
      a = nextA;
      b = nextB;
    }
    buffer.triangle(
      b,
      a,
      { x: center.x, y: scene.terrain.waterLevel - (circular ? 6.3 : 2.5), z: center.z },
      new Color('#69616a'),
    );
  }
  return buffer;
}
