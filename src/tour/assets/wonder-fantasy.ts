import type { ModelPart } from '../../world/model/geometry-types.js';
import { branch, part, place, radial, type Variant } from '../../world/model/recipes/primitives.js';
import { conifer } from '../../world/model/recipes/trees.js';
import { oak } from './nature.js';
import { TOUR_COLORS as C } from './palette.js';
import { ring } from './structure.js';

export function aurora(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    ...place(conifer(2), [-0.27, 0, -0.09], 0.52),
    ...place(conifer(2), [0.29, 0, 0.03], 0.39),
  ];
  for (let ribbon = 0; ribbon < 2; ribbon += 1)
    for (let segment = 0; segment < 12; segment += 1) {
      const x = (segment - 5.5) * 0.095;
      const y = 0.85 + Math.sin(segment * 0.43 + variant * 0.3 + ribbon) * 0.13;
      parts.push(
        part(
          'box',
          ribbon ? C.violet : C.jade,
          [x, y, -0.1 + ribbon * 0.1],
          [0.1, 0.24 + (segment % 3) * 0.025, 0.017],
          [0, Math.sin(segment * 0.6) * 0.35, Math.cos(segment * 0.43) * 0.42],
          0.5,
        ),
      );
    }
  return parts;
}

export function floatingIsland(variant: Variant): readonly ModelPart[] {
  return [
    part('cone', C.stoneDark, [0, 0.5, 0], [0.78, 0.63, 0.65], [0, variant * 0.3, Math.PI]),
    part('cylinder', C.leafDark, [0, 0.825, 0], [0.84, 0.07, 0.71]),
    ...place(oak(variant), [-0.07, 0.86, -0.06], 0.53),
    part('box', C.waterLight, [0.29, 0.52, 0.17], [0.063, 0.65, 0.017], [0, 0.15, 0], 0.35),
    ...Array.from({ length: 3 }, (_, stone) =>
      part(
        'cone',
        C.stone,
        [-0.31 + stone * 0.32, 0.17 + (stone % 2) * 0.1, -0.12],
        [0.14, 0.2, 0.13],
        [0.2, stone, Math.PI],
      ),
    ),
  ];
}

export function crystalSpire(variant: Variant): readonly ModelPart[] {
  const colors = [C.ice, C.violet, C.jade] as const;
  return Array.from({ length: 7 }, (_, crystal) => {
    const [x, , z] = radial(crystal, 7, crystal === 0 ? 0 : 0.26, 0, variant * 0.2);
    const height = crystal === 0 ? 1.16 : 0.31 + (crystal % 3) * 0.18;
    const color = colors[crystal % 3] ?? C.ice;
    return [
      part(
        'cylinder',
        color,
        [x, height * 0.32, z],
        [0.15, height * 0.64, 0.15],
        [0.1, crystal, x * -0.35],
        0.27,
      ),
      part(
        'cone',
        color,
        [x - x * 0.06, height * 0.78, z],
        [0.15, height * 0.3, 0.15],
        [0.1, crystal, x * -0.35],
        0.27,
      ),
    ];
  }).flat();
}

export function dragonNest(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    ...ring([0, 0.11, 0], 0.4, 0.11, C.bark, 'xz', 12),
    part('sphere', C.straw, [0, 0.045, 0], [0.77, 0.09, 0.68]),
  ];
  for (let curl = 0; curl < 10; curl += 1) {
    const point = radial(curl, 13, 0.25, 0.2, 0.2);
    const size = 0.14 - curl * 0.006;
    parts.push(
      part('sphere', C.leafDark, point, [size, size, size * 1.2]),
      part('cone', C.gold, [point[0], point[1] + size * 0.55, point[2]], [0.045, 0.095, 0.045]),
    );
  }
  parts.push(
    part('sphere', C.leaf, [0.17, 0.38, 0.16], [0.25, 0.17, 0.17]),
    part('sphere', C.leafDark, [0.26, 0.35, 0.2], [0.16, 0.095, 0.12]),
  );
  for (const side of [-1, 1]) {
    parts.push(
      part(
        'cone',
        C.gold,
        [0.12, 0.52, 0.16 + side * 0.063],
        [0.035, 0.18, 0.035],
        [side * 0.25, 0, 0.35],
      ),
    );
    parts.push(part('sphere', C.gold, [0.225, 0.412, 0.16 + side * 0.075], [0.026, 0.027, 0.012]));
    parts.push(
      part(
        'cone',
        C.leaf,
        [-0.02, 0.4, side * 0.2],
        [0.34, 0.37 + variant * 0.03, 0.025],
        [side * 0.5, side * 0.2, side * 0.45],
      ),
    );
  }
  return parts;
}

export function worldTree(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [...place(oak(variant), [0, 0, 0], 1.55)];
  for (let light = 0; light < 14; light += 1)
    parts.push(
      part(
        'sphere',
        C.glow,
        radial(light, 14, 0.43, 0.76 + (light % 4) * 0.13),
        [0.03, 0.034, 0.03],
        [0, 0, 0],
        0.5,
      ),
    );
  for (let root = 0; root < 5; root += 1)
    parts.push(branch([0, 0.3, 0], radial(root, 5, 0.39, 0.018), 0.065));
  return parts;
}

export function ancientPortal(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [];
  for (const side of [-1, 1])
    for (let stone = 0; stone < 3; stone += 1)
      parts.push(
        part(
          'box',
          stone % 2 ? C.stone : C.stoneDark,
          [side * 0.31, 0.09 + stone * 0.17, 0],
          [0.18, 0.17, 0.23],
          [0, side * 0.06, 0],
        ),
      );
  for (let stone = 0; stone < 9; stone += 1) {
    const angle = (stone * Math.PI) / 8;
    parts.push(
      part(
        'box',
        stone % 2 ? C.stoneLight : C.stone,
        [Math.cos(angle) * 0.31, 0.49 + Math.sin(angle) * 0.31, 0],
        [0.14, 0.19, 0.24],
        [0, 0, angle - Math.PI / 2],
      ),
    );
  }
  for (let swirl = 0; swirl < 3; swirl += 1)
    parts.push(
      ...ring(
        [0, 0.4, 0],
        0.1 + swirl * 0.06,
        0.016,
        swirl % 2 ? C.violet : C.jade,
        'xy',
        10,
        variant * 0.3 + swirl,
        variant * 0.3 + swirl + Math.PI * 1.4,
      ),
    );
  return parts;
}
