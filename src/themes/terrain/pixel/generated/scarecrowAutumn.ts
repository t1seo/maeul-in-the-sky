import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'trunk', d: 'M-0.5,0.5h1v0.5h-1zM-1,1h2.5v0.5h-2.5z' },
    {
      paint: 'scarecrow',
      d: 'M-1,-3h1v0.5h-1zM-2.5,-2.5h2.5v1h-2.5zM2,-2.5h0.5v1h-0.5zM-1,-1.5h0.5v0.5h-0.5zM-1,-1h1v1h-1zM-1,0h2v0.5h-2z',
    },
    {
      paint: [
        ['scarecrow', 0.6],
        ['trunk', 0.4],
      ],
      d: 'M0,-3h1v0.5h-1zM0,-2.5h2v1h-2zM0,-1.5h1v1.5h-1z',
    },
    { paint: 'haybale', d: 'M-3,-2.5h0.5v0.5h-0.5zM2.5,-2h0.5v0.5h-0.5zM0.5,0.5h0.5v0.5h-0.5z' },
    { paint: 'fallenLeafRed', d: 'M-0.5,-1.5h0.5v0.5h-0.5z' },
    { paint: 'lambWool', d: 'M-1,-4h2v0.5h-2zM-1,-3.5h1.5v0.5h-1.5z' },
    { paint: 'scarecrowHat', d: 'M-1,-5.5h1.5v0.5h-1.5zM-1,-5h2v0.5h-2zM-1.5,-4.5h2.5v0.5h-2.5z' },
  ],
  pixels: 69,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'trunk', d: 'M2.5,-2.5h0.5v0.5h-0.5zM-0.5,0.5h1v0.5h-1zM-1,1h2.5v0.5h-2.5z' },
    {
      paint: 'scarecrow',
      d: 'M-1,-3h1v0.5h-1zM-2.5,-2.5h2.5v1h-2.5zM2,-2.5h0.5v1h-0.5zM-1,-1.5h0.5v0.5h-0.5zM-1,-1h1v1h-1zM-1,0h2v0.5h-2z',
    },
    {
      paint: [
        ['scarecrow', 0.6],
        ['trunk', 0.4],
      ],
      d: 'M0,-3h1v0.5h-1zM0,-2.5h2v1h-2zM0,-1.5h1v1.5h-1z',
    },
    { paint: 'haybale', d: 'M-3,-2.5h0.5v0.5h-0.5zM2.5,-2h0.5v0.5h-0.5zM0.5,0.5h0.5v0.5h-0.5z' },
    { paint: 'fallenLeafRed', d: 'M-0.5,-1.5h0.5v0.5h-0.5z' },
    { paint: 'lambWool', d: 'M-1,-4h2v0.5h-2zM-1,-3.5h1.5v0.5h-1.5z' },
    { paint: 'scarecrowHat', d: 'M-1,-5.5h1.5v0.5h-1.5zM-1,-5h2v0.5h-2zM-1.5,-4.5h2.5v0.5h-2.5z' },
    { paint: 'watermelonSeed', d: 'M2,-4h0.5v0.5h-0.5zM1.5,-3.5h2v0.5h-2zM1,-3h2v0.5h-2z' },
  ],
  pixels: 79,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'trunk', d: 'M-0.5,0.5h1v0.5h-1zM-1,1h2.5v0.5h-2.5z' },
    {
      paint: 'scarecrow',
      d: 'M0,-5h0.5v0.5h-0.5zM-1,-3h1v0.5h-1zM-2.5,-2.5h2.5v1h-2.5zM2,-2.5h0.5v1h-0.5zM-1,-1.5h0.5v0.5h-0.5zM-1,-1h1v1h-1zM-1,0h2v0.5h-2z',
    },
    {
      paint: [
        ['scarecrow', 0.6],
        ['trunk', 0.4],
      ],
      d: 'M0,-4h0.5v0.5h-0.5zM0,-3h1v0.5h-1zM0,-2.5h2v1h-2zM0,-1.5h1v1.5h-1z',
    },
    { paint: 'haybale', d: 'M-3,-2.5h0.5v0.5h-0.5zM2.5,-2h0.5v0.5h-0.5zM0.5,0.5h0.5v0.5h-0.5z' },
    { paint: 'fallenLeafRed', d: 'M-0.5,-1.5h0.5v0.5h-0.5z' },
    {
      paint: 'pumpkin',
      d: 'M-0.5,-5h0.5v0.5h-0.5zM-1,-4.5h2v0.5h-2zM-1,-4h1v0.5h-1zM0.5,-4h0.5v0.5h-0.5zM-1,-3.5h2v0.5h-2z',
    },
  ],
  pixels: 64,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
