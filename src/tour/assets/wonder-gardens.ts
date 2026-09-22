import type { ModelPart } from '../../world/model/geometry-types.js';
import { pond } from '../../world/model/recipes/gardens.js';
import { bamboo, willow } from '../../world/model/recipes/trees.js';
import { branch, part, place, radial, type Variant } from '../../world/model/recipes/primitives.js';
import { mushroom, oak, palm, blossomTree, evergreen } from './nature.js';
import { TOUR_COLORS as C } from './palette.js';
import { ring } from './structure.js';

export function giantSequoia(variant: Variant): readonly ModelPart[] {
  const parts = place(evergreen(variant), [0, 0, 0], 1.35).map((item) =>
    item.color === C.bark ? { ...item, color: C.red } : item,
  );
  return [
    ...parts,
    part('cylinder', C.red, [0, 0.45, 0], [0.18, 0.9, 0.18]),
    ...Array.from({ length: 5 }, (_, root) =>
      branch([0, 0.23, 0], radial(root, 5, 0.24, 0.015), 0.052, C.barkLight),
    ),
  ];
}

export function coralReef(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [part('sphere', C.stoneLight, [0, 0.04, 0], [0.9, 0.08, 0.7])];
  const colors = [C.lotus, C.red, C.violet, C.gold] as const;
  for (let coral = 0; coral < 7; coral += 1) {
    const [x, , z] = radial(coral, 7, 0.28, 0, variant * 0.3);
    const height = 0.24 + (coral % 3) * 0.09;
    const color = colors[coral % 4] ?? C.lotus;
    parts.push(branch([x, 0.055, z], [x, height, z], 0.037, color));
    for (const side of [-1, 1])
      parts.push(
        branch([x, height * 0.58, z], [x + side * 0.08, height * 0.85, z], 0.023, color),
        branch(
          [x + side * 0.08, height * 0.85, z],
          [x + side * 0.09, height + 0.07, z],
          0.022,
          color,
        ),
      );
  }
  return parts;
}

export function hotSpring(variant: Variant): readonly ModelPart[] {
  const parts = pond(variant)
    .filter((item) => item.position.y < 0.2)
    .map((item) => (item.color === C.water ? { ...item, color: C.jade } : item));
  return [
    ...parts,
    ...ring([0, 0.13, 0], 0.21, 0.009, C.waterLight),
    ...Array.from({ length: 3 }, (_, index) =>
      part(
        'sphere',
        C.snow,
        [-0.12 + index * 0.12, 0.27 + index * 0.08, 0],
        [0.025, 0.18, 0.032],
        [0, 0, 0.23],
      ),
    ),
  ];
}

export function geyser(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [...place(hotSpring(0), [0, 0, 0], 0.65)];
  for (let jet = 0; jet < 6 + variant; jet += 1) {
    const endpoint = radial(jet, 8, 0.18, 0.58 + (jet % 3) * 0.12);
    parts.push(
      branch([0, 0.08, 0], endpoint, 0.025, jet % 2 ? C.waterLight : C.snow),
      part('sphere', C.snow, endpoint, [0.045, 0.09, 0.045]),
    );
  }
  return parts;
}

export function oasis(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.strawLight, [0, 0.035, 0], [1.07, 0.07, 0.83]),
    ...place(pond(0), [0.12, 0.02, 0.08], 0.66),
    ...place(palm(variant), [-0.29, 0.06, -0.16], 0.9),
    ...place(palm(0), [0.27, 0.05, -0.21], 0.63),
  ];
}

export function giantMushroom(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('cylinder', C.cream, [0, 0.32, 0], [0.14, 0.64, 0.14]),
    part('sphere', C.red, [0, 0.69, 0], [0.84, 0.4, 0.77]),
    ...place(mushroom(variant), [0.25, 0, 0.15], 0.6),
  ];
  for (let spot = 0; spot < 8; spot += 1)
    parts.push(
      part(
        'sphere',
        C.cream,
        radial(spot, 8, 0.24, 0.855, 0.2),
        [0.077, 0.018, 0.062],
        [0.05, spot, 0.15],
      ),
    );
  return parts;
}

export function bambooGrove(variant: Variant): readonly ModelPart[] {
  return [
    ...place(bamboo(variant), [-0.2, 0, -0.12], 1),
    ...place(bamboo(0), [0.24, 0, 0.16], 0.85),
    part('box', C.stoneLight, [0.02, 0.018, 0.02], [0.16, 0.036, 0.78], [0, -0.2, 0]),
  ];
}

export function bioluminescentPool(variant: Variant): readonly ModelPart[] {
  return [
    ...pond(variant),
    ...Array.from({ length: 11 }, (_, light) =>
      part(
        'sphere',
        light % 2 ? C.jade : C.ice,
        radial(light, 11, 0.15 + (light % 3) * 0.06, 0.14 + (light % 3) * 0.024),
        [0.023, 0.026, 0.023],
        [0, 0, 0],
        0.4,
      ),
    ),
    ...place(willow(0), [-0.28, 0.02, -0.2], 0.55),
  ];
}

export function bonsaiGiant(variant: Variant): readonly ModelPart[] {
  return [
    part('box', C.stoneDark, [0, 0.065, 0], [0.81, 0.13, 0.58]),
    ...place(oak(variant), [0, 0.13, 0], 0.93).map((item) => ({
      ...item,
      position: {
        ...item.position,
        x: item.position.x * 1.2,
        y: 0.13 + (item.position.y - 0.13) * 0.73,
      },
      size: { ...item.size, x: item.size.x * 1.2, y: item.size.y * 0.73 },
    })),
  ];
}

export function sakuraEternal(variant: Variant): readonly ModelPart[] {
  return [
    ...place(blossomTree(variant), [0, 0, 0], 1.3),
    ...Array.from({ length: 11 }, (_, petal) =>
      part(
        'sphere',
        petal % 2 ? C.pink : C.cream,
        radial(petal, 11, 0.43 + (petal % 2) * 0.09, 0.13 + (petal % 4) * 0.19),
        [0.047, 0.013, 0.027],
        [0.3, petal, 0.4],
      ),
    ),
  ];
}
