import type { ModelPart } from '../../world/model/geometry-types.js';
import { branch, part, type Triple } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from './palette.js';

export function ring(
  center: Triple,
  radius: number,
  width: number,
  color: string,
  plane: 'xy' | 'xz' | 'yz' = 'xz',
  segments = 16,
  start = 0,
  end = Math.PI * 2,
): readonly ModelPart[] {
  const point = (angle: number): Triple => {
    const a = Math.cos(angle) * radius;
    const b = Math.sin(angle) * radius;
    const axes = { xy: [a, b, 0], xz: [a, 0, b], yz: [0, a, b] } as const;
    const [x, y, z] = axes[plane];
    return [center[0] + x, center[1] + y, center[2] + z];
  };
  return Array.from({ length: segments }, (_, index) =>
    branch(
      point(start + ((end - start) * index) / segments),
      point(start + ((end - start) * (index + 1)) / segments),
      width,
      color,
    ),
  );
}

export function lattice(position: Triple, width: number, height: number): readonly ModelPart[] {
  const [x, y, z] = position;
  return [
    part('box', C.glow, position, [width, height, 0.009], [0, 0, 0], 0.5),
    ...Array.from({ length: 5 }, (_, index) =>
      part(
        'box',
        C.wood,
        [x + ((index - 2) * width) / 4, y, z + 0.01],
        [0.009, height + 0.017, 0.018],
      ),
    ),
    ...[-1, 0, 1].map((row) =>
      part('box', C.wood, [x, y + row * height * 0.5, z + 0.01], [width + 0.018, 0.01, 0.018]),
    ),
  ];
}

export function wheel(position: Triple, radius: number): readonly ModelPart[] {
  const [x, y, z] = position;
  const parts: ModelPart[] = [
    ...ring(position, radius, 0.027, C.wood, 'yz'),
    part('cylinder', C.woodLight, position, [0.08, 0.15, 0.08], [0, 0, Math.PI / 2]),
  ];
  for (let index = 0; index < 8; index += 1) {
    const angle = (index * Math.PI) / 4;
    parts.push(
      branch(
        position,
        [x, y + Math.cos(angle) * radius, z + Math.sin(angle) * radius],
        0.019,
        C.woodLight,
      ),
    );
    parts.push(
      part(
        'box',
        C.wood,
        [x, y + Math.cos(angle) * radius, z + Math.sin(angle) * radius],
        [0.14, 0.065, 0.024],
        [angle, 0, 0],
      ),
    );
  }
  return parts;
}

export function lantern(position: Triple, scale = 1): readonly ModelPart[] {
  const [x, y, z] = position;
  return [
    part(
      'sphere',
      C.glow,
      [x, y, z],
      [0.085 * scale, 0.115 * scale, 0.085 * scale],
      [0, 0, 0],
      0.5,
    ),
    part(
      'cylinder',
      C.charcoal,
      [x, y + 0.06 * scale, z],
      [0.055 * scale, 0.012 * scale, 0.055 * scale],
    ),
    part(
      'cylinder',
      C.charcoal,
      [x, y - 0.06 * scale, z],
      [0.055 * scale, 0.012 * scale, 0.055 * scale],
    ),
    part(
      'cylinder',
      C.red,
      [x, y - 0.092 * scale, z],
      [0.015 * scale, 0.052 * scale, 0.015 * scale],
    ),
  ];
}
