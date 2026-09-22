import type { ModelPart } from '../../world/model/geometry-types.js';
import { branch, part, radial, type Variant } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from './palette.js';
import { ring } from './structure.js';

export function fish(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', variant === 1 ? C.red : C.blue, [0, 0.08, 0], [0.25, 0.11, 0.085]),
    part('cone', C.waterLight, [-0.15, 0.08, 0], [0.13, 0.13, 0.032], [0, 0, Math.PI / 2]),
    part('sphere', C.charcoal, [0.08, 0.1, 0.039], [0.015, 0.015, 0.015]),
    part('cone', C.blue, [0, 0.155, 0], [0.065, 0.065, 0.018]),
  ];
}

export function turtle(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('sphere', C.leafDark, [0, 0.055, 0], [0.25, 0.105, 0.2]),
    part('sphere', C.leaf, [0.15, 0.035, 0], [0.083, 0.05, 0.05]),
  ];
  for (const side of [-1, 1])
    for (const front of [-1, 1])
      parts.push(
        part(
          'sphere',
          C.leaf,
          [front * 0.065, 0.026, side * 0.1],
          [0.075, 0.025, 0.064],
          [0, side * front * 0.45, 0],
        ),
      );
  return [...parts, ...ring([0, 0.079, 0], 0.07 + variant * 0.006, 0.009, C.leafLight, 'xz', 6)];
}

export function crab(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [part('sphere', C.red, [0, 0.045, 0], [0.19, 0.065, 0.12])];
  for (const side of [-1, 1]) {
    for (let leg = 0; leg < 3; leg += 1)
      parts.push(
        branch([side * 0.07, 0.043, 0.01], [side * 0.14, 0.015, (leg - 1) * 0.058], 0.012, C.red),
      );
    parts.push(
      part(
        'sphere',
        C.red,
        [side * 0.135, 0.08, 0.082],
        [0.065, 0.09 + variant * 0.007, 0.039],
        [0, 0, side * 0.3],
      ),
    );
  }
  return parts;
}

export function jellyfish(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.violet, [0, 0.22, 0], [0.23, 0.13, 0.21]),
    ...Array.from({ length: 5 + variant }, (_, tentacle) =>
      branch(
        radial(tentacle, 7, 0.065, 0.19),
        radial(tentacle, 7, 0.079, 0.028, 0.2),
        0.012,
        C.pink,
      ),
    ),
  ];
}

export function boat(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.wood, [0, 0.045, 0], [0.67, 0.09, 0.22]),
    part('box', C.charcoal, [0, 0.085, 0], [0.41, 0.016, 0.14]),
    ...[-1, 0, 1].map((bench) =>
      part('box', C.woodLight, [bench * 0.145, 0.1, 0], [0.045, 0.025, 0.19]),
    ),
    branch([-0.06, 0.12, 0.08], [0.18, 0.035, 0.31 + variant * 0.025], 0.017, C.woodLight),
  ];
}

export function sailboat(variant: Variant): readonly ModelPart[] {
  return [
    ...boat(variant),
    part('cylinder', C.wood, [0, 0.38, 0], [0.019, 0.58, 0.019]),
    part('cone', C.cream, [0.13, 0.43, 0], [0.33, 0.43, 0.014], [0, 0, -0.25]),
    part('cone', C.red, [-0.1, 0.36, 0], [0.2, 0.28, 0.014], [0, 0, 0.2]),
  ];
}

export function waves(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 3 }, (_, index) =>
    ring(
      [0, 0.014, (index - 1) * 0.09],
      0.22 + index * 0.045,
      0.009 + variant * 0.002,
      C.waterLight,
      'xz',
      8,
      0.2,
      2.8,
    ),
  ).flat();
}

export function buoy(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.red, [0, 0.065, 0], [0.15, 0.13, 0.15]),
    part('cylinder', C.cream, [0, 0.17, 0], [0.047, 0.14 + variant * 0.02, 0.047]),
    part('sphere', C.glow, [0, 0.26, 0], [0.045, 0.05, 0.045]),
  ];
}
