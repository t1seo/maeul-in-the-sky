import type { ModelPart } from '../../world/model/geometry-types.js';
import { branch, part, type Variant } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from './palette.js';

export function whale(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.roof, [0, 0.16, 0], [0.7, 0.31, 0.31]),
    part('sphere', C.cream, [0.09, 0.065, 0], [0.45, 0.085, 0.2]),
    part('sphere', C.charcoal, [0.24, 0.2, 0.137], [0.023, 0.023, 0.012]),
    part('sphere', C.roof, [-0.42, 0.16, 0], [0.23, 0.07, 0.41]),
    ...[-1, 1].map((side) =>
      part(
        'sphere',
        C.roof,
        [0.02, 0.093, side * 0.2],
        [0.27, 0.045, 0.16],
        [0, side * 0.45, side * 0.3],
      ),
    ),
    branch([0.13, 0.3, 0], [0.13, 0.52 + variant * 0.045, 0], 0.018, C.waterLight),
  ];
}

export function frog(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.leaf, [0, 0.052, 0], [0.16, 0.085, 0.13]),
    part('sphere', C.leafLight, [0.076, 0.07, 0], [0.095, 0.065, 0.11]),
    ...[-1, 1].flatMap((side) => [
      part(
        'sphere',
        C.leafDark,
        [-0.047, 0.036, side * 0.078],
        [0.105, 0.062, 0.07],
        [0, side * 0.6, 0],
      ),
      part('sphere', C.cream, [0.083, 0.107, side * 0.037], [0.03, 0.026, 0.029]),
      part('sphere', C.charcoal, [0.095, 0.11, side * 0.037], [0.015, 0.018, 0.019]),
      branch(
        [0.04, 0.045, side * 0.04],
        [0.12 + variant * 0.006, 0.012, side * 0.073],
        0.016,
        C.leaf,
      ),
    ]),
  ];
}

export function shellfish(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.pink, [0, 0.026, 0], [0.2, 0.05, 0.17]),
    part('sphere', C.cream, [-0.024, 0.08, 0], [0.19, 0.04, 0.16], [0, 0, 0.55 + variant * 0.09]),
    part('sphere', C.snow, [0.02, 0.059, 0], [0.034, 0.033, 0.034], [0, 0, 0], 0.3),
  ];
}

export function towel(variant: Variant): readonly ModelPart[] {
  return [
    part('box', C.cream, [0, 0.009, 0], [0.26, 0.018, 0.51]),
    ...Array.from({ length: 5 }, (_, stripe) =>
      part(
        'box',
        variant === 1 ? C.red : C.blue,
        [0, 0.021, (stripe - 2) * 0.09],
        [0.255, 0.006, 0.034],
      ),
    ),
  ];
}

export function surfboard(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', variant === 1 ? C.gold : C.blue, [0, 0.023, 0], [0.18, 0.046, 0.59]),
    part('box', C.cream, [0, 0.045, 0], [0.035, 0.007, 0.43]),
    part('cone', C.charcoal, [0, 0.057, -0.15], [0.03, 0.068, 0.074]),
  ];
}

export function watermelon(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.leafDark, [0, 0.095, 0], [0.25, 0.19, 0.19]),
    ...[-1, 0, 1].map((stripe) =>
      part('sphere', C.leafLight, [stripe * 0.049, 0.097, 0], [0.023, 0.19, 0.193]),
    ),
    part('sphere', C.red, [0.19, 0.054, 0.07], [0.1, 0.09, 0.13], [0, variant * 0.2, 0]),
  ];
}
