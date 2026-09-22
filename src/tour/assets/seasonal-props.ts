import type { ModelPart } from '../../world/model/geometry-types.js';
import { branch, part, radial, type Variant } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from './palette.js';
import { ring } from './structure.js';

export function parasol(variant: Variant): readonly ModelPart[] {
  return [
    part('cylinder', C.wood, [0, 0.22, 0], [0.016, 0.44, 0.016]),
    part('cone', variant === 1 ? C.red : C.cream, [0, 0.45, 0], [0.45, 0.12, 0.45]),
    ...Array.from({ length: 8 }, (_, rib) =>
      branch([0, 0.508, 0], radial(rib, 8, 0.215, 0.398), 0.006, C.woodLight),
    ),
  ];
}

export function fountain(variant: Variant): readonly ModelPart[] {
  return [
    part('cylinder', C.stoneLight, [0, 0.065, 0], [0.6, 0.13, 0.6]),
    part('cylinder', C.water, [0, 0.135, 0], [0.51, 0.015, 0.51], [0, 0, 0], 0.25),
    part('cylinder', C.stone, [0, 0.3, 0], [0.095, 0.37, 0.095]),
    part('sphere', C.stoneLight, [0, 0.41, 0], [0.34, 0.09, 0.34]),
    ...Array.from({ length: 5 + variant }, (_, stream) =>
      branch(radial(stream, 7, 0.12, 0.41), radial(stream, 7, 0.21, 0.14), 0.009, C.waterLight),
    ),
  ];
}

export function puddle(variant: Variant): readonly ModelPart[] {
  return [
    part(
      'sphere',
      C.water,
      [0, 0.007, 0],
      [0.48 + variant * 0.07, 0.013, 0.33],
      [0, variant * 0.3, 0],
      0.2,
    ),
    ...ring([0, 0.017, 0], 0.1, 0.004, C.waterLight, 'xz', 10),
  ];
}

export function leaves(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 11 + variant }, (_, leaf) =>
    part(
      'sphere',
      leaf % 2 ? C.autumn : C.gold,
      radial(leaf, 13, 0.13 + (leaf % 3) * 0.07, 0.022 + (leaf % 3) * 0.014),
      [0.061, 0.013, 0.04],
      [0.1, leaf, 0.2],
    ),
  );
}

export function fireflies(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 8 + variant }, (_, light) =>
    part(
      'sphere',
      light % 2 ? C.glow : C.jade,
      radial(light, 10, 0.13 + (light % 3) * 0.07, 0.1 + (light % 4) * 0.13),
      [0.015, 0.017, 0.015],
      [0, 0, 0],
      0.5,
    ),
  );
}

export function snowdrift(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 3 }, (_, snow) =>
    part(
      'sphere',
      C.snow,
      [(snow - 1) * 0.14, 0.035, (snow % 2) * 0.08],
      [0.3, 0.07 + variant * 0.017, 0.24],
    ),
  );
}

export function icicles(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 4 + variant }, (_, icicle) =>
    part(
      'cone',
      C.ice,
      [(icicle - 2) * 0.052, 0.14, 0],
      [0.036, 0.21 + (icicle % 2) * 0.05, 0.033],
      [0, 0, Math.PI],
      0.35,
    ),
  );
}

export function sled(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [part('box', C.red, [0, 0.085, 0], [0.23, 0.035, 0.37])];
  for (const side of [-1, 1]) {
    parts.push(branch([side * 0.095, 0.035, -0.21], [side * 0.095, 0.035, 0.22], 0.019, C.wood));
    parts.push(
      branch(
        [side * 0.095, 0.035, 0.22],
        [side * 0.095, 0.12 + variant * 0.01, 0.26],
        0.019,
        C.wood,
      ),
    );
  }
  return parts;
}

export function hammock(variant: Variant): readonly ModelPart[] {
  return [
    branch([-0.38, 0.02, 0], [-0.34, 0.45, 0], 0.035),
    branch([0.38, 0.02, 0], [0.34, 0.45, 0], 0.035),
    part(
      'box',
      variant === 1 ? C.blue : C.cream,
      [-0.14, 0.24, 0],
      [0.33, 0.014, 0.22],
      [0, 0, -0.4],
    ),
    part(
      'box',
      variant === 1 ? C.blue : C.cream,
      [0.14, 0.24, 0],
      [0.33, 0.014, 0.22],
      [0, 0, 0.4],
    ),
    branch([-0.34, 0.4, 0], [-0.29, 0.31, 0], 0.008, C.woodLight),
    branch([0.34, 0.4, 0], [0.29, 0.31, 0], 0.008, C.woodLight),
  ];
}

export function smoke(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 4 }, (_, puff) =>
    part(
      'sphere',
      C.stoneLight,
      [Math.sin(puff + variant) * 0.035, 0.12 + puff * 0.085, 0],
      [0.09 + puff * 0.02, 0.13, 0.08 + puff * 0.02],
    ),
  );
}

export function steppingStones(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 5 }, (_, stone) =>
    part(
      'sphere',
      stone % 2 ? C.stone : C.stoneLight,
      [Math.sin(stone) * 0.035, 0.022, (stone - 2) * 0.11],
      [0.14 + variant * 0.02, 0.044, 0.1],
      [0, stone, 0],
    ),
  );
}
