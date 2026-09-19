import type { ModelPart } from '../geometry-types.js';
import { flower, fruitTree } from './botany.js';
import { branch, PALETTE as C, part, radial, type Variant } from './primitives.js';

export function meadow(variant: Variant): readonly ModelPart[] {
  const blooms = 4 + variant;
  const parts: ModelPart[] = [];
  for (let bloom = 0; bloom < blooms; bloom += 1) {
    const position = radial(bloom, blooms, 0.15 + (bloom % 2) * 0.13, 0.015, variant * 0.25);
    parts.push(
      ...flower(
        position,
        0.17 + (bloom % 3) * 0.055,
        bloom % 2 === 0 ? C.cream : C.pink,
        4 + variant,
      ),
    );
  }
  for (let tuft = 0; tuft < 5; tuft += 1) {
    const [x, , z] = radial(tuft, 5, 0.29, 0);
    parts.push(part('cone', C.leaf, [x, 0.06, z], [0.06, 0.12, 0.045], [0.18, tuft, 0.16]));
  }
  return parts;
}

export function reeds(variant: Variant): readonly ModelPart[] {
  const stalks = 5 + variant;
  const parts: ModelPart[] = [];
  for (let stalk = 0; stalk < stalks; stalk += 1) {
    const [x, , z] = radial(stalk, stalks, 0.19 + (stalk % 2) * 0.05, 0, variant * 0.4);
    const height = 0.36 + ((stalk + variant) % 3) * 0.1;
    const lean = (stalk % 2 === 0 ? 1 : -1) * 0.065;
    parts.push(branch([x, 0.015, z], [x + lean, height, z + 0.025], 0.014, C.leafDark));
    parts.push(
      part(
        'sphere',
        C.bark,
        [x + lean, height + 0.04, z + 0.025],
        [0.035, 0.11, 0.035],
        [0, 0, -lean],
      ),
    );
    parts.push(
      part(
        'sphere',
        C.leaf,
        [x + 0.055, height * 0.38, z],
        [0.034, 0.3, 0.055],
        [0.2, stalk, -0.42],
      ),
    );
    parts.push(
      part(
        'sphere',
        C.leafLight,
        [x - 0.05, height * 0.32, z + 0.03],
        [0.031, 0.24, 0.06],
        [-0.3, stalk, 0.4],
      ),
    );
  }
  return parts;
}

export function pond(variant: Variant): readonly ModelPart[] {
  const breadth = 0.75 + variant * 0.05;
  const parts: ModelPart[] = [
    part('sphere', C.stoneDark, [0, 0.065, 0], [breadth + 0.12, 0.13, 0.8]),
    part('cylinder', C.water, [0, 0.105, 0], [breadth, 0.018, 0.67], [0, 0, 0], 0.4),
  ];
  for (let stone = 0; stone < 9; stone += 1) {
    const angle = (stone * Math.PI * 2) / 9;
    parts.push(
      part(
        'sphere',
        stone % 2 === 0 ? C.stone : C.stoneLight,
        [(Math.cos(angle) * breadth) / 2, 0.09, Math.sin(angle) * 0.35],
        [0.15, 0.13 + (stone % 3) * 0.018, 0.12],
        [0.12, angle, 0.2],
      ),
    );
  }
  for (let lily = 0; lily < 2 + variant; lily += 1) {
    const [x, , z] = radial(lily, 3 + variant, 0.2, 0, 0.5);
    parts.push(part('cylinder', C.leaf, [x, 0.122, z], [0.16, 0.013, 0.12], [0.015, lily, -0.04]));
  }
  parts.push(...flower([0.085, 0.12, -0.065], 0.075, C.pink, 6));
  parts.push(
    ...reeds(0)
      .slice(0, 8)
      .map((item) => ({
        ...item,
        position: {
          x: item.position.x * 0.4 - 0.19,
          y: item.position.y * 0.56 + 0.09,
          z: item.position.z * 0.4 - 0.23,
        },
        size: { x: item.size.x * 0.56, y: item.size.y * 0.56, z: item.size.z * 0.56 },
      })),
  );
  return parts;
}

export function orchard(variant: Variant): readonly ModelPart[] {
  const trees = 2 + variant;
  const parts: ModelPart[] = [];
  for (let tree = 0; tree < trees; tree += 1) {
    parts.push(
      ...fruitTree(radial(tree, trees, 0.25, 0, variant * 0.2), 0.62 + (tree % 2) * 0.12, 4),
    );
  }
  parts.push(part('box', C.wood, [0.02, 0.048, 0.32], [0.17, 0.09, 0.13]));
  for (let apple = 0; apple < 3; apple += 1) {
    parts.push(part('sphere', C.red, [-0.035 + apple * 0.05, 0.102, 0.32], [0.048, 0.049, 0.044]));
  }
  return parts;
}

export function riceTerrace(variant: Variant): readonly ModelPart[] {
  const levels = 3 + variant;
  const parts: ModelPart[] = [];
  for (let level = 0; level < levels; level += 1) {
    const width = 0.9 - level * 0.13;
    const z = -0.18 + level * 0.095;
    const y = 0.055 + level * 0.075;
    parts.push(part('sphere', C.barkLight, [0, y, z], [width, 0.115, 0.62 - level * 0.06]));
    parts.push(
      part(
        'cylinder',
        C.waterLight,
        [0, y + 0.061, z],
        [width - 0.055, 0.012, 0.54 - level * 0.06],
        [0, 0, 0],
        0.55,
      ),
    );
    for (let crop = 0; crop < 5; crop += 1) {
      const x = (crop - 2) * width * 0.15;
      parts.push(
        part('cone', C.leaf, [x, y + 0.1, z - 0.14], [0.036, 0.11, 0.025], [0.1, crop * 0.4, -0.1]),
      );
      parts.push(
        part(
          'cone',
          C.leafLight,
          [x + 0.025, y + 0.1, z - 0.15],
          [0.03, 0.1, 0.026],
          [0.1, crop, 0.25],
        ),
      );
    }
  }
  return parts;
}
