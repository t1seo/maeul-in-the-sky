import type { ColorMode } from '../../../core/types.js';
import { clamp } from '../../../utils/math.js';
import { getSeasonalTint, getTransitionBlend } from '../seasons.js';
import { createTerrainPalette100, createSeasonalPalette100 } from './factory.js';
import type { AssetColors } from './asset-colors.js';
import type { TerrainPalette100 } from './types.js';

const basePalettes = {
  dark: createTerrainPalette100('dark'),
  light: createTerrainPalette100('light'),
};
const seasonalPalettes: Record<ColorMode, (TerrainPalette100 | undefined)[]> = {
  dark: Array.from({ length: 52 }),
  light: Array.from({ length: 52 }),
};

function forMode<T>(mode: ColorMode, palettes: Readonly<Record<ColorMode, T>>): T {
  switch (mode) {
    case 'dark':
      return palettes.dark;
    case 'light':
      return palettes.light;
  }
  throw new TypeError('Unsupported color mode');
}

function copyPalette(
  palette: TerrainPalette100,
  assets: AssetColors = { ...palette.assets },
): TerrainPalette100 {
  return {
    ...palette,
    elevations: palette.elevations.map((elevation) => ({ ...elevation })),
    heights: [...palette.heights],
    text: { ...palette.text },
    bg: { ...palette.bg },
    cloud: { ...palette.cloud },
    assets,
  };
}

export function getTerrainPalette100(mode: ColorMode): TerrainPalette100 {
  return copyPalette(forMode(mode, basePalettes));
}

export function getSeasonalPalette100(
  mode: ColorMode,
  week: number,
  rotation: number = 0,
): TerrainPalette100 {
  const base = forMode(mode, basePalettes);
  const cache = forMode(mode, seasonalPalettes);
  // Match seasons.ts exactly: negative remainders clamp; fractional weeks stay fractional.
  const seasonalWeek = clamp((week + rotation) % 52, 0, 51);
  if (!Number.isInteger(seasonalWeek)) {
    const palette = createSeasonalPalette100(
      mode,
      getSeasonalTint(week, rotation),
      base,
      getTransitionBlend(week, rotation),
    );
    return copyPalette(palette, palette === base ? { ...palette.assets } : palette.assets);
  }
  const cached = cache[seasonalWeek];
  if (cached) return copyPalette(cached);
  const palette = createSeasonalPalette100(
    mode,
    getSeasonalTint(week, rotation),
    base,
    getTransitionBlend(week, rotation),
  );
  cache[seasonalWeek] = palette;
  return copyPalette(palette);
}
