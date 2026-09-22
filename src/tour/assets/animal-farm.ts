import type { ModelPart } from '../../world/model/geometry-types.js';
import { branch, part, place, type Variant } from '../../world/model/recipes/primitives.js';
import { ears, eyes, hoovedLegs, tuftedTail } from './animal-parts.js';
import { TOUR_COLORS as C } from './palette.js';
import { ring } from './structure.js';

export function cow(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('sphere', C.cream, [-0.025, 0.31, 0], [0.51, 0.29, 0.29]),
    part('sphere', C.cream, [0.16, 0.355, 0], [0.2, 0.29, 0.22]),
    part('sphere', C.cream, [0.24, 0.447, 0], [0.19, 0.215, 0.2]),
    part('sphere', C.pink, [0.325, 0.39, 0], [0.17, 0.12, 0.195]),
    part('sphere', C.pink, [-0.12, 0.174, 0], [0.135, 0.074, 0.09]),
    ...hoovedLegs(0.165, 0.096, 0.28, 0.046, C.cream, variant),
    ...eyes(0.284, 0.476, 0.087, 0.021),
    ...tuftedTail(
      [
        [-0.265, 0.375, 0],
        [-0.315, 0.32, 0.018],
        [-0.32, 0.175, 0.026],
      ],
      0.018,
      C.cream,
    ),
    part('sphere', C.charcoal, [-0.32, 0.15, 0.026], [0.038, 0.088, 0.042]),
    part('sphere', C.charcoal, [-0.07, 0.445, -0.005], [0.18, 0.029, 0.15]),
  ];
  for (const side of [-1, 1]) {
    parts.push(
      part('sphere', C.charcoal, [0.383, 0.405, side * 0.051], [0.023, 0.018, 0.018]),
      part('sphere', C.cream, [0.215, 0.517, side * 0.16], [0.1, 0.041, 0.15], [0, side * 0.3, 0]),
      part(
        'sphere',
        C.pink,
        [0.221, 0.535, side * 0.16],
        [0.068, 0.012, 0.098],
        [0, side * 0.3, 0],
      ),
      branch([0.2, 0.521, side * 0.06], [0.174, 0.574, side * 0.116], 0.029, C.strawLight),
      branch([0.174, 0.574, side * 0.116], [0.208, 0.618, side * 0.13], 0.017, C.cream),
      part(
        'sphere',
        C.charcoal,
        [-0.14 + variant * 0.013, 0.327, side * 0.132],
        [0.18, 0.17, 0.032],
        [0, 0, -0.25],
      ),
      part('sphere', C.charcoal, [0.055, 0.348, side * 0.135], [0.115, 0.139, 0.033], [0, 0, 0.3]),
    );
  }
  return parts;
}

export function sheep(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('sphere', C.cream, [-0.025, 0.265, 0], [0.39, 0.285, 0.265]),
    part('sphere', C.charcoal, [0.218, 0.309, 0], [0.145, 0.173, 0.125], [0, 0, -0.26]),
    ...hoovedLegs(0.125, 0.076, 0.24, 0.038, C.charcoal, variant),
    ...eyes(0.249, 0.345, 0.057),
    ...ears([0.189, 0.355, 0.105], [0.085, 0.027, 0.105], C.charcoal, 0.2, C.bark),
    part('sphere', C.cream, [-0.223, 0.24, 0], [0.1, 0.12, 0.085]),
    part('sphere', C.cream, [0.183, 0.395, 0], [0.138, 0.082, 0.13]),
  ];
  for (let row = 0; row < 3; row += 1)
    for (let curl = 0; curl < 7; curl += 1) {
      const angle = (curl * Math.PI * 2) / 7;
      parts.push(
        part(
          'sphere',
          C.cream,
          [-0.137 + row * 0.12, 0.278 + Math.cos(angle) * 0.1, Math.sin(angle) * 0.09],
          [0.15, 0.145, 0.14],
        ),
      );
    }
  return parts;
}

export function lamb(variant: Variant): readonly ModelPart[] {
  return place(sheep(variant), [0, 0, 0], 0.68).map((item) =>
    item.color === C.charcoal && item.position.y > 0.03 && item.size.y > 0.035
      ? { ...item, color: C.stoneLight }
      : item,
  );
}

export function goat(variant: Variant): readonly ModelPart[] {
  const coat = variant === 2 ? C.barkLight : C.stoneLight;
  const parts: ModelPart[] = [
    part('sphere', coat, [-0.016, 0.28, 0], [0.35, 0.2, 0.175]),
    part('sphere', coat, [0.148, 0.349, 0], [0.13, 0.245, 0.13], [0, 0, -0.37]),
    part('sphere', coat, [0.23, 0.424, 0], [0.165, 0.145, 0.12], [0, 0, -0.32]),
    part('sphere', C.cream, [0.287, 0.386, 0], [0.096, 0.071, 0.102]),
    part('cone', C.cream, [0.277, 0.322, 0], [0.065, 0.12, 0.062], [0, 0, Math.PI]),
    ...hoovedLegs(0.12, 0.063, 0.25, 0.032, coat, variant),
    ...eyes(0.252, 0.443, 0.055),
    ...ears([0.204, 0.458, 0.09], [0.065, 0.035, 0.12], coat, 0.3),
    part('sphere', coat, [-0.207, 0.331, 0], [0.11, 0.046, 0.064], [0, 0, -0.8]),
  ];
  for (const side of [-1, 1])
    parts.push(
      ...tuftedTail(
        [
          [0.18, 0.473, side * 0.047],
          [0.164, 0.556, side * 0.071],
          [0.103, 0.59, side * 0.083],
          [0.052, 0.552, side * 0.078],
        ],
        0.027,
        C.strawLight,
      ),
    );
  return parts;
}

export function pig(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('sphere', C.pink, [-0.016, 0.2, 0], [0.4, 0.245, 0.25]),
    part('sphere', C.pink, [0.173, 0.235, 0], [0.19, 0.193, 0.183]),
    part('cylinder', C.lotus, [0.281, 0.221, 0], [0.119, 0.066, 0.119], [0, 0, -Math.PI / 2]),
    ...hoovedLegs(0.124, 0.074, 0.158, 0.036, C.pink, variant),
    ...eyes(0.224, 0.27, 0.076, 0.019),
    ...ears([0.154, 0.334, 0.077], [0.073, 0.102, 0.06], C.pink, 0.48, C.lotus),
    ...ring([-0.226, 0.244, 0], 0.038, 0.013, C.pink, 'xy', 9, 0, Math.PI * 1.75),
  ];
  for (const side of [-1, 1])
    parts.push(part('sphere', C.charcoal, [0.317, 0.226, side * 0.029], [0.008, 0.024, 0.019]));
  return parts;
}
