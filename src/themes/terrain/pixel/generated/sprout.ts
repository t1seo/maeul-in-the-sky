import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'gardenSoil', d: 'M-1,0h2v1h-2z' },
    { paint: 'tulipStem', d: 'M0,-0.5h0.5v0.5h-0.5z' },
    { paint: 'sproutGreen', d: 'M-1,-1.5h2.5v0.5h-2.5zM-1,-1h2v0.5h-2z' },
  ],
  pixels: 18,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'gardenSoil', d: 'M-0.5,0h1v0.5h-1zM-1,0.5h2v0.5h-2z' },
    { paint: 'tulipStem', d: 'M0.5,-0.5h0.5v1h-0.5zM-1,0h0.5v0.5h-0.5z' },
    {
      paint: 'sproutGreen',
      d: 'M-0.5,-1.5h1v0.5h-1zM1,-1.5h1v0.5h-1zM-2,-1h1v0.5h-1zM-0.5,-1h2v0.5h-2zM-1.5,-0.5h1.5v0.5h-1.5z',
    },
  ],
  pixels: 22,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'gardenSoil', d: 'M-1,0h1v0.5h-1zM0.5,0h0.5v0.5h-0.5zM-1,0.5h2v0.5h-2z' },
    { paint: 'tulipStem', d: 'M0,-0.5h1.5v0.5h-1.5zM0,0h0.5v0.5h-0.5z' },
    { paint: 'sproutGreen', d: 'M0.5,-2h0.5v0.5h-0.5zM-1.5,-1.5h3v0.5h-3zM-1,-1h2v0.5h-2z' },
  ],
  pixels: 22,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
