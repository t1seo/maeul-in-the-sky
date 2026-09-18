import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: [
        ['hotDrinkMug', 0.65],
        ['trunk', 0.35],
      ],
      d: 'M-0.5,-1.5h1v0.5h-1zM1,-1.5h0.5v0.5h-0.5zM0.5,-1h1.5v1h-1.5zM0,0h1.5v0.5h-1.5z',
    },
    { paint: 'hotDrinkMug', d: 'M-1,-1h1.5v1h-1.5zM-1,0h1v0.5h-1zM-0.5,0.5h1v0.5h-1z' },
    { paint: 'parasolStripe', d: 'M0,-2h0.5v0.5h-0.5z' },
    {
      paint: [
        ['hotDrinkMug', 0.35],
        ['parasolStripe', 0.65],
      ],
      d: 'M-1,-1.5h0.5v0.5h-0.5zM0.5,-1.5h0.5v0.5h-0.5z',
    },
    { paint: 'hotDrinkSteam', d: 'M-0.5,-3h0.5v1.5h-0.5z' },
  ],
  pixels: 28,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: [
        ['hotDrinkMug', 0.65],
        ['trunk', 0.35],
      ],
      d: 'M-0.5,-2h1v0.5h-1zM1,-2h0.5v0.5h-0.5zM0,-1.5h2v0.5h-2zM0.5,-1h1.5v0.5h-1.5zM0.5,-0.5h1v0.5h-1zM0,0h1v0.5h-1z',
    },
    {
      paint: 'hotDrinkMug',
      d: 'M-1,-1.5h1v0.5h-1zM-1,-1h1.5v1h-1.5zM-1,0h1v0.5h-1zM-0.5,0.5h1v0.5h-1z',
    },
    {
      paint: [
        ['hotDrinkMug', 0.35],
        ['parasolStripe', 0.65],
      ],
      d: 'M-1,-2h0.5v0.5h-0.5zM0.5,-2h0.5v0.5h-0.5z',
    },
    { paint: 'hotDrinkSteam', d: 'M-0.5,-3.5h0.5v1.5h-0.5z' },
  ],
  pixels: 31,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'hotDrinkMug',
      d: 'M-1,-1h1.5v1h-1.5zM-1,0h1v0.5h-1zM-1.5,0.5h0.5v0.5h-0.5zM1,0.5h1v0.5h-1zM-0.5,1h1.5v0.5h-1.5z',
    },
    { paint: 'parasolStripe', d: 'M0,-2h0.5v0.5h-0.5z' },
    {
      paint: [
        ['hotDrinkMug', 0.65],
        ['trunk', 0.35],
      ],
      d: 'M-0.5,-1.5h1v0.5h-1zM1,-1.5h0.5v0.5h-0.5zM0.5,-1h1.5v1h-1.5zM0,0h1.5v0.5h-1.5z',
    },
    {
      paint: [
        ['hotDrinkMug', 0.35],
        ['parasolStripe', 0.65],
      ],
      d: 'M-1,-1.5h0.5v0.5h-0.5zM0.5,-1.5h0.5v0.5h-0.5zM-1,0.5h2v0.5h-2z',
    },
    { paint: 'hotDrinkSteam', d: 'M-0.5,-3h0.5v1.5h-0.5z' },
  ],
  pixels: 36,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
