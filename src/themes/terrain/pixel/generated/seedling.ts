import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'gardenSoil',
      d: 'M-1,-0.5h0.5v0.5h-0.5zM0.5,-0.5h0.5v0.5h-0.5zM-1.5,0h3v0.5h-3zM-0.5,0.5h1v0.5h-1z',
    },
    { paint: 'tulipStem', d: 'M0,-1h0.5v1h-0.5z' },
    { paint: 'sproutGreen', d: 'M-0.5,-2.5h1v0.5h-1zM-0.5,-2h1.5v1h-1.5z' },
    { paint: 'birdhouseWood', d: 'M-0.5,-0.5h0.5v0.5h-0.5z' },
  ],
  pixels: 21,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'gardenSoil',
      d: 'M-1,-0.5h0.5v0.5h-0.5zM0.5,-0.5h0.5v0.5h-0.5zM-1.5,0h1v0.5h-1zM0,0h1.5v0.5h-1.5zM-0.5,0.5h1v0.5h-1z',
    },
    { paint: 'tulipStem', d: 'M0,-1h0.5v1h-0.5z' },
    {
      paint: 'sproutGreen',
      d: 'M-1.5,-2h1v0.5h-1zM0,-2h1.5v0.5h-1.5zM-1.5,-1.5h3v0.5h-3zM-1,-1h1v0.5h-1z',
    },
    { paint: 'birdhouseWood', d: 'M-0.5,-0.5h0.5v1h-0.5z' },
  ],
  pixels: 26,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant0];
