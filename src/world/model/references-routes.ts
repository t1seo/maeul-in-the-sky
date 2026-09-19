import { distance, pathLength } from './math.js';
import { contains, requireWorld, uniqueIds } from './references-space.js';
import type { WorldScene } from './types.js';

export function validateRoutes(scene: WorldScene): void {
  const nodes = uniqueIds(scene.routeNodes, 'route node');
  const routes = uniqueIds(scene.routes, 'route');
  uniqueIds(scene.actors, 'actor');
  const entities = new Map(scene.entities.map((entity) => [entity.id, entity]));
  const recipes = new Set(scene.modelRecipes.map((recipe) => recipe.key));
  const islands = new Set(scene.islands.map((island) => island.id));
  for (const node of nodes.values()) {
    requireWorld(
      islands.has(node.islandId) && contains(scene.bounds, node.position),
      `Invalid route node: ${node.id}`,
    );
    if (node.entityId !== undefined) {
      const entity = entities.get(node.entityId);
      requireWorld(
        entity !== undefined &&
          entity.islandId === node.islandId &&
          entity.kind === node.role &&
          distance(entity.position, node.position) <= 3,
        `Invalid transit endpoint: ${node.id}`,
      );
    }
    if (node.role !== 'junction')
      requireWorld(node.entityId !== undefined, `Transit node ${node.id} requires a building`);
  }
  for (const route of routes.values()) {
    requireWorld(
      route.points.length === route.nodeIds.length &&
        Math.abs(pathLength(route.points) - route.length) <= 1e-6,
      `Invalid route length or graph: ${route.id}`,
    );
    if (route.loop)
      requireWorld(
        distance(route.points[0], route.points[route.points.length - 1]) <= 1e-6,
        `Loop ${route.id} does not close`,
      );
    for (const [index, point] of route.points.entries()) {
      const node = nodes.get(route.nodeIds[index]);
      requireWorld(
        node !== undefined && distance(node.position, point) <= 1e-6,
        `Invalid route/node correspondence: ${route.id}`,
      );
      requireWorld(contains(scene.bounds, point), `Route leaves world bounds: ${route.id}`);
      const tile = scene.terrain.tiles.find(
        (tile) =>
          tile.islandId === node.islandId &&
          Math.abs(tile.position.x - point.x) <= tile.size / 2 &&
          Math.abs(tile.position.z - point.z) <= tile.size / 2,
      );
      requireWorld(
        tile !== undefined &&
          Math.abs(tile.position.y - point.y) <= 0.1 &&
          (route.kind === 'water' ? tile.surface === 'water' : tile.surface === 'path'),
        `Route leaves its traversable surface: ${route.id}`,
      );
      if (index > 0) {
        const previous = route.points[index - 1];
        requireWorld(
          distance(previous, point) > 1e-6 &&
            Math.hypot(point.x - previous.x, point.z - previous.z) <=
              tile.size * Math.SQRT2 + 1e-6 &&
            Math.abs(point.y - previous.y) <=
              Math.hypot(point.x - previous.x, point.z - previous.z) * 0.75,
          `Degenerate or steep route segment: ${route.id}`,
        );
      }
    }
    if (route.kind !== 'walk') {
      const role = route.kind === 'water' ? 'dock' : 'station';
      requireWorld(
        nodes.get(route.nodeIds[0])?.role === role &&
          nodes.get(route.nodeIds[route.nodeIds.length - 1])?.role === role,
        `Route ${route.id} is missing its ${role} endpoints`,
      );
    }
  }
  for (const actor of scene.actors) {
    const route = routes.get(actor.routeId);
    const kind = actor.kind === 'train' ? 'rail' : actor.kind === 'ferry' ? 'water' : 'walk';
    requireWorld(
      route !== undefined &&
        route.kind === kind &&
        recipes.has(actor.modelKey) &&
        actor.visibleFrom >= route.visibleFrom,
      `Invalid actor route/model: ${actor.id}`,
    );
  }
}
