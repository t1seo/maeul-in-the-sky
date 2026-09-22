import type { Box3 } from 'three';
import type { TourPlacement } from '../types.js';
import { WILDLIFE, type WildlifeSpecies } from './catalog.js';

const SPANS: Readonly<Partial<Record<WildlifeSpecies, number>>> = {
  rabbit: 0.8,
  goat: 1.8,
  bird: 0.55,
  chicken: 1,
  owl: 0.8,
  seagull: 0.8,
  heron: 1.2,
  whale: 3.2,
  frog: 0.5,
  shellfish: 0.6,
  fish: 0.65,
  turtle: 0.9,
  crab: 0.6,
  jellyfish: 0.8,
  butterfly: 0.4,
  spider: 0.45,
};

export function wildlifeMembers(placement: TourPlacement): readonly number[] {
  switch (placement.source.catalogId) {
    case 'fishSchool':
      return [0, 1, 2];
    case 'butterfly':
    case 'butterflyGarden':
      return Array.from({ length: 2 + (placement.source.variant % 3) }, (_, index) => index);
    default:
      return [0];
  }
}

export function wildlifePlacement(
  species: WildlifeSpecies,
  placement: TourPlacement,
  bounds: Box3,
  member: number,
) {
  const school = placement.source.catalogId === 'fishSchool';
  const butterfly = species === 'butterfly';
  const waterline =
    species === 'fish' ? 0.5 : species === 'whale' ? 0.65 : species === 'jellyfish' ? 0.78 : 0;
  const height = placement.source.catalogId === 'lamb' ? 0.66 : WILDLIFE[species].height;
  const size = school ? 0.7 : 1;
  const span = Math.hypot(bounds.max.x - bounds.min.x, bounds.max.z - bounds.min.z);
  const scale =
    Math.min(height / (bounds.max.y - bounds.min.y), (SPANS[species] ?? 3.4) / span) * size;
  const actualHeight = (bounds.max.y - bounds.min.y) * scale;
  const angle = member * 2.4;
  return {
    scale,
    height: actualHeight,
    waterline: actualHeight * waterline,
    elevation: waterline > 0 ? 0 : butterfly ? 0.65 + member * 0.17 : 0.025,
    x: school ? (member - 1) * 0.45 : butterfly ? Math.cos(angle) * 0.38 : 0,
    z: school ? (member % 2) * 0.38 : butterfly ? Math.sin(angle) * 0.38 : 0,
    ambient: species === 'squirrel' ? 'breath' : butterfly ? 'drift' : 'still',
  } as const;
}
