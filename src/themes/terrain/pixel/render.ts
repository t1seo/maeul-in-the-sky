import { escapeXml } from '../../../core/svg.js';
import type { AssetColors } from '../palette.js';
import { resolvePixelPaint } from './colors.js';
import { PIXEL_SPRITES } from './generated/index.js';
import { PIXEL_GRID_STEP } from './types.js';

export class MissingPixelSpriteError extends Error {
  constructor(readonly catalogId: string) {
    super(`Missing compiled pixel sprite ${catalogId}; run npx tsx scripts/pixel/generate.ts`);
    this.name = 'MissingPixelSpriteError';
  }
}

export function renderPixelAsset(
  id: string,
  x: number,
  y: number,
  colors: AssetColors,
  variant = 0,
): string {
  if (!Object.hasOwn(PIXEL_SPRITES, id)) throw new MissingPixelSpriteError(id);
  const variants = PIXEL_SPRITES[id];
  if (!variants?.length) throw new MissingPixelSpriteError(id);
  const selected = Number.isFinite(variant) ? Math.trunc(variant) : 0;
  const index = ((selected % variants.length) + variants.length) % variants.length;
  const sprite = variants[index];
  const paths = sprite.layers
    .map(({ paint, d }) => `<path fill="${escapeXml(resolvePixelPaint(paint, colors))}" d="${d}"/>`)
    .join('');
  return `<g data-art-style="pixel" data-pixel-grid="${PIXEL_GRID_STEP}" shape-rendering="crispEdges" transform="translate(${x},${y})">${paths}</g>`;
}
