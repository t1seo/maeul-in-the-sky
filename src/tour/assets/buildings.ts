import type { ModelPart } from '../../world/model/geometry-types.js';
import { house } from '../../world/model/recipes/homes.js';
import { door, gableRoof, windowFrame } from '../../world/model/recipes/joinery.js';
import { branch, part, place, type Variant } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from './palette.js';
import { lantern, ring } from './structure.js';

export function church(variant: Variant): readonly ModelPart[] {
  return [
    ...house(variant),
    part('box', C.plaster, [-0.2, 0.53, -0.12], [0.21, 0.87, 0.22]),
    part('cone', C.roof, [-0.2, 1.04, -0.12], [0.32, 0.34, 0.32], [0, Math.PI / 4, 0]),
    part('box', C.gold, [-0.2, 1.25, -0.12], [0.024, 0.17, 0.024]),
    part('box', C.gold, [-0.2, 1.28, -0.12], [0.105, 0.024, 0.024]),
    ...windowFrame([-0.2, 0.83, 0], 0.09, 0.14),
  ];
}

export function windmill(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('cylinder', C.plaster, [0, 0.36, 0], [0.36, 0.72, 0.36]),
    part('cone', C.roof, [0, 0.82, 0], [0.49, 0.27, 0.49]),
    ...door([0, 0, 0.19], 0.13, 0.25),
    ...windowFrame([0, 0.52, -0.185], 0.1, 0.12, -1),
  ];
  for (let sail = 0; sail < 4; sail += 1) {
    const angle = (sail * Math.PI) / 2 + 0.25 + variant * 0.1;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    parts.push(branch([0, 0.67, 0.235], [x * 0.45, 0.67 + y * 0.45, 0.235], 0.027, C.wood));
    parts.push(
      part('box', C.cream, [x * 0.32, 0.67 + y * 0.32, 0.245], [0.28, 0.09, 0.018], [0, 0, angle]),
    );
    for (let rib = 0; rib < 3; rib += 1)
      parts.push(
        part(
          'box',
          C.wood,
          [x * (0.22 + rib * 0.085), 0.67 + y * (0.22 + rib * 0.085), 0.26],
          [0.015, 0.1, 0.015],
          [0, 0, angle],
        ),
      );
  }
  parts.push(part('sphere', C.wood, [0, 0.67, 0.255], [0.075, 0.075, 0.075]));
  return parts;
}

export function castle(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('box', C.stone, [0, 0.22, 0], [0.66, 0.44, 0.52]),
    ...door([0, 0, 0.27], 0.18, 0.29),
  ];
  for (const x of [-0.3, 0.3])
    for (const z of [-0.23, 0.23]) {
      parts.push(
        part('cylinder', C.stoneLight, [x, 0.32, z], [0.2, 0.64, 0.2]),
        part('cone', C.roof, [x, 0.72 + variant * 0.02, z], [0.27, 0.25, 0.27]),
      );
      for (const side of [-1, 1])
        parts.push(part('box', C.charcoal, [x + side * 0.07, 0.4, z + 0.076], [0.02, 0.11, 0.01]));
    }
  for (let merlon = 0; merlon < 6; merlon += 1)
    parts.push(
      part('box', C.stoneLight, [(merlon - 2.5) * 0.105, 0.48, 0.255], [0.06, 0.09, 0.07]),
    );
  return parts;
}

export function well(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('cylinder', C.water, [0, 0.06, 0], [0.26, 0.02, 0.26], [0, 0, 0], 0.3),
    ...ring([0, 0.14, 0], 0.17, 0.1, C.stoneLight, 'xz', 10),
    ...gableRoof(0.58, 0.4, 0.53, 0.16, C.roof),
  ];
  for (const x of [-0.22, 0.22]) parts.push(part('box', C.wood, [x, 0.27, 0], [0.035, 0.54, 0.04]));
  parts.push(
    branch([-0.24, 0.39, 0], [0.24, 0.39, 0], 0.039),
    part('cylinder', C.woodLight, [0.07, 0.32, 0], [0.01, 0.14 + variant * 0.03, 0.01]),
    part('cylinder', C.wood, [0.07, 0.24, 0], [0.075, 0.08, 0.075]),
  );
  return parts;
}

export function tent(variant: Variant): readonly ModelPart[] {
  return [
    part('roof', variant === 1 ? C.blue : C.straw, [0, 0.22, 0], [0.62, 0.44, 0.56]),
    part('cone', C.charcoal, [0, 0.18, 0.286], [0.27, 0.35, 0.012], [0, Math.PI / 4, 0]),
    branch([-0.4, 0.02, 0.38], [0, 0.43, 0.28], 0.008, C.woodLight),
    branch([0.4, 0.02, -0.38], [0, 0.43, -0.28], 0.008, C.woodLight),
  ];
}

export function igloo(variant: Variant): readonly ModelPart[] {
  return [
    part('sphere', C.snow, [0, 0.12, 0], [0.66, 0.55, 0.6]),
    part('sphere', C.ice, [0, 0.11, 0.31], [0.26, 0.26, 0.24]),
    part('sphere', C.charcoal, [0, 0.09, 0.435], [0.16, 0.2, 0.017]),
    ...ring([0, 0.15, 0], 0.316, 0.007, C.ice, 'xz', 12),
    ...ring([0, 0.27, 0], 0.266, 0.007, C.ice, 'xz', 12 + variant),
  ];
}

export function lighthouse(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('cylinder', C.stoneLight, [0, 0.035, 0], [0.38, 0.07, 0.38]),
    part('cylinder', C.cream, [0, 0.47, 0], [0.27, 0.94, 0.27]),
    part('cylinder', C.red, [0, 0.5, 0], [0.274, 0.18, 0.274]),
    part('cylinder', C.charcoal, [0, 0.92, 0], [0.37, 0.05, 0.37]),
    part('cylinder', C.glow, [0, 1.01, 0], [0.22, 0.15, 0.22], [0, 0, 0], 0.4),
    part('cone', C.red, [0, 1.15, 0], [0.32, 0.15 + variant * 0.02, 0.32]),
  ];
  return [...parts, ...door([0, 0, 0.14], 0.09, 0.22)];
}

export function shop(variant: Variant): readonly ModelPart[] {
  return [
    ...house(variant),
    part('box', C.red, [0, 0.43, 0.3], [0.52, 0.025, 0.23], [0.18, 0, 0]),
    part('box', C.wood, [-0.24, 0.32, 0.39], [0.09, 0.16, 0.025]),
    ...lantern([0.22, 0.36, 0.37], 0.6),
  ];
}

export function grandWindmill(variant: Variant): readonly ModelPart[] {
  return [
    ...place(windmill(variant), [0, 0.12, 0], 1.15),
    part('cylinder', C.stone, [0, 0.06, 0], [0.69, 0.12, 0.69]),
    ...ring([0, 0.65, 0], 0.25, 0.024, C.wood, 'xz', 12),
  ];
}
