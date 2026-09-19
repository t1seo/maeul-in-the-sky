import { WorldModelError } from './errors.js';
import { railSleeperCount } from './route-detail.js';
import type { WorldScene } from './types.js';

export const MAX_WORLD_RENDER_UNITS = 800_000;
const MAX_SEASONAL_VARIANTS = 3;
const DETAIL_LEVELS = 2;

type SceneWork = Pick<WorldScene, 'entities' | 'actors' | 'modelRecipes' | 'terrain' | 'routes'>;

export function assertSceneComplexity(scene: SceneWork): void {
  const partCounts = new Map(scene.modelRecipes.map((recipe) => [recipe.key, recipe.parts.length]));
  let units = scene.terrain.tiles.length * 8;
  for (const waterway of scene.terrain.waterways) units += waterway.points.length * 20;
  for (const route of scene.routes) {
    units += route.points.length * 8;
    if (route.kind !== 'rail') continue;
    for (let index = 1; index < route.points.length; index += 1) {
      const from = route.points[index - 1];
      const to = route.points[index];
      if (from && to) units += railSleeperCount(from, to) * 6;
    }
  }
  for (const item of [...scene.entities, ...scene.actors]) {
    const parts = partCounts.get(item.modelKey);
    if (parts === undefined)
      throw new WorldModelError('INVALID_WORLD', 'A world model recipe is missing.');
    units += parts * MAX_SEASONAL_VARIANTS * DETAIL_LEVELS;
    if (units > MAX_WORLD_RENDER_UNITS)
      throw new WorldModelError(
        'INVALID_WORLD',
        'This world is too detailed to open safely. Choose a shorter period or fewer project landmarks.',
      );
  }
  if (units > MAX_WORLD_RENDER_UNITS)
    throw new WorldModelError('INVALID_WORLD', 'This world has too much landscape detail to open.');
}
