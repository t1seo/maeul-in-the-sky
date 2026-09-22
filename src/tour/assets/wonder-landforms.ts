import type { ModelPart } from '../../world/model/geometry-types.js';
import { branch, part, radial, type Variant } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from './palette.js';
import { ring } from './structure.js';

export function mountFuji(variant: Variant): readonly ModelPart[] {
  return [
    part('cone', C.stoneDark, [0, 0.48, 0], [1.05, 0.96, 0.95], [0, variant * 0.25, 0]),
    part('cone', C.snow, [0, 0.835, 0], [0.29, 0.25, 0.27], [0, variant * 0.25, 0]),
    ...Array.from({ length: 6 }, (_, ridge) => {
      const low = radial(ridge, 6, 0.4, 0.08, 0.1);
      const high = radial(ridge, 6, 0.11, 0.75, 0.1);
      return branch(low, high, 0.025, ridge % 2 ? C.stone : C.stoneDark);
    }),
  ];
}

export function volcano(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('cone', C.charcoal, [0, 0.4, 0], [1.03, 0.8, 0.94]),
    part('cylinder', C.red, [0, 0.69, 0], [0.24, 0.025, 0.24], [0, 0, 0], 0.3),
    ...ring([0, 0.7, 0], 0.16, 0.065, C.stoneDark, 'xz', 10),
  ];
  for (let flow = 0; flow < 3 + variant; flow += 1) {
    const high = radial(flow, 4, 0.13, 0.68);
    const low = radial(flow, 4, 0.43, 0.08, 0.2);
    parts.push(
      branch(high, low, 0.029, C.red),
      part('sphere', C.gold, [low[0], low[1], low[2]], [0.04, 0.035, 0.055]),
    );
  }
  return parts;
}

export function grandCanyon(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('box', C.water, [0, 0.02, 0], [0.18, 0.022, 0.97], [0, 0.15, 0], 0.35),
  ];
  const colors = [C.red, C.straw, C.barkLight, C.autumnDark] as const;
  for (const side of [-1, 1])
    for (let tier = 0; tier < 4; tier += 1) {
      parts.push(
        part(
          'box',
          colors[tier] ?? C.red,
          [side * (0.25 + tier * 0.035), 0.075 + tier * 0.095, 0],
          [0.28 - tier * 0.04, 0.12, 0.9 - tier * 0.07],
          [0, side * 0.08, 0],
        ),
      );
      parts.push(
        part(
          'box',
          C.strawLight,
          [side * 0.27, 0.1 + tier * 0.095, -0.2 + variant * 0.025],
          [0.27 - tier * 0.04, 0.019, 0.38],
          [0, side * 0.08, 0],
        ),
      );
    }
  return parts;
}

export function glacierPeak(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 5 }, (_, peak) => {
    const [x, , z] = radial(peak, 5, peak === 0 ? 0 : 0.28, 0, 0.4);
    const height = peak === 0 ? 1.2 : 0.46 + peak * 0.08 + variant * 0.02;
    return [
      part(
        'cone',
        peak % 2 ? C.ice : C.snow,
        [x, height / 2, z],
        [0.43, height, 0.36],
        [0.05, peak, -0.04],
      ),
      part(
        'cone',
        C.blue,
        [x + 0.07, height * 0.3, z + 0.045],
        [0.11, height * 0.55, 0.12],
        [0.05, peak, -0.2],
      ),
    ];
  }).flat();
}

export function giantWaterfall(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('box', C.stoneDark, [0, 0.48, -0.11], [0.86, 0.96, 0.3]),
    part('sphere', C.leafDark, [0, 0.95, -0.13], [0.94, 0.12, 0.38]),
    part('sphere', C.water, [0, 0.027, 0.19], [0.98, 0.046, 0.59], [0, 0, 0], 0.3),
  ];
  for (let fall = 0; fall < 7; fall += 1)
    parts.push(
      part(
        'box',
        fall % 3 ? C.waterLight : C.snow,
        [(fall - 3) * 0.085, 0.49, 0.062 + (fall % 2) * 0.01],
        [0.079, 0.9 + variant * 0.015, 0.025],
        [0.015, 0, 0],
        0.35,
      ),
      part('sphere', C.snow, [(fall - 3) * 0.094, 0.085, 0.12], [0.16, 0.084, 0.15]),
    );
  return parts;
}

export function meteorCrater(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [part('cylinder', C.charcoal, [0, 0.045, 0], [0.79, 0.06, 0.73])];
  for (let rim = 0; rim < 12; rim += 1)
    parts.push(
      part(
        'sphere',
        rim % 2 ? C.stone : C.stoneDark,
        radial(rim, 12, 0.37, 0.09),
        [0.21, 0.15, 0.18],
        [0, rim, 0.15],
      ),
    );
  parts.push(
    part('sphere', C.violet, [0.015, 0.17, 0], [0.23, 0.28, 0.22], [0.4, variant, 0.4]),
    ...ring([0, 0.095, 0], 0.22, 0.018, C.jade, 'xz', 10),
  );
  return parts;
}
