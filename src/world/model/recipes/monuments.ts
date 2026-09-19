import type { ModelPart } from '../geometry-types.js';
import { PALETTE as C, part, type Variant } from './primitives.js';

export function monument(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('box', C.stone, [0, 0.035, 0], [0.66, 0.07, 0.58]),
    part('box', C.stoneLight, [0, 0.093, 0], [0.54, 0.045, 0.47]),
    part('box', C.stone, [0, 0.145, 0], [0.43, 0.06, 0.38]),
  ];
  const sculptures = [
    [
      part('box', C.stoneLight, [0, 0.46, 0], [0.22, 0.59, 0.17]),
      part('cone', C.stoneLight, [0, 0.81, 0], [0.26, 0.17, 0.21], [0, Math.PI / 4, 0]),
      part('box', C.gold, [0, 0.43, 0.091], [0.13, 0.17, 0.014]),
    ],
    [
      part('box', C.stoneLight, [-0.185, 0.43, 0], [0.12, 0.55, 0.19]),
      part('box', C.stoneLight, [0.185, 0.43, 0], [0.12, 0.55, 0.19]),
      part('box', C.stone, [0, 0.715, 0], [0.54, 0.12, 0.24]),
      part('box', C.gold, [0, 0.72, 0.131], [0.1, 0.07, 0.012]),
    ],
    [
      part('cylinder', C.stoneLight, [0, 0.37, 0], [0.25, 0.4, 0.25]),
      part('box', C.wood, [0, 0.59, 0], [0.44, 0.04, 0.28]),
      part('box', C.cream, [-0.095, 0.64, 0], [0.2, 0.045, 0.25], [0, 0, -0.2]),
      part('box', C.cream, [0.095, 0.64, 0], [0.2, 0.045, 0.25], [0, 0, 0.2]),
      part('cylinder', C.gold, [0, 0.65, 0], [0.02, 0.27, 0.02], [Math.PI / 2, 0, 0]),
    ],
  ] as const;
  parts.push(...sculptures[variant]);
  for (const side of [-1, 1]) {
    parts.push(part('sphere', C.leafDark, [side * 0.26, 0.15, 0.17], [0.12, 0.18, 0.13]));
    parts.push(part('sphere', C.leaf, [side * 0.28, 0.21, 0.17], [0.08, 0.12, 0.095]));
  }
  return parts;
}
