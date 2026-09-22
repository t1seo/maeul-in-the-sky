import { barn, house, market } from '../../world/model/recipes/homes.js';
import { library, tower } from '../../world/model/recipes/civic.js';
import { dock, pier } from '../../world/model/recipes/infrastructure.js';
import { monument } from '../../world/model/recipes/monuments.js';
import { place } from '../../world/model/recipes/primitives.js';
import { castle, church, igloo, lighthouse, shop, tent, well, windmill } from './buildings.js';
import {
  basket,
  beehive,
  crops,
  fence,
  hay,
  pumpkin,
  pumpkinPatch,
  scarecrow,
  vegetableBeds,
} from './farm-props.js';
import {
  estate,
  hanokGate,
  onggi,
  guardians,
  birdPoles,
  stoneBridge,
  stoneWall,
  tourChoga,
  tourHanok,
  tourPavilion,
  watermill,
} from './korean.js';
import {
  barrel,
  campfire,
  cart,
  flag,
  lamp,
  laundry,
  logs,
  signpost,
  snowman,
  stump,
} from './village-props.js';
import {
  fireflies,
  fountain,
  hammock,
  icicles,
  leaves,
  parasol,
  puddle,
  sled,
  smoke,
  snowdrift,
  steppingStones,
} from './seasonal-props.js';
import type { AssetDefinition, TourRecipeBuilder } from './recipe-types.js';
import { DETAIL_DEFINITIONS } from './definitions-details.js';

function building(
  build: TourRecipeBuilder,
  footprint: readonly [number, number] | null = [0.31, 0.26],
  scale = 3.8,
): AssetDefinition {
  return { build, kind: 'building', scale, footprint };
}

function prop(
  build: TourRecipeBuilder,
  footprint: readonly [number, number] | null = null,
  scale = 3.4,
): AssetDefinition {
  return { build, kind: 'prop', scale, footprint };
}

export const VILLAGE_DEFINITIONS = {
  ...DETAIL_DEFINITIONS,
  house: building(house),
  barn: building(barn, [0.34, 0.26]),
  shop: building(shop),
  market: building(market, null),
  church: building(church),
  castle: building(castle, [0.38, 0.32]),
  tower: building(tower, [0.21, 0.21]),
  library: building(library, [0.37, 0.28]),
  windmill: building(windmill, [0.18, 0.18]),
  lighthouse: building(lighthouse, [0.14, 0.14]),
  tent: building(tent, [0.28, 0.25]),
  igloo: building(igloo, [0.3, 0.28]),
  hanok: building(tourHanok, [0.31, 0.26]),
  choga: building(tourChoga, [0.33, 0.24]),
  pavilion: building(tourPavilion, null),
  hanokGate: building(hanokGate, null),
  estate: building(estate, null, 3.6),
  watermill: building(watermill, [0.35, 0.22]),
  stoneWall: prop(stoneWall, [0.37, 0.075]),
  stoneBridge: prop(stoneBridge),
  dock: prop(dock),
  bridge: prop(pier),
  well: prop(well, [0.22, 0.22]),
  onggi: prop(onggi, [0.25, 0.21]),
  guardians: prop(guardians),
  birdPoles: prop(birdPoles),
  statue: prop(monument, [0.18, 0.18]),
  fence: prop(fence, [0.36, 0.024]),
  basket: prop(basket),
  beehive: prop(beehive, [0.11, 0.11]),
  crops: prop(crops),
  vegetables: prop(vegetableBeds),
  pumpkin: prop(pumpkin),
  pumpkinPatch: prop(pumpkinPatch),
  hay: prop(hay, [0.2, 0.13]),
  scarecrow: prop(scarecrow),
  barrel: prop(barrel, [0.1, 0.1]),
  campfire: prop(campfire),
  cart: prop(cart, [0.2, 0.14]),
  flag: prop(flag),
  lamp: prop(lamp),
  laundry: prop(laundry),
  logs: prop(logs, [0.18, 0.18]),
  signpost: prop(signpost),
  snowman: prop(snowman, [0.12, 0.12]),
  stump: prop(stump, [0.1, 0.09]),
  parasol: prop(parasol),
  fountain: prop(fountain, [0.3, 0.3]),
  puddle: prop(puddle),
  leaves: prop(leaves),
  fireflies: prop(fireflies),
  snowdrift: prop(snowdrift),
  icicles: prop(icicles),
  sled: prop(sled),
  hammock: prop(hammock),
  smoke: prop(smoke),
  stones: prop(steppingStones),
  doghouse: building((v) => place(house(v), [0, 0, 0], 0.4), [0.14, 0.11]),
} as const satisfies Readonly<Record<string, AssetDefinition>>;
