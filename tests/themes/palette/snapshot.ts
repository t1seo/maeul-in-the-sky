import { createHash } from 'node:crypto';
import type { ColorMode } from '../../../src/core/types.js';
import {
  getSeasonalPalette100,
  getTerrainPalette,
  getTerrainPalette100,
} from '../../../src/themes/terrain/palette.js';
import type { TerrainPalette100 } from '../../../src/themes/terrain/palette.js';

export const modes = ['dark', 'light'] as const;
export const levels = [
  ...Array.from({ length: 100 }, (_, level) => level),
  -10,
  -0.5,
  0.25,
  4.5,
  12.25,
  50.5,
  98.75,
  100,
  1000,
];

export function paletteSnapshot(palette: TerrainPalette100): string {
  return JSON.stringify({
    ...palette,
    colors: levels.map((level) => palette.getElevation(level)),
    allHeights: levels.map((level) => palette.getHeight(level)),
  });
}

export function paletteChecksum(mode: ColorMode): string {
  const hash = createHash('sha256');
  hash.update(paletteSnapshot(getTerrainPalette100(mode)));
  hash.update(JSON.stringify(getTerrainPalette(mode)));
  for (let rotation = 0; rotation < 52; rotation++) {
    for (let week = 0; week < 53; week++) {
      hash.update(paletteSnapshot(getSeasonalPalette100(mode, week, rotation)));
    }
  }
  for (const week of [-105, -53, -1, -0.5, 4.5, 8.25, 18.5, 26.75, 40.5, 51.75, 104]) {
    for (const rotation of [-52, -0.25, 0, 0.5, 26, 52, 104]) {
      hash.update(paletteSnapshot(getSeasonalPalette100(mode, week, rotation)));
    }
  }
  return hash.digest('hex');
}
