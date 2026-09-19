import type { ModelPart } from '../geometry-types.js';
import { door, gableRoof, jar, tiledRoof, windowFrame } from './joinery.js';
import { branch, PALETTE as C, part, place, type Variant } from './primitives.js';

export function station(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('box', C.stone, [0, 0.06, 0], [0.94, 0.12, 0.63]),
    part('box', C.plaster, [-0.13, 0.3, -0.05], [0.47, 0.38, 0.37]),
    ...place(gableRoof(0.59, 0.53, 0.49, 0.21, C.roof), [-0.13, 0, -0.05]),
    ...door([-0.13, 0.12, 0.145], 0.13, 0.28),
    ...windowFrame([-0.26, 0.33, 0.145], 0.09, 0.14),
    ...windowFrame([-0.12, 0.33, -0.241], 0.19, 0.15, -1),
    part('box', C.wood, [0.28, 0.5, 0.01], [0.31, 0.04, 0.5], [0.07, 0, 0]),
  ];
  for (const z of [-0.2, 0.21])
    parts.push(part('cylinder', C.wood, [0.38, 0.3, z], [0.027, 0.36, 0.027]));
  parts.push(part('box', C.woodLight, [0.23, 0.24, -0.08], [0.26, 0.03, 0.09]));
  parts.push(part('box', C.wood, [0.23, 0.18, -0.08], [0.035, 0.12, 0.055]));
  if (variant > 0) {
    parts.push(part('cylinder', C.wood, [0.39, 0.47, 0.23], [0.022, 0.7, 0.022]));
    parts.push(part('box', C.cream, [0.27, 0.75, 0.23], [0.25, 0.12, 0.025]));
  }
  if (variant === 2) {
    parts.push(part('box', C.plaster, [-0.13, 0.7, -0.05], [0.18, 0.3, 0.18]));
    parts.push(part('cone', C.roof, [-0.13, 0.9, -0.05], [0.27, 0.18, 0.27], [0, Math.PI / 4, 0]));
    parts.push(
      part('cylinder', C.cream, [-0.13, 0.76, 0.049], [0.11, 0.015, 0.11], [Math.PI / 2, 0, 0]),
    );
  }
  return parts;
}

export function pier(variant: Variant): readonly ModelPart[] {
  const planks = 7 + variant;
  const parts: ModelPart[] = [];
  for (let plank = 0; plank < planks; plank += 1) {
    parts.push(
      part(
        'box',
        plank % 3 === 0 ? C.woodLight : C.wood,
        [0, 0.18, (plank - (planks - 1) / 2) * 0.1],
        [0.55, 0.038, 0.088],
      ),
    );
  }
  for (const x of [-0.22, 0.22]) {
    parts.push(part('box', C.bark, [x, 0.14, 0], [0.06, 0.05, planks * 0.1]));
    for (const z of [-0.31, 0.31]) {
      parts.push(part('cylinder', C.wood, [x, 0.165, z], [0.065, 0.33, 0.065]));
      parts.push(part('cylinder', C.woodLight, [x, 0.335, z], [0.079, 0.025, 0.079]));
    }
    if (variant > 0) parts.push(branch([x, 0.295, -0.31], [x, 0.295, 0.31], 0.018, C.cream));
  }
  if (variant === 2) {
    parts.push(part('box', C.woodLight, [0, 0.18, -0.38], [0.87, 0.045, 0.14]));
    parts.push(...jar([0.32, 0.2, -0.38], 0.58));
  }
  return parts;
}

export function dock(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [...place(pier(variant), [0, 0, 0], 0.9)];
  parts.push(...place(tiledRoof(0.6, 0.38, 0.55), [0, 0, -0.15]));
  for (const x of [-0.23, 0.23])
    parts.push(part('cylinder', C.wood, [x, 0.35, -0.25], [0.033, 0.37, 0.033]));
  parts.push(part('box', C.woodLight, [0, 0.3, -0.27], [0.37, 0.035, 0.1]));
  parts.push(part('sphere', C.cream, [0.29, 0.12, 0.19], [0.1, 0.14, 0.1]));
  parts.push(part('cylinder', C.red, [0.29, 0.13, 0.19], [0.104, 0.03, 0.104]));
  return parts;
}

export function courtyard(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [];
  for (let stone = 0; stone < 9; stone += 1) {
    parts.push(
      part(
        'box',
        stone % 2 === 0 ? C.stoneLight : C.plaster,
        [((stone % 3) - 1) * 0.26, 0.018, (Math.floor(stone / 3) - 1) * 0.26],
        [0.244, 0.036, 0.244],
      ),
    );
  }
  for (const x of [-0.41, 0.41]) {
    parts.push(part('box', C.stone, [x, 0.07, 0], [0.06, 0.14, 0.87]));
    parts.push(part('box', C.stoneDark, [x, 0.146, 0], [0.08, 0.025, 0.89]));
  }
  const center = [
    [
      part('cylinder', C.woodLight, [0, 0.12, 0], [0.27, 0.2, 0.27]),
      part('sphere', C.leaf, [0, 0.24, 0], [0.36, 0.23, 0.33]),
    ],
    [
      part('cylinder', C.stone, [0, 0.19, 0], [0.3, 0.34, 0.3]),
      part('cylinder', C.charcoal, [0, 0.363, 0], [0.21, 0.01, 0.21]),
    ],
    [
      part('sphere', C.stoneDark, [-0.04, 0.17, 0], [0.2, 0.3, 0.26], [0.1, 0.5, 0.2]),
      part('sphere', C.stone, [0.12, 0.08, 0.06], [0.2, 0.13, 0.18]),
    ],
  ] as const;
  parts.push(...center[variant]);
  parts.push(part('box', C.woodLight, [0, 0.16, -0.32], [0.37, 0.028, 0.11]));
  for (const x of [-0.13, 0.13])
    parts.push(part('box', C.wood, [x, 0.09, -0.32], [0.045, 0.14, 0.07]));
  parts.push(...jar([0.3, 0.038, 0.31], 0.68));
  return parts;
}

export function stair(variant: Variant): readonly ModelPart[] {
  const steps = 4 + variant * 2;
  const width = 0.48 + variant * 0.08;
  const parts: ModelPart[] = [];
  for (let step = 0; step < steps; step += 1) {
    const height = (step + 1) / steps;
    const z = 0.4 - ((step + 0.5) * 0.8) / steps;
    parts.push(part('box', C.stone, [0, height / 2, z], [width, height, 0.8 / steps + 0.002]));
    parts.push(
      part(
        'box',
        C.stoneLight,
        [0, height + 0.009, z],
        [width + 0.024, 0.018, 0.8 / steps + 0.014],
      ),
    );
  }
  for (const x of [-width / 2, width / 2]) {
    parts.push(branch([x, 0.4, 0.32], [x, 1.2, -0.32], 0.024, C.wood));
    parts.push(part('box', C.wood, [x, 0.23, 0.32], [0.033, 0.46, 0.033]));
    parts.push(part('box', C.wood, [x, 0.99, -0.32], [0.033, 0.46, 0.033]));
  }
  return parts;
}
