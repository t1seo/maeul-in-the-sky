import type { ModelPart } from '../../world/model/geometry-types.js';
import { flower } from '../../world/model/recipes/botany.js';
import { pond } from '../../world/model/recipes/gardens.js';
import { branch, part, type Variant } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from './palette.js';

export function withSnow(parts: readonly ModelPart[]): readonly ModelPart[] {
  const caps = parts
    .filter(
      (item) =>
        item.primitive === 'roof' ||
        (item.primitive === 'box' && Math.abs(item.rotation.x) > 0.1 && item.size.y < 0.07),
    )
    .map((item) => ({
      ...item,
      color: C.snow,
      position: { ...item.position, y: item.position.y + 0.015 },
      size: { ...item.size, y: item.primitive === 'roof' ? item.size.y : 0.009 },
    }));
  return [...parts, ...caps, part('sphere', C.snow, [-0.26, 0.012, 0.23], [0.22, 0.03, 0.12])];
}

export function lily(variant: Variant): readonly ModelPart[] {
  return [
    part('cylinder', C.leafDark, [0, 0.012, 0], [0.28, 0.017, 0.22], [0, variant * 0.4, 0]),
    ...flower([0.021, 0.021, 0], 0.062, C.pink, 6),
  ];
}

export function frozenPond(variant: Variant): readonly ModelPart[] {
  const basin = pond(variant)
    .filter(
      (item) => item.color === C.water || item.color === C.stone || item.color === C.stoneLight,
    )
    .map((item) => (item.color === C.water ? { ...item, color: C.ice } : item));
  return [
    ...basin,
    branch([-0.23, 0.066, 0.13], [0.06, 0.068, 0.02], 0.004, C.waterLight),
    branch([0.06, 0.068, 0.02], [0.19, 0.068, -0.16], 0.004, C.waterLight),
    branch([0.06, 0.068, 0.02], [0.23, 0.068, 0.09], 0.004, C.waterLight),
    part('sphere', C.snow, [-0.28, 0.052, -0.13], [0.24, 0.07, 0.17]),
  ];
}

export function pool(variant: Variant): readonly ModelPart[] {
  return [
    part('box', C.stoneLight, [0, 0.025, 0], [0.78, 0.05, 0.56]),
    part('box', C.water, [0, 0.054, 0], [0.65, 0.008, 0.43], [0, 0, 0], 0.2),
    ...[-1, 1].map((side) =>
      part(
        'cylinder',
        C.charcoal,
        [side * 0.07, 0.104, 0.22],
        [0.012, 0.1 + variant * 0.01, 0.012],
      ),
    ),
  ];
}

export function canal(variant: Variant): readonly ModelPart[] {
  return [
    part('box', C.water, [0, 0.012, 0], [0.3, 0.018, 0.85], [0, 0, 0], 0.25),
    ...[-1, 1].map((side) =>
      part('box', C.stoneLight, [side * 0.19, 0.036, 0], [0.07 + variant * 0.01, 0.072, 0.9]),
    ),
  ];
}
