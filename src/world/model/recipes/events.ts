import type { ModelPart } from '../geometry-types.js';
import { flower } from './botany.js';
import { branch, PALETTE as C, part, place, type Triple, type Variant } from './primitives.js';
import { broadleaf, conifer } from './trees.js';

function lantern(position: Triple, scale = 1): readonly ModelPart[] {
  return place(
    [
      part('sphere', C.gold, [0, -0.06, 0], [0.1, 0.12, 0.1], [0, 0, 0], 0.6),
      part('cylinder', C.red, [0, -0.003, 0], [0.071, 0.02, 0.071]),
      part('cylinder', C.red, [0, -0.119, 0], [0.061, 0.02, 0.061]),
      part('cylinder', C.gold, [0, -0.149, 0], [0.012, 0.043, 0.012]),
    ],
    position,
    scale,
  );
}

export function lanterns(variant: Variant): readonly ModelPart[] {
  const height = 0.64 + variant * 0.04;
  const lights = 3 + variant;
  const parts: ModelPart[] = [];
  for (const x of [-0.37, 0.37]) {
    parts.push(part('cylinder', C.wood, [x, height / 2, 0], [0.035, height, 0.035]));
    parts.push(part('sphere', C.stone, [x, 0.045, 0], [0.14, 0.09, 0.14]));
    parts.push(part('sphere', C.gold, [x, height + 0.015, 0], [0.055, 0.055, 0.055]));
  }
  const knot = (index: number): Triple => {
    const x = -0.37 + (index * 0.74) / (lights + 1);
    return [x, height - 0.11 * (1 - (x / 0.37) ** 2), Math.sin(index) * variant * 0.018];
  };
  for (let index = 1; index <= lights + 1; index += 1)
    parts.push(branch(knot(index - 1), knot(index), 0.012, C.bark));
  for (let light = 1; light <= lights; light += 1)
    parts.push(...lantern(knot(light), 0.85 + (light % 2) * 0.12));
  if (variant === 2) {
    parts.push(part('box', C.woodLight, [0, 0.045, 0], [0.5, 0.09, 0.25]));
    parts.push(part('cylinder', C.red, [0, 0.175, 0], [0.17, 0.16, 0.17], [Math.PI / 2, 0, 0]));
    parts.push(
      part('cylinder', C.cream, [0, 0.175, 0.088], [0.16, 0.016, 0.16], [Math.PI / 2, 0, 0]),
    );
  }
  return parts;
}

export function blossoms(variant: Variant): readonly ModelPart[] {
  const colors = new Map<string, string>([
    [C.leafDark, '#c77f9c'],
    [C.leaf, C.pink],
    [C.leafLight, '#f1c7ce'],
    ['#c69858', '#d998ad'],
    ['#d9b665', '#e8b2c2'],
    [C.gold, '#f1c7ce'],
  ]);
  const parts: ModelPart[] = [
    ...place(
      broadleaf(variant).map((item) => ({ ...item, color: colors.get(item.color) ?? item.color })),
      [0, 0, -0.035],
      0.82,
    ),
  ];
  for (let bloom = 0; bloom < 3; bloom += 1) {
    parts.push(
      ...flower(
        [(bloom - 1) * 0.2, 0, 0.24 + (bloom % 2) * 0.045],
        0.12 + bloom * 0.025,
        C.cream,
        4,
      ),
    );
  }
  return parts;
}

export function harvest(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('box', C.wood, [0, 0.18, 0], [0.57, 0.13, 0.31]),
    part('box', C.woodLight, [0, 0.255, -0.155], [0.61, 0.1, 0.03]),
    part('box', C.woodLight, [0, 0.255, 0.155], [0.61, 0.1, 0.03]),
    branch([0.2, 0.18, 0], [0.42, 0.07, 0], 0.022, C.wood),
  ];
  for (const side of [-1, 1]) {
    parts.push(
      part('cylinder', C.wood, [side * 0.22, 0.1, 0], [0.19, 0.038, 0.19], [0, 0, Math.PI / 2]),
    );
    parts.push(
      part(
        'cylinder',
        C.stoneDark,
        [side * 0.245, 0.1, 0],
        [0.07, 0.016, 0.07],
        [0, 0, Math.PI / 2],
      ),
    );
  }
  for (let pumpkin = 0; pumpkin < 2 + variant; pumpkin += 1) {
    const x = -0.19 + pumpkin * 0.125;
    const z = (pumpkin % 2) * 0.07 - 0.045;
    for (let lobe = 0; lobe < 4; lobe += 1) {
      const angle = (lobe * Math.PI) / 2;
      parts.push(
        part(
          'sphere',
          pumpkin % 2 === 0 ? '#cd8b48' : C.gold,
          [x + Math.cos(angle) * 0.025, 0.32, z + Math.sin(angle) * 0.025],
          [0.071, 0.1, 0.071],
        ),
      );
    }
    parts.push(part('cylinder', C.leafDark, [x, 0.379, z], [0.013, 0.03, 0.013], [0.1, 0, 0.2]));
  }
  for (let sheaf = 0; sheaf < 3; sheaf += 1) {
    const x = -0.24 + sheaf * 0.13;
    parts.push(
      part('cone', C.straw, [x, 0.13, -0.27], [0.11, 0.26, 0.09], [0, 0, (sheaf - 1) * 0.09]),
    );
    parts.push(part('cylinder', C.wood, [x, 0.12, -0.27], [0.068, 0.023, 0.06]));
    parts.push(part('sphere', C.strawLight, [x, 0.257, -0.27], [0.085, 0.08, 0.07]));
  }
  return parts;
}

export function snowLights(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [...place(conifer(2), [-0.23, 0, -0.09], 0.62)];
  const x = 0.2;
  parts.push(part('sphere', C.snow, [x, 0.115, 0.12], [0.23, 0.23, 0.22]));
  parts.push(part('sphere', C.snow, [x, 0.277, 0.12], [0.16, 0.17, 0.16]));
  parts.push(part('cylinder', C.red, [x, 0.219, 0.12], [0.165, 0.025, 0.165]));
  parts.push(part('cone', C.straw, [x, 0.38, 0.12], [0.23, 0.07, 0.23]));
  parts.push(part('cone', C.red, [x, 0.276, 0.213], [0.029, 0.077, 0.029], [Math.PI / 2, 0, 0]));
  for (const side of [-1, 1]) {
    parts.push(part('sphere', C.charcoal, [x + side * 0.032, 0.304, 0.189], [0.014, 0.014, 0.014]));
    parts.push(branch([x + side * 0.08, 0.19, 0.12], [x + side * 0.16, 0.24, 0.1], 0.015));
  }
  for (let light = 0; light <= variant; light += 1) {
    const lx = -0.2 + light * 0.16;
    parts.push(part('cylinder', C.wood, [lx, 0.125, 0.31], [0.022, 0.25, 0.022]));
    parts.push(...lantern([lx, 0.3 + light * 0.025, 0.31], 0.7));
  }
  return parts;
}
