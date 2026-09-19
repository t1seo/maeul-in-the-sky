import type { ModelPart } from '../geometry-types.js';
import { branch, PALETTE as C, part, radial, type Triple } from './primitives.js';

export function flower(
  position: Triple,
  height: number,
  color: string,
  petals = 5,
): readonly ModelPart[] {
  const [x, y, z] = position;
  const parts: ModelPart[] = [
    branch([x, y, z], [x + 0.012, y + height, z], 0.012, C.leafDark),
    part('sphere', C.leaf, [x + 0.04, y + height * 0.43, z], [0.11, 0.024, 0.044], [0, 0.4, 0.45]),
    part(
      'sphere',
      C.leafLight,
      [x - 0.027, y + height * 0.62, z],
      [0.075, 0.018, 0.034],
      [0, -0.6, -0.5],
    ),
    part('sphere', C.gold, [x + 0.012, y + height + 0.012, z], [0.043, 0.033, 0.043]),
  ];
  for (let petal = 0; petal < petals; petal += 1) {
    const angle = (petal * Math.PI * 2) / petals;
    parts.push(
      part(
        'sphere',
        color,
        [x + 0.012 + Math.cos(angle) * 0.037, y + height, z + Math.sin(angle) * 0.037],
        [0.068, 0.024, 0.042],
        [0, -angle, -0.18],
      ),
    );
  }
  return parts;
}

export function fruitTree(position: Triple, height: number, fruits: number): readonly ModelPart[] {
  const [x, y, z] = position;
  const parts: ModelPart[] = [
    branch([x, y + 0.02, z], [x + 0.024, y + height * 0.67, z], 0.045),
    part(
      'sphere',
      C.leafDark,
      [x, y + height * 0.7, z],
      [height * 0.57, height * 0.38, height * 0.56],
    ),
    part(
      'sphere',
      C.leaf,
      [x - 0.065, y + height * 0.84, z],
      [height * 0.46, height * 0.33, height * 0.44],
    ),
    part(
      'sphere',
      C.leafLight,
      [x + 0.065, y + height * 0.89, z + 0.02],
      [height * 0.35, height * 0.29, height * 0.38],
    ),
  ];
  for (let fruit = 0; fruit < fruits; fruit += 1) {
    const [dx, dy, dz] = radial(
      fruit,
      fruits,
      height * 0.25,
      y + height * (0.65 + (fruit % 2) * 0.12),
      0.2,
    );
    parts.push(branch([x, y + height * 0.46, z], [x + dx, dy, z + dz], 0.018));
    parts.push(
      part('sphere', fruit % 3 === 0 ? C.gold : C.red, [x + dx, dy, z + dz], [0.055, 0.062, 0.053]),
    );
  }
  return parts;
}
