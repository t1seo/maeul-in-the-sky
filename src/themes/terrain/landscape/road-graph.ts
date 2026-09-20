import { groundDistance, groundLine } from './settlement-geometry.js';
import type { LandscapeModel, LandscapePoint, LandscapeSite, LandscapeTriangle } from './types.js';

interface Edge {
  readonly neighbor: number;
  readonly portal: LandscapePoint;
}
interface Node {
  readonly triangle: LandscapeTriangle;
  readonly center: LandscapeSite;
  readonly edges: Edge[];
}
const key = (point: LandscapePoint): string => `${point.x},${point.z}`;

function contains(triangle: LandscapeTriangle, point: LandscapePoint): boolean {
  const [a, b, c] = triangle.points;
  const denominator = (b.z - c.z) * (a.x - c.x) + (c.x - b.x) * (a.z - c.z);
  const u = ((b.z - c.z) * (point.x - c.x) + (c.x - b.x) * (point.z - c.z)) / denominator;
  const v = ((c.z - a.z) * (point.x - c.x) + (a.x - c.x) * (point.z - c.z)) / denominator;
  return u >= -1e-7 && v >= -1e-7 && u + v <= 1 + 1e-7;
}

function graph(model: LandscapeModel): readonly Node[] {
  const nodes = model.triangles.map((triangle): Node => ({
    triangle,
    center: {
      x: triangle.points.reduce((sum, point) => sum + point.x, 0) / 3,
      z: triangle.points.reduce((sum, point) => sum + point.z, 0) / 3,
      elevation: triangle.points.reduce((sum, point) => sum + point.elevation, 0) / 3,
      biome: triangle.biome,
      moisture: triangle.moisture,
      slope: 0,
      component: triangle.component,
    },
    edges: [],
  }));
  const edges = new Map<string, { readonly node: number; readonly portal: LandscapePoint }>();
  for (const [index, node] of nodes.entries()) {
    for (let side = 0; side < 3; side++) {
      const a = node.triangle.points[side],
        b = node.triangle.points[(side + 1) % 3];
      const id = [key(a), key(b)].sort().join('|');
      const previous = edges.get(id);
      if (previous && nodes[previous.node].center.component === node.center.component) {
        node.edges.push({ neighbor: previous.node, portal: previous.portal });
        nodes[previous.node].edges.push({ neighbor: index, portal: previous.portal });
      } else {
        edges.set(id, {
          node: index,
          portal: {
            x: (a.x + b.x) / 2,
            z: (a.z + b.z) / 2,
            elevation: (a.elevation + b.elevation) / 2,
          },
        });
      }
    }
  }
  return nodes;
}

function search(nodes: readonly Node[], start: number, end: number): readonly LandscapePoint[] {
  const open = new Set([start]);
  const costs = new Map([[start, 0]]);
  const previous = new Map<number, { readonly node: number; readonly portal: LandscapePoint }>();
  while (open.size > 0) {
    let current = start,
      best = Number.POSITIVE_INFINITY;
    for (const index of open) {
      const score =
        (costs.get(index) ?? 0) + groundDistance(nodes[index].center, nodes[end].center);
      if (score < best) {
        current = index;
        best = score;
      }
    }
    if (current === end) {
      const result: LandscapePoint[] = [nodes[end].center];
      while (current !== start) {
        const step = previous.get(current);
        if (!step) return [];
        result.push(step.portal, nodes[step.node].center);
        current = step.node;
      }
      return result.reverse();
    }
    open.delete(current);
    for (const edge of nodes[current].edges) {
      const from = nodes[current].center,
        to = nodes[edge.neighbor].center;
      if (edge.portal.elevation < 0.025) continue;
      const cost =
        (costs.get(current) ?? 0) +
        groundDistance(from, to) +
        Math.abs(from.elevation - to.elevation) * 7;
      if (cost >= (costs.get(edge.neighbor) ?? Number.POSITIVE_INFINITY)) continue;
      costs.set(edge.neighbor, cost);
      previous.set(edge.neighbor, { node: current, portal: edge.portal });
      open.add(edge.neighbor);
    }
  }
  return [];
}

export function createLandscapeRouter(
  model: LandscapeModel,
): (from: LandscapeSite, to: LandscapeSite) => readonly LandscapePoint[] {
  const nodes = graph(model);
  return (from, to) => {
    if (from.component !== to.component) return [];
    const direct = groundLine(model, from, to);
    if (direct.length && direct.every((point) => point.slope < 0.65)) return direct;
    const start = nodes.findIndex(
      (node) => node.center.component === from.component && contains(node.triangle, from),
    );
    const end = nodes.findIndex(
      (node) => node.center.component === to.component && contains(node.triangle, to),
    );
    if (start < 0 || end < 0) return [];
    const route = search(nodes, start, end);
    return route.length ? [from, ...route, to] : [];
  };
}
