import { seaIntersection, type LandscapeMesh } from './mesh.js';
import type { LandscapePoint, LandscapeRiver } from './types.js';

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
    const first = this.entries[0],
      last = this.entries.pop();
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
  mesh: LandscapeMesh,
  drainage: readonly number[],
): readonly LandscapePoint[] {
  const points: LandscapePoint[] = [];
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

function chooseRivers(mesh: LandscapeMesh, drainage: readonly number[]): readonly LandscapeRiver[] {
  const peak = Math.max(...mesh.vertices.map((point) => point.elevation));
  const candidates = mesh.vertices
    .flatMap((point, index) => {
      if (point.elevation < peak * 0.23) return [];
      const points = traceRiver(index, mesh, drainage);
      const outlet = points.at(-1);
      if (points.length < 12 || !outlet) return [];
      const length = points.reduce((total, current, position) => {
        const previous = points[position - 1];
        return total + (previous ? Math.hypot(current.x - previous.x, current.z - previous.z) : 0);
      }, 0);
      const score = length * (outlet.x + outlet.z > 0 ? 1.25 : 0.82) + point.elevation * 0.35;
      return [{ point, points, length, score }];
    })
    .sort((a, b) => b.score - a.score);
  const rivers: LandscapeRiver[] = [],
    sources: LandscapePoint[] = [];
  const occupied = new Set<string>();
  for (const candidate of candidates) {
    if (
      sources.some(
        (point) => Math.hypot(point.x - candidate.point.x, point.z - candidate.point.z) < 8,
      )
    )
      continue;
    const fresh = candidate.points.filter((point) => !occupied.has(`${point.x}:${point.z}`));
    if (fresh.length < candidate.points.length * 0.5) continue;
    sources.push(candidate.point);
    for (const point of candidate.points) occupied.add(`${point.x}:${point.z}`);
    rivers.push({
      points: candidate.points,
      width: Math.min(0.95, 0.3 + candidate.length * 0.016),
    });
    if (rivers.length === 4) break;
  }
  return rivers;
}

export function drainLandscape(
  mesh: LandscapeMesh,
  relief: number,
): {
  readonly mesh: LandscapeMesh;
  readonly rivers: readonly LandscapeRiver[];
} {
  const elevations = mesh.vertices.map((point) => point.elevation);
  const drainage = mesh.vertices.map(() => -1);
  const visited = mesh.vertices.map((point) => point.elevation <= 0);
  const queue = new ElevationQueue();
  for (const [index, elevation] of elevations.entries())
    if (elevation <= 0) queue.push({ index, elevation });
  let current = queue.take();
  while (current) {
    for (const next of mesh.neighbors[current.index]) {
      if (visited[next]) continue;
      visited[next] = true;
      drainage[next] = current.index;
      elevations[next] = Math.max(elevations[next], current.elevation + 0.002 * relief);
      queue.push({ index: next, elevation: elevations[next] });
    }
    current = queue.take();
  }
  const drained: LandscapeMesh = {
    ...mesh,
    vertices: mesh.vertices.map((point, index) => ({ ...point, elevation: elevations[index] })),
  };
  return { mesh: drained, rivers: chooseRivers(drained, drainage) };
}
