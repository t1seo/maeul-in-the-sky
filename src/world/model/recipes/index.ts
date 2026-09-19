import type { ModelRecipe, WorldModelFamily } from '../geometry-types.js';
import { library, tower } from './civic.js';
import { blossoms, harvest, lanterns, snowLights } from './events.js';
import { meadow, orchard, pond, reeds, riceTerrace } from './gardens.js';
import { barn, house, market } from './homes.js';
import { deer, resident } from './inhabitants.js';
import { courtyard, dock, pier, stair, station } from './infrastructure.js';
import { choga, hanok, pagoda, pavilion } from './korean.js';
import { monument } from './monuments.js';
import type { RecipeBuilder } from './primitives.js';
import { rocks } from './rocks.js';
import { ferry, train } from './transport.js';
import { bamboo, broadleaf, conifer, grove, willow } from './trees.js';

const BUILDERS = {
  conifer,
  broadleaf,
  bamboo,
  willow,
  grove,
  meadow,
  reeds,
  rocks,
  pond,
  hanok,
  choga,
  house,
  barn,
  market,
  tower,
  library,
  pavilion,
  orchard,
  'rice-terrace': riceTerrace,
  station,
  dock,
  courtyard,
  pier,
  stair,
  train,
  ferry,
  deer,
  resident,
  lanterns,
  harvest,
  blossoms,
  'snow-lights': snowLights,
  monument,
  pagoda,
} as const satisfies Readonly<Record<WorldModelFamily, RecipeBuilder>>;

export function createModelRecipe(family: WorldModelFamily, variant: 0 | 1 | 2): ModelRecipe {
  const parts = BUILDERS[family](variant).map((item) =>
    Object.freeze({
      ...item,
      position: Object.freeze(item.position),
      rotation: Object.freeze(item.rotation),
      size: Object.freeze(item.size),
    }),
  );
  return Object.freeze({ key: `${family}:${variant}`, version: 1, parts: Object.freeze(parts) });
}
