import type { EpicBuildingType } from '../../themes/terrain/epics/types.js';
import { pagoda } from '../../world/model/recipes/korean.js';
import { grandWindmill } from './buildings.js';
import {
  ancientPortal,
  aurora,
  crystalSpire,
  dragonNest,
  floatingIsland,
  worldTree,
} from './wonder-fantasy.js';
import {
  bambooGrove,
  bioluminescentPool,
  bonsaiGiant,
  coralReef,
  geyser,
  giantMushroom,
  giantSequoia,
  hotSpring,
  oasis,
  sakuraEternal,
} from './wonder-gardens.js';
import {
  glacierPeak,
  grandCanyon,
  giantWaterfall,
  meteorCrater,
  mountFuji,
  volcano,
} from './wonder-landforms.js';
import {
  colosseum,
  eiffelTower,
  operaHouse,
  stBasils,
  tajMahal,
  torii,
} from './wonder-landmarks.js';
import type { AssetDefinition, TourRecipeBuilder } from './recipe-types.js';

function wonder(
  build: TourRecipeBuilder,
  footprint: readonly [number, number] | null,
): AssetDefinition {
  return { build, kind: 'wonder', scale: 4.1, footprint };
}

export const WONDER_DEFINITIONS = {
  mountFuji: wonder(mountFuji, [0.43, 0.4]),
  colosseum: wonder(colosseum, null),
  giantSequoia: wonder(giantSequoia, [0.11, 0.11]),
  coralReef: wonder(coralReef, null),
  pagoda: wonder(pagoda, [0.23, 0.21]),
  torii: wonder(torii, null),
  geyser: wonder(geyser, [0.2, 0.2]),
  hotSpring: wonder(hotSpring, null),
  eiffelTower: wonder(eiffelTower, null),
  grandCanyon: wonder(grandCanyon, null),
  windmillGrand: wonder(grandWindmill, [0.22, 0.22]),
  oasis: wonder(oasis, null),
  volcano: wonder(volcano, [0.43, 0.4]),
  giantMushroom: wonder(giantMushroom, [0.09, 0.09]),
  aurora: wonder(aurora, null),
  tajMahal: wonder(tajMahal, [0.31, 0.28]),
  giantWaterfall: wonder(giantWaterfall, [0.43, 0.25]),
  stBasils: wonder(stBasils, [0.3, 0.27]),
  bambooGrove: wonder(bambooGrove, null),
  operaHouse: wonder(operaHouse, [0.48, 0.32]),
  glacierPeak: wonder(glacierPeak, [0.37, 0.36]),
  bioluminescentPool: wonder(bioluminescentPool, null),
  meteorCrater: wonder(meteorCrater, null),
  bonsaiGiant: wonder(bonsaiGiant, [0.4, 0.28]),
  floatingIsland: wonder(floatingIsland, null),
  crystalSpire: wonder(crystalSpire, [0.22, 0.22]),
  dragonNest: wonder(dragonNest, [0.42, 0.42]),
  worldTree: wonder(worldTree, [0.16, 0.16]),
  sakuraEternal: wonder(sakuraEternal, [0.12, 0.12]),
  ancientPortal: wonder(ancientPortal, null),
} as const satisfies Readonly<Record<EpicBuildingType, AssetDefinition>>;
