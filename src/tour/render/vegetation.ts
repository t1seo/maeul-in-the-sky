import type { WindProfile } from './wind-profiles.js';
import { ORDINARY_MAP } from '../assets/ordinary-map.js';

const recipes: Readonly<Record<string, string | undefined>> = ORDINARY_MAP;

export function vegetationWind(catalogId: string): WindProfile | 'none' {
  switch (recipes[catalogId]) {
    case 'pine':
    case 'oak':
    case 'birch':
    case 'cedar':
    case 'bamboo':
    case 'willow':
    case 'palm':
    case 'fruitTree':
    case 'blossom':
    case 'smallBlossom':
    case 'bareTree':
    case 'snowPine':
    case 'snowTree':
    case 'autumnTree':
    case 'autumnBirch':
      return 'tree';
    case 'shrub':
    case 'berryBush':
    case 'fern':
      return 'shrub';
    case 'reeds':
      return 'reed';
    case 'flower':
    case 'sunflower':
      return 'flower';
    default:
      return 'none';
  }
}
