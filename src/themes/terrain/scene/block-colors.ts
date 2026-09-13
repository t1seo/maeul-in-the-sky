import type { ElevationColors } from '../palette.js';
/** Parse a hex color like "#aabbcc" or "rgb(r,g,b)" to [r,g,b] */
function parseColor(color: string): [number, number, number] {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  const m = color.match(/(\d+)/g);
  /* v8 ignore start */
  if (m && m.length >= 3) return [+m[0], +m[1], +m[2]];
  /* v8 ignore stop */
  /* v8 ignore start */
  return [128, 128, 128];
  /* v8 ignore stop */
}

function toHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
}

function toRgb(r: number, g: number, b: number): string {
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

/** Blend a color string toward a water blue target by strength (0-1) */
function blendColorTowardWater(
  color: string,
  waterRgb: [number, number, number],
  strength: number,
): string {
  const [r, g, b] = parseColor(color);
  const nr = r + (waterRgb[0] - r) * strength;
  const ng = g + (waterRgb[1] - g) * strength;
  const nb = b + (waterRgb[2] - b) * strength;
  return color.startsWith('#') ? toHex(nr, ng, nb) : toRgb(nr, ng, nb);
}

/** Get water blend strength based on level and type (6d: depth variation) */
function getWaterBlendStrength(level: number, isRiver: boolean): number {
  if (isRiver) return 0.4; // consistent river look
  if (level <= 14) return 0.25; // shallow: subtle blend (oasis/lagoon)
  return 0.45; // deep: strong blend (ocean depth)
}

/** Blend an ElevationColors set toward water blue */
export function blendWithWater(
  colors: ElevationColors,
  isDark: boolean,
  level?: number,
  isRiver?: boolean,
): ElevationColors {
  const waterRgb: [number, number, number] = isDark ? [40, 80, 140] : [70, 140, 200];
  /* v8 ignore start */
  const strength = level !== undefined ? getWaterBlendStrength(level, !!isRiver) : 0.35;
  /* v8 ignore stop */
  return {
    top: blendColorTowardWater(colors.top, waterRgb, strength),
    left: blendColorTowardWater(colors.left, waterRgb, strength),
    right: blendColorTowardWater(colors.right, waterRgb, strength),
  };
}
