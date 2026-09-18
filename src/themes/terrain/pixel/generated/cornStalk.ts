import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'cornStalkColor',
      d: 'M0,-3h0.5v0.5h-0.5zM1,-2.5h0.5v0.5h-0.5zM-1.5,-2h1.5v0.5h-1.5zM-1,-1.5h1v0.5h-1zM1,-1.5h0.5v0.5h-0.5zM-0.5,-1h2v0.5h-2zM-0.5,-0.5h1v1.5h-1z',
    },
    {
      paint: [
        ['cornEar', 0.35],
        ['cornStalkColor', 0.65],
      ],
      d: 'M-1.5,-3h1.5v0.5h-1.5zM-1,-2.5h2v0.5h-2zM0,-2h0.5v0.5h-0.5zM0,-1.5h1v0.5h-1z',
    },
    { paint: 'cornEar', d: 'M-0.5,-3.5h1v0.5h-1zM0.5,-2h0.5v0.5h-0.5z' },
  ],
  pixels: 31,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'cornStalkColor',
      d: 'M-2,-3h0.5v1.5h-0.5zM1.5,-3h0.5v0.5h-0.5zM-1,-2.5h0.5v0.5h-0.5zM2.5,-2.5h1v0.5h-1zM-3.5,-2h1v0.5h-1zM-1,-2h1v1h-1zM1.5,-2h0.5v0.5h-0.5zM-3,-1.5h1.5v0.5h-1.5zM1,-1.5h1v0.5h-1zM2.5,-1.5h1v0.5h-1zM-2,-1h5v0.5h-5zM-2,-0.5h1v0.5h-1zM-0.5,-0.5h1v1.5h-1zM1.5,-0.5h1v0.5h-1zM-2,0h0.5v1h-0.5zM1.5,0h0.5v1h-0.5z',
    },
    {
      paint: [
        ['cornEar', 0.35],
        ['cornStalkColor', 0.65],
      ],
      d: 'M-3.5,-3h1.5v0.5h-1.5zM-1.5,-3h1.5v0.5h-1.5zM0.5,-3h1v0.5h-1zM-3,-2.5h1v0.5h-1zM-0.5,-2.5h2.5v0.5h-2.5zM-1.5,-2h0.5v1h-0.5zM0,-2h1v1h-1zM2,-1.5h0.5v0.5h-0.5z',
    },
    {
      paint: 'cornEar',
      d: 'M-2.5,-3.5h1.5v0.5h-1.5zM-0.5,-3.5h1.5v0.5h-1.5zM1.5,-3.5h1v0.5h-1zM0,-3h0.5v0.5h-0.5zM-1.5,-2.5h0.5v0.5h-0.5zM2,-2.5h0.5v0.5h-0.5zM2,-2h1v0.5h-1z',
    },
  ],
  pixels: 80,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'haybale',
      d: 'M0,-3h0.5v0.5h-0.5zM1,-2.5h0.5v0.5h-0.5zM-1.5,-2h0.5v0.5h-0.5zM1,-1.5h0.5v0.5h-0.5zM-0.5,-1h2v0.5h-2zM-0.5,-0.5h1v0.5h-1zM-0.5,0.5h1v0.5h-1z',
    },
    {
      paint: [
        ['cornEar', 0.35],
        ['haybale', 0.65],
      ],
      d: 'M-1.5,-3h1.5v0.5h-1.5zM-1,-2.5h2v0.5h-2zM-0.5,-2h1v0.5h-1zM-1,-1.5h0.5v0.5h-0.5zM0,-1.5h1v0.5h-1z',
    },
    {
      paint: 'cornEar',
      d: 'M-0.5,-3.5h1v0.5h-1zM-1,-2h0.5v0.5h-0.5zM0.5,-2h0.5v0.5h-0.5zM-0.5,-1.5h0.5v0.5h-0.5z',
    },
    { paint: 'nestBrown', d: 'M-0.5,0h1.5v0.5h-1.5z' },
  ],
  pixels: 32,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
