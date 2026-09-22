import type { ModelPart } from '../../world/model/geometry-types.js';
import { part, branch, place, type Variant } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from './palette.js';
import { lantern, ring } from './structure.js';

export function logs(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 3 + variant }, (_, index) => {
    const x = ((index % 3) - 1) * 0.12;
    const y = 0.055 + Math.floor(index / 3) * 0.105;
    return [
      part('cylinder', C.bark, [x, y, 0], [0.105, 0.37, 0.105], [Math.PI / 2, 0, 0]),
      part('cylinder', C.woodLight, [x, y, 0.19], [0.081, 0.007, 0.081], [Math.PI / 2, 0, 0]),
    ];
  }).flat();
}

export function stump(variant: Variant): readonly ModelPart[] {
  return [
    part('cylinder', C.bark, [0, 0.095, 0], [0.19, 0.19 + variant * 0.023, 0.17]),
    part('cylinder', C.woodLight, [0, 0.195 + variant * 0.012, 0], [0.18, 0.013, 0.16]),
    ...ring([0, 0.204 + variant * 0.012, 0], 0.06, 0.006, C.bark, 'xz', 10),
    ...ring([0, 0.205 + variant * 0.012, 0], 0.03, 0.005, C.bark, 'xz', 8),
  ];
}

export function barrel(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.wood, [0, 0.13, 0], [0.2, 0.26, 0.2]),
    part('cylinder', C.woodLight, [0, 0.253, 0], [0.155, 0.012, 0.155]),
    ...ring([0, 0.068, 0], 0.093, 0.012, C.charcoal, 'xz', 12),
    ...ring([0, 0.19 + variant * 0.006, 0], 0.093, 0.012, C.charcoal, 'xz', 12),
  ];
}

export function lamp(variant: Variant): readonly ModelPart[] {
  return [
    part('cylinder', C.stoneDark, [0, 0.035, 0], [0.13, 0.07, 0.13]),
    part('cylinder', C.wood, [0, 0.31, 0], [0.022, 0.56, 0.022]),
    branch([0, 0.58, 0], [0.12, 0.58, 0], 0.018),
    ...lantern([0.11, 0.48, 0], 0.8 + variant * 0.1),
  ];
}

export function signpost(variant: Variant): readonly ModelPart[] {
  return [
    part('box', C.wood, [0, 0.23, 0], [0.035, 0.46, 0.035]),
    part('box', C.woodLight, [0.025, 0.4, 0], [0.29, 0.084, 0.022]),
    part('cone', C.woodLight, [0.19, 0.4, 0], [0.081, 0.084, 0.022], [0, 0, -Math.PI / 2]),
    part('box', C.wood, [-0.04, 0.28, 0], [0.22, 0.07, 0.023], [0, 0, variant * 0.07]),
  ];
}

export function flag(variant: Variant): readonly ModelPart[] {
  return [
    part('cylinder', C.wood, [0, 0.32, 0], [0.018, 0.64, 0.018]),
    part(
      'box',
      variant === 1 ? C.blue : C.red,
      [0.11, 0.53, 0],
      [0.21, 0.13, 0.013],
      [0, 0.12, 0.035],
    ),
    part('sphere', C.gold, [0, 0.67, 0], [0.035, 0.035, 0.035]),
  ];
}

export function cart(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('box', C.woodLight, [0, 0.16, 0], [0.41, 0.04, 0.24]),
    part('box', C.wood, [0, 0.25, -0.13], [0.43, 0.17, 0.022]),
    part('box', C.wood, [0, 0.25, 0.13], [0.43, 0.17, 0.022]),
  ];
  for (const x of [-0.15, 0.15])
    for (const z of [-0.16, 0.16])
      parts.push(
        part('cylinder', C.charcoal, [x, 0.095, z], [0.18, 0.033, 0.18], [Math.PI / 2, 0, 0]),
        part(
          'cylinder',
          C.woodLight,
          [x, 0.095, z * 1.14],
          [0.12, 0.011, 0.12],
          [Math.PI / 2, 0, 0],
        ),
      );
  parts.push(branch([0.15, 0.16, 0], [0.45 + variant * 0.025, 0.1, 0], 0.025));
  return parts;
}

export function campfire(variant: Variant): readonly ModelPart[] {
  return [
    ...place(logs(0), [0, 0, 0], 0.6),
    part('cone', C.red, [0, 0.15, 0], [0.18, 0.26, 0.16]),
    part('cone', C.glow, [0.024, 0.12, 0.035], [0.09, 0.18 + variant * 0.03, 0.08]),
  ];
}

export function snowman(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.snow, [0, 0.12, 0], [0.26, 0.24, 0.25]),
    part('sphere', C.snow, [0, 0.3, 0], [0.19, 0.2, 0.18]),
    part('cylinder', C.red, [0, 0.255, 0], [0.2, 0.032, 0.19]),
    part('cone', C.red, [0, 0.315, 0.112], [0.03, 0.1, 0.03], [Math.PI / 2, 0, 0]),
    ...[-1, 1].map((side) =>
      part('sphere', C.charcoal, [side * 0.032, 0.34, 0.08], [0.018, 0.018, 0.018]),
    ),
    part('cylinder', C.charcoal, [0, 0.42, 0], [0.13, 0.1 + variant * 0.02, 0.13]),
  ];
}

export function laundry(variant: Variant): readonly ModelPart[] {
  return [
    branch([-0.32, 0, 0], [-0.32, 0.44, 0], 0.025),
    branch([0.32, 0, 0], [0.32, 0.44, 0], 0.025),
    branch([-0.32, 0.43, 0], [0.32, 0.43, 0], 0.005, C.charcoal),
    ...Array.from({ length: 3 + variant }, (_, cloth) =>
      part(
        'box',
        cloth % 2 ? C.cream : C.blue,
        [(cloth - (2 + variant) / 2) * 0.12, 0.32, 0],
        [0.095, 0.19, 0.008],
        [0.03, 0, (cloth % 2) * 0.035],
      ),
    ),
  ];
}
