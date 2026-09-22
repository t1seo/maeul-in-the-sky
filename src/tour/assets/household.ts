import type { ModelPart } from '../../world/model/geometry-types.js';
import { part, branch, radial, type Variant } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from './palette.js';
import { ring } from './structure.js';

export function wateringCan(variant: Variant): readonly ModelPart[] {
  return [
    part('cylinder', C.blue, [0, 0.085, 0], [0.16, 0.17, 0.16]),
    ...ring([0, 0.18, 0], 0.09, 0.014, C.charcoal, 'xy', 10, 0, Math.PI),
    branch([0.075, 0.045, 0], [0.2, 0.18, 0], 0.022, C.blue),
    part(
      'sphere',
      C.charcoal,
      [0.21, 0.188, 0],
      [0.06, 0.018, 0.065],
      [0, 0, -0.5 - variant * 0.08],
    ),
  ];
}

export function cup(variant: Variant): readonly ModelPart[] {
  return [
    part('cylinder', C.cream, [0, 0.063, 0], [0.12, 0.126, 0.12]),
    part('cylinder', C.bark, [0, 0.127, 0], [0.099, 0.006, 0.099]),
    ...ring([0.073, 0.071, 0], 0.04, 0.013, C.cream, 'xy', 8),
    part('sphere', C.snow, [0.01, 0.23, 0], [0.012, 0.095 + variant * 0.01, 0.012], [0, 0, 0.2]),
  ];
}

export function rake(variant: Variant): readonly ModelPart[] {
  return [
    branch([0, 0, 0], [0.08, 0.48, 0], 0.014, C.woodLight),
    part('box', C.charcoal, [0, 0.025, 0], [0.22 + variant * 0.025, 0.014, 0.02]),
    ...Array.from({ length: 7 }, (_, tooth) =>
      part('box', C.charcoal, [(tooth - 3) * 0.03, 0.017, 0.025], [0.007, 0.022, 0.07]),
    ),
  ];
}

export function acorn(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.barkLight, [0, 0.07, 0], [0.12, 0.14, 0.11]),
    part('sphere', C.bark, [0, 0.13, 0], [0.14, 0.065, 0.13]),
    branch([0, 0.15, 0], [0.015 + variant * 0.006, 0.195, 0], 0.014),
  ];
}

export function wreath(variant: Variant): readonly ModelPart[] {
  return [
    ...ring([0, 0.16, 0], 0.13, 0.016, C.wood, 'xy', 12),
    ...Array.from({ length: 14 }, (_, leaf) => {
      const angle = (leaf * Math.PI) / 7;
      return part(
        'sphere',
        leaf % 2 ? C.autumn : C.gold,
        [Math.cos(angle) * 0.135, 0.16 + Math.sin(angle) * 0.135, 0],
        [0.07, 0.035, 0.022],
        [0, 0, angle + variant * 0.05],
      );
    }),
  ];
}

export function birdhouse(variant: Variant): readonly ModelPart[] {
  return [
    part('cylinder', C.wood, [0, 0.27, 0], [0.021, 0.54, 0.021]),
    part('box', C.woodLight, [0, 0.55, 0], [0.19, 0.22, 0.15]),
    part('roof', variant === 1 ? C.red : C.roof, [0, 0.72, 0], [0.26, 0.13, 0.22]),
    part('cylinder', C.charcoal, [0, 0.58, 0.081], [0.06, 0.012, 0.06], [Math.PI / 2, 0, 0]),
    branch([0, 0.51, 0.07], [0, 0.51, 0.15], 0.013, C.wood),
  ];
}

export function trough(variant: Variant): readonly ModelPart[] {
  return [
    part('box', C.wood, [0, 0.04, 0], [0.43, 0.05, 0.2]),
    part('box', C.water, [0, 0.067, 0], [0.37, 0.009, 0.13], [0, 0, 0], 0.25),
    ...[-1, 1].flatMap((side) => [
      part('box', C.woodLight, [0, 0.105, side * 0.09], [0.44, 0.15, 0.025]),
      part('box', C.woodLight, [side * 0.205, 0.105, 0], [0.025, 0.15 + variant * 0.01, 0.2]),
    ]),
  ];
}

export function silo(variant: Variant): readonly ModelPart[] {
  return [
    part('cylinder', C.stoneLight, [0, 0.38, 0], [0.31, 0.76, 0.31]),
    part('cone', C.roof, [0, 0.83, 0], [0.36, 0.18, 0.36]),
    ...[0.2, 0.4, 0.6].flatMap((y) => ring([0, y, 0], 0.157, 0.011, C.stoneDark, 'xz', 12)),
    ...Array.from({ length: 7 + variant }, (_, rung) =>
      part('box', C.charcoal, [0, 0.08 + rung * 0.083, 0.167], [0.085, 0.012, 0.015]),
    ),
  ];
}

export function nest(variant: Variant): readonly ModelPart[] {
  return [
    ...ring([0, 0.055, 0], 0.14, 0.042, C.bark, 'xz', 12),
    ...ring([0, 0.095, 0], 0.14, 0.025, C.woodLight, 'xz', 14),
    ...Array.from({ length: 2 + variant }, (_, egg) =>
      part('sphere', C.cream, radial(egg, 4, 0.05, 0.06), [0.05, 0.065, 0.05]),
    ),
  ];
}
