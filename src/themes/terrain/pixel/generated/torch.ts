import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'torch', d: 'M-0.5,-3.5h1v4h-1z' },
    { paint: 'anvil', d: 'M-1,-4.5h0.5v0.5h-0.5zM0.5,-4.5h0.5v0.5h-0.5zM-1,-4h2v0.5h-2z' },
    {
      paint: 'torchFlame',
      d: 'M-0.5,-6.5h0.5v0.5h-0.5zM-0.5,-6h1v0.5h-1zM-1,-5.5h2v0.5h-2zM-1,-5h0.5v0.5h-0.5zM0,-5h1v0.5h-1zM-0.5,-4.5h1v0.5h-1z',
    },
    { paint: 'lanternGlow', d: 'M-0.5,-5h0.5v0.5h-0.5z' },
  ],
  pixels: 35,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'torch', d: 'M-0.5,-2h1v2.5h-1z' },
    { paint: 'anvil', d: 'M-1,-3h2v0.5h-2zM-1,-2.5h1.5v0.5h-1.5z' },
    {
      paint: 'torchFlame',
      d: 'M-0.5,-5h1v1h-1zM-1,-4h2v0.5h-2zM-1,-3.5h0.5v0.5h-0.5zM0.5,-3.5h0.5v0.5h-0.5z',
    },
    { paint: 'lanternGlow', d: 'M-0.5,-3.5h1v0.5h-1z' },
  ],
  pixels: 29,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'torch',
      d: 'M0,-6.5h1.5v0.5h-1.5zM-0.5,-6h1v6h-1zM1,-6h0.5v0.5h-0.5zM-1,0h2v0.5h-2z',
    },
    {
      paint: [
        ['lantern', 0.78],
        ['sail', 0.22],
      ],
      d: 'M0.5,-5.5h1.5v0.5h-1.5zM1,-5h1v0.5h-1zM0.5,-4.5h0.5v0.5h-0.5zM1.5,-4.5h0.5v1h-0.5zM0.5,-3.5h1.5v0.5h-1.5z',
    },
    { paint: 'lanternGlow', d: 'M0.5,-5h0.5v0.5h-0.5zM1,-4.5h0.5v0.5h-0.5zM0.5,-4h1v0.5h-1z' },
    { paint: 'lantern', d: 'M0.5,-6h0.5v0.5h-0.5z' },
  ],
  pixels: 48,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
