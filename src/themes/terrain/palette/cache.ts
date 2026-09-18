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
  return copyPalette(basePalettes[mode]);
}

export function getSeasonalPalette100(
  mode: ColorMode,
  week: number,
  rotation: number = 0,
): TerrainPalette100 {
  // Match seasons.ts exactly: negative remainders clamp; fractional weeks stay fractional.
  const seasonalWeek = clamp((week + rotation) % 52, 0, 51);
  if (!Number.isInteger(seasonalWeek)) {
    const base = basePalettes[mode];
    const palette = createSeasonalPalette100(
      mode,
      getSeasonalTint(week, rotation),
      base,
      getTransitionBlend(week, rotation),
    );
    return copyPalette(palette, palette === base ? { ...palette.assets } : palette.assets);
  }
  const cached = seasonalPalettes[mode][seasonalWeek];
  if (cached) return copyPalette(cached);
  const palette = createSeasonalPalette100(
    mode,
    getSeasonalTint(week, rotation),
    basePalettes[mode],
    getTransitionBlend(week, rotation),
  );
  seasonalPalettes[mode][seasonalWeek] = palette;
  return copyPalette(palette);
}
