import type { ModelPart } from '../geometry-types.js';
import { PALETTE as C, part, type Variant } from './primitives.js';

function boulders(): readonly ModelPart[] {
  return Array.from({ length: 5 }, (_, index) => {
    const angle = index * 2.4;
    const x = Math.cos(angle) * 0.2;
    const z = Math.sin(angle) * 0.2;
    const height = 0.17 + (index % 3) * 0.1;
    return [
      part(
        'sphere',
        index % 2 === 0 ? C.stone : C.stoneLight,
        [x, height / 2, z],
        [0.34, height, 0.24],
        [0.08, angle, 0.12],
      ),
      part(
        'sphere',
        C.leafDark,
        [x - 0.035, height * 0.9, z + 0.02],
        [0.18, 0.035, 0.1],
        [0, angle, -0.1],
      ),
    ];
  }).flat();
}

function ridge(): readonly ModelPart[] {
  return Array.from({ length: 5 }, (_, index) => {
    const height = 0.2 + (3 - Math.abs(index - 2)) * 0.16;
    return [
      part(
        'box',
        index % 2 === 0 ? C.stone : C.stoneDark,
        [(index - 2) * 0.13, height / 2, 0],
        [0.19, height, 0.31],
        [0.05, -0.2, 0.1],
      ),
      part(
        'sphere',
        C.stoneLight,
        [(index - 2) * 0.13 - 0.02, height * 0.94, 0],
        [0.2, 0.14, 0.3],
        [0.1, -0.2, -0.1],
      ),
      part(
        'box',
        C.barkLight,
        [(index - 2) * 0.13, height * 0.32, 0.01],
        [0.205, 0.025, 0.33],
        [0.05, -0.2, 0.1],
      ),
    ];
  }).flat();
}

function arch(): readonly ModelPart[] {
  const parts: ModelPart[] = [];
  for (const side of [-1, 1]) {
    parts.push(part('sphere', C.stoneDark, [side * 0.3, 0.075, 0], [0.29, 0.15, 0.32]));
    parts.push(
      part('box', C.stone, [side * 0.3, 0.24, 0], [0.2, 0.4, 0.24], [0, side * 0.1, side * 0.045]),
    );
  }
  for (let stone = 0; stone < 7; stone += 1) {
    const angle = (stone * Math.PI) / 6;
    parts.push(
      part(
        'box',
        stone % 2 === 0 ? C.stoneLight : C.stone,
        [Math.cos(angle) * 0.3, 0.42 + Math.sin(angle) * 0.24, 0],
        [0.19, 0.16, 0.27],
        [0.05, 0, angle - Math.PI / 2],
      ),
    );
  }
  return parts;
}

const SHAPES = [boulders, ridge, arch] as const;

export function rocks(variant: Variant): readonly ModelPart[] {
  return SHAPES[variant]();
}
