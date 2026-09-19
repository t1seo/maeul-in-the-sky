import type { ModelPart } from '../geometry-types.js';
import { branch, PALETTE as C, part, place, type Triple, type Variant } from './primitives.js';

export function deer(variant: Variant): readonly ModelPart[] {
  const grazing = variant === 1;
  const head: Triple = [0, grazing ? 0.28 : 0.57, grazing ? 0.34 : 0.26];
  const parts: ModelPart[] = [
    part('sphere', C.barkLight, [0, 0.36, 0], [0.19, 0.24, 0.43], [0.03, 0, 0]),
    part('sphere', C.cream, [0, 0.305, 0.025], [0.15, 0.14, 0.31]),
    branch([0, 0.39, 0.14], head, 0.115, C.barkLight),
    part('sphere', C.barkLight, head, [0.105, 0.105, 0.18], [grazing ? 0.8 : 0.2, 0, 0]),
    part('sphere', C.charcoal, [0, head[1] - 0.017, head[2] + 0.081], [0.057, 0.044, 0.04]),
    part('sphere', C.cream, [0, 0.395, -0.23], [0.057, 0.085, 0.1], [-0.6, 0, 0]),
  ];
  for (const side of [-1, 1]) {
    parts.push(
      part(
        'sphere',
        C.barkLight,
        [side * 0.069, head[1] + 0.047, head[2] - 0.035],
        [0.038, 0.12, 0.06],
        [0.1, side * 0.5, side * -0.55],
      ),
    );
    parts.push(
      part(
        'sphere',
        C.charcoal,
        [side * 0.05, head[1] + 0.01, head[2] + 0.026],
        [0.015, 0.016, 0.013],
      ),
    );
    for (const end of [-1, 1]) {
      const stride = variant === 2 ? side * end * 0.075 : 0;
      const hip: Triple = [side * 0.065, 0.32, end * 0.13];
      const knee: Triple = [side * 0.066, 0.16, end * 0.13 + stride];
      const foot: Triple = [side * 0.07, 0.022, end * 0.15 - stride * 0.3];
      parts.push(branch(hip, knee, 0.039, C.barkLight), branch(knee, foot, 0.023, C.barkLight));
      parts.push(part('sphere', C.charcoal, foot, [0.033, 0.034, 0.052]));
    }
    if (!grazing) {
      const tip: Triple = [side * 0.12, head[1] + 0.22, head[2] - 0.04];
      parts.push(
        branch([side * 0.035, head[1] + 0.045, head[2] - 0.026], tip, 0.019, C.stoneLight),
      );
      parts.push(
        branch(
          [side * 0.08, head[1] + 0.14, head[2] - 0.033],
          [side * 0.14, head[1] + 0.17, head[2] + 0.035],
          0.015,
          C.stoneLight,
        ),
      );
    }
  }
  return place(parts, [0, 0, 0], 0.63);
}

export function resident(variant: Variant): readonly ModelPart[] {
  const coats = [C.blue, C.red, C.leafDark] as const;
  const coat = coats[variant];
  const parts: ModelPart[] = [
    part('cone', coat, [0, 0.185, 0], [0.103, 0.14, 0.071]),
    part('sphere', '#dbb393', [0, 0.282, 0.002], [0.072, 0.081, 0.067]),
    part('sphere', C.charcoal, [0, 0.309, -0.006], [0.075, 0.042, 0.068]),
    part('box', C.cream, [0, 0.236, 0.03], [0.035, 0.027, 0.012]),
  ];
  for (const side of [-1, 1]) {
    const stride = variant === 0 ? side * 0.026 : 0;
    parts.push(branch([side * 0.024, 0.13, 0], [side * 0.027, 0.03, stride], 0.026, C.charcoal));
    parts.push(part('sphere', C.bark, [side * 0.027, 0.021, 0.012 + stride], [0.036, 0.032, 0.06]));
    parts.push(branch([side * 0.038, 0.23, 0], [side * 0.07, 0.165, -stride], 0.027, coat));
    parts.push(part('sphere', '#dbb393', [side * 0.07, 0.157, -stride], [0.026, 0.027, 0.026]));
  }
  if (variant === 1) {
    parts.push(branch([0.068, 0.16, 0], [0.052, 0.435, 0], 0.01, C.wood));
    parts.push(part('cone', C.pink, [0.052, 0.433, 0], [0.28, 0.075, 0.28]));
    parts.push(part('sphere', C.cream, [0.052, 0.479, 0], [0.019, 0.025, 0.019]));
  }
  if (variant === 2) {
    parts.push(part('cone', C.straw, [0, 0.34, 0], [0.155, 0.055, 0.155]));
    parts.push(part('sphere', C.woodLight, [-0.074, 0.105, -0.005], [0.079, 0.09, 0.065]));
    parts.push(part('sphere', C.leafLight, [-0.077, 0.15, 0], [0.063, 0.045, 0.055]));
  }
  return parts;
}
