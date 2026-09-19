import type { BufferGeometry } from 'three';
import type { Vec3 } from '../../model/types.js';
import { SurfaceBuffer } from './buffer.js';

export type RoofProfile = 'gable' | 'giwa';

export function roofProfile(key: string): RoofProfile {
  return /hanok|pavilion|korean|palace|temple|pagoda|dock/i.test(key) ? 'giwa' : 'gable';
}

function point(x: number, z: number, profile: RoofProfile, underside = false): Vec3 {
  const t = Math.abs(z);
  const y =
    profile === 'giwa'
      ? (0.5 - 5 * t + 6 * t * t + 13 / 24) / (25 / 24) -
        0.5 -
        Math.max(0, Math.abs(x) - 0.25) * Math.max(0, 1 - 4 * t) * 0.6
      : 0.5 - 2 * t;
  return { x, y: y * 0.945 + 0.0275 - (underside ? 0.055 : 0), z };
}

export function createRoof(profile: RoofProfile): BufferGeometry {
  const buffer = new SurfaceBuffer();
  const columns = profile === 'giwa' ? 4 : 1;
  const rows = profile === 'giwa' ? 12 : 2;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column / columns - 0.5;
      const z = row / rows - 0.5;
      const nextX = (column + 1) / columns - 0.5;
      const nextZ = (row + 1) / rows - 0.5;
      buffer.quad(
        point(x, z, profile),
        point(x, nextZ, profile),
        point(nextX, nextZ, profile),
        point(nextX, z, profile),
      );
      buffer.quad(
        point(x, z, profile, true),
        point(nextX, z, profile, true),
        point(nextX, nextZ, profile, true),
        point(x, nextZ, profile, true),
      );
      if (row === 0)
        buffer.quad(
          point(x, z, profile),
          point(nextX, z, profile),
          point(nextX, z, profile, true),
          point(x, z, profile, true),
        );
      if (row === rows - 1)
        buffer.quad(
          point(nextX, nextZ, profile),
          point(x, nextZ, profile),
          point(x, nextZ, profile, true),
          point(nextX, nextZ, profile, true),
        );
      if (column === 0)
        buffer.quad(
          point(x, nextZ, profile),
          point(x, z, profile),
          point(x, z, profile, true),
          point(x, nextZ, profile, true),
        );
      if (column === columns - 1)
        buffer.quad(
          point(nextX, z, profile),
          point(nextX, nextZ, profile),
          point(nextX, nextZ, profile, true),
          point(nextX, z, profile, true),
        );
    }
  }
  return buffer.build();
}
