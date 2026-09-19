import type { WorldModelFamily } from '../../../../src/world/model/geometry-types.js';

const FAMILY_CASES = {
  conifer: 'conifer',
  broadleaf: 'broadleaf',
  bamboo: 'bamboo',
  willow: 'willow',
  grove: 'grove',
  meadow: 'meadow',
  reeds: 'reeds',
  rocks: 'rocks',
  pond: 'pond',
  hanok: 'hanok',
  choga: 'choga',
  house: 'house',
  barn: 'barn',
  market: 'market',
  tower: 'tower',
  library: 'library',
  pavilion: 'pavilion',
  orchard: 'orchard',
  'rice-terrace': 'rice-terrace',
  station: 'station',
  dock: 'dock',
  courtyard: 'courtyard',
  pier: 'pier',
  stair: 'stair',
  train: 'train',
  ferry: 'ferry',
  deer: 'deer',
  resident: 'resident',
  lanterns: 'lanterns',
  harvest: 'harvest',
  blossoms: 'blossoms',
  'snow-lights': 'snow-lights',
  monument: 'monument',
  pagoda: 'pagoda',
} as const satisfies Readonly<Record<WorldModelFamily, WorldModelFamily>>;

export const FAMILIES = Object.values(FAMILY_CASES);
export const VARIANTS = [0, 1, 2] as const;
export const RECIPE_CASES = FAMILIES.flatMap((family) =>
  VARIANTS.map((variant) => ({ family, variant })),
);
