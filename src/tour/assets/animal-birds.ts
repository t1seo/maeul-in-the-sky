import type { ModelPart } from '../../world/model/geometry-types.js';
import { branch, part, type Variant } from '../../world/model/recipes/primitives.js';
import { eyes, toes } from './animal-parts.js';
import { TOUR_COLORS as C } from './palette.js';

function foldedWings(
  x: number,
  y: number,
  z: number,
  color: string,
  size = 1,
): readonly ModelPart[] {
  return [-1, 1].flatMap((side) => [
    part(
      'sphere',
      color,
      [x, y, side * z],
      [0.153 * size, 0.108 * size, 0.024 * size],
      [0, side * 0.1, 0.29],
    ),
    ...[0, 1, 2].map((feather) =>
      part(
        'sphere',
        color,
        [
          x - 0.035 - feather * 0.016 * size,
          y - 0.033 + feather * 0.014 * size,
          side * (z + 0.007),
        ],
        [0.088 * size, 0.022 * size, 0.023 * size],
        [0, side * 0.14, 0.31],
      ),
    ),
  ]);
}

function beak(x: number, y: number, length: number, width: number, color = C.gold): ModelPart {
  return part('cone', color, [x, y, 0], [width, length, width], [0, 0, -Math.PI / 2]);
}

export function bird(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.barkLight, [0, 0.143, 0], [0.198, 0.164, 0.127]),
    part('sphere', C.cream, [0.049, 0.13, 0], [0.112, 0.115, 0.117]),
    part('sphere', C.bark, [0.068, 0.235, 0], [0.111, 0.109, 0.099]),
    part('sphere', C.cream, [0.094, 0.219, 0], [0.069, 0.051, 0.104]),
    beak(0.146, 0.234, 0.069, 0.04),
    ...eyes(0.096, 0.254, 0.044, 0.016),
    ...foldedWings(-0.031, 0.155, 0.064, variant === 2 ? C.roof : C.bark),
    ...toes(0.002, 0.093, 0.028),
    ...[-1, 0, 1].map((feather) =>
      part(
        'sphere',
        C.bark,
        [-0.127, 0.112, feather * 0.019],
        [0.139, 0.022, 0.028],
        [0, feather * 0.14, -0.21],
      ),
    ),
  ];
}

export function robin(variant: Variant): readonly ModelPart[] {
  const singing = variant === 1;
  return [
    part('sphere', C.barkLight, [0, 0.153, 0], [0.164, 0.194, 0.141]),
    part('sphere', C.red, [0.062, 0.19, 0], [0.116, 0.176, 0.128]),
    part('sphere', C.barkLight, [0.055, 0.26, 0], [0.122, 0.123, 0.112]),
    part('sphere', C.red, [0.102, 0.242, 0], [0.068, 0.092, 0.102]),
    ...eyes(0.085, 0.282, 0.049, 0.019),
    beak(0.141, 0.26 + (singing ? 0.016 : 0), 0.059, 0.03),
    ...foldedWings(-0.028, 0.17, 0.069, C.bark, 0.89),
    ...toes(-0.011, 0.09, 0.027, C.bark),
    part('sphere', C.bark, [-0.105, 0.11, 0], [0.161, 0.027, 0.055], [0, 0, -0.51]),
    ...(singing ? [beak(0.136, 0.244, 0.049, 0.023)] : []),
  ];
}

export function winterBird(variant: Variant): readonly ModelPart[] {
  const coat = variant === 0 ? C.red : C.barkLight;
  return [
    part('sphere', coat, [0, 0.166, 0], [0.194, 0.174, 0.132]),
    part('sphere', coat, [0.082, 0.26, 0], [0.117, 0.132, 0.112]),
    part('sphere', variant === 2 ? C.cream : C.charcoal, [0.112, 0.247, 0], [0.063, 0.08, 0.116]),
    ...(variant === 0
      ? [part('cone', coat, [0.049, 0.326, 0], [0.095, 0.122, 0.076], [0, 0, 0.32])]
      : []),
    beak(0.157, 0.254, 0.068, 0.059),
    ...eyes(0.11, 0.286, 0.048, 0.019),
    ...foldedWings(-0.017, 0.178, 0.069, variant === 0 ? C.red : C.bark),
    ...toes(0.003, 0.091, 0.029, C.charcoal),
    part('sphere', coat, [-0.151, 0.093, 0], [0.193, 0.027, 0.071], [0, 0, 0.34]),
    part('sphere', variant === 2 ? C.cream : C.red, [0.063, 0.164, 0], [0.111, 0.132, 0.118]),
  ];
}

