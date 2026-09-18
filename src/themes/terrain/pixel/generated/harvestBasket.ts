import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: [
        ['haybale', 0.55],
        ['nestBrown', 0.45],
      ],
      d: 'M-1,-3h1.5v0.5h-1.5zM-1.5,-2.5h2.5v0.5h-2.5zM-0.5,-1h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['nestBrown', 0.65],
        ['trunk', 0.35],
      ],
      d: 'M1,-2h0.5v1h-0.5zM-1,-1h0.5v0.5h-0.5zM0,-1h2v0.5h-2zM0.5,-0.5h1v1h-1zM0.5,0.5h0.5v0.5h-0.5z',
    },
    { paint: 'harvestApple', d: 'M-1,-1.5h0.5v0.5h-0.5zM0.5,-1.5h0.5v0.5h-0.5z' },
    {
      paint: [
        ['harvestApple', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M-1.5,-2h2.5v0.5h-2.5zM-1.5,-1.5h0.5v0.5h-0.5z',
    },
    { paint: 'pearGreen', d: 'M-0.5,-1.5h0.5v0.5h-0.5z' },
    {
      paint: [
        ['pearGreen', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M0,-1.5h0.5v0.5h-0.5z',
    },
    { paint: 'nestBrown', d: 'M-2,-1h1v0.5h-1zM-1.5,-0.5h2v1.5h-2zM1,0.5h0.5v0.5h-0.5z' },
  ],
  pixels: 46,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: [
        ['haybale', 0.55],
        ['nestBrown', 0.45],
      ],
      d: 'M-1,-3h1.5v0.5h-1.5zM-1.5,-2.5h2.5v0.5h-2.5zM-1,-1h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['nestBrown', 0.65],
        ['trunk', 0.35],
      ],
      d: 'M1,-1.5h0.5v0.5h-0.5zM-0.5,-1h2.5v0.5h-2.5zM0.5,-0.5h1v1h-1zM0.5,0.5h0.5v0.5h-0.5z',
    },
    { paint: 'pearGreen', d: 'M-1.5,-1.5h1v0.5h-1z' },
    {
      paint: [
        ['pearGreen', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M-1.5,-2h1v0.5h-1zM0.5,-1.5h0.5v0.5h-0.5z',
    },
    { paint: 'harvestApple', d: 'M-0.5,-2h0.5v0.5h-0.5zM-0.5,-1.5h1v0.5h-1z' },
    {
      paint: [
        ['harvestApple', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M0,-2h0.5v0.5h-0.5z',
    },
    { paint: 'cornEar', d: 'M0.5,-2h1v0.5h-1z' },
    { paint: 'cornStalkColor', d: 'M1,-2.5h0.5v0.5h-0.5z' },
    {
      paint: 'nestBrown',
      d: 'M-2,-1h0.5v0.5h-0.5zM-1,-0.5h1.5v0.5h-1.5zM-0.5,0h1v0.5h-1zM-1.5,0.5h2v0.5h-2zM1,0.5h0.5v0.5h-0.5z',
    },
    { paint: 'beachTowelB', d: 'M-1.5,-1h0.5v1h-0.5zM-1.5,0h1v0.5h-1z' },
  ],
  pixels: 47,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: [
        ['nestBrown', 0.65],
        ['trunk', 0.35],
      ],
      d: 'M-1.5,-1.5h0.5v0.5h-0.5zM1,-1.5h0.5v0.5h-0.5zM-1,-1h0.5v0.5h-0.5zM0.5,-1h1.5v0.5h-1.5zM0.5,-0.5h1v1.5h-1z',
    },
    {
      paint: 'harvestGrape',
      d: 'M0,-2.5h0.5v0.5h-0.5zM-1,-2h1v0.5h-1zM-1,-1.5h2v0.5h-2zM-0.5,-1h1v0.5h-1z',
    },
    { paint: 'autumnOlive', d: 'M0,-2h0.5v0.5h-0.5zM1.5,-0.5h1v0.5h-1z' },
    { paint: 'nestBrown', d: 'M-2,-1h1v0.5h-1zM-1.5,-0.5h2v1.5h-2z' },
    {
      paint: [
        ['autumnOlive', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M0.5,-2h0.5v0.5h-0.5zM1.5,0h1v0.5h-1z',
    },
  ],
  pixels: 41,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
