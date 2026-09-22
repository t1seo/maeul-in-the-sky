import { orchard, meadow, pond, reeds, riceTerrace } from '../../world/model/recipes/gardens.js';
import { bamboo, grove, willow } from '../../world/model/recipes/trees.js';
import { rocks } from '../../world/model/recipes/rocks.js';
import { place } from '../../world/model/recipes/primitives.js';
import {
  bareTree,
  berryBush,
  birch,
  blossomTree,
  evergreen,
  fern,
  field,
  fruitOrchard,
  mushroom,
  oak,
  palm,
  reedPool,
  shrub,
  snowPine,
  sunflower,
  willowPool,
} from './nature.js';
import { boat, buoy, crab, fish, jellyfish, sailboat, turtle, waves } from './aquatic.js';
import { bird, butterfly, heron, quadruped, spider } from './fauna.js';
import { coralReef } from './wonder-gardens.js';
import type { AssetDefinition, TourRecipeBuilder } from './recipe-types.js';
import { frog, shellfish, whale } from './coastal.js';

function plant(
  build: TourRecipeBuilder,
  footprint: readonly [number, number] | null = null,
  scale = 3.6,
): AssetDefinition {
  return { build, kind: 'plant', scale, footprint };
}

function creature(build: TourRecipeBuilder, scale = 2.6): AssetDefinition {
  return { build, kind: 'prop', scale, footprint: null };
}

export const NATURE_DEFINITIONS = {
  pine: plant(evergreen, [0.07, 0.07]),
  oak: plant(oak, [0.1, 0.1]),
  birch: plant(birch, [0.065, 0.065]),
  cedar: plant(grove),
  bamboo: plant(bamboo),
  willow: plant(willow, [0.11, 0.1]),
  palm: plant(palm, [0.065, 0.065]),
  fruitTree: plant(fruitOrchard, [0.065, 0.065]),
  blossom: plant(blossomTree, [0.07, 0.07]),
  smallBlossom: plant((v) => place(blossomTree(v), [0, 0, 0], 0.65), [0.04, 0.04]),
  bareTree: plant(bareTree, [0.08, 0.08]),
  snowPine: { ...plant(snowPine, [0.07, 0.07]), season: 'winter' },
  snowTree: { ...plant(oak, [0.1, 0.1]), season: 'winter' },
  autumnTree: { ...plant(oak, [0.1, 0.1]), season: 'autumn' },
  autumnBirch: { ...plant(birch, [0.065, 0.065]), season: 'autumn' },
  shrub: plant(shrub),
  berryBush: plant(berryBush),
  fern: plant(fern),
  mushroom: plant(mushroom),
  flower: plant((v) => place(meadow(v), [0, 0, 0], 0.55)),
  meadow: plant(field),
  sunflower: plant(sunflower),
  reeds: plant(reeds),
  reedPool: plant(reedPool),
  pond: plant(pond),
  willowPond: plant(willowPool),
  rocks: plant(rocks, [0.28, 0.22]),
  rock: plant((v) => place(rocks(v === 2 ? 0 : v), [0, 0, 0], 0.48), [0.13, 0.11]),
  orchard: plant(orchard),
  rice: plant(riceTerrace),
  coral: plant((v) => place(coralReef(v), [0, 0, 0], 0.65)),
  whale: creature(whale, 3.2),
  frog: creature(frog),
  shellfish: creature(shellfish),
  fish: creature(fish),
  fishSchool: creature((v) =>
    [0, 1, 2].flatMap((i) => place(fish(v), [(i - 1) * 0.17, 0.012, (i % 2) * 0.15], 0.55)),
  ),
  turtle: creature(turtle),
  crab: creature(crab),
  jellyfish: creature(jellyfish),
  bird: creature(bird),
  heron: creature(heron),
  butterfly: creature(butterfly),
  spider: creature(spider),
  deer: creature((v) => quadruped('deer', v)),
  rabbit: creature((v) => quadruped('rabbit', v), 1.8),
  fox: creature((v) => quadruped('fox', v), 2.1),
  sheep: creature((v) => quadruped('sheep', v)),
  cow: creature((v) => quadruped('cow', v), 3),
  horse: creature((v) => quadruped('horse', v), 3.2),
  pig: creature((v) => quadruped('pig', v)),
  goat: creature((v) => quadruped('goat', v)),
  squirrel: creature((v) => quadruped('squirrel', v), 1.4),
  boat: creature(boat, 3.6),
  sailboat: creature(sailboat, 3.6),
  waves: creature(waves, 3.6),
  buoy: creature(buoy, 3),
} as const satisfies Readonly<Record<string, AssetDefinition>>;
