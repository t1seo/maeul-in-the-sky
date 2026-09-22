import { barn, house } from '../../world/model/recipes/homes.js';
import { place } from '../../world/model/recipes/primitives.js';
import { castle, church } from './buildings.js';
import { surfboard, towel, watermelon } from './coastal.js';
import {
  acorn,
  birdhouse,
  cup,
  nest,
  rake,
  silo,
  trough,
  wateringCan,
  wreath,
} from './household.js';
import { canal, frozenPond, lily, pool, withSnow } from './seasonal-details.js';
import { TOUR_COLORS as C } from './palette.js';
import type { AssetDefinition, TourRecipeBuilder } from './recipe-types.js';

function detail(
  build: TourRecipeBuilder,
  scale = 3.2,
  footprint: readonly [number, number] | null = null,
): AssetDefinition {
  return { build, scale, footprint, kind: 'prop' };
}

export const DETAIL_DEFINITIONS = {
  wateringCan: detail(wateringCan),
  cup: detail(cup, 2.6),
  rake: detail(rake),
  acorn: detail(acorn, 1.8),
  wreath: detail(wreath),
  birdhouse: detail(birdhouse),
  trough: detail(trough, 3.4, [0.22, 0.1]),
  silo: { ...detail(silo, 3.8, [0.155, 0.155]), kind: 'building' },
  nest: detail(nest),
  towel: detail(towel),
  surfboard: detail(surfboard),
  watermelon: detail(watermelon),
  lily: detail(lily),
  swimmingPool: detail(pool, 3.6),
  canal: detail(canal, 3.6),
  frozenPond: detail(frozenPond, 3.6),
  sandcastle: detail((v) =>
    place(castle(v), [0, 0, 0], 0.55).map((item) => ({ ...item, color: C.strawLight })),
  ),
  snowHouse: {
    ...detail((v) => withSnow(house(v)), 3.8, [0.31, 0.26]),
    kind: 'building',
    season: 'winter',
  },
  snowBarn: {
    ...detail((v) => withSnow(barn(v)), 3.8, [0.34, 0.26]),
    kind: 'building',
    season: 'winter',
  },
  snowChurch: {
    ...detail((v) => withSnow(church(v)), 3.8, [0.31, 0.26]),
    kind: 'building',
    season: 'winter',
  },
} as const satisfies Readonly<Record<string, AssetDefinition>>;
