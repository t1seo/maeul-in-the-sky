import type { ModelPart } from '../../world/model/geometry-types.js';
import { part, type Variant } from '../../world/model/recipes/primitives.js';
import { ears, eyes, hoovedLegs, tuftedTail } from './animal-parts.js';
import { TOUR_COLORS as C } from './palette.js';

export function horse(variant: Variant): readonly ModelPart[] {
  const coat = variant === 2 ? C.stoneLight : C.bark;
  const parts: ModelPart[] = [
    part('sphere', coat, [-0.032, 0.365, 0], [0.484, 0.262, 0.225]),
    part('sphere', coat, [0.148, 0.422, 0], [0.164, 0.294, 0.178], [0, 0, -0.25]),
    part('sphere', coat, [0.212, 0.541, 0], [0.13, 0.261, 0.135], [0, 0, -0.38]),
    part('sphere', coat, [0.298, 0.58, 0], [0.231, 0.128, 0.127], [0, 0, -0.59]),
    part('sphere', C.stoneLight, [0.377, 0.526, 0], [0.097, 0.085, 0.103], [0, 0, -0.36]),
    part('sphere', C.cream, [0.329, 0.606, 0], [0.148, 0.011, 0.028], [0, 0, -0.6]),
    ...hoovedLegs(0.155, 0.075, 0.329, 0.035, coat, variant),
    ...eyes(0.291, 0.629, 0.056, 0.02),
    ...ears([0.215, 0.715, 0.049], [0.043, 0.106, 0.047], coat, 0.12, C.barkLight),
    ...tuftedTail(
      [
        [-0.264, 0.404, 0],
        [-0.307, 0.306, 0.027],
        [-0.299, 0.135, 0.039],
      ],
      0.069,
      C.charcoal,
    ),
    part('sphere', C.charcoal, [-0.307, 0.122, 0.039], [0.077, 0.117, 0.084]),
  ];
  for (let lock = 0; lock < 6; lock += 1)
    parts.push(
      part(
        'sphere',
        C.charcoal,
        [0.123 + lock * 0.014, 0.439 + lock * 0.039, -0.005],
        [0.064, 0.11, 0.084],
        [0, 0, -0.3],
      ),
    );
  for (const side of [-1, 1])
    parts.push(part('sphere', C.charcoal, [0.408, 0.535, side * 0.029], [0.014, 0.018, 0.017]));
  return parts;
}

export function donkey(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('sphere', C.stone, [-0.026, 0.292, 0], [0.403, 0.213, 0.198]),
    part('sphere', C.stone, [0.151, 0.363, 0], [0.143, 0.255, 0.141], [0, 0, -0.17]),
    part('sphere', C.stone, [0.227, 0.465, 0], [0.183, 0.139, 0.126], [0, 0, -0.25]),
    part('sphere', C.cream, [0.314, 0.425, 0], [0.123, 0.095, 0.115]),
    part('sphere', C.cream, [0.024, 0.239, 0], [0.24, 0.08, 0.191]),
    part('sphere', C.charcoal, [-0.025, 0.399, 0], [0.307, 0.015, 0.031]),
    ...hoovedLegs(0.13, 0.065, 0.261, 0.032, C.stone, variant),
    ...eyes(0.257, 0.49, 0.058, 0.021),
    ...ears([0.193, 0.639, 0.054], [0.06, 0.263, 0.057], C.stone, 0.2),
    ...tuftedTail(
      [
        [-0.229, 0.326, 0],
        [-0.276, 0.255, 0.023],
        [-0.27, 0.116, 0.043],
      ],
      0.018,
      C.stone,
    ),
    part('sphere', C.charcoal, [-0.272, 0.099, 0.044], [0.044, 0.089, 0.047]),
  ];
  for (let lock = 0; lock < 5; lock += 1)
    parts.push(
      part(
        'box',
        C.charcoal,
        [0.115 + lock * 0.011, 0.386 + lock * 0.027, 0],
        [0.022, 0.073, 0.029],
        [0, 0, -0.22],
      ),
    );
  for (const side of [-1, 1])
    parts.push(part('sphere', C.charcoal, [0.359, 0.442, side * 0.034], [0.012, 0.016, 0.013]));
  return parts;
}
