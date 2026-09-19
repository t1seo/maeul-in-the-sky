import type { ModelPart } from '../geometry-types.js';
import { door, gableRoof, windowFrame } from './joinery.js';
import { PALETTE as C, part, place, type Variant } from './primitives.js';

export function library(variant: Variant): readonly ModelPart[] {
  const width = 0.62 + variant * 0.09;
  const parts: ModelPart[] = [
    part('box', C.stone, [0, 0.045, 0], [width + 0.08, 0.09, 0.62]),
    part('box', C.plaster, [0, 0.31, -0.025], [width, 0.44, 0.45]),
    ...gableRoof(width + 0.11, 0.58, 0.55, 0.2, C.roof),
    ...door([0, 0.09, 0.21], 0.17, 0.3),
    ...place(gableRoof(0.42, 0.24, 0.46, 0.13, C.stoneLight), [0, 0, 0.24]),
  ];
  for (const x of [-0.18, 0.18]) {
    parts.push(part('cylinder', C.stoneLight, [x, 0.285, 0.3], [0.047, 0.39, 0.047]));
    parts.push(part('box', C.stone, [x, 0.455, 0.3], [0.075, 0.04, 0.075]));
    parts.push(...windowFrame([x * 1.2, 0.33, 0.205], 0.13, 0.2));
    parts.push(...windowFrame([x * 1.2, 0.33, -0.257], 0.13, 0.2, -1));
  }
  for (let step = 0; step < 3; step += 1) {
    parts.push(
      part('box', C.stoneLight, [0, 0.018 + step * 0.025, 0.4 - step * 0.05], [0.39, 0.035, 0.08]),
    );
  }
  if (variant > 0) {
    parts.push(part('cylinder', C.plaster, [0, 0.7, -0.02], [0.23, 0.16, 0.23]));
    parts.push(part('sphere', C.blue, [0, 0.795, -0.02], [0.29 + variant * 0.02, 0.2, 0.29]));
    parts.push(part('cone', C.gold, [0, 0.93, -0.02], [0.04, 0.12, 0.04]));
  }
  if (variant === 2) {
    for (const x of [-0.31, 0.31]) {
      parts.push(part('box', C.plaster, [x, 0.28, 0.15], [0.15, 0.38, 0.23]));
      parts.push(...place(gableRoof(0.23, 0.32, 0.49, 0.12, C.roof), [x, 0, 0.15]));
      parts.push(...windowFrame([x, 0.32, 0.275], 0.095, 0.2));
    }
  }
  return parts;
}

function clockTower(): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('box', C.stone, [0, 0.05, 0], [0.49, 0.1, 0.46]),
    part('box', C.plaster, [0, 0.5, 0], [0.31, 0.9, 0.3]),
    part('box', C.wood, [0, 0.9, 0], [0.38, 0.045, 0.37]),
    part('cone', C.roof, [0, 1.08, 0], [0.47, 0.33, 0.47], [0, Math.PI / 4, 0]),
    part('sphere', C.gold, [0, 1.265, 0], [0.045, 0.045, 0.045]),
    ...door([0, 0.095, 0.158], 0.12, 0.25),
  ];
  for (const side of [-1, 1] as const) {
    parts.push(
      part(
        'cylinder',
        C.charcoal,
        [0, 0.775, side * 0.163],
        [0.21, 0.025, 0.21],
        [Math.PI / 2, 0, 0],
      ),
    );
    parts.push(
      part('cylinder', C.cream, [0, 0.775, side * 0.18], [0.17, 0.015, 0.17], [Math.PI / 2, 0, 0]),
    );
    parts.push(
      part('box', C.charcoal, [0.018, 0.79, side * 0.192], [0.055, 0.014, 0.01], [0, 0, 0.65]),
    );
    parts.push(part('box', C.charcoal, [0, 0.805, side * 0.192], [0.012, 0.066, 0.01]));
    parts.push(...windowFrame([0, 0.48, side * 0.155], 0.09, 0.17, side));
  }
  return parts;
}

function cityTower(): readonly ModelPart[] {
  const parts: ModelPart[] = [];
  for (let tier = 0; tier < 4; tier += 1) {
    const width = 0.56 - tier * 0.07;
    const y = 0.14 + tier * 0.27;
    parts.push(part('box', C.stoneLight, [0, y, 0], [width, 0.27, width * 0.8]));
    parts.push(part('box', C.blue, [0, y + 0.014, 0], [width + 0.006, 0.16, width * 0.8 + 0.006]));
    parts.push(part('box', C.cream, [0, y + 0.11, 0], [width + 0.045, 0.033, width * 0.8 + 0.045]));
    for (const side of [-1, 1]) {
      parts.push(
        part('box', C.stoneLight, [side * width * 0.25, y, width * 0.409], [0.022, 0.25, 0.018]),
      );
      parts.push(
        part('box', C.stoneLight, [side * width * 0.25, y, -width * 0.409], [0.022, 0.25, 0.018]),
      );
    }
  }
  parts.push(part('box', C.leafDark, [0, 1.1, 0], [0.27, 0.04, 0.21]));
  parts.push(part('cylinder', C.charcoal, [-0.06, 1.23, 0], [0.015, 0.24, 0.015]));
  return parts;
}

function observatory(): readonly ModelPart[] {
  const parts: ModelPart[] = [
    part('cylinder', C.stone, [0, 0.07, 0], [0.69, 0.14, 0.69]),
    part('cylinder', C.plaster, [0, 0.5, 0], [0.48, 0.8, 0.48]),
    part('cylinder', C.stoneLight, [0, 0.88, 0], [0.59, 0.065, 0.59]),
    part('sphere', C.blue, [0, 0.99, 0], [0.58, 0.34, 0.58]),
    part('cylinder', C.charcoal, [0.09, 1.125, 0.16], [0.1, 0.32, 0.1], [0.85, 0, -0.3]),
    ...door([0, 0.14, 0.244], 0.13, 0.28),
  ];
  for (let window = 0; window < 7; window += 1) {
    const angle = (window * Math.PI * 2) / 7;
    parts.push(
      part(
        'box',
        C.gold,
        [Math.sin(angle) * 0.241, 0.63, Math.cos(angle) * 0.241],
        [0.08, 0.16, 0.018],
        [0, angle, 0],
      ),
    );
  }
  return parts;
}

const TOWERS = [clockTower, cityTower, observatory] as const;

export function tower(variant: Variant): readonly ModelPart[] {
  return TOWERS[variant]();
}
