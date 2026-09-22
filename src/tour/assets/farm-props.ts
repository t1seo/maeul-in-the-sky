import type { ModelPart } from '../../world/model/geometry-types.js';
import { branch, part, place, radial, type Variant } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from './palette.js';
import { ring } from './structure.js';

export function crops(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 9 }, (_, crop) => {
    const x = ((crop % 3) - 1) * 0.16;
    const z = (Math.floor(crop / 3) - 1) * 0.16;
    const height = 0.24 + ((crop + variant) % 3) * 0.05;
    return [
      part('cylinder', C.leafDark, [x, height / 2, z], [0.012, height, 0.012]),
      part('sphere', C.strawLight, [x, height, z], [0.043, 0.115, 0.031], [0, crop, 0.2]),
      part('sphere', C.leaf, [x + 0.026, height * 0.5, z], [0.11, 0.017, 0.036], [0, crop, 0.55]),
    ];
  }).flat();
}

export function vegetableBeds(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [];
  for (let bed = 0; bed < 3; bed += 1) {
    parts.push(part('box', C.bark, [(bed - 1) * 0.24, 0.018, 0], [0.19, 0.036, 0.67]));
    for (let cabbage = 0; cabbage < 4; cabbage += 1) {
      const x = (bed - 1) * 0.24;
      const z = (cabbage - 1.5) * 0.15;
      parts.push(part('sphere', C.leafLight, [x, 0.075, z], [0.09, 0.11, 0.09]));
      for (const side of [-1, 1])
        parts.push(
          part(
            'sphere',
            (bed + variant) % 2 ? C.leaf : C.leafDark,
            [x + side * 0.04, 0.062, z],
            [0.041, 0.095, 0.079],
            [0, side * 0.3, side * 0.4],
          ),
        );
    }
  }
  return parts;
}

export function pumpkin(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [];
  for (let lobe = 0; lobe < 7; lobe += 1)
    parts.push(
      part('sphere', lobe % 2 ? C.autumn : C.red, radial(lobe, 7, 0.043, 0.084), [
        0.085,
        0.15 + variant * 0.009,
        0.085,
      ]),
    );
  parts.push(part('cylinder', C.leafDark, [0.01, 0.175, 0], [0.025, 0.052, 0.025], [0, 0, -0.3]));
  return parts;
}

export function pumpkinPatch(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 3 + variant }, (_, index) =>
    place(pumpkin(index % 2 === 0 ? 0 : 1), radial(index, 5, 0.23, 0), 0.65 + (index % 2) * 0.17),
  ).flat();
}

export function hay(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [];
  for (let bale = 0; bale < 2 + variant; bale += 1) {
    const x = ((bale % 2) - 0.5) * 0.23;
    const y = 0.1 + Math.floor(bale / 2) * 0.18;
    parts.push(
      part('cylinder', C.straw, [x, y, 0], [0.19, 0.24, 0.19], [Math.PI / 2, 0, 0]),
      ...ring([x, y, 0.125], 0.068, 0.009, C.strawLight, 'xy', 8),
    );
  }
  return parts;
}

export function fence(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('box', C.woodLight, [0, 0.14, 0], [0.7, 0.035, 0.027]),
    part('box', C.woodLight, [0, 0.27, 0], [0.7, 0.035, 0.027]),
  ];
  for (let post = 0; post < 4 + variant; post += 1)
    parts.push(
      part(
        'box',
        C.wood,
        [((post - (3 + variant) / 2) * 0.65) / (3 + variant), 0.18, 0],
        [0.04, 0.36, 0.041],
      ),
    );
  return parts;
}

export function scarecrow(variant: Variant): readonly ModelPart[] {
  return [
    part('cylinder', C.wood, [0, 0.24, 0], [0.025, 0.48, 0.025]),
    part('box', C.red, [0, 0.33, 0], [0.11, 0.2, 0.06]),
    branch([-0.17, 0.36, 0], [0.17, 0.36, 0], 0.034, C.blue),
    part('sphere', C.strawLight, [0, 0.48, 0], [0.09, 0.1, 0.085]),
    part('cone', C.straw, [0, 0.57, 0], [0.17, 0.12, 0.17], [0, 0, variant * 0.1]),
    part('sphere', C.charcoal, [-0.019, 0.49, 0.041], [0.01, 0.012, 0.01]),
    part('sphere', C.charcoal, [0.019, 0.49, 0.041], [0.01, 0.012, 0.01]),
  ];
}

export function basket(variant: Variant): readonly ModelPart[] {
  return [
    part('cylinder', C.woodLight, [0, 0.06, 0], [0.21, 0.12, 0.21]),
    ...ring([0, 0.13, 0], 0.1, 0.018, C.wood, 'xz', 10),
    ...ring([0, 0.13, 0], 0.115, 0.012, C.wood, 'xy', 8, 0, Math.PI),
    ...Array.from({ length: 6 + variant }, (_, apple) =>
      part(
        'sphere',
        apple % 2 ? C.red : C.gold,
        radial(apple, 7, 0.058, 0.13 + (apple % 3) * 0.012),
        [0.052, 0.053, 0.052],
      ),
    ),
  ];
}

export function beehive(variant: Variant): readonly ModelPart[] {
  return [
    part('box', C.wood, [0, 0.04, 0], [0.24, 0.08, 0.22]),
    ...Array.from({ length: 4 }, (_, ringIndex) =>
      part(
        'cylinder',
        ringIndex % 2 ? C.straw : C.strawLight,
        [0, 0.105 + ringIndex * 0.055, 0],
        [0.22 - ringIndex * 0.031, 0.059, 0.22 - ringIndex * 0.031],
      ),
    ),
    part('sphere', C.charcoal, [0, 0.115, 0.113], [0.046, 0.035 + variant * 0.004, 0.009]),
  ];
}
