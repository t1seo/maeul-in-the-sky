import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: [
        ['poolWater', 0.8],
        ['shadow', 0.2],
      ],
      d: 'M-0.5,-1h1.5v0.5h-1.5zM-1.5,-0.5h0.5v0.5h-0.5zM1.5,-0.5h0.5v0.5h-0.5zM-2,0h0.5v0.5h-0.5zM1,0h1v0.5h-1zM-1.5,0.5h3v0.5h-3z',
    },
    {
      paint: 'poolWater',
      d: 'M-1.5,-1h1v0.5h-1zM-2,-0.5h0.5v0.5h-0.5zM-0.5,-0.5h2v0.5h-2zM-1.5,0h2.5v0.5h-2.5z',
    },
    { paint: 'waterLight', d: 'M-1,-0.5h0.5v0.5h-0.5z' },
  ],
  pixels: 27,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: [
        ['poolWater', 0.8],
        ['shadow', 0.2],
      ],
      d: 'M-2,-1h0.5v0.5h-0.5zM0,-1h2v0.5h-2zM-2.5,-0.5h0.5v0.5h-0.5zM-1.5,-0.5h0.5v0.5h-0.5zM2,-0.5h0.5v0.5h-0.5zM-2.5,0h1v0.5h-1zM1,0h1.5v0.5h-1.5zM-1.5,0.5h3.5v0.5h-3.5z',
    },
    {
      paint: 'poolWater',
      d: 'M-2.5,-1h0.5v0.5h-0.5zM-1.5,-1h1.5v0.5h-1.5zM-2,-0.5h0.5v0.5h-0.5zM-0.5,-0.5h2.5v0.5h-2.5zM-1.5,0h2.5v0.5h-2.5z',
    },
    { paint: 'waterLight', d: 'M-1,-0.5h0.5v0.5h-0.5z' },
  ],
  pixels: 36,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'gardenSoil',
      d: 'M-2.5,-1h1.5v0.5h-1.5zM0,-1h0.5v0.5h-0.5zM1,-1h1v0.5h-1zM-2.5,-0.5h0.5v1h-0.5zM2,-0.5h0.5v1h-0.5zM-2,0.5h2.5v0.5h-2.5zM1,0.5h1.5v0.5h-1.5z',
    },
    {
      paint: [
        ['poolWater', 0.8],
        ['shadow', 0.2],
      ],
      d: 'M-1,-1h1v0.5h-1zM0.5,-1h0.5v0.5h-0.5zM-1.5,-0.5h0.5v0.5h-0.5zM1.5,-0.5h0.5v0.5h-0.5zM-2,0h0.5v0.5h-0.5zM1,0h1v0.5h-1zM0.5,0.5h0.5v0.5h-0.5z',
    },
    { paint: 'poolWater', d: 'M-2,-0.5h0.5v0.5h-0.5zM-0.5,-0.5h2v0.5h-2zM-1.5,0h2.5v0.5h-2.5z' },
    { paint: 'waterLight', d: 'M-1,-0.5h0.5v0.5h-0.5z' },
  ],
  pixels: 38,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
