import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'ice',
      d: 'M1,-2.5h0.5v0.5h-0.5zM-1,-2h0.5v0.5h-0.5zM-1,0h0.5v0.5h-0.5zM0.5,0h1v0.5h-1zM-1.5,0.5h3v0.5h-3z',
    },
    {
      paint: 'bareBranch',
      d: 'M-0.5,-3h1v1h-1zM1.5,-2.5h0.5v0.5h-0.5zM-2,-2h0.5v0.5h-0.5zM-0.5,-2h2v0.5h-2zM-1.5,-1.5h2.5v0.5h-2.5zM-0.5,-1h1v1.5h-1z',
    },
    { paint: 'snowCap', d: 'M-2,-3h0.5v1h-0.5zM1,-3h1v0.5h-1zM-1.5,-2h0.5v0.5h-0.5z' },
  ],
  pixels: 37,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'ice',
      d: 'M2.5,-3h0.5v0.5h-0.5zM-1,0h0.5v0.5h-0.5zM0.5,0h1v0.5h-1zM-1.5,0.5h3v0.5h-3z',
    },
    {
      paint: 'bareBranch',
      d: 'M-1,-3.5h0.5v0.5h-0.5zM0.5,-3.5h0.5v0.5h-0.5zM-2,-3h0.5v0.5h-0.5zM-1,-3h2v0.5h-2zM-3.5,-2.5h0.5v0.5h-0.5zM-2,-2.5h1v0.5h-1zM-0.5,-2.5h1v0.5h-1zM-3,-2h0.5v0.5h-0.5zM-1.5,-2h2v0.5h-2zM1,-2h2.5v0.5h-2.5zM-3,-1.5h5.5v0.5h-5.5zM-2,-1h3.5v0.5h-3.5zM-0.5,-0.5h1.5v0.5h-1.5zM-0.5,0h1v0.5h-1z',
    },
    {
      paint: 'snowCap',
      d: 'M2,-3h0.5v0.5h-0.5zM-3,-2.5h0.5v0.5h-0.5zM1.5,-2.5h1v0.5h-1zM-2.5,-2h1v0.5h-1z',
    },
  ],
  pixels: 61,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'ice',
      d: 'M-2.5,-3h0.5v0.5h-0.5zM-2,-2.5h0.5v0.5h-0.5zM-1,0h0.5v0.5h-0.5zM0.5,0h1v0.5h-1zM-1.5,0.5h3v0.5h-3z',
    },
    {
      paint: 'bareBranch',
      d: 'M-0.5,-3h1v0.5h-1zM-2.5,-2.5h0.5v0.5h-0.5zM-0.5,-2.5h1.5v0.5h-1.5zM1.5,-2.5h1v0.5h-1zM-2,-2h2.5v0.5h-2.5zM-1.5,-1.5h3v0.5h-3zM-0.5,-1h2v0.5h-2zM-0.5,-0.5h1.5v0.5h-1.5zM-0.5,0h1v0.5h-1z',
    },
    { paint: 'snowCap', d: 'M-1,-3.5h1v0.5h-1zM-2,-3h0.5v0.5h-0.5z' },
    {
      paint: 'scarfRed',
      d: 'M1,-3.5h0.5v0.5h-0.5zM-1.5,-3h1v1h-1zM0.5,-3h1v0.5h-1zM1.5,-2h1v1h-1z',
    },
  ],
  pixels: 53,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
