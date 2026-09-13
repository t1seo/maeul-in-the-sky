import { converter, displayable, wcagContrast } from 'culori';
import type { TerrainPalette100 } from '../../../src/themes/terrain/palette.js';

const toRgb = converter('rgb');

export function auditPaletteColors(palette: TerrainPalette100) {
  const invalidColors: string[] = [];
  const colors: [string, string][] = [
    ...Object.entries(palette.assets).map(([key, value]): [string, string] => [
      `assets.${key}`,
      value,
    ]),
    ...Object.entries(palette.text).map(([key, value]): [string, string] => [`text.${key}`, value]),
    ['bg.subtle', palette.bg.subtle],
    ['cloud.fill', palette.cloud.fill],
    ['cloud.stroke', palette.cloud.stroke],
  ];
  for (let level = 0; level < 100; level++) {
    for (const [face, color] of Object.entries(palette.getElevation(level))) {
      colors.push([`elevation.${level}.${face}`, color]);
    }
  }
  for (const [label, color] of colors) {
    const rgb = toRgb(color);
    if (
      !rgb ||
      !displayable(rgb) ||
      ![rgb.r, rgb.g, rgb.b, rgb.alpha ?? 1].every(Number.isFinite) ||
      (rgb.alpha ?? 1) < 0 ||
      (rgb.alpha ?? 1) > 1
    ) {
      invalidColors.push(label);
    }
  }
  const contrast = (foreground: string): number | null => {
    const text = toRgb(foreground);
    const background = toRgb(palette.bg.subtle);
    return text && background ? wcagContrast(text, background) : null;
  };
  return {
    checkedColors: colors.length,
    invalidColors,
    textContrast: {
      primary: contrast(palette.text.primary),
      secondary: contrast(palette.text.secondary),
      accent: contrast(palette.text.accent),
    },
  };
}
