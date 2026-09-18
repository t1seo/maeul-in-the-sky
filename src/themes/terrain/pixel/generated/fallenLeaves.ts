import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'fallenLeafRed', d: 'M-2.5,-0.5h1.5v0.5h-1.5zM-1.5,0.5h0.5v0.5h-0.5z' },
    {
      paint: [
        ['fallenLeafRed', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M-2.5,0h1.5v0.5h-1.5zM-2.5,0.5h0.5v0.5h-0.5z',
    },
    { paint: 'fallenLeafOrange', d: 'M0,-0.5h0.5v0.5h-0.5zM0.5,0h0.5v0.5h-0.5z' },
    {
      paint: [
        ['fallenLeafOrange', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M-0.5,0h1v0.5h-1zM0,0.5h1v0.5h-1z',
    },
  ],
  pixels: 14,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'fallenLeafGold', d: 'M-2,-0.5h1v0.5h-1z' },
    {
      paint: [
        ['fallenLeafGold', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M-2.5,-0.5h0.5v0.5h-0.5zM-2.5,0h1.5v0.5h-1.5z',
    },
    { paint: 'fallenLeafBrown', d: 'M0.5,-0.5h0.5v0.5h-0.5zM0,0h0.5v0.5h-0.5zM1,0h0.5v0.5h-0.5z' },
    {
      paint: [
        ['fallenLeafBrown', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M0.5,0h0.5v0.5h-0.5zM-0.5,0.5h1.5v0.5h-1.5z',
    },
  ],
  pixels: 13,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'fallenLeafRed', d: 'M-2.5,-0.5h1v0.5h-1zM-2.5,0h0.5v0.5h-0.5z' },
    {
      paint: [
        ['fallenLeafRed', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M-3,0h0.5v0.5h-0.5zM-2,0h1v0.5h-1zM-3,0.5h1.5v0.5h-1.5z',
    },
    { paint: 'fallenLeafGold', d: 'M-1,-0.5h1v0.5h-1z' },
    {
      paint: [
        ['fallenLeafGold', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M-1.5,-0.5h0.5v0.5h-0.5zM-1,0h1v1h-1z',
    },
    { paint: 'fallenLeafOrange', d: 'M0,0h1v0.5h-1zM1,0.5h0.5v0.5h-0.5zM0.5,1h0.5v0.5h-0.5z' },
    {
      paint: [
        ['fallenLeafOrange', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M0,0.5h1v0.5h-1z',
    },
  ],
  pixels: 22,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
