import { Resvg } from '@resvg/resvg-js';
import type { AssetBounds } from '../../src/themes/terrain/assets/types.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import { hexToRgb } from '../../src/utils/color.js';
import { resolvePixelPaint } from '../../src/themes/terrain/pixel/colors.js';
import { encodePixelRuns } from '../../src/themes/terrain/pixel/encode.js';
import {
  PIXEL_ALPHA_THRESHOLD,
  PIXEL_GRID_STEP,
  PIXEL_PALETTE_LIMIT,
} from '../../src/themes/terrain/pixel/types.js';
import type { PixelSprite } from '../../src/themes/terrain/pixel/types.js';
import { diagnosticPalette, inferPixelPaints, PixelCompileError } from './paints.js';
import type { PixelSourceRenderer } from './paints.js';

export function compilePixelSprite(render: PixelSourceRenderer, bounds: AssetBounds): PixelSprite {
  const x = Math.floor((bounds.x - 1) / PIXEL_GRID_STEP) * PIXEL_GRID_STEP;
  const y = Math.floor((bounds.y - 1) / PIXEL_GRID_STEP) * PIXEL_GRID_STEP;
  const width = Math.ceil((bounds.x + bounds.width + 1 - x) / PIXEL_GRID_STEP);
  const height = Math.ceil((bounds.y + bounds.height + 1 - y) / PIXEL_GRID_STEP);
  const paints = inferPixelPaints(render);
  const palettes = [
    getTerrainPalette100('light').assets,
    getTerrainPalette100('dark').assets,
    diagnosticPalette(),
  ];
  const samples = palettes.map((colors) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${x} ${y} ${width * PIXEL_GRID_STEP} ${height * PIXEL_GRID_STEP}">${render(colors)}</svg>`;
    return new Resvg(svg, { font: { loadSystemFonts: false } }).render().pixels;
  });
  const references = paints.map((paint) =>
    palettes.flatMap((colors) => {
      const rgb = hexToRgb(resolvePixelPaint(paint, colors));
      return [rgb.r, rgb.g, rgb.b];
    }),
  );
  const distance = (pixel: number, paint: number): number =>
    samples.reduce((sum, sample, index) => {
      const rgb = references[paint];
      const alpha = Math.max(1, sample[pixel * 4 + 3]);
      return (
        sum +
        [0, 1, 2].reduce(
          (delta, channel) =>
            delta + ((sample[pixel * 4 + channel] * 255) / alpha - rgb[index * 3 + channel]) ** 2,
          0,
        )
      );
    }, 0);
  const choose = (pixel: number, candidates: readonly number[]): number => {
    let selected = -1;
    let closest = Infinity;
    for (const candidate of candidates) {
      const error = distance(pixel, candidate);
      if (error < closest) {
        closest = error;
        selected = candidate;
      }
    }
    return selected;
  };
  const candidates = paints.map((_, index) => index);
  const initial = Array.from({ length: width * height }, (_, index) =>
    samples[0][index * 4 + 3] < PIXEL_ALPHA_THRESHOLD ? -1 : choose(index, candidates),
  );
  const usage = new Map<number, number>();
  for (const color of initial) if (color >= 0) usage.set(color, (usage.get(color) ?? 0) + 1);
  const limited = [...usage]
    .sort(([a, countA], [b, countB]) => countB - countA || a - b)
    .slice(0, PIXEL_PALETTE_LIMIT)
    .map(([color]) => color);
  const colors = initial.map((color, index) =>
    color < 0 || limited.includes(color) ? color : choose(index, limited),
  );
  const pixels = colors.filter((color) => color >= 0).length;
  if (pixels === 0) throw new PixelCompileError('The alpha threshold removed the whole sprite');
  const layers = [...encodePixelRuns({ x, y, width, height, colors })].map(([paint, d]) => ({
    paint: paints[paint],
    d,
  }));
  return { layers, pixels };
}
