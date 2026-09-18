import type { AssetColors } from '../palette.js';
import { hexToRgb, rgbToHex } from '../../../utils/color.js';
import type { PixelColor, PixelPaint } from './types.js';

export function isPixelLiteral(value: string): value is `#${string}` {
  return /^#[\da-f]{6}$/i.test(value);
}

export function pixelColor(value: PixelColor, colors: AssetColors): string {
  const color = isPixelLiteral(value) ? value : colors[value];
  if (isPixelLiteral(color)) return color;
  if (/^#[\da-f]{3}$/i.test(color))
    return `#${[...color.slice(1)].map((digit) => digit + digit).join('')}`;
  const rgba = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)$/.exec(
    color,
  );
  if (rgba) return rgbToHex(Number(rgba[1]), Number(rgba[2]), Number(rgba[3]));
  return color;
}

export function resolvePixelPaint(paint: PixelPaint, colors: AssetColors): string {
  if (typeof paint === 'string') return pixelColor(paint, colors);
  const rgb = paint.reduce(
    (sum, [color, weight]) => {
      const value = hexToRgb(pixelColor(color, colors));
      return {
        r: sum.r + value.r * weight,
        g: sum.g + value.g * weight,
        b: sum.b + value.b * weight,
      };
    },
    { r: 0, g: 0, b: 0 },
  );
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}
