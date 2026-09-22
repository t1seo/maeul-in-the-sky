import type { ModelPart } from '../../world/model/geometry-types.js';
import { branch, part, place, type Variant } from '../../world/model/recipes/primitives.js';
import { ears, eyes, hoovedLegs, tuftedTail } from './animal-parts.js';
import { TOUR_COLORS as C } from './palette.js';

export function deer(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('sphere', C.barkLight, [-0.027, 0.355, 0], [0.412, 0.196, 0.164]),
    part('sphere', C.cream, [0.124, 0.398, 0.003], [0.09, 0.202, 0.113], [0, 0, -0.43]),
    part('sphere', C.barkLight, [0.17, 0.43, 0], [0.112, 0.253, 0.109], [0, 0, -0.35]),
    part('sphere', C.barkLight, [0.232, 0.543, 0], [0.139, 0.128, 0.102]),
    part('sphere', C.barkLight, [0.296, 0.512, 0], [0.123, 0.081, 0.088], [0, 0, -0.25]),
    part('sphere', C.charcoal, [0.35, 0.5, 0], [0.034, 0.032, 0.055]),
    part('sphere', C.cream, [-0.244, 0.376, 0], [0.084, 0.057, 0.057], [0, 0, -0.4]),
    ...hoovedLegs(0.137, 0.052, 0.322, 0.026, C.barkLight, variant),
    ...eyes(0.268, 0.56, 0.046, 0.019),
    ...ears([0.193, 0.606, 0.083], [0.057, 0.099, 0.074], C.barkLight, 0.75, C.cream),
  ];
  for (const side of [-1, 1]) {
    parts.push(
      ...tuftedTail(
        [
          [0.21, 0.592, side * 0.031],
          [0.164, 0.662, side * 0.071],
          [0.143, 0.74, side * 0.092],
          [0.179, 0.789, side * 0.104],
        ],
        0.018,
        C.wood,
      ),
      branch([0.176, 0.645, side * 0.061], [0.249, 0.697, side * 0.084], 0.012, C.wood),
      branch([0.15, 0.711, side * 0.084], [0.09, 0.754, side * 0.136], 0.012, C.wood),
      branch([0.143, 0.74, side * 0.092], [0.218, 0.777, side * 0.136], 0.011, C.wood),
    );
    for (let spot = 0; spot < 4; spot += 1)
      parts.push(
        part(
          'sphere',
          C.cream,
          [-0.153 + spot * 0.077, 0.389 + (spot % 2) * 0.013, side * 0.072],
          [0.028, 0.025, 0.014],
        ),
      );
  }
  return parts;
}

function singleRabbit(variant: Variant): readonly ModelPart[] {
  const fur = variant === 1 ? C.barkLight : C.stoneLight;
  const parts: ModelPart[] = [
    part('sphere', fur, [-0.031, 0.156, 0], [0.27, 0.255, 0.2]),
    part('sphere', fur, [0.107, 0.218, 0], [0.161, 0.18, 0.143]),
    part('sphere', C.cream, [0.166, 0.192, 0], [0.086, 0.054, 0.104]),
    part('sphere', C.pink, [0.211, 0.208, 0], [0.025, 0.026, 0.04]),
    part('sphere', C.cream, [-0.179, 0.176, 0], [0.091, 0.098, 0.095]),
    ...eyes(0.146, 0.25, 0.063, 0.024),
    ...ears([0.071, 0.378, 0.047], [0.054, 0.235, 0.052], fur, variant === 1 ? 0.31 : 0.14),
  ];
  for (const side of [-1, 1]) {
    parts.push(
      part('sphere', fur, [-0.072, 0.126, side * 0.078], [0.172, 0.186, 0.121]),
      part('sphere', fur, [-0.015, 0.036, side * 0.09], [0.184, 0.062, 0.09]),
      part('sphere', fur, [0.106, 0.087, side * 0.056], [0.054, 0.139, 0.051], [0, 0, -0.14]),
      part('sphere', C.cream, [0.129, 0.03, side * 0.057], [0.074, 0.043, 0.054]),
      branch([0.191, 0.192, side * 0.04], [0.205, 0.207, side * 0.12], 0.004, C.cream),
      branch([0.191, 0.185, side * 0.04], [0.222, 0.177, side * 0.116], 0.004, C.cream),
    );
  }
  return parts;
}

