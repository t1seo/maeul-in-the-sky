import type { ModelPart } from '../../world/model/geometry-types.js';
import { flower, fruitTree } from '../../world/model/recipes/botany.js';
import { meadow, pond, reeds } from '../../world/model/recipes/gardens.js';
import { broadleaf, conifer, willow } from '../../world/model/recipes/trees.js';
import { branch, part, place, radial, type Variant } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from './palette.js';

export function evergreen(variant: Variant): readonly ModelPart[] {
  return conifer(variant).filter((item) => item.color !== C.snow);
}

export function snowPine(variant: Variant): readonly ModelPart[] {
  const tree = evergreen(variant);
  const caps = tree
    .filter((item) => item.color === C.pine || item.color === C.pineLight)
    .map((item) => ({
      ...item,
      color: C.snow,
      position: { ...item.position, y: item.position.y + 0.09 },
      size: { x: item.size.x * 0.64, y: item.size.y * 0.5, z: item.size.z * 0.64 },
    }));
  return [...tree, ...caps];
}

export function oak(variant: Variant): readonly ModelPart[] {
  return [
    ...broadleaf(variant),
    part('sphere', C.charcoal, [-0.026, 0.2, 0.053], [0.05, 0.085, 0.009]),
    ...Array.from({ length: 4 }, (_, index) =>
      branch([0, 0.15, 0], radial(index, 4, 0.24, 0.015, 0.4), 0.038),
    ),
  ];
}

export function birch(variant: Variant): readonly ModelPart[] {
  const parts = broadleaf(variant).map((item) =>
    item.color === C.bark
      ? {
          ...item,
          color: C.cream,
          size: { ...item.size, x: item.size.x * 0.7, z: item.size.z * 0.7 },
        }
      : item,
  );
  return [
    ...parts,
    ...Array.from({ length: 5 }, (_, index) =>
      part(
        'box',
        C.charcoal,
        [-0.022 + index * 0.008, 0.11 + index * 0.08, 0.063],
        [0.034, 0.014, 0.013],
      ),
    ),
  ];
}

export function blossomTree(variant: Variant): readonly ModelPart[] {
  const leaves = new Set<string>([C.leaf, C.leafDark, C.leafLight, '#c69858', '#d9b665']);
  return broadleaf(variant).map((item, index) =>
    leaves.has(item.color)
      ? { ...item, color: index % 3 === 0 ? C.cream : index % 2 === 0 ? C.lotus : C.pink }
      : item,
  );
}

export function palm(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [branch([0, 0.015, 0], [0.06, 0.75, 0], 0.065)];
  for (let ring = 0; ring < 6; ring += 1)
    parts.push(
      part('cylinder', C.barkLight, [ring * 0.008, 0.08 + ring * 0.1, 0], [0.079, 0.035, 0.079]),
    );
  for (let leaf = 0; leaf < 7 + variant; leaf += 1) {
    const tip = radial(leaf, 7 + variant, 0.34, 0.71, variant * 0.3);
    parts.push(branch([0.06, 0.75, 0], tip, 0.024, C.leafDark));
    parts.push(
      part(
        'sphere',
        leaf % 2 ? C.leaf : C.leafLight,
        [tip[0] * 0.7, 0.79, tip[2] * 0.7],
        [0.36, 0.047, 0.11],
        [0, (-leaf * Math.PI * 2) / (7 + variant), 0.25],
      ),
    );
  }
  return parts;
}

export function bareTree(variant: Variant): readonly ModelPart[] {
  return broadleaf(variant).filter((item) => item.primitive === 'cylinder');
}

export function shrub(variant: Variant): readonly ModelPart[] {
  return place(broadleaf(variant), [0, 0, 0], 0.4).map((item) => ({
    ...item,
    position: { ...item.position, y: item.position.y * 0.65 },
    size: { ...item.size, y: item.size.y * 0.65 },
  }));
}

export function berryBush(variant: Variant): readonly ModelPart[] {
  return [
    ...shrub(variant),
    ...Array.from({ length: 7 }, (_, index) =>
      part(
        'sphere',
        C.red,
        radial(index, 7, 0.14, 0.17 + (index % 2) * 0.035),
        [0.027, 0.026, 0.027],
      ),
    ),
  ];
}

export function fern(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 6 + variant }, (_, frond) => {
    const tip = radial(frond, 6 + variant, 0.22, 0.2, 0.2);
    const stem = branch([0, 0.015, 0], tip, 0.013, C.leafDark);
    const leaves = Array.from({ length: 4 }, (_, leaf) =>
      part(
        'sphere',
        leaf % 2 ? C.leaf : C.leafLight,
        [(tip[0] * (leaf + 1)) / 4, 0.06 + leaf * 0.044, (tip[2] * (leaf + 1)) / 4],
        [0.095 - leaf * 0.014, 0.022, 0.043],
        [0.2, -frond, 0.1],
      ),
    );
    return [stem, ...leaves];
  }).flat();
}

export function mushroom(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 2 + variant }, (_, index) => {
    const [x, , z] = radial(index, 3, 0.13, 0);
    const y = 0.12 + index * 0.045;
    return [
      part('cylinder', C.cream, [x, y / 2, z], [0.043, y, 0.043]),
      part('sphere', C.red, [x, y, z], [0.19, 0.09, 0.17]),
      part('sphere', C.cream, [x + 0.022, y + 0.041, z], [0.025, 0.012, 0.025]),
    ];
  }).flat();
}

export function willowPool(variant: Variant): readonly ModelPart[] {
  return [
    ...place(pond(variant), [0.15, 0, 0.05], 0.7),
    ...place(willow(variant), [-0.23, 0, -0.09], 0.85),
  ];
}

export function fruitOrchard(variant: Variant): readonly ModelPart[] {
  return fruitTree([0, 0, 0], 0.8 + variant * 0.07, 6 + variant);
}

export function field(variant: Variant): readonly ModelPart[] {
  return [
    ...place(meadow(variant), [0, 0, 0], 0.85),
    part('sphere', C.leafDark, [0, 0.022, 0], [0.7, 0.035, 0.62]),
  ];
}

export function sunflower(variant: Variant): readonly ModelPart[] {
  return [
    ...flower([0, 0, 0], 0.46 + variant * 0.06, C.gold, 8),
    part('sphere', C.bark, [0.012, 0.48 + variant * 0.06, 0], [0.055, 0.021, 0.055]),
  ];
}

export function reedPool(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.water, [0, 0.012, 0], [0.65, 0.022, 0.57], [0, 0, 0], 0.3),
    ...reeds(variant),
  ];
}
