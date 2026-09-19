import {
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  RGBAFormat,
  SRGBColorSpace,
} from 'three';
import type { GeometryResources } from './resources.js';

const cellSize = 128;
export const surfaceCells = {
  grass: 0,
  path: 1,
  sand: 2,
  rock: 3,
  snow: 4,
  field: 5,
  water: 6,
} as const;

function grain(cell: number, x: number, y: number, frequency: number): number {
  const u = x * frequency;
  const v = y * frequency;
  const a = Math.floor(u);
  const b = Math.floor(v);
  const sample = (dx: number, dy: number) => {
    const sx = (((a + dx) % frequency) + frequency) % frequency;
    const sy = (((b + dy) % frequency) + frequency) % frequency;
    const seed = Math.imul(sx + cell * 47, 374761393) + Math.imul(sy, 668265263);
    const mixed = Math.imul(seed ^ (seed >>> 13), 1274126177);
    return ((mixed ^ (mixed >>> 16)) >>> 0) / 2147483647.5 - 1;
  };
  const s = (u - a) ** 2 * (3 - 2 * (u - a));
  const t = (v - b) ** 2 * (3 - 2 * (v - b));
  return (
    (sample(0, 0) * (1 - s) + sample(1, 0) * s) * (1 - t) +
    (sample(0, 1) * (1 - s) + sample(1, 1) * s) * t
  );
}

function relief(cell: number, x: number, y: number): number {
  const u = x * Math.PI * 2;
  const v = y * Math.PI * 2;
  const fine = grain(cell, x, y, 31);
  const broad = grain(cell, x, y, 5);
  switch (cell) {
    case 0:
      return broad * 0.45 + grain(cell, x, y, 13) * 0.2 + fine * 0.1;
    case 1:
      return broad * 0.6 + fine * 0.18;
    case 2:
      return Math.sin(v * 3 + broad) * 0.08 + grain(cell, x, y, 9) * 0.12;
    case 3:
      return broad * 0.6 + grain(cell, x, y, 11) * 0.25 + fine * 0.1;
    case 4:
      return broad * 0.12 + fine * 0.03;
    case 5:
      return Math.cos(u * 9 + broad) * 0.06 + broad * 0.25 + fine * 0.1;
    default:
      return broad * 0.15 + fine * 0.05;
  }
}

export function createGroundTextures(resources: GeometryResources) {
  const width = cellSize * 4;
  const height = cellSize * 2;
  const color = new Uint8Array(width * height * 4);
  const normal = new Uint8Array(color.length);
  for (let cell = 0; cell < 8; cell += 1) {
    for (let y = 0; y < cellSize; y += 1) {
      for (let x = 0; x < cellSize; x += 1) {
        const u = x / (cellSize - 1);
        const v = y / (cellSize - 1);
        const value = relief(cell, u, v);
        const dx = relief(cell, u + 1 / cellSize, v) - relief(cell, u - 1 / cellSize, v);
        const dy = relief(cell, u, v + 1 / cellSize) - relief(cell, u, v - 1 / cellSize);
        const index =
          ((Math.floor(cell / 4) * cellSize + y) * width + (cell % 4) * cellSize + x) * 4;
        const shade = Math.round(243 + value * 12);
        color.set([shade, shade, shade, 255], index);
        const length = Math.hypot(dx * 0.3, dy * 0.3, 1);
        normal.set(
          [
            Math.round(128 - ((dx * 0.3) / length) * 127),
            Math.round(128 - ((dy * 0.3) / length) * 127),
            Math.round(128 + 127 / length),
            255,
          ],
          index,
        );
      }
    }
  }
  const map = resources.texture(new DataTexture(color, width, height, RGBAFormat));
  const normalMap = resources.texture(new DataTexture(normal, width, height, RGBAFormat));
  map.name = 'ground:grain';
  map.colorSpace = SRGBColorSpace;
  normalMap.name = 'ground:relief';
  for (const texture of [map, normalMap]) {
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
  }
  return { map, normalMap };
}

export function atlasUV(cell: number, u: number, v: number): readonly [number, number] {
  const inset = 1.5 / cellSize;
  return [
    ((cell % 4) + inset + u * (1 - inset * 2)) / 4,
    (Math.floor(cell / 4) + inset + v * (1 - inset * 2)) / 2,
  ];
}
