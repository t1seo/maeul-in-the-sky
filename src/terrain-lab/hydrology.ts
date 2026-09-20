import { seaIntersection, type TerrainMesh } from './mesh.js';
import type { TerrainPoint, TerrainRiver } from './types.js';

type QueueEntry = { readonly index: number; readonly elevation: number };

class ElevationQueue {
  private readonly entries: QueueEntry[] = [];

  push(entry: QueueEntry): void {
    this.entries.push(entry);
    let index = this.entries.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.entries[parent].elevation <= entry.elevation) break;
      this.entries[index] = this.entries[parent];
      index = parent;
    }
    this.entries[index] = entry;
  }

  take(): QueueEntry | undefined {
    const first = this.entries[0];
    const last = this.entries.pop();
    if (!last || this.entries.length === 0) return first;
    let index = 0;
    while (index * 2 + 1 < this.entries.length) {
      let child = index * 2 + 1;
      if (
        child + 1 < this.entries.length &&
        this.entries[child + 1].elevation < this.entries[child].elevation
      )
        child++;
      if (this.entries[child].elevation >= last.elevation) break;
      this.entries[index] = this.entries[child];
      index = child;
    }
    this.entries[index] = last;
    return first;
  }
}

function traceRiver(
  source: number,
  mesh: TerrainMesh,
  drainage: readonly number[],
): readonly TerrainPoint[] {
  const points: TerrainPoint[] = [];
  let index = source;
  while (index >= 0) {
    const point = mesh.vertices[index];
    points.push(point);
    const next = drainage[index];
    if (next < 0) return [];
    const downstream = mesh.vertices[next];
    if (downstream.elevation <= 0) {
      points.push(seaIntersection(point, downstream));
      return points;
    }
    index = next;
  }
  return [];
}

export function drainTerrain(mesh: TerrainMesh): {
  readonly mesh: TerrainMesh;
  readonly rivers: readonly TerrainRiver[];
} {
  const elevations = mesh.vertices.map((point) => point.elevation);
  const drainage = mesh.vertices.map(() => -1);
  const visited = mesh.vertices.map((point) => point.elevation <= 0);
  const queue = new ElevationQueue();
  for (const [index, elevation] of elevations.entries()) {
    if (elevation <= 0) queue.push({ index, elevation });
  }
  let current = queue.take();
  while (current) {
    for (const next of mesh.neighbors[current.index]) {
      if (visited[next]) continue;
      visited[next] = true;
      drainage[next] = current.index;
      elevations[next] = Math.max(elevations[next], current.elevation + 0.002);
      queue.push({ index: next, elevation: elevations[next] });
    }
    current = queue.take();
  }
  const drained = {
    ...mesh,
    vertices: mesh.vertices.map((point, index) => ({ ...point, elevation: elevations[index] })),
  };
  const candidates = drained.vertices
    .map((point, index) => ({ point, index }))
    .filter(({ point }) => point.elevation > 1)
    .sort((a, b) => b.point.elevation - a.point.elevation);
  const sources: TerrainPoint[] = [];
  const rivers: TerrainRiver[] = [];
  for (const { point, index } of candidates) {
    if (sources.some((source) => Math.hypot(source.x - point.x, source.z - point.z) < 12)) continue;
    const points = traceRiver(index, drained, drainage);
    if (points.length < 9) continue;
    rivers.push({ points, width: Math.min(0.38, 0.2 + points.length * 0.004) });
    sources.push(point);
    if (rivers.length === 4) break;
  }
  return { mesh: drained, rivers };
}
