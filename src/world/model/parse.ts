import { WorldModelError } from './errors.js';
import { assertSceneComplexity } from './complexity.js';
import { assertJsonBudget } from './json-budget.js';
import { validateEntities } from './references-entities.js';
import { validateRoutes } from './references-routes.js';
import { validateSpace } from './references-space.js';
import { worldSceneSchema } from './schema.js';
import type { WorldScene } from './types.js';

export function parseWorldScene(input: unknown): WorldScene {
  assertJsonBudget(input);
  const parsed = worldSceneSchema.safeParse(input);
  if (!parsed.success) throw new WorldModelError('INVALID_WORLD', parsed.error.message);
  const scene: WorldScene = parsed.data;
  assertSceneComplexity(scene);
  validateSpace(scene);
  validateEntities(scene);
  validateRoutes(scene);
  return scene;
}
