import type { AssetColors } from '../palette.js';

export const PIXEL_GRID_STEP = 0.5;
export const PIXEL_ALPHA_THRESHOLD = 32;
export const PIXEL_PALETTE_LIMIT = 16;

export type PixelColor = keyof AssetColors | `#${string}`;
export type PixelPaint = PixelColor | readonly (readonly [PixelColor, number])[];
export type PixelLayer = { readonly paint: PixelPaint; readonly d: string };
export type PixelSprite = {
  readonly layers: readonly PixelLayer[];
  readonly pixels: number;
};
