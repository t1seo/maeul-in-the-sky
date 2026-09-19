import type { ModelPart } from '../geometry-types.js';
import { branch, PALETTE as C, part, type Triple } from './primitives.js';

export function windowFrame(
  position: Triple,
  width = 0.15,
  height = 0.17,
  facing: -1 | 1 = 1,
): readonly ModelPart[] {
  const [x, y, z] = position;
  return [
    part('box', C.gold, [x, y, z], [width, height, 0.017], [0, 0, 0], 0.5),
    part('box', C.wood, [x, y, z + facing * 0.013], [0.018, height + 0.023, 0.025]),
    part('box', C.wood, [x, y, z + facing * 0.013], [width + 0.023, 0.018, 0.025]),
    part(
      'box',
      C.stoneLight,
      [x, y - height / 2 - 0.018, z + facing * 0.015],
      [width + 0.04, 0.023, 0.047],
    ),
  ];
}

export function door(position: Triple, width = 0.13, height = 0.25): readonly ModelPart[] {
  const [x, y, z] = position;
  return [
    part('box', C.wood, [x, y + height / 2, z], [width, height, 0.025]),
    part(
      'box',
      C.woodLight,
      [x - width / 2, y + height / 2, z + 0.007],
      [0.022, height + 0.03, 0.036],
    ),
    part(
      'box',
      C.woodLight,
      [x + width / 2, y + height / 2, z + 0.007],
      [0.022, height + 0.03, 0.036],
    ),
    part('sphere', C.gold, [x + width * 0.27, y + height * 0.45, z + 0.021], [0.017, 0.017, 0.017]),
  ];
}

export function tiledRoof(width: number, depth: number, y: number): readonly ModelPart[] {
  const height = 0.19;
  const parts: ModelPart[] = [
    part('roof', C.roof, [0, y, 0], [width, height, depth]),
    part(
      'cylinder',
      C.roofLight,
      [0, y + height / 2 + 0.009, 0],
      [0.03, width * 0.61, 0.03],
      [0, 0, Math.PI / 2],
    ),
  ];
  for (const side of [-1, 1]) {
    parts.push(
      part(
        'cylinder',
        C.roofLight,
        [0, y - height * 0.4072, side * depth * 0.5],
        [0.028, width, 0.028],
        [0, 0, Math.PI / 2],
      ),
    );
    for (let rib = 0; rib < 3; rib += 1) {
      const u = (rib - 1) * 0.3;
      const surface = (v: number): Triple => {
        const profile =
          (0.5 - 5 * v + 6 * v * v + 13 / 24) / (25 / 24) -
          0.5 -
          Math.max(0, Math.abs(u) - 0.25) * Math.max(0, 1 - 4 * v) * 0.6;
        return [u * width, y + (profile * 0.945 + 0.0275) * height + 0.004, side * v * depth];
      };
      for (let segment = 0; segment < 3; segment += 1) {
        parts.push(branch(surface(segment / 6), surface((segment + 1) / 6), 0.012, C.roofLight));
      }
    }
  }
  return parts;
}

export function gableRoof(
  width: number,
  depth: number,
  y: number,
  height: number,
  color: string,
): readonly ModelPart[] {
  const angle = Math.atan2(height, depth / 2);
  const slope = Math.hypot(height, depth / 2);
  return [-1, 1].flatMap((side) => [
    part(
      'box',
      color,
      [0, y + height / 2, (side * depth) / 4],
      [width, 0.035, slope],
      [side * angle, 0, 0],
    ),
    part('box', C.wood, [0, y - 0.004, (side * depth) / 2], [width, 0.034, 0.031]),
    part(
      'box',
      C.woodLight,
      [side * width * 0.45, y + height / 2 - 0.015, (side * depth) / 4],
      [0.024, 0.042, slope],
      [side * angle, 0, 0],
    ),
  ]);
}

export function jar(position: Triple, scale = 1): readonly ModelPart[] {
  const [x, y, z] = position;
  return [
    part('sphere', C.bark, [x, y + 0.077 * scale, z], [0.13 * scale, 0.15 * scale, 0.13 * scale]),
    part(
      'cylinder',
      C.charcoal,
      [x, y + 0.146 * scale, z],
      [0.091 * scale, 0.024 * scale, 0.091 * scale],
    ),
  ];
}