export function chicken(variant: Variant): readonly ModelPart[] {
  const coat = variant === 2 ? C.barkLight : C.cream;
  const parts: ModelPart[] = [
    part('sphere', coat, [-0.012, 0.195, 0], [0.246, 0.209, 0.187]),
    part('sphere', coat, [0.101, 0.275, 0], [0.126, 0.217, 0.118], [0, 0, -0.23]),
    part('sphere', coat, [0.143, 0.344, 0], [0.104, 0.115, 0.104]),
    beak(0.218, 0.335, 0.086, 0.049),
    part('sphere', C.red, [0.186, 0.298, 0], [0.055, 0.075, 0.048]),
    ...eyes(0.174, 0.36, 0.044, 0.018),
    ...foldedWings(-0.025, 0.202, 0.095, variant === 2 ? C.bark : C.stoneLight, 1.22),
    ...toes(0.007, 0.108, 0.045),
  ];
  for (let lobe = 0; lobe < 3; lobe += 1)
    parts.push(
      part(
        'sphere',
        C.red,
        [0.112 + lobe * 0.029, 0.402 + (lobe === 1 ? 0.008 : 0), 0],
        [0.044, 0.067, 0.039],
      ),
    );
  for (let feather = 0; feather < 5; feather += 1)
    parts.push(
      part(
        'sphere',
        feather % 2 ? C.charcoal : C.pine,
        [-0.157 - feather * 0.014, 0.273 + feather * 0.015, (feather - 2) * 0.019],
        [0.181, 0.034, 0.044],
        [0, (feather - 2) * 0.19, -0.67 - feather * 0.08],
      ),
    );
  return parts;
}

export function owl(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('sphere', C.bark, [0, 0.188, 0], [0.173, 0.258, 0.205]),
    part('sphere', C.cream, [0.072, 0.159, 0], [0.055, 0.171, 0.137]),
    part('sphere', C.barkLight, [0.021, 0.308, 0], [0.171, 0.174, 0.233]),
    part('cone', C.gold, [0.133, 0.276, 0], [0.042, 0.058, 0.033], [0, 0, -2.1]),
    ...toes(0.03, 0.069, 0.047, C.charcoal),
    ...foldedWings(-0.047, 0.178, 0.101, C.barkLight, 1.1),
  ];
  for (const side of [-1, 1])
    parts.push(
      part('sphere', C.cream, [0.101, 0.31, side * 0.06], [0.028, 0.123, 0.112]),
      part('sphere', C.gold, [0.119, 0.32, side * 0.06], [0.018, 0.064, 0.066]),
      part('sphere', C.charcoal, [0.131, 0.322, side * 0.06], [0.013, 0.039, 0.035]),
      part('sphere', C.snow, [0.14, 0.332, side * 0.06 + 0.008], [0.006, 0.015, 0.013]),
      part(
        'cone',
        C.bark,
        [0.006, 0.419, side * 0.082],
        [0.053, 0.104 + variant * 0.006, 0.054],
        [side * 0.22, 0, 0.07],
      ),
    );
  for (let fleck = 0; fleck < 6; fleck += 1)
    parts.push(
      part(
        'sphere',
        C.barkLight,
        [0.097, 0.12 + Math.floor(fleck / 2) * 0.032, (fleck % 2 === 0 ? -1 : 1) * 0.026],
        [0.006, 0.017, 0.019],
      ),
    );
  return parts;
}

export function seagull(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('sphere', C.snow, [0, 0.162, 0], [0.244, 0.133, 0.119]),
    part('sphere', C.snow, [0.091, 0.208, 0], [0.096, 0.161, 0.087], [0, 0, -0.2]),
    part('sphere', C.snow, [0.136, 0.265, 0], [0.098, 0.092, 0.081]),
    beak(0.218, 0.255, 0.105, 0.031),
    ...eyes(0.159, 0.277, 0.035, 0.015),
    ...toes(0.002, 0.109, 0.028),
    part('sphere', C.snow, [-0.156, 0.161, 0], [0.164, 0.032, 0.084], [0, 0, -0.12]),
  ];
  for (const side of [-1, 1])
    parts.push(
      part(
        'sphere',
        C.stone,
        [-0.028, 0.187, side * 0.065],
        [0.216, 0.065, 0.035],
        [0, side * 0.18, 0.04],
      ),
      part(
        'sphere',
        C.charcoal,
        [-0.118, 0.184, side * 0.069],
        [0.106, 0.036, 0.033],
        [0, side * 0.17, 0.06],
      ),
      part('sphere', C.snow, [-0.136, 0.189, side * 0.081], [0.026, 0.021, 0.012]),
    );
  if (variant === 1)
    parts.push(
      ...[-1, 1].map((side) =>
        part(
          'sphere',
          C.stone,
          [-0.016, 0.218, side * 0.16],
          [0.163, 0.025, 0.262],
          [side * 0.24, side * 0.28, 0],
        ),
      ),
    );
  return parts;
}

export function heron(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.cream, [-0.027, 0.334, 0], [0.258, 0.159, 0.129]),
    ...foldedWings(-0.047, 0.343, 0.065, C.roofLight, 1.4),
    branch([0.063, 0.37, 0], [0.039, 0.453, 0], 0.052, C.cream),
    branch([0.039, 0.453, 0], [0.115, 0.501, 0], 0.045, C.cream),
    branch([0.115, 0.501, 0], [0.094, 0.589, 0], 0.034, C.cream),
    part('sphere', C.cream, [0.135, 0.598, 0], [0.107, 0.08, 0.069]),
    beak(0.258, 0.589, 0.183, 0.029),
    ...eyes(0.154, 0.609, 0.03, 0.013),
    ...toes(-0.013 + variant * 0.006, 0.303, 0.037, C.charcoal),
    part('sphere', C.charcoal, [0.055, 0.622, 0], [0.118, 0.022, 0.039], [0, 0, -0.3]),
    part('sphere', C.roofLight, [-0.18, 0.315, 0], [0.116, 0.043, 0.081], [0, 0, 0.28]),
  ];
}
