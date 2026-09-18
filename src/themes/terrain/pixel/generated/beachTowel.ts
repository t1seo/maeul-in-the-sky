import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'beachTowelA',
      d: 'M-1.5,-1.5h2v0.5h-2zM-2,-1h0.5v0.5h-0.5zM-1,-1h3v0.5h-3zM-3,-0.5h0.5v0.5h-0.5zM-2,-0.5h1v0.5h-1zM-0.5,-0.5h3.5v0.5h-3.5zM-2.5,0h0.5v0.5h-0.5zM-1.5,0h3.5v0.5h-3.5zM-1,0.5h1v0.5h-1zM0.5,0.5h1v0.5h-1z',
    },
    {
      paint: [
        ['beachTowelA', 0.75],
        ['trunk', 0.25],
      ],
      d: 'M-3.5,0h1v0.5h-1zM2,0h1v0.5h-1zM-2.5,0.5h1.5v0.5h-1.5zM1.5,0.5h1v0.5h-1zM-1,1h2.5v0.5h-2.5z',
    },
    {
      paint: 'parasolStripe',
      d: 'M-1.5,-1h0.5v0.5h-0.5zM-2.5,-0.5h0.5v0.5h-0.5zM-1,-0.5h0.5v0.5h-0.5zM-2,0h0.5v0.5h-0.5zM0,0.5h0.5v0.5h-0.5zM0,1.5h0.5v0.5h-0.5z',
    },
  ],
  pixels: 53,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'beachTowelB',
      d: 'M-1.5,-2h1v0.5h-1zM-3,-1.5h3.5v0.5h-3.5zM-2.5,-1h4.5v0.5h-4.5zM-3,-0.5h6v0.5h-6zM-2,0h4v0.5h-4zM-1,0.5h2.5v0.5h-2.5z',
    },
    {
      paint: [
        ['beachTowelB', 0.75],
        ['trunk', 0.25],
      ],
      d: 'M-3,-1h0.5v0.5h-0.5zM-3.5,0h1.5v0.5h-1.5zM2,0h1v0.5h-1zM-2.5,0.5h1.5v0.5h-1.5zM1.5,0.5h1v0.5h-1zM-1,1h2.5v0.5h-2.5z',
    },
    { paint: 'parasolStripe', d: 'M0,1.5h0.5v0.5h-0.5z' },
  ],
  pixels: 60,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'parasolYellow',
      d: 'M-1.5,-1.5h2v0.5h-2zM-2,-1h1v0.5h-1zM0.5,-1h0.5v0.5h-0.5zM1.5,-1h0.5v0.5h-0.5zM-3,-0.5h2.5v0.5h-2.5zM1.5,-0.5h1v0.5h-1zM-2.5,0h3v0.5h-3zM1.5,0h0.5v0.5h-0.5zM-2.5,0.5h0.5v0.5h-0.5zM-1,0.5h2.5v0.5h-2.5z',
    },
    {
      paint: [
        ['parasolYellow', 0.75],
        ['trunk', 0.25],
      ],
      d: 'M-1,-1h1.5v0.5h-1.5zM1,-1h0.5v1h-0.5zM3,-1h0.5v0.5h-0.5zM0,-0.5h0.5v0.5h-0.5zM2.5,-0.5h1v0.5h-1zM-3.5,0h1v0.5h-1zM0.5,0h1v0.5h-1zM2,0h1v0.5h-1zM-2,0.5h1v0.5h-1zM1.5,0.5h1v0.5h-1zM-1,1h2.5v0.5h-2.5z',
    },
    { paint: 'parasolStripe', d: 'M2,-1h1v0.5h-1zM0,1.5h0.5v0.5h-0.5z' },
    { paint: 'watermelonSeed', d: 'M-0.5,-0.5h0.5v0.5h-0.5zM0.5,-0.5h0.5v0.5h-0.5z' },
  ],
  pixels: 57,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
