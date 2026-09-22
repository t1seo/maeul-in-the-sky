import type { ModelPart } from '../../world/model/geometry-types.js';
import { branch, part, radial, type Variant } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from './palette.js';
import { ring } from './structure.js';

export function torii(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('box', C.red, [0, 0.65, 0], [0.82, 0.065, 0.095]),
    part('box', C.red, [0, 0.81, 0], [0.93, 0.08, 0.16]),
    part('box', C.charcoal, [0, 0.86, 0], [0.93, 0.036, 0.19]),
  ];
  for (const side of [-1, 1]) {
    parts.push(
      part('cylinder', C.red, [side * 0.3, 0.39, 0], [0.07, 0.78, 0.07], [0, 0, side * 0.04]),
      part('cylinder', C.charcoal, [side * 0.313, 0.055, 0], [0.088, 0.11, 0.088]),
    );
    parts.push(
      part('box', C.charcoal, [side * 0.46, 0.875, 0], [0.22, 0.036, 0.19], [0, 0, side * 0.2]),
    );
  }
  parts.push(part('box', C.gold, [0, 0.72, 0.055], [0.055 + variant * 0.008, 0.1, 0.013]));
  return parts;
}

export function colosseum(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [part('cylinder', C.strawLight, [0, 0.025, 0], [1.1, 0.05, 0.8])];
  const columns = 14 + variant * 2;
  for (let tier = 0; tier < 2; tier += 1)
    for (let index = 0; index < columns; index += 1) {
      const angle = (index * Math.PI * 2) / columns;
      const x = Math.cos(angle) * 0.47;
      const z = Math.sin(angle) * 0.32;
      parts.push(
        part('box', C.stoneLight, [x, 0.16 + tier * 0.22, z], [0.054, 0.22, 0.065], [0, -angle, 0]),
      );
      parts.push(
        part('box', C.plaster, [x, 0.265 + tier * 0.22, z], [0.09, 0.065, 0.18], [0, -angle, 0]),
      );
      parts.push(
        part(
          'box',
          C.straw,
          [x * 0.85, 0.08 + tier * 0.12, z * 0.85],
          [0.09, 0.05, 0.18],
          [0, -angle, 0],
        ),
      );
    }
  return parts;
}

export function eiffelTower(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [];
  for (const x of [-1, 1])
    for (const z of [-1, 1]) {
      parts.push(part('box', C.stone, [x * 0.31, 0.025, z * 0.31], [0.15, 0.05, 0.15]));
      parts.push(branch([x * 0.32, 0.04, z * 0.32], [x * 0.14, 0.55, z * 0.14], 0.043, C.charcoal));
      parts.push(
        branch([x * 0.14, 0.55, z * 0.14], [x * 0.035, 1.18, z * 0.035], 0.025, C.charcoal),
      );
      for (let section = 0; section < 4; section += 1) {
        const height = 0.28 + section * 0.2;
        const width = 0.24 - section * 0.052;
        parts.push(
          branch(
            [x * width, height, z * width],
            [-x * width * 0.8, height + 0.16, z * width * 0.8],
            0.012,
            C.wood,
          ),
        );
      }
    }
  parts.push(
    part('box', C.charcoal, [0, 0.45, 0], [0.43, 0.045, 0.43]),
    part('box', C.wood, [0, 0.85, 0], [0.24, 0.03, 0.24]),
    part('box', C.charcoal, [0, 1.18, 0], [0.11, 0.04, 0.11]),
    part('cone', C.gold, [0, 1.33 + variant * 0.015, 0], [0.037, 0.28, 0.037]),
  );
  return parts;
}

export function tajMahal(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('box', C.stoneLight, [0, 0.045, 0], [1.08, 0.09, 0.97]),
    part('box', C.cream, [0, 0.3, 0], [0.62, 0.42, 0.55]),
    part('cylinder', C.plaster, [0, 0.55, 0], [0.4, 0.1, 0.4]),
    part('sphere', C.cream, [0, 0.69, 0], [0.48, 0.41, 0.48]),
    part('cone', C.gold, [0, 0.96, 0], [0.028, 0.16, 0.028]),
    part('box', C.stoneDark, [0, 0.24, 0.284], [0.16, 0.27, 0.018]),
    part('sphere', C.stoneDark, [0, 0.37, 0.284], [0.16, 0.16, 0.018]),
  ];
  for (const x of [-0.43, 0.43])
    for (const z of [-0.39, 0.39]) {
      parts.push(
        part('cylinder', C.cream, [x, 0.42, z], [0.073, 0.67, 0.073]),
        part('cylinder', C.stoneLight, [x, 0.58, z], [0.105, 0.035, 0.105]),
        part('sphere', C.plaster, [x, 0.79, z], [0.12, 0.13, 0.12]),
        part('cone', C.gold, [x, 0.89, z], [0.018, 0.1, 0.018]),
      );
    }
  for (let window = 0; window < 4 + variant; window += 1)
    parts.push(
      part(
        'box',
        C.stoneDark,
        [(window - (3 + variant) / 2) * 0.095, 0.39, -0.283],
        [0.042, 0.1, 0.012],
      ),
    );
  return parts;
}

export function stBasils(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('box', C.stoneLight, [0, 0.04, 0], [0.98, 0.08, 0.88]),
    part('box', C.red, [0, 0.24, 0], [0.59, 0.4, 0.5]),
  ];
  const colors = [C.red, C.leafDark, C.blue, C.gold, C.cream] as const;
  for (let tower = 0; tower < 5; tower += 1) {
    const [x, , z] = tower === 4 ? [0, 0, 0] : radial(tower, 4, 0.32, 0, Math.PI / 4);
    const height = tower === 4 ? 0.98 : 0.6 + (tower % 2) * 0.14;
    const color = colors[tower] ?? C.red;
    parts.push(
      part('cylinder', C.red, [x, height / 2, z], [0.18, height, 0.18]),
      part('cylinder', C.cream, [x, height - 0.05, z], [0.21, 0.045, 0.21]),
      part('sphere', color, [x, height + 0.1, z], [0.27, 0.26, 0.27]),
      part('cone', color, [x, height + 0.28, z], [0.2, 0.23, 0.2]),
      part('cone', C.gold, [x, height + 0.43, z], [0.023, 0.13 + variant * 0.015, 0.023]),
    );
    parts.push(...ring([x, height + 0.07, z], 0.136, 0.016, C.cream, 'xz', 8));
  }
  return parts;
}

export function operaHouse(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('box', C.straw, [0, 0.065, 0], [1.03, 0.13, 0.75]),
    part('box', C.charcoal, [0, 0.16, 0], [0.82, 0.14, 0.5]),
  ];
  for (let sail = 0; sail < 6; sail += 1) {
    const x = ((sail % 3) - 1) * 0.27;
    const height = 0.53 + (sail % 3) * 0.12;
    const z = sail < 3 ? -0.15 : 0.17;
    parts.push(
      part(
        'cone',
        sail % 2 ? C.cream : C.snow,
        [x, height / 2 + 0.17, z],
        [0.4, height, 0.19],
        [0.18, 0, -0.38 + variant * 0.03],
      ),
    );
    parts.push(
      branch([x - 0.12, 0.18, z + 0.03], [x + 0.12, height + 0.11, z - 0.02], 0.014, C.stoneLight),
    );
  }
  return parts;
}
