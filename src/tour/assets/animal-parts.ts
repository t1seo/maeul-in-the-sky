import type { ModelPart } from '../../world/model/geometry-types.js';
import { branch, part, type Triple, type Variant } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from './palette.js';

export function eyes(x: number, y: number, halfWidth: number, size = 0.021): readonly ModelPart[] {
  return [-1, 1].flatMap((side) => [
    part('sphere', C.charcoal, [x, y, side * halfWidth], [size, size * 1.1, size * 0.48]),
    part(
      'sphere',
      C.snow,
      [x + size * 0.17, y + size * 0.2, side * (halfWidth + size * 0.23)],
      [size * 0.29, size * 0.32, size * 0.16],
    ),
  ]);
}

export function hoovedLegs(
  xSpan: number,
  zSpan: number,
  shoulder: number,
  width: number,
  color: string,
  variant: Variant,
): readonly ModelPart[] {
  return [-1, 1].flatMap((end) =>
    [-1, 1].flatMap((side) => {
      const x = xSpan * end;
      const z = zSpan * side;
      const stride = variant === 1 ? side * end * 0.037 : variant === 2 ? end * 0.012 : 0;
      return [
        branch([x, shoulder, z], [x + stride * 0.45, shoulder * 0.48, z], width, color),
        branch(
          [x + stride * 0.45, shoulder * 0.48, z],
          [x + stride, 0.035, z],
          width * 0.68,
          color,
        ),
        part('box', C.charcoal, [x + stride + 0.009, 0.022, z], [width * 1.48, 0.044, width * 1.1]),
      ];
    }),
  );
}

export function ears(
  position: Triple,
  size: Triple,
  color: string,
  tilt = 0.2,
  inside: string = C.pink,
): readonly ModelPart[] {
  const [x, y, z] = position;
  return [-1, 1].flatMap((side) => [
    part('sphere', color, [x, y, side * z], size, [side * tilt, 0, -0.12]),
    part(
      'sphere',
      inside,
      [x + size[0] * 0.33, y + 0.005, side * z],
      [size[0] * 0.43, size[1] * 0.72, size[2] * 0.66],
      [side * tilt, 0, -0.12],
    ),
  ]);
}

export function tuftedTail(
  points: readonly Triple[],
  width: number,
  color: string,
): readonly ModelPart[] {
  return points.slice(1).flatMap((point, index) => {
    const previous = points[index];
    return previous ? [branch(previous, point, width * (1 - index * 0.12), color)] : [];
  });
}

export function toes(
  x: number,
  y: number,
  z: number,
  color: string = C.gold,
): readonly ModelPart[] {
  return [-1, 1].flatMap((side) => [
    branch([x, y, side * z], [x + 0.011, 0.018, side * z], 0.011, color),
    ...[-1, 0, 1].map((toe) =>
      branch([x + 0.011, 0.018, side * z], [x + 0.05, 0.012, side * z + toe * 0.017], 0.008, color),
    ),
  ]);
}
