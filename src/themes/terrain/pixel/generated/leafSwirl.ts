import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'fallenLeafRed', d: 'M-2,-2h1v0.5h-1zM-2.5,-1.5h0.5v0.5h-0.5z' },
    {
      paint: [
        ['fallenLeafRed', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M-2,-1.5h1v0.5h-1zM-2.5,-1h0.5v0.5h-0.5z',
    },
    { paint: 'fallenLeafOrange', d: 'M0,-3.5h0.5v0.5h-0.5z' },
    {
      paint: [
        ['fallenLeafOrange', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M-0.5,-3.5h0.5v0.5h-0.5zM-0.5,-3h1v0.5h-1z',
    },
    { paint: 'fallenLeafGold', d: 'M1.5,-1h0.5v0.5h-0.5z' },
    {
      paint: [
        ['fallenLeafGold', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M1,-1h0.5v0.5h-0.5zM1,-0.5h1v0.5h-1z',
    },
  ],
  pixels: 14,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'fallenLeafRed', d: 'M-2,-3h0.5v0.5h-0.5z' },
    {
      paint: [
        ['fallenLeafRed', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M-1.5,-3h0.5v0.5h-0.5zM-2,-2.5h1v0.5h-1z',
    },
    {
      paint: 'mapleRed',
      d: 'M1,-1.5h1v0.5h-1zM0.5,-1h0.5v0.5h-0.5zM1.5,-1h0.5v0.5h-0.5zM1,-0.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['mapleRed', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M0.5,-1.5h0.5v0.5h-0.5zM1,-1h0.5v0.5h-0.5z',
    },
  ],
  pixels: 11,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'fallenLeafGold',
      d: 'M-1.5,-1.5h0.5v0.5h-0.5zM-1,-1h0.5v1h-0.5zM-2,-0.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['fallenLeafGold', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M-2,-1h1v0.5h-1zM-1.5,-0.5h0.5v0.5h-0.5z',
    },
    { paint: 'oakGold', d: 'M1,-3.5h0.5v0.5h-0.5zM0.5,-3h0.5v0.5h-0.5z' },
    {
      paint: [
        ['oakGold', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M1,-3h1v0.5h-1zM0.5,-2.5h1v0.5h-1z',
    },
  ],
  pixels: 13,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
