import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'lantern',
      d: 'M-1,-6.5h0.5v1h-0.5zM0.5,-6.5h0.5v1h-0.5zM-1,-5.5h2v0.5h-2zM-0.5,-5h1v5.5h-1zM0,0.5h0.5v0.5h-0.5z',
    },
    { paint: 'ice', d: 'M-1.5,-7h1v0.5h-1zM0.5,-7h1v0.5h-1z' },
    { paint: 'lanternGlow', d: 'M-0.5,-6.5h1v0.5h-1zM-0.5,-6h0.5v0.5h-0.5z' },
    { paint: 'christmasGold', d: 'M0,-6h0.5v0.5h-0.5z' },
    {
      paint: 'snowCap',
      d: 'M-0.5,-8h0.5v0.5h-0.5zM-1,-7.5h2v0.5h-2zM-0.5,-7h1v0.5h-1zM-1,0h0.5v0.5h-0.5zM-1,0.5h1v0.5h-1z',
    },
  ],
  pixels: 49,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'lantern',
      d: 'M-3,-6h0.5v1h-0.5zM-1.5,-6h0.5v1h-0.5zM-0.5,-6h0.5v0.5h-0.5zM1,-6h0.5v1h-0.5zM2.5,-6h0.5v1h-0.5zM-0.5,-5.5h1v0.5h-1zM-2.5,-5h5.5v0.5h-5.5zM-2.5,-4.5h0.5v0.5h-0.5zM-0.5,-4.5h1v5h-1zM2,-4.5h0.5v0.5h-0.5zM0,0.5h0.5v0.5h-0.5z',
    },
    {
      paint: 'ice',
      d: 'M-1,-7h0.5v0.5h-0.5zM3,-7h0.5v0.5h-0.5zM-3.5,-6.5h2.5v0.5h-2.5zM0.5,-6.5h2.5v0.5h-2.5z',
    },
    { paint: 'lanternGlow', d: 'M-2.5,-6h0.5v1h-0.5zM1.5,-6h0.5v1h-0.5z' },
    { paint: 'christmasGold', d: 'M-2,-6h0.5v1h-0.5zM2,-6h0.5v1h-0.5z' },
    {
      paint: 'snowCap',
      d: 'M-2.5,-7.5h1v0.5h-1zM1.5,-7.5h1v0.5h-1zM-3,-7h2v0.5h-2zM1,-7h2v0.5h-2zM-1,0h0.5v0.5h-0.5zM-1,0.5h1v0.5h-1z',
    },
  ],
  pixels: 80,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant0];
