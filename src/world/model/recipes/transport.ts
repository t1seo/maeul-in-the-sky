import type { ModelPart } from '../geometry-types.js';
import { branch, PALETTE as C, part, place, type Variant } from './primitives.js';

function wheels(length: number): readonly ModelPart[] {
  return [-1, 1].flatMap((side) =>
    [-length * 0.3, length * 0.3].flatMap((z) => [
      part(
        'cylinder',
        C.charcoal,
        [side * 0.14, 0.075, z],
        [0.13, 0.035, 0.13],
        [0, 0, Math.PI / 2],
      ),
      part(
        'cylinder',
        C.stone,
        [side * 0.162, 0.075, z],
        [0.047, 0.009, 0.047],
        [0, 0, Math.PI / 2],
      ),
    ]),
  );
}

function railcar(length: number, color: string): readonly ModelPart[] {
  const parts: ModelPart[] = [
    ...wheels(length),
    part('box', C.charcoal, [0, 0.125, 0], [0.28, 0.055, length]),
    part('box', color, [0, 0.26, 0], [0.29, 0.24, length * 0.91]),
    part('sphere', C.cream, [0, 0.38, 0], [0.32, 0.095, length]),
    part('box', C.gold, [0, 0.28, length * 0.46], [0.22, 0.12, 0.014]),
    part('box', C.gold, [0, 0.28, -length * 0.46], [0.22, 0.12, 0.014]),
  ];
  for (let window = 0; window < 3; window += 1) {
    for (const side of [-1, 1]) {
      parts.push(
        part(
          'box',
          C.gold,
          [side * 0.149, 0.29, (window - 1) * length * 0.26],
          [0.013, 0.11, length * 0.18],
        ),
      );
    }
  }
  return parts;
}

function steamTrain(): readonly ModelPart[] {
  const parts: ModelPart[] = [
    ...wheels(0.65),
    part('box', C.charcoal, [0, 0.13, 0], [0.29, 0.06, 0.75]),
    part('cylinder', C.pine, [0, 0.235, 0.13], [0.21, 0.38, 0.21], [Math.PI / 2, 0, 0]),
    part('cylinder', C.gold, [0, 0.235, 0.328], [0.15, 0.024, 0.15], [Math.PI / 2, 0, 0]),
    part('box', C.pine, [0, 0.27, -0.2], [0.29, 0.27, 0.26]),
    part('box', C.charcoal, [0, 0.419, -0.2], [0.35, 0.04, 0.32]),
    part('cylinder', C.charcoal, [0, 0.4, 0.21], [0.066, 0.19, 0.066]),
    part('cylinder', C.charcoal, [0, 0.487, 0.21], [0.1, 0.037, 0.1]),
    part('sphere', C.gold, [0, 0.372, 0.04], [0.08, 0.07, 0.08]),
  ];
  for (const side of [-1, 1]) {
    parts.push(part('box', C.gold, [side * 0.151, 0.3, -0.2], [0.015, 0.13, 0.15]));
    parts.push(branch([side * 0.166, 0.065, -0.21], [side * 0.166, 0.065, 0.21], 0.018, C.stone));
  }
  return parts;
}

const TRAINS = [
  steamTrain,
  () => railcar(0.83, C.red),
  () => [
    ...place(railcar(0.47, C.blue), [0, 0, 0.245], 0.9),
    ...place(railcar(0.47, C.blue), [0, 0, -0.245], 0.9),
    part('box', C.charcoal, [0, 0.14, 0], [0.065, 0.035, 0.09]),
  ],
] as const;

export function train(variant: Variant): readonly ModelPart[] {
  return TRAINS[variant]();
}

export function ferry(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('sphere', C.wood, [0, 0.083, 0], [0.38, 0.166, 0.88]),
    part('box', C.woodLight, [0, 0.14, -0.015], [0.3, 0.035, 0.64]),
    part('sphere', C.cream, [0, 0.127, 0], [0.383, 0.035, 0.85]),
    part('box', C.woodLight, [0, 0.151, -0.015], [0.28, 0.025, 0.63]),
  ];
  for (const side of [-1, 1]) {
    parts.push(branch([side * 0.155, 0.205, -0.27], [side * 0.155, 0.205, 0.25], 0.014, C.cream));
    for (const z of [-0.25, 0, 0.25])
      parts.push(branch([side * 0.15, 0.14, z], [side * 0.15, 0.21, z], 0.013, C.wood));
  }
  const cabins = [
    [
      part('box', C.woodLight, [0, 0.265, -0.065], [0.19, 0.2, 0.26]),
      part('sphere', C.pine, [0, 0.382, -0.065], [0.26, 0.08, 0.36]),
    ],
    [
      part('box', C.cream, [0, 0.265, -0.065], [0.22, 0.2, 0.37]),
      part('box', C.roof, [0, 0.375, -0.065], [0.28, 0.035, 0.43]),
      part('cylinder', C.red, [0, 0.46, -0.1], [0.07, 0.15, 0.07]),
    ],
    [
      part('box', C.wood, [0, 0.48, 0], [0.024, 0.64, 0.024]),
      part('box', C.cream, [0.095, 0.52, 0.018], [0.19, 0.43, 0.025], [0, 0.25, -0.12]),
      part('box', C.strawLight, [-0.07, 0.53, -0.04], [0.14, 0.3, 0.02], [0, -0.25, 0.1]),
    ],
  ] as const;
  parts.push(...cabins[variant]);
  if (variant < 2) {
    for (const side of [-1, 1])
      parts.push(part('box', C.blue, [side * 0.116, 0.29, -0.055], [0.016, 0.08, 0.17]));
    parts.push(part('box', C.blue, [0, 0.29, 0.075], [0.15, 0.08, 0.015]));
  }
  return parts;
}
