import type { AuthoredPart } from './types.js';

export const NATURE_NODES = [
  'CommonTree_3',
  'CommonTree_5',
  'Pine_1',
  'Pine_5',
  'TwistedTree_1',
  'DeadTree_3',
  'Bush_Common',
  'Bush_Common_Flowers',
  'Fern_1',
  'Flower_3_Single',
  'Flower_4_Single',
  'Mushroom_Common',
  'Rock_Medium_1',
  'Rock_Medium_2',
  'Rock_Medium_3',
  'Pebble_Round_1',
  'Grass_Common_Short',
  'Grass_Common_Tall',
] as const;

export type NatureNode = (typeof NATURE_NODES)[number];

const FOLIAGE = {
  CommonTree_3: ['Leaves_NormalTree'],
  CommonTree_5: ['Leaves_NormalTree'],
  Pine_1: ['Leaves_Pine'],
  Pine_5: ['Leaves_Pine'],
  TwistedTree_1: ['Leaves_TwistedTree'],
  DeadTree_3: [],
  Bush_Common: ['Leaves_TwistedTree'],
  Bush_Common_Flowers: ['Leaves_NormalTree'],
  Fern_1: ['Leaves'],
  Flower_3_Single: ['Leaves'],
  Flower_4_Single: ['Leaves'],
  Mushroom_Common: [],
  Rock_Medium_1: [],
  Rock_Medium_2: [],
  Rock_Medium_3: [],
  Pebble_Round_1: [],
  Grass_Common_Short: ['Grass'],
  Grass_Common_Tall: ['Grass'],
} as const satisfies Readonly<Record<NatureNode, readonly string[]>>;

const SUMMER_COLORS: Readonly<Partial<Record<NatureNode, string>>> = {
  Bush_Common: '#718b4c',
  Bush_Common_Flowers: '#718b4c',
  TwistedTree_1: '#718b4c',
  Grass_Common_Short: '#789542',
  Grass_Common_Tall: '#789542',
};

export function naturePart(
  node: NatureNode,
  height: number,
  maxSpan: number,
  options: Omit<AuthoredPart, 'file' | 'node' | 'height' | 'maxSpan' | 'foliageMaterials'> = {},
): AuthoredPart {
  return {
    file: 'nature/nature-collection.glb',
    node,
    height,
    maxSpan,
    foliageMaterials: FOLIAGE[node],
    ...(options.season === 'summer' && SUMMER_COLORS[node]
      ? { foliageColor: SUMMER_COLORS[node] }
      : {}),
    ...options,
  };
}
