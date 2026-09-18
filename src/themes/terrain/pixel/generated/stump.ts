import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'trunk',
      d: 'M-1.5,-2.5h0.5v1h-0.5zM-0.5,-2.5h1.5v0.5h-1.5zM0.5,-2h0.5v0.5h-0.5zM-2,-1.5h1v0.5h-1zM1,-1.5h1v0.5h-1zM-2,-1h3.5v0.5h-3.5zM-2,-0.5h4v0.5h-4zM-2,0h1v0.5h-1zM-0.5,0h1v0.5h-1zM1,0h1v0.5h-1z',
    },
    {
      paint: 'stump',
      d: 'M1,-2.5h0.5v0.5h-0.5zM-2,-2h0.5v0.5h-0.5zM1,-2h1v0.5h-1zM-1,-1.5h2v0.5h-2z',
    },
    { paint: 'fence', d: 'M-1,-2.5h0.5v0.5h-0.5zM-1,-2h1.5v0.5h-1.5z' },
  ],
  pixels: 43,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'trunk',
      d: 'M-1.5,-2.5h0.5v1h-0.5zM-0.5,-2.5h1.5v0.5h-1.5zM0.5,-2h0.5v0.5h-0.5zM-2,-1.5h1v0.5h-1zM-2,-1h3v1h-3zM-2,0h1v0.5h-1zM-0.5,0h1v0.5h-1zM1,0h1v0.5h-1z',
    },
    {
      paint: 'stump',
      d: 'M1,-2.5h0.5v0.5h-0.5zM-2,-2h0.5v0.5h-0.5zM1,-2h1v0.5h-1zM-1,-1.5h2v0.5h-2z',
    },
    { paint: 'fence', d: 'M-1,-2.5h0.5v0.5h-0.5zM-1,-2h1.5v0.5h-1.5zM1,-0.5h1v0.5h-1z' },
    { paint: 'mushroom', d: 'M1,-1.5h1v0.5h-1zM1,-1h1.5v0.5h-1.5z' },
  ],
  pixels: 45,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'trunk',
      d: 'M0.5,-2h0.5v0.5h-0.5zM-2,-1.5h0.5v1h-0.5zM1,-1.5h1v0.5h-1zM-1,-1h2.5v0.5h-2.5zM-2,-0.5h4v0.5h-4zM-2,0h1v0.5h-1zM-0.5,0h1v0.5h-1zM1,0h1v0.5h-1z',
    },
    {
      paint: 'stump',
      d: 'M1,-2.5h0.5v0.5h-0.5zM-2,-2h0.5v0.5h-0.5zM1,-2h1v0.5h-1zM-0.5,-1.5h1.5v0.5h-1.5z',
    },
    {
      paint: 'moss',
      d: 'M-1.5,-2.5h1v0.5h-1zM0,-2.5h1v0.5h-1zM-1.5,-2h2v0.5h-2zM-1.5,-1.5h1v0.5h-1zM-1.5,-1h0.5v0.5h-0.5z',
    },
    { paint: 'leafLight', d: 'M-0.5,-2.5h0.5v0.5h-0.5z' },
  ],
  pixels: 43,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
