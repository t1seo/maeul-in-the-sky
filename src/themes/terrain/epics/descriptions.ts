import type { EpicBuildingType } from './types.js';

export const WONDER_DESCRIPTIONS: Readonly<
  Record<EpicBuildingType, readonly [string, 'nature' | 'landmark' | 'fantasy', string]>
> = {
  mountFuji: ['Mount Fuji', 'nature', 'A snow-capped volcanic cone above the village.'],
  colosseum: ['Colosseum', 'landmark', 'An oval amphitheatre with two tiers of stone arches.'],
  giantSequoia: ['Giant sequoia', 'nature', 'A towering evergreen with a broad russet trunk.'],
  coralReef: ['Coral reef', 'nature', 'A miniature reef of branching, brightly colored coral.'],
  pagoda: ['Pagoda', 'landmark', 'A tiered tower with sweeping rooflines.'],
  torii: ['Torii gate', 'landmark', 'A vermilion gate with a gently curved crossbeam.'],
  geyser: ['Geyser', 'nature', 'A spring sending pale water jets above a rocky basin.'],
  hotSpring: ['Hot spring', 'nature', 'A steaming pool ringed by warm stones.'],
  eiffelTower: ['Eiffel Tower', 'landmark', 'A tapering lattice tower with a wide arched base.'],
  grandCanyon: ['Grand Canyon', 'nature', 'Layered red cliffs cut by a narrow river.'],
  windmillGrand: ['Grand windmill', 'landmark', 'A tall mill with four large turning sails.'],
  oasis: ['Oasis', 'nature', 'A small turquoise pool sheltered by palms.'],
  volcano: ['Volcano', 'nature', 'A dark volcanic cone with a glowing crater.'],
  giantMushroom: [
    'Giant mushroom',
    'nature',
    'An oversized spotted cap rising above smaller fungi.',
  ],
  aurora: ['Aurora', 'nature', 'Ribbons of green and violet light over a dark landscape.'],
  tajMahal: ['Taj Mahal', 'landmark', 'A pale domed monument flanked by slender minarets.'],
  giantWaterfall: [
    'Giant waterfall',
    'nature',
    'A broad cascade descending from a high stone ledge.',
  ],
  stBasils: [
    'Saint Basil’s Cathedral',
    'landmark',
    'A cluster of colorful onion domes and slender spires.',
  ],
  bambooGrove: ['Bamboo grove', 'nature', 'Tall jointed bamboo stems form a quiet green grove.'],
  operaHouse: [
    'Sydney Opera House',
    'landmark',
    'White sail-shaped roofs rising from a low waterfront platform.',
  ],
  glacierPeak: ['Glacier peak', 'nature', 'An angular ice peak with blue crevasses.'],
  bioluminescentPool: [
    'Bioluminescent pool',
    'nature',
    'A sheltered pool dotted with softly glowing lights.',
  ],
  meteorCrater: [
    'Meteor crater',
    'nature',
    'A round impact basin holding a luminous fallen stone.',
  ],
  bonsaiGiant: ['Giant bonsai', 'nature', 'A broad sculpted canopy on a twisting old trunk.'],
  floatingIsland: [
    'Floating island',
    'fantasy',
    'A grassy island suspended above its rocky underside.',
  ],
  crystalSpire: ['Crystal spire', 'fantasy', 'A cluster of translucent pointed crystals.'],
  dragonNest: ['Dragon nest', 'fantasy', 'A rocky nest sheltering a curled dragon.'],
  worldTree: ['World tree', 'fantasy', 'An immense branching tree dotted with golden lights.'],
  sakuraEternal: [
    'Eternal sakura',
    'fantasy',
    'A luminous flowering cherry tree with drifting petals.',
  ],
  ancientPortal: [
    'Ancient portal',
    'fantasy',
    'An old stone arch framing a swirling magical opening.',
  ],
};
