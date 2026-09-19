import { WorldModelError } from './errors.js';
import { createModelRecipe } from './recipes/index.js';
import type { ModelRecipe, WorldModelFamily } from './types.js';

export const WORLD_MODEL_FAMILIES = [
  'conifer',
  'broadleaf',
  'bamboo',
  'willow',
  'grove',
  'meadow',
  'reeds',
  'rocks',
  'pond',
  'hanok',
  'choga',
  'house',
  'barn',
  'market',
  'tower',
  'library',
  'pavilion',
  'orchard',
  'rice-terrace',
  'station',
  'dock',
  'courtyard',
  'pier',
  'stair',
  'train',
  'ferry',
  'deer',
  'resident',
  'lanterns',
  'harvest',
  'blossoms',
  'snow-lights',
  'monument',
  'pagoda',
] as const satisfies readonly WorldModelFamily[];

export function collectRecipes(keys: readonly string[]): readonly ModelRecipe[] {
  return [...new Set(keys)].sort().map((key) => {
    const [name, variantText] = key.split(':');
    const family = WORLD_MODEL_FAMILIES.find((family) => family === name);
    const variant = Number(variantText);
    if (family === undefined || (variant !== 0 && variant !== 1 && variant !== 2)) {
      throw new WorldModelError('INVALID_WORLD', `Unsupported generated model key: ${key}`);
    }
    return createModelRecipe(family, variant);
  });
}
