import type { ModelPart } from '../../world/model/geometry-types.js';
import { branch, part, radial, type Variant } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from './palette.js';

export type AnimalKind =
  'deer' | 'rabbit' | 'fox' | 'sheep' | 'cow' | 'horse' | 'pig' | 'goat' | 'squirrel';
const COATS = {
  deer: C.barkLight,
  rabbit: C.stoneLight,
  fox: C.red,
  sheep: C.cream,
  cow: C.cream,
  horse: C.bark,
  pig: C.pink,
  goat: C.stoneLight,
  squirrel: C.barkLight,
} as const;
const TRAITS = {
  deer: { height: 0.27, ear: 0.062, antlers: true, tail: false, spots: false },
  rabbit: { height: 0.16, ear: 0.13, antlers: false, tail: false, spots: false },
  fox: { height: 0.16, ear: 0.062, antlers: false, tail: true, spots: false },
  sheep: { height: 0.16, ear: 0.062, antlers: false, tail: false, spots: false },
  cow: { height: 0.16, ear: 0.062, antlers: false, tail: false, spots: true },
  horse: { height: 0.27, ear: 0.062, antlers: false, tail: false, spots: false },
  pig: { height: 0.16, ear: 0.062, antlers: false, tail: false, spots: false },
  goat: { height: 0.16, ear: 0.062, antlers: true, tail: false, spots: false },
  squirrel: { height: 0.16, ear: 0.062, antlers: false, tail: true, spots: false },
} as const;

export function quadruped(kind: AnimalKind, variant: Variant): readonly ModelPart[] {
  const color = COATS[kind];
  const traits = TRAITS[kind];
  const height = traits.height;
  const parts: ModelPart[] = [
    part('sphere', color, [0, height, 0], [0.32, 0.17, 0.15]),
    part('sphere', color, [0.15, height + 0.09, 0], [0.12, 0.14, 0.1]),
    part('sphere', C.charcoal, [0.197, height + 0.117, 0.041], [0.015, 0.018, 0.012]),
  ];
  for (const x of [-0.1, 0.1])
    for (const z of [-0.053, 0.053])
      parts.push(branch([x, 0.015, z], [x + (variant - 1) * 0.02, height, z], 0.027, color));
  const earHeight = traits.ear;
  for (const side of [-1, 1])
    parts.push(
      part(
        'sphere',
        color,
        [0.14, height + 0.17, side * 0.045],
        [0.037, earHeight, 0.032],
        [side * 0.3, 0, -0.15],
      ),
    );
  if (traits.antlers)
    for (const side of [-1, 1]) {
      parts.push(
        branch(
          [0.14, height + 0.14, side * 0.03],
          [0.11, height + 0.3, side * 0.07],
          0.012,
          C.wood,
        ),
      );
      parts.push(
        branch(
          [0.12, height + 0.24, side * 0.06],
          [0.17, height + 0.29, side * 0.09],
          0.01,
          C.wood,
        ),
      );
    }
  if (traits.tail)
    parts.push(
      part('sphere', color, [-0.21, height + 0.025, 0.045], [0.25, 0.09, 0.085], [0, -0.3, -0.65]),
    );
  if (traits.spots)
    parts.push(part('sphere', C.charcoal, [-0.048, height + 0.06, 0.056], [0.13, 0.055, 0.065]));
  return parts;
}

export function bird(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.stoneLight, [0, 0.11, 0], [0.14, 0.13, 0.09]),
    part('sphere', C.bark, [0.063, 0.19, 0], [0.065, 0.065, 0.058]),
    part('cone', C.gold, [0.107, 0.185, 0], [0.032, 0.063, 0.03], [0, 0, -Math.PI / 2]),
    part('sphere', C.charcoal, [0.079, 0.2, 0.026], [0.012, 0.013, 0.01]),
    part(
      'sphere',
      variant === 1 ? C.red : C.roof,
      [-0.015, 0.12, 0.045],
      [0.13, 0.08, 0.018],
      [0, 0, 0.2],
    ),
    ...[-1, 1].map((side) =>
      branch([0.013, 0.016, side * 0.024], [0, 0.085, side * 0.024], 0.009, C.gold),
    ),
  ];
}

export function heron(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.cream, [0, 0.26, 0], [0.18, 0.13, 0.1]),
    branch([0.05, 0.28, 0], [0.05, 0.44, 0], 0.034, C.cream),
    branch([0.05, 0.44, 0], [0.12, 0.48, 0], 0.036, C.cream),
    part('cone', C.gold, [0.2, 0.47, 0], [0.025, 0.16, 0.026], [0, 0, -Math.PI / 2]),
    ...[-1, 1].map((side) =>
      branch(
        [-0.025 + variant * 0.012, 0.013, side * 0.027],
        [0, 0.25, side * 0.027],
        0.012,
        C.charcoal,
      ),
    ),
  ];
}

export function butterfly(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 2 + variant }, (_, index) => {
    const [x, y, z] = radial(index, 3, 0.14, 0.14 + index * 0.1);
    return [
      part('cylinder', C.charcoal, [x, y, z], [0.009, 0.06, 0.009], [Math.PI / 2, 0, 0]),
      ...[-1, 1].map((side) =>
        part(
          'sphere',
          index % 2 ? C.lotus : C.gold,
          [x + side * 0.038, y + 0.01, z],
          [0.07, 0.016, 0.083],
          [0, 0, side * 0.35],
        ),
      ),
    ];
  }).flat();
}

export function spider(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [part('sphere', C.charcoal, [0, 0.04, 0], [0.082, 0.05, 0.1])];
  for (let leg = 0; leg < 8; leg += 1)
    parts.push(
      branch([0, 0.04, 0], radial(leg, 8, 0.105, 0.018, variant * 0.1), 0.009, C.charcoal),
    );
  return parts;
}
