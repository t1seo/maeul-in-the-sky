import type { ModelPart } from '../geometry-types.js';
import { door, jar, tiledRoof, windowFrame } from './joinery.js';
import { PALETTE as C, part, place, type Variant } from './primitives.js';

function hall(width: number, depth: number): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('box', C.stoneLight, [0, 0.04, 0], [width + 0.1, 0.08, depth + 0.1]),
    part('box', C.plaster, [0, 0.24, -0.018], [width, 0.32, depth * 0.77]),
    ...tiledRoof(width + 0.19, depth + 0.19, 0.5),
    ...door([0, 0.08, depth * 0.39], 0.135, 0.27),
  ];
  for (const x of [-width * 0.43, width * 0.43]) {
    for (const z of [-depth * 0.4, depth * 0.45]) {
      parts.push(part('cylinder', C.wood, [x, 0.28, z], [0.035, 0.4, 0.035]));
    }
    parts.push(...windowFrame([x * 0.55, 0.28, depth * 0.39], 0.1, 0.16));
    parts.push(...windowFrame([x * 0.55, 0.28, -depth * 0.385 - 0.027], 0.1, 0.15, -1));
  }
  parts.push(part('box', C.wood, [0, 0.44, depth * 0.45], [width, 0.05, 0.045]));
  return parts;
}

export function hanok(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    ...place(hall(0.6 - variant * 0.07, 0.4), [-0.05 * variant, 0, -0.045 * variant]),
  ];
  if (variant > 0) {
    parts.push(...place(tiledRoof(0.27, 0.5, 0.39), [0.28, 0, 0.12]));
    parts.push(part('box', C.plaster, [0.28, 0.18, 0.1], [0.18, 0.32, 0.38]));
    parts.push(part('cylinder', C.wood, [0.28, 0.23, 0.31], [0.033, 0.42, 0.033]));
  }
  parts.push(part('box', C.stone, [0, 0.022, 0.31], [0.28 + variant * 0.08, 0.044, 0.11]));
  parts.push(...jar([-0.26, 0, 0.25], 0.7));
  if (variant === 2) {
    parts.push(part('box', C.stoneLight, [-0.12, 0.025, 0.29], [0.48, 0.05, 0.28]));
    parts.push(part('box', C.wood, [-0.14, 0.08, 0.39], [0.48, 0.12, 0.045]));
    parts.push(...jar([-0.27, 0.05, 0.27], 0.6));
  }
  return parts;
}

export function choga(variant: Variant): readonly ModelPart[] {
  const width = 0.54 + variant * 0.045;
  const parts: ModelPart[] = [
    part('box', C.stone, [0, 0.03, 0], [width + 0.07, 0.06, 0.48]),
    part('box', C.plaster, [0, 0.21, 0], [width, 0.31, 0.4]),
    part('sphere', C.straw, [0, 0.43, 0], [width + 0.19, 0.36 + variant * 0.035, 0.61]),
    ...door([-0.075, 0.055, 0.21], 0.125, 0.25),
    ...windowFrame([0.16, 0.24, 0.206], 0.14, 0.15),
    ...windowFrame([0.03, 0.24, -0.206], 0.16, 0.15, -1),
    part('box', C.stoneDark, [-0.29, 0.28, -0.12], [0.065, 0.52, 0.08]),
  ];
  for (let binding = 0; binding < 5; binding += 1) {
    parts.push(
      part(
        'sphere',
        C.strawLight,
        [(binding - 2) * width * 0.17, 0.435, 0],
        [0.016, 0.361 + variant * 0.035, 0.615],
      ),
    );
  }
  for (let pot = 0; pot <= variant; pot += 1)
    parts.push(...jar([-0.2 + pot * 0.1, 0, 0.32], 0.6 + pot * 0.1));
  parts.push(part('box', C.wood, [0.24, 0.07, 0.3], [0.19, 0.05, 0.09]));
  parts.push(part('box', C.wood, [0.24, 0.032, 0.3], [0.04, 0.064, 0.07]));
  return parts;
}

export function pavilion(variant: Variant): readonly ModelPart[] {
  const columns = 4 + variant * 2;
  const parts: ModelPart[] = [
    part('box', C.stone, [0, 0.035, 0], [0.68, 0.07, 0.6]),
    part('box', C.woodLight, [0, 0.09, 0], [0.61, 0.04, 0.54]),
    ...tiledRoof(0.84, 0.72, 0.6 + variant * 0.035),
  ];
  for (let column = 0; column < columns; column += 1) {
    const angle = Math.PI / 4 + (column * Math.PI * 2) / columns;
    const x = Math.cos(angle) * 0.34;
    const z = Math.sin(angle) * 0.3;
    parts.push(part('cylinder', C.red, [x, 0.32, z], [0.042, 0.46, 0.042]));
    parts.push(part('box', C.leafDark, [x, 0.515, z], [0.1, 0.048, 0.08], [0, -angle, 0]));
  }
  parts.push(part('box', C.wood, [0, 0.2, -0.23], [0.51, 0.025, 0.035]));
  parts.push(part('box', C.stoneLight, [0, 0.03, 0.355], [0.25, 0.06, 0.12]));
  if (variant === 2) parts.push(...place(tiledRoof(0.44, 0.38, 0.82), [0, 0, 0]));
  return parts;
}

export function pagoda(variant: Variant): readonly ModelPart[] {
  const tiers = 3 + variant;
  const parts: ModelPart[] = [part('box', C.stone, [0, 0.06, 0], [0.78, 0.12, 0.7])];
  for (let tier = 0; tier < tiers; tier += 1) {
    const width = 0.66 - tier * 0.065;
    const y = 0.22 + tier * 0.25;
    parts.push(part('box', C.plaster, [0, y, 0], [width * 0.59, 0.2, width * 0.53]));
    parts.push(part('roof', C.roof, [0, y + 0.14, 0], [width + 0.11, 0.15, width]));
    for (const side of [-1, 1]) {
      parts.push(part('box', C.wood, [side * width * 0.27, y, width * 0.25], [0.029, 0.2, 0.035]));
      parts.push(part('box', C.gold, [0, y, side * width * 0.268], [0.08, 0.11, 0.014]));
      parts.push(
        part(
          'cylinder',
          C.roofLight,
          [0, y + 0.13, side * width * 0.48],
          [0.025, width + 0.09, 0.025],
          [0, 0, Math.PI / 2],
        ),
      );
    }
  }
  const top = 0.22 + (tiers - 1) * 0.25 + 0.25;
  parts.push(part('cone', C.gold, [0, top, 0], [0.065, 0.22, 0.065]));
  parts.push(part('sphere', C.gold, [0, top + 0.13, 0], [0.06, 0.06, 0.06]));
  return parts;
}
