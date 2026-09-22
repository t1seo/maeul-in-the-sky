import type { ModelPart } from '../../world/model/geometry-types.js';
import { hanok, choga, pavilion } from '../../world/model/recipes/korean.js';
import { jar, tiledRoof } from '../../world/model/recipes/joinery.js';
import { branch, part, place, type Variant } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from './palette.js';
import { lattice, lantern, wheel } from './structure.js';

export function tourHanok(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [...hanok(variant)];
  for (const x of [-0.135, 0.135])
    parts.push(...lattice([x - variant * 0.035, 0.27, 0.164 - variant * 0.045], 0.105, 0.16));
  for (let board = 0; board < 6; board += 1)
    parts.push(
      part('box', C.woodLight, [(board - 2.5) * 0.066, 0.087, 0.23], [0.058, 0.017, 0.15]),
    );
  parts.push(...lantern([0.255 - variant * 0.03, 0.39, 0.22], 0.5));
  return parts;
}

export function tourChoga(variant: Variant): readonly ModelPart[] {
  return [
    ...choga(variant),
    ...lattice([0.16, 0.24, 0.22], 0.12, 0.13),
    part('box', C.woodLight, [0.18, 0.052, 0.29], [0.25, 0.035, 0.095]),
  ];
}

export function tourPavilion(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [...pavilion(variant)];
  for (const x of [-0.27, 0.27]) {
    parts.push(part('box', C.red, [x, 0.26, 0], [0.027, 0.026, 0.4]));
    parts.push(...lantern([x, 0.43, -0.2], 0.58));
    for (const z of [-0.16, 0, 0.16])
      parts.push(part('box', C.wood, [x, 0.19, z], [0.019, 0.15, 0.02]));
  }
  parts.push(part('box', C.wood, [0, 0.47, 0.305], [0.18, 0.055, 0.014]));
  parts.push(part('box', C.gold, [0, 0.473, 0.314], [0.1, 0.008, 0.006]));
  return parts;
}

export function stoneWall(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [];
  for (let row = 0; row < 3; row += 1)
    for (let stone = 0; stone < 5; stone += 1)
      parts.push(
        part(
          'sphere',
          stone % 2 ? C.stone : C.stoneDark,
          [(stone - 2) * 0.13 + (row % 2) * 0.022, 0.045 + row * 0.055, 0],
          [0.15, 0.083, 0.14 + variant * 0.015],
          [0, stone * 0.7, 0.09],
        ),
      );
  parts.push(...tiledRoof(0.81, 0.24, 0.24));
  return parts;
}

export function onggi(variant: Variant): readonly ModelPart[] {
  return [
    part('box', C.stone, [0, 0.025, 0], [0.51, 0.05, 0.43]),
    ...Array.from({ length: 3 + variant }, (_, index) =>
      jar(
        [((index % 3) - 1) * 0.15, 0.05, Math.floor(index / 3) * 0.14 - 0.07],
        0.65 + (index % 3) * 0.15,
      ),
    ).flat(),
  ];
}

export function hanokGate(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    ...tiledRoof(0.75, 0.4, 0.73),
    part('box', C.wood, [0, 0.61, 0], [0.59, 0.075, 0.2]),
  ];
  for (const x of [-0.245, 0.245]) {
    parts.push(
      part('box', C.stoneLight, [x, 0.06, 0], [0.14, 0.12, 0.21]),
      part('cylinder', C.wood, [x, 0.35, 0], [0.067, 0.58, 0.067]),
    );
    parts.push(
      part(
        'box',
        C.woodLight,
        [x * 1.08, 0.33, -0.12],
        [0.035, 0.47, 0.24],
        [0, x > 0 ? 0.8 : -0.8, 0],
      ),
    );
    parts.push(...lantern([x, 0.54, 0.13], 0.64));
  }
  if (variant > 0) parts.push(part('box', C.wood, [0, 0.66, 0.12], [0.19, 0.069, 0.018]));
  return parts;
}

export function estate(variant: Variant): readonly ModelPart[] {
  const wings = [-1, 1].flatMap((side) => [
    part('box', C.plaster, [side * 0.36, 0.17, 0.1], [0.19, 0.24, 0.39]),
    part('roof', C.roof, [side * 0.36, 0.34, 0.1], [0.28, 0.14, 0.47]),
    ...lattice([side * 0.36, 0.2, 0.302], 0.11, 0.14),
    part('box', C.wood, [side * 0.36, 0.075, 0.33], [0.2, 0.05, 0.1]),
  ]);
  return [
    part('box', C.stoneLight, [0, 0.025, 0], [1, 0.05, 0.86]),
    ...place(tourHanok(0), [0, 0.05, -0.18], 0.9),
    ...wings,
    ...place(hanokGate(variant), [0, 0.05, 0.32], 0.45),
  ];
}

export function watermill(variant: Variant): readonly ModelPart[] {
  return [
    ...place(tourChoga(variant), [-0.13, 0, 0], 0.8),
    ...wheel([0.29, 0.28, 0.02], 0.255),
    part('box', C.water, [0.29, 0.015, 0], [0.22, 0.024, 0.76], [0, 0, 0], 0.35),
  ];
}

export function guardians(variant: Variant): readonly ModelPart[] {
  return [-1, 1].flatMap((side) => {
    const x = side * 0.16;
    const y = 0.57 + (side > 0 ? variant * 0.035 : 0.06);
    return [
      part('cylinder', C.wood, [x, y / 2, 0], [0.11, y, 0.11]),
      part('box', C.red, [x, y - 0.14, 0.059], [0.078, 0.02, 0.012]),
      part('cone', C.woodLight, [x, y - 0.075, 0.064], [0.035, 0.058, 0.035], [Math.PI / 2, 0, 0]),
      ...[-1, 1].map((eye) =>
        part('sphere', C.charcoal, [x + eye * 0.028, y - 0.05, 0.059], [0.025, 0.02, 0.012]),
      ),
      part('box', C.charcoal, [x, 0.28, 0.057], [0.035, 0.18, 0.009]),
    ];
  });
}

export function birdPoles(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 2 + variant }, (_, index) => {
    const x = (index - 1) * 0.16;
    const height = 0.72 + index * 0.11;
    return [
      branch([x, 0, 0], [x + 0.025, height, 0], 0.027),
      part('sphere', C.woodLight, [x + 0.025, height, 0], [0.14, 0.052, 0.04]),
      branch([x + 0.065, height, 0], [x + 0.086, height + 0.055, 0], 0.025, C.woodLight),
      part(
        'cone',
        C.woodLight,
        [x + 0.12, height + 0.055, 0],
        [0.025, 0.08, 0.025],
        [0, 0, -Math.PI / 2],
      ),
    ];
  }).flat();
}

export function stoneBridge(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [];
  for (let step = 0; step < 9; step += 1) {
    const x = (step - 4) * 0.105;
    const y = 0.08 + Math.sin((step / 8) * Math.PI) * 0.18;
    parts.push(
      part(
        'box',
        step % 2 ? C.stone : C.stoneLight,
        [x, y, 0],
        [0.111, 0.13, 0.4 + variant * 0.025],
        [0, 0, Math.cos((step / 8) * Math.PI) * 0.36],
      ),
    );
    for (const side of [-1, 1])
      parts.push(part('box', C.stoneDark, [x, y + 0.1, side * 0.19], [0.1, 0.11, 0.045]));
  }
  return parts;
}
