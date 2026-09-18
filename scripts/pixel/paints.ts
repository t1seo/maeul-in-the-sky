import type { AssetColors } from '../../src/themes/terrain/palette.js';
import { formatHex, parse } from 'culori';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import { hexToRgb, rgbToHex } from '../../src/utils/color.js';
import { isPixelLiteral, resolvePixelPaint } from '../../src/themes/terrain/pixel/colors.js';
import type { PixelColor, PixelPaint } from '../../src/themes/terrain/pixel/types.js';

export type PixelSourceRenderer = (colors: AssetColors) => string;
const BASE = getTerrainPalette100('light').assets;
const isRole = (key: string): key is keyof AssetColors => Object.hasOwn(BASE, key);
const ROLES = Object.keys(BASE).filter(isRole);
const PAINT = /\b(?:fill|stroke|stop-color)="([^"]+)"/g;

export class PixelCompileError extends Error {
  constructor(readonly detail: string) {
    super(`Pixel compilation failed: ${detail}`);
    this.name = 'PixelCompileError';
  }
}

export function uniformPalette(color: string): AssetColors {
  const result = { ...BASE };
  for (const role of ROLES) result[role] = color;
  return result;
}

export function diagnosticPalette(): AssetColors {
  const result = { ...BASE };
  ROLES.forEach((role, index) => {
    const unique24BitColor = Math.imul(index + 1, 0x9e3779b1) & 0xffffff;
    result[role] = rgbToHex(
      unique24BitColor >>> 16,
      (unique24BitColor >>> 8) & 255,
      unique24BitColor & 255,
    );
  });
  return result;
}

function literal(color: string): `#${string}` {
  const parsed = parse(color);
  const normalized = parsed && formatHex(parsed);
  if (!normalized || !isPixelLiteral(normalized))
    throw new PixelCompileError(`Unsupported paint ${color}`);
  return normalized;
}

function paints(svg: string): readonly string[] {
  return [...svg.matchAll(PAINT)].map((match) => match[1]).filter((value) => value !== 'none');
}

function geometry(svg: string): string {
  return svg.replace(PAINT, 'paint="color"');
}

export function inferPixelPaints(render: PixelSourceRenderer): readonly PixelPaint[] {
  const used = new Set<keyof AssetColors>();
  render(
    new Proxy(BASE, {
      get(target, property) {
        if (typeof property !== 'string' || !isRole(property)) return undefined;
        used.add(property);
        return target[property];
      },
    }),
  );
  const black = uniformPalette('#000000');
  const zeroSvg = render(black);
  const zero = paints(zeroSvg).map((color) => hexToRgb(literal(color)));
  const probes = [...used].sort().map((role) => {
    const svg = render({ ...black, [role]: '#ffffff' });
    if (geometry(svg) !== geometry(zeroSvg))
      throw new PixelCompileError('Palette-dependent geometry');
    return { role, paints: paints(svg).map((color) => hexToRgb(literal(color))) };
  });
  const result = zero.map((base, index): PixelPaint => {
    const weights: (readonly [PixelColor, number])[] = [];
    for (const probe of probes) {
      const color = probe.paints[index];
      const weight =
        Math.round(((color.r - base.r + color.g - base.g + color.b - base.b) / 765) * 100) / 100;
      if (weight > 0) weights.push([probe.role, weight]);
    }
    if (weights.length === 0) return literal(rgbToHex(base.r, base.g, base.b));
    const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
    if (total > 1.02) throw new PixelCompileError('Nonlinear palette paint');
    if (weights.length === 1 && total === 1) return weights[0][0];
    const remainder = Math.round((1 - total) * 100) / 100;
    if (remainder > 0)
      weights.push([
        literal(rgbToHex(base.r / remainder, base.g / remainder, base.b / remainder)),
        remainder,
      ]);
    return weights;
  });
  for (const palette of [BASE, getTerrainPalette100('dark').assets, diagnosticPalette()]) {
    const rendered = paints(render(palette));
    for (const [index, paint] of result.entries()) {
      const expected = hexToRgb(literal(rendered[index]));
      const actual = hexToRgb(resolvePixelPaint(paint, palette));
      if (
        Math.max(
          Math.abs(expected.r - actual.r),
          Math.abs(expected.g - actual.g),
          Math.abs(expected.b - actual.b),
        ) > 3
      ) {
        throw new PixelCompileError(
          `Unsupported nonlinear paint ${rendered[index]} became ${resolvePixelPaint(paint, palette)} from ${JSON.stringify(paint)}`,
        );
      }
    }
  }
  return [...new Map(result.map((paint) => [JSON.stringify(paint), paint])).values()];
}