export function rabbit(variant: Variant): readonly ModelPart[] {
  return variant === 2
    ? [
        ...place(singleRabbit(0), [-0.125, 0, -0.11], 0.79),
        ...place(singleRabbit(1), [0.157, 0, 0.13], 0.7),
      ]
    : singleRabbit(variant);
}

export function fox(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('sphere', C.red, [-0.011, 0.23, 0], [0.367, 0.19, 0.157]),
    part('sphere', C.cream, [0.12, 0.253, 0], [0.11, 0.211, 0.135], [0, 0, -0.27]),
    part('sphere', C.red, [0.177, 0.33, 0], [0.157, 0.163, 0.143]),
    part('cone', C.cream, [0.263, 0.287, 0], [0.099, 0.133, 0.115], [0, 0, -Math.PI / 2 - 0.2]),
    part('sphere', C.charcoal, [0.326, 0.277, 0], [0.032, 0.032, 0.04]),
    ...hoovedLegs(0.126, 0.051, 0.198, 0.027, C.charcoal, variant),
    ...eyes(0.216, 0.352, 0.063, 0.02),
    part('sphere', C.red, [-0.265, 0.248, 0.035], [0.25, 0.151, 0.135], [0, -0.13, -0.46]),
    part('sphere', C.red, [-0.351, 0.31, 0.047], [0.217, 0.136, 0.128], [0, -0.12, -0.7]),
    part('sphere', C.cream, [-0.409, 0.37, 0.055], [0.139, 0.113, 0.098], [0, -0.12, -0.75]),
  ];
  for (const side of [-1, 1])
    parts.push(
      part(
        'cone',
        C.red,
        [0.14, 0.447, side * 0.059],
        [0.084, 0.158, 0.07],
        [side * 0.18, 0, 0.09],
      ),
      part(
        'cone',
        C.charcoal,
        [0.17, 0.445, side * 0.059],
        [0.016, 0.102, 0.041],
        [side * 0.18, 0, 0.09],
      ),
    );
  return parts;
}

export function squirrel(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('sphere', C.barkLight, [0, 0.211, 0], [0.165, 0.266, 0.15], [0, 0, -0.22]),
    part('sphere', C.cream, [0.068, 0.238, 0], [0.042, 0.18, 0.097], [0, 0, -0.18]),
    part('sphere', C.barkLight, [0.083, 0.362, 0], [0.137, 0.128, 0.117]),
    part('sphere', C.barkLight, [0.151, 0.34, 0], [0.094, 0.062, 0.079]),
    part('sphere', C.charcoal, [0.197, 0.344, 0], [0.021, 0.024, 0.027]),
    ...eyes(0.115, 0.389, 0.052, 0.025),
    ...ears([0.056, 0.441, 0.044], [0.042, 0.094, 0.04], C.barkLight, 0.17, C.bark),
    part('sphere', C.gold, [0.147, 0.221, 0], [0.073, 0.093, 0.075]),
    part('sphere', C.bark, [0.147, 0.252, 0], [0.081, 0.047, 0.083]),
  ];
  for (const side of [-1, 1])
    parts.push(
      part('sphere', C.barkLight, [-0.034, 0.098, side * 0.062], [0.114, 0.135, 0.089]),
      part('sphere', C.barkLight, [0.03, 0.031, side * 0.068], [0.143, 0.053, 0.063]),
      branch([0.06, 0.27, side * 0.058], [0.15, 0.221, side * 0.043], 0.03, C.barkLight),
    );
  const curl = variant * 0.009;
  parts.push(
    part('sphere', C.barkLight, [-0.13, 0.192, 0], [0.155, 0.193, 0.146], [0, 0, -0.48]),
    part('sphere', C.barkLight, [-0.221, 0.282, 0], [0.165, 0.235, 0.158], [0, 0, -0.24]),
    part('sphere', C.barkLight, [-0.218, 0.423 + curl, 0], [0.174, 0.207, 0.166], [0, 0, 0.27]),
    part('sphere', C.barkLight, [-0.138, 0.496 + curl, 0], [0.151, 0.117, 0.137], [0, 0, 0.57]),
    part('sphere', C.cream, [-0.116, 0.47 + curl, 0.04], [0.062, 0.093, 0.104], [0, 0, 0.49]),
  );
  return parts;
}
