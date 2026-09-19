import type { Vec3, WorldSettings, WorldTile } from './types.js';

export type LandCell = {
  readonly x: number;
  readonly z: number;
  readonly surface: WorldTile['surface'];
};

export function monthPoint(origin: Vec3, rotation: number, x: number, z: number, y = 0): Vec3 {
  const dx = x - 4.5;
  const dz = z - 4.5;
  const quarter = rotation % 4;
  const rotatedX = quarter === 0 ? dx : quarter === 1 ? -dz : quarter === 2 ? -dx : dz;
  const rotatedZ = quarter === 0 ? dz : quarter === 1 ? dx : quarter === 2 ? -dz : -dx;
  return { x: origin.x + 4.5 + rotatedX, y, z: origin.z + 4.5 + rotatedZ };
}

export function pondProfile(seed: number): {
  readonly x: number;
  readonly z: number;
  readonly radius: number;
} {
  return { x: seed % 2 ? -1 : 0, z: 3 + (seed % 4), radius: 1.25 + (seed % 3) * 0.22 };
}

function surfaceAt(x: number, z: number, seed: number): WorldTile['surface'] {
  const pond = pondProfile(seed);
  if (x === -1 || x === 0 || (x <= 1 && Math.hypot(x - pond.x, z - pond.z) <= pond.radius))
    return 'water';
  if (x >= 2 && x <= 9 && (z === 1 || z === 2)) return 'path';
  if (z >= 8 && x >= 7) return 'rock';
  if (z === 8 && x >= 3 && x <= 5) return 'field';
  return 'grass';
}

export function landCells(layout: WorldSettings['layout'], seed: number): readonly LandCell[] {
  const cells: LandCell[] = [];
  const archipelago = layout === 'archipelago';
  const low = archipelago ? -4 : -1;
  const high = archipelago ? 13 : 10;
  for (let z = low; z <= high; z += 1) {
    for (let x = low; x <= high; x += 1) {
      const dx = (x - 4.5) / (6.8 + (seed % 4) * 0.4);
      const dz = (z - 4.5) / (6.6 + (Math.floor(seed / 4) % 4) * 0.4);
      const angle = Math.atan2(dz, dx);
      const radius = 1 + 0.13 * Math.sin(angle * 3 + (seed % 17)) + 0.07 * Math.cos(angle * 5);
      const reserved = (x >= -1 && x <= 9 && z >= 0 && z <= 9) || (x === 10 && z === 2);
      if (archipelago && !reserved && dx * dx + dz * dz > radius) continue;
      const surface = !archipelago && x <= 0 && z === 0 ? 'path' : surfaceAt(x, z, seed);
      cells.push({ x, z, surface });
    }
  }
  const keys = new Set(cells.map((cell) => `${cell.x},${cell.z}`));
  return cells.map((cell) => {
    const coast = [
      [cell.x - 1, cell.z],
      [cell.x + 1, cell.z],
      [cell.x, cell.z - 1],
      [cell.x, cell.z + 1],
    ].some(([x, z]) => !keys.has(`${x},${z}`));
    return coast && cell.surface === 'grass'
      ? { ...cell, surface: (cell.x + cell.z + seed) % 3 === 0 ? 'rock' : 'sand' }
      : cell;
  });
}

export function groundHeight(
  x: number,
  z: number,
  surface: WorldTile['surface'],
  seed: number,
): number {
  if (surface === 'water') return 0;
  if (surface === 'path') return 0.5;
  if (surface === 'sand') return 0.25;
  const ridgeX = 6 + (seed % 4);
  const ridgeZ = 7 + (Math.floor(seed / 4) % 4);
  const ridge =
    (0.55 + (seed % 3) * 0.22) * Math.exp(-((x - ridgeX) ** 2 + (z - ridgeZ) ** 2) / 10);
  return (
    Math.round((0.6 + ridge + Math.sin((x + (seed % 7)) * 0.6) * Math.sin(z * 0.4) * 0.16) * 1000) /
    1000
  );
}
