import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'shadow', d: 'M-0.5,0h1.5v0.5h-1.5z' },
    {
      paint: [
        ['donkey', 0.78],
        ['shadow', 0.22],
      ],
      d: 'M-2,-5h0.5v0.5h-0.5zM-1,-5h0.5v0.5h-0.5zM1.5,-3.5h0.5v0.5h-0.5zM2.5,-3h0.5v0.5h-0.5zM0,-1.5h1.5v0.5h-1.5zM-1,-1h0.5v1.5h-0.5zM1,-1h0.5v1h-0.5zM-2.5,0h0.5v0.5h-0.5zM2,0h0.5v0.5h-0.5z',
    },
    {
      paint: 'trunk',
      d: 'M-1.5,-5h0.5v0.5h-0.5zM-1,-4.5h0.5v1h-0.5zM-0.5,-3.5h2v0.5h-2zM2.5,-2.5h0.5v2h-0.5zM-2,0h1v0.5h-1zM1,0h1v0.5h-1z',
    },
    {
      paint: 'donkey',
      d: 'M-2.5,-6.5h2v0.5h-2zM-2,-6h1.5v0.5h-1.5zM-2.5,-5.5h0.5v1h-0.5zM-1.5,-5.5h1v0.5h-1zM-2,-4.5h1v0.5h-1zM-1,-3.5h0.5v0.5h-0.5zM-0.5,-3h3v0.5h-3zM-2,-2.5h4.5v1h-4.5zM-2,-1.5h2v0.5h-2zM1.5,-1.5h1v1.5h-1zM-2,-1h1v1h-1z',
    },
    {
      paint: [
        ['donkey', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-2.5,-6h0.5v0.5h-0.5zM-2,-5.5h0.5v0.5h-0.5zM-2,-4h1v1h-1zM-2,-3h1.5v0.5h-1.5z',
    },
    { paint: 'goat', d: 'M-3.5,-4.5h1.5v0.5h-1.5zM-3,-4h1v0.5h-1z' },
  ],
  pixels: 98,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'shadow', d: 'M0,0h0.5v0.5h-0.5zM1.5,0h0.5v0.5h-0.5z' },
    {
      paint: [
        ['donkey', 0.78],
        ['shadow', 0.22],
      ],
      d: 'M-2,-5h1v1h-1zM-1.5,-4h0.5v0.5h-0.5zM1.5,-3.5h0.5v0.5h-0.5zM2.5,-3h0.5v0.5h-0.5zM-0.5,-1.5h2v0.5h-2zM-1,-1h1.5v0.5h-1.5zM2,-1h0.5v0.5h-0.5zM-0.5,-0.5h1v0.5h-1zM2,-0.5h1v1h-1zM-1,0h1v0.5h-1z',
    },
    {
      paint: 'trunk',
      d: 'M-0.5,-3.5h2v0.5h-2zM2.5,-2.5h0.5v2h-0.5zM-3,0h1v0.5h-1zM0.5,0h1v0.5h-1z',
    },
    {
      paint: 'donkey',
      d: 'M-3,-6.5h0.5v0.5h-0.5zM-2,-6.5h1v0.5h-1zM-3,-6h1v0.5h-1zM-1.5,-6h0.5v1h-0.5zM-3,-5.5h0.5v0.5h-0.5zM-3,-5h1v0.5h-1zM-2.5,-4.5h0.5v1h-0.5zM-1,-3.5h0.5v0.5h-0.5zM-0.5,-3h3v0.5h-3zM-2,-2.5h4.5v1h-4.5zM-2,-1.5h1.5v0.5h-1.5zM1.5,-1.5h1v0.5h-1zM-2.5,-1h1v1h-1zM1.5,-1h0.5v0.5h-0.5zM1,-0.5h1v0.5h-1z',
    },
    {
      paint: [
        ['donkey', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-2,-6h0.5v0.5h-0.5zM-2.5,-5.5h1v0.5h-1zM-2,-4h0.5v0.5h-0.5zM-1,-4h0.5v0.5h-0.5zM-2,-3.5h1v0.5h-1zM-2,-3h1.5v0.5h-1.5z',
    },
    { paint: 'goat', d: 'M-4,-4.5h1.5v1h-1.5z' },
  ],
  pixels: 102,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant0];
