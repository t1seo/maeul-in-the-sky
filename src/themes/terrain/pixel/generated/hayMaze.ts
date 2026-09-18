import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'haybale',
      d: 'M-1,-2h0.5v0.5h-0.5zM1,-2h0.5v0.5h-0.5zM-1,-1.5h1.5v1h-1.5zM1,-1h0.5v0.5h-0.5zM-2,-0.5h3.5v0.5h-3.5zM-2,0h3v0.5h-3zM-1.5,0.5h3v0.5h-3z',
    },
    {
      paint: [
        ['haybale', 0.65],
        ['trunk', 0.35],
      ],
      d: 'M0.5,-1.5h1v0.5h-1zM0.5,-1h0.5v0.5h-0.5zM1.5,-0.5h0.5v0.5h-0.5zM1,0h1v0.5h-1zM1.5,0.5h0.5v0.5h-0.5z',
    },
    {
      paint: 'autumnGold',
      d: 'M-0.5,-2.5h0.5v0.5h-0.5zM-0.5,-2h1.5v0.5h-1.5zM-2,-1h1v0.5h-1zM1.5,-1h0.5v0.5h-0.5z',
    },
  ],
  pixels: 42,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'haybale',
      d: 'M-2.5,-2h1.5v1h-1.5zM-2.5,-1h1v0.5h-1zM-1,-1h0.5v0.5h-0.5zM-2.5,-0.5h1.5v1h-1.5zM-0.5,-0.5h1v0.5h-1zM1.5,-0.5h0.5v0.5h-0.5zM-0.5,0h2v1h-2zM-2,0.5h1v0.5h-1z',
    },
    {
      paint: [
        ['haybale', 0.65],
        ['trunk', 0.35],
      ],
      d: 'M-1,-2h0.5v1h-0.5zM-1,-0.5h0.5v1h-0.5zM1.5,0h0.5v1h-0.5z',
    },
    {
      paint: 'autumnGold',
      d: 'M-2,-2.5h1.5v0.5h-1.5zM-1.5,-1h0.5v0.5h-0.5zM0,-1h1.5v0.5h-1.5zM0.5,-0.5h1v0.5h-1z',
    },
  ],
  pixels: 43,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'haybale', d: 'M0,-1.5h1.5v1.5h-1.5zM-2.5,-0.5h1.5v1h-1.5zM-2,0.5h1v0.5h-1z' },
    {
      paint: [
        ['haybale', 0.65],
        ['trunk', 0.35],
      ],
      d: 'M2,-1.5h0.5v0.5h-0.5zM-0.5,-1h0.5v0.5h-0.5zM1.5,-1h1v1h-1zM-1,-0.5h1v1h-1zM-1,0.5h0.5v0.5h-0.5z',
    },
    {
      paint: 'autumnGold',
      d: 'M0,-2h2.5v0.5h-2.5zM-1.5,-1.5h0.5v0.5h-0.5zM1.5,-1.5h0.5v0.5h-0.5zM-2.5,-1h2v0.5h-2z',
    },
  ],
  pixels: 39,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
