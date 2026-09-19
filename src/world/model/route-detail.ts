import type { Vec3 } from './types.js';

export function railSleeperCount(from: Vec3, to: Vec3): number {
  const length = Math.hypot(to.x - from.x, to.z - from.z);
  return length < 0.001 ? 0 : Math.ceil(length / 0.24);
}
