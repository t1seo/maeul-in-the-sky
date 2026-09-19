import type { ModelPart, Vec3 } from '../geometry-types.js';

export type Variant = 0 | 1 | 2;
export type Triple = readonly [number, number, number];
export type RecipeBuilder = (variant: Variant) => readonly ModelPart[];

export const PALETTE = {
  bark: '#765344',
  barkLight: '#a17b58',
  leaf: '#65854e',
  leafDark: '#385f49',
  leafLight: '#94aa65',
  pine: '#386c60',
  pineLight: '#609279',
  stone: '#999b91',
  stoneDark: '#697b7e',
  stoneLight: '#c4c1ad',
  wood: '#916c4b',
  woodLight: '#c39769',
  plaster: '#e9dcc0',
  roof: '#495b63',
  roofLight: '#6c7d82',
  straw: '#c7a45e',
  strawLight: '#e2c47e',
  water: '#5b9eaa',
  waterLight: '#8bbfc0',
  red: '#b96750',
  gold: '#e3b564',
  cream: '#f7e8c8',
  pink: '#e1a6b5',
  snow: '#e9f0e7',
  charcoal: '#38494b',
  blue: '#618e9b',
} as const;

export function vec([x, y, z]: Triple): Vec3 {
  return { x: x + 0, y: y + 0, z: z + 0 };
}

export function part(
  primitive: ModelPart['primitive'],
  color: string,
  position: Triple,
  size: Triple,
  rotation: Triple = [0, 0, 0],
  roughness = 0.86,
): ModelPart {
  return {
    primitive,
    color,
    position: vec(position),
    size: vec(size),
    rotation: vec(rotation),
    roughness,
    opacity: 1,
  };
}

export function branch(
  from: Triple,
  to: Triple,
  width: number,
  color: string = PALETTE.bark,
): ModelPart {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const length = Math.hypot(dx, dy, dz);
  return part(
    'cylinder',
    color,
    [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2],
    [width, length, width],
    [Math.atan2(dz, dy), 0, -Math.atan2(dx, Math.hypot(dy, dz))],
  );
}

export function place(
  parts: readonly ModelPart[],
  offset: Triple,
  scale = 1,
): readonly ModelPart[] {
  return parts.map((item) => ({
    ...item,
    position: {
      x: item.position.x * scale + offset[0],
      y: item.position.y * scale + offset[1],
      z: item.position.z * scale + offset[2],
    },
    size: { x: item.size.x * scale, y: item.size.y * scale, z: item.size.z * scale },
  }));
}

export function radial(
  index: number,
  count: number,
  radius: number,
  height: number,
  phase = 0,
): Triple {
  const angle = (index * Math.PI * 2) / count + phase;
  return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
}
