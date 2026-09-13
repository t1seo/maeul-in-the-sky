import { lerp, clamp } from '../../../utils/math.js';
import type { RGB, ColorAnchor, HeightAnchor } from './anchors.js';
import type { ElevationColors } from './types.js';

export function interpolateRGB(anchors: readonly ColorAnchor[], level: number): RGB {
  const l = clamp(level, 0, 99);
  // Find surrounding anchors
  let lower = anchors[0];
  let upper = anchors[anchors.length - 1];
  for (let i = 0; i < anchors.length - 1; i++) {
    if (l >= anchors[i].level && l <= anchors[i + 1].level) {
      lower = anchors[i];
      upper = anchors[i + 1];
      break;
    }
  }
  /* v8 ignore start */
  if (lower.level === upper.level) return lower.rgb;
  /* v8 ignore stop */
  const t = (l - lower.level) / (upper.level - lower.level);
  return [
    Math.round(lerp(lower.rgb[0], upper.rgb[0], t)),
    Math.round(lerp(lower.rgb[1], upper.rgb[1], t)),
    Math.round(lerp(lower.rgb[2], upper.rgb[2], t)),
  ];
}

export function interpolateHeight(anchors: readonly HeightAnchor[], level: number): number {
  const l = clamp(level, 0, 99);
  let lower = anchors[0];
  let upper = anchors[anchors.length - 1];
  for (let i = 0; i < anchors.length - 1; i++) {
    if (l >= anchors[i].level && l <= anchors[i + 1].level) {
      lower = anchors[i];
      upper = anchors[i + 1];
      break;
    }
  }
  /* v8 ignore start */
  if (lower.level === upper.level) return lower.height;
  /* v8 ignore stop */
  const t = (l - lower.level) / (upper.level - lower.level);
  return Math.round(lerp(lower.height, upper.height, t));
}

function darken(rgb: RGB, factor: number): string {
  return `rgb(${Math.round(rgb[0] * factor)},${Math.round(rgb[1] * factor)},${Math.round(rgb[2] * factor)})`;
}

function rgbToHex(rgb: RGB): string {
  return '#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join('');
}

export function makeElevation(rgb: RGB): ElevationColors {
  return {
    top: rgbToHex(rgb),
    left: darken(rgb, 0.75),
    right: darken(rgb, 0.6),
  };
}
