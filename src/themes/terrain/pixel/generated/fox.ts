import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'trunk',
      d: 'M-1.5,-1h0.5v0.5h-0.5zM1,-1h0.5v0.5h-0.5zM-1.5,-0.5h1v1h-1zM1,-0.5h1v0.5h-1zM1,0h0.5v0.5h-0.5z',
    },
    {
      paint: 'fox',
      d: 'M-3,-4h1v0.5h-1zM-1.5,-4h0.5v0.5h-0.5zM-3,-3.5h2v0.5h-2zM-3,-3h4v0.5h-4zM-3.5,-2.5h2.5v0.5h-2.5zM0,-2.5h1.5v0.5h-1.5zM-2,-2h4v0.5h-4zM2.5,-2h0.5v0.5h-0.5zM-1.5,-1.5h4.5v0.5h-4.5zM-1,-1h2v0.5h-2zM1.5,-1h2v0.5h-2zM2,-0.5h1v0.5h-1z',
    },
    {
      paint: 'mushroom',
      d: 'M3.5,-3h0.5v0.5h-0.5zM3,-2.5h1.5v1.5h-1.5zM-3,-2h1v0.5h-1zM-2.5,-1.5h1v0.5h-1zM3.5,-1h0.5v0.5h-0.5z',
    },
    { paint: 'butterflyWing', d: 'M-1,-2.5h1v0.5h-1z' },
  ],
  pixels: 77,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'fox',
      d: 'M-0.5,-3h1v0.5h-1zM-2.5,-2.5h2v0.5h-2zM1,-2.5h1v0.5h-1zM-2.5,-2h5v0.5h-5zM-2.5,-1.5h1v0.5h-1zM-1,-1.5h3.5v0.5h-3.5zM-2,-1h0.5v0.5h-0.5zM-0.5,-1h3v0.5h-3zM0.5,-0.5h2v0.5h-2zM-1.5,0h1v0.5h-1zM0,0h1.5v0.5h-1.5z',
    },
    { paint: 'butterflyWing', d: 'M-0.5,-2.5h1.5v0.5h-1.5z' },
    {
      paint: 'mushroom',
      d: 'M-1.5,-1.5h0.5v0.5h-0.5zM-1.5,-1h1v0.5h-1zM-2,-0.5h2.5v0.5h-2.5zM-0.5,0h0.5v0.5h-0.5z',
    },
  ],
  pixels: 55,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'trunk',
      d: 'M-1.5,-1h0.5v0.5h-0.5zM1,-1h0.5v0.5h-0.5zM-2,-0.5h1v1h-1zM1.5,-0.5h0.5v1h-0.5z',
    },
    {
      paint: 'fox',
      d: 'M-3,-4h1v0.5h-1zM-1.5,-4h0.5v0.5h-0.5zM-3,-3.5h2v0.5h-2zM-3,-3h4v0.5h-4zM-3.5,-2.5h2.5v0.5h-2.5zM0,-2.5h1.5v0.5h-1.5zM2.5,-2.5h0.5v0.5h-0.5zM-2,-2h5v0.5h-5zM-1.5,-1.5h5v0.5h-5zM-1,-1h2v0.5h-2zM1.5,-1h1.5v0.5h-1.5z',
    },
    {
      paint: 'mushroom',
      d: 'M3,-3.5h1v2h-1zM-3,-2h1v0.5h-1zM-2.5,-1.5h1v0.5h-1zM3.5,-1.5h0.5v0.5h-0.5z',
    },
    { paint: 'butterflyWing', d: 'M-1,-2.5h1v0.5h-1z' },
  ],
  pixels: 74,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
