import type { ModelPart } from '../geometry-types.js';
import { door, gableRoof, windowFrame } from './joinery.js';
import { branch, PALETTE as C, part, place, type Variant } from './primitives.js';

export function house(variant: Variant): readonly ModelPart[] {
  const floors = variant === 2 ? 2 : 1;
  const width = 0.5 + variant * 0.04;
  const wallHeight = floors * 0.29;
  const parts: ModelPart[] = [
    part('box', C.stone, [0, 0.04, 0], [width + 0.04, 0.08, 0.48]),
    part('box', C.plaster, [0, 0.08 + wallHeight / 2, 0], [width, wallHeight, 0.43]),
    ...gableRoof(width + 0.14, 0.61, wallHeight + 0.08, 0.23, variant === 0 ? C.red : C.roof),
    ...door([-0.11, 0.075, 0.22], 0.12, 0.235),
    part('box', C.stoneDark, [0.17, wallHeight + 0.18, -0.12], [0.075, 0.3, 0.08]),
    part('box', C.stoneLight, [0.17, wallHeight + 0.335, -0.12], [0.095, 0.026, 0.1]),
  ];
  for (let floor = 0; floor < floors; floor += 1) {
    const y = 0.25 + floor * 0.285;
    parts.push(...windowFrame([0.13, y, 0.22], 0.13, 0.15));
    parts.push(...windowFrame([0, y, -0.22], 0.17, 0.15, -1));
    parts.push(
      part('box', C.wood, [0, 0.085 + floor * 0.285, 0.225], [width + 0.02, 0.028, 0.035]),
    );
  }
  if (variant === 1) {
    parts.push(part('box', C.plaster, [0.02, wallHeight + 0.14, 0.15], [0.19, 0.2, 0.14]));
    parts.push(...place(gableRoof(0.23, 0.21, wallHeight + 0.24, 0.1, C.roof), [0.02, 0, 0.15]));
    parts.push(...windowFrame([0.02, wallHeight + 0.16, 0.227], 0.1, 0.11));
  }
  parts.push(part('box', C.stoneLight, [-0.11, 0.03, 0.29], [0.2, 0.06, 0.12]));
  return parts;
}

export function barn(variant: Variant): readonly ModelPart[] {
  const width = 0.59 + variant * 0.045;
  const depth = 0.48;
  const parts: ModelPart[] = [
    part('box', C.stone, [0, 0.035, 0], [width + 0.07, 0.07, depth + 0.05]),
    part('box', C.red, [0, 0.25, 0], [width, 0.43, depth]),
    ...gableRoof(width + 0.12, depth + 0.14, 0.465, 0.23 + variant * 0.035, C.roof),
  ];
  for (const side of [-1, 1]) {
    parts.push(part('box', C.wood, [side * 0.08, 0.22, 0.252], [0.15, 0.33, 0.025]));
    parts.push(branch([side * 0.155, 0.08, 0.273], [0, 0.37, 0.273], 0.017, C.cream));
    parts.push(part('box', C.cream, [side * width * 0.47, 0.25, 0.25], [0.024, 0.43, 0.025]));
  }
  for (let board = 0; board < 6; board += 1) {
    parts.push(
      part('box', '#9e5949', [((board - 2.5) * width) / 6, 0.25, -0.245], [0.009, 0.4, 0.015]),
    );
  }
  parts.push(...windowFrame([0, 0.39, -0.252], 0.15, 0.1, -1));
  for (let bale = 0; bale <= variant; bale += 1) {
    parts.push(
      part(
        'cylinder',
        C.straw,
        [-0.22 + bale * 0.18, 0.072, 0.35],
        [0.14, 0.15, 0.14],
        [Math.PI / 2, 0, 0],
      ),
    );
    parts.push(
      part(
        'cylinder',
        C.strawLight,
        [-0.22 + bale * 0.18, 0.072, 0.431],
        [0.095, 0.01, 0.095],
        [Math.PI / 2, 0, 0],
      ),
    );
  }
  return parts;
}

function stall(color: string): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('box', C.woodLight, [0, 0.16, 0.05], [0.3, 0.12, 0.19]),
    part('box', C.wood, [0, 0.085, 0.05], [0.27, 0.05, 0.17]),
  ];
  for (const x of [-0.14, 0.14]) {
    parts.push(part('cylinder', C.wood, [x, 0.23, -0.09], [0.018, 0.46, 0.018]));
    parts.push(part('cylinder', C.wood, [x, 0.18, 0.13], [0.018, 0.36, 0.018]));
  }
  for (let stripe = 0; stripe < 4; stripe += 1) {
    parts.push(
      part(
        'box',
        stripe % 2 === 0 ? color : C.cream,
        [(stripe - 1.5) * 0.09, 0.41, 0.025],
        [0.09, 0.024, 0.34],
        [0.3, 0, 0],
      ),
    );
  }
  for (let fruit = 0; fruit < 4; fruit += 1) {
    parts.push(
      part(
        'sphere',
        fruit % 2 === 0 ? C.red : C.gold,
        [(fruit - 1.5) * 0.066, 0.242, 0.065],
        [0.048, 0.05, 0.05],
      ),
    );
  }
  return parts;
}

export function market(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    ...place(stall(C.red), [-0.22, 0, -0.1]),
    ...place(stall(C.blue), [0.23, 0, variant === 0 ? 0.12 : -0.1]),
  ];
  if (variant > 0) parts.push(...place(stall(C.leaf), [0, 0, 0.3], 0.78));
  if (variant === 2) {
    parts.push(part('box', C.wood, [0, 0.5, -0.12], [0.62, 0.034, 0.035]));
    parts.push(part('box', C.cream, [0, 0.56, -0.12], [0.25, 0.11, 0.028]));
    parts.push(part('cone', C.red, [-0.035, 0.64, -0.12], [0.11, 0.13, 0.025], [0, 0, Math.PI]));
  }
  return parts;
}
