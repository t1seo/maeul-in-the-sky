import type { WorldSeason } from '../../world/model/geometry-types.js';
import type { WindProfile } from '../render/wind-profiles.js';
import type { AuthoredMapping } from './types.js';
import { naturePart, type NatureNode } from './nature-models.js';

type TreeSpec = {
  readonly nodes: readonly [NatureNode, NatureNode];
  readonly height: number;
  readonly span: number;
  readonly wind: WindProfile;
  readonly season?: WorldSeason;
  readonly color?: string;
};

const OAK = {
  nodes: ['CommonTree_3', 'CommonTree_5'],
  height: 3.7,
  span: 2.9,
  wind: 'tree',
} as const;
const PINE = { nodes: ['Pine_1', 'Pine_5'], height: 3.8, span: 2.9, wind: 'tree' } as const;
const BLOSSOM = { ...OAK, color: '#efbdd0', season: 'spring' } as const;
const SMALL_BLOSSOM = { ...BLOSSOM, height: 2.4, span: 1.9 } as const;
const TREES: Readonly<Record<string, TreeSpec | undefined>> = {
  pine: PINE,
  deciduous: OAK,
  gardenTree: OAK,
  ancientOak: { ...OAK, nodes: ['TwistedTree_1', 'TwistedTree_1'], height: 4.4, span: 3.6 },
  deadTree: { ...OAK, nodes: ['DeadTree_3', 'DeadTree_3'], height: 3, span: 2.3 },
  bareBush: { ...OAK, nodes: ['DeadTree_3', 'DeadTree_3'], height: 0.9, span: 0.8 },
  snowPine: { ...PINE, season: 'winter' },
  snowDeciduous: { ...OAK, season: 'winter' },
  christmasTree: { ...PINE, season: 'winter' },
  autumnMaple: { ...OAK, nodes: ['TwistedTree_1', 'TwistedTree_1'], season: 'autumn' },
  autumnOak: { ...OAK, season: 'autumn' },
  cherryBlossom: BLOSSOM,
  cherryBlossomFull: { ...BLOSSOM, height: 4.1, span: 3.3 },
  cherryBlossomSmall: SMALL_BLOSSOM,
  cherryBlossomBranch: SMALL_BLOSSOM,
  peachBlossom: { ...BLOSSOM, color: '#e8abc1' },
  bush: { nodes: ['Bush_Common', 'Bush_Common_Flowers'], height: 0.9, span: 1.4, wind: 'shrub' },
  seedling: { ...OAK, nodes: ['CommonTree_5', 'CommonTree_5'], height: 0.75, span: 0.65 },
};

export const natureTree: AuthoredMapping = (placement) => {
  const spec = TREES[placement.source.catalogId];
  if (!spec) return null;
  const variant = placement.source.variant % 3;
  const node = spec.nodes[variant % 2];
  return {
    parts: [
      naturePart(node, spec.height * (1 + variant * 0.035), spec.span, {
        season: spec.season ?? placement.season,
        wind: spec.wind,
        yaw: variant * 1.43,
        ...(spec.color ? { foliageColor: spec.color } : {}),
      }),
    ],
    retainedParts: [],
  };
};
