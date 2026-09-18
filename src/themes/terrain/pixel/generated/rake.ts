import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'trunk', d: 'M-0.5,-2h1v2.5h-1z' },
    {
      paint: [
        ['haybale', 0.6],
        ['trunk', 0.4],
      ],
      d: 'M-0.5,-2.5h1v0.5h-1z',
    },
    { paint: 'sledRunner', d: 'M-1,-3.5h2v1h-2zM-1,-2.5h0.5v0.5h-0.5zM0.5,-2.5h0.5v0.5h-0.5z' },
    { paint: 'acornCap', d: 'M-0.5,0.5h1v0.5h-1z' },
  ],
  pixels: 24,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'fallenLeafOrange', d: 'M-2.5,0h0.5v0.5h-0.5z' },
    {
      paint: [
        ['fallenLeafOrange', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M-2,0h0.5v1h-0.5zM-1.5,1h0.5v0.5h-0.5z',
    },
    {
      paint: 'trunk',
      d: 'M0.5,-2h0.5v1h-0.5zM0,-1h1v0.5h-1zM0,-0.5h0.5v0.5h-0.5zM-0.5,0h1v0.5h-1z',
    },
    { paint: 'fallenLeafRed', d: 'M-1.5,0h1v0.5h-1z' },
    {
      paint: [
        ['fallenLeafRed', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M-1.5,0.5h1v0.5h-1z',
    },
    {
      paint: [
        ['fallenLeafGold', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M-3,0.5h0.5v0.5h-0.5zM-3,1h1v0.5h-1z',
    },
    {
      paint: [
        ['haybale', 0.6],
        ['trunk', 0.4],
      ],
      d: 'M1,-2.5h0.5v1h-0.5zM0,-1.5h0.5v0.5h-0.5zM-0.5,-0.5h0.5v0.5h-0.5zM-2.5,0.5h0.5v0.5h-0.5zM-2,1h0.5v0.5h-0.5z',
    },
    {
      paint: 'sledRunner',
      d: 'M0.5,-3.5h1v0.5h-1zM0,-3h2.5v0.5h-2.5zM0,-2.5h1v0.5h-1zM1.5,-2.5h1v0.5h-1zM1.5,-2h0.5v0.5h-0.5z',
    },
    { paint: 'acornCap', d: 'M-0.5,0.5h0.5v0.5h-0.5z' },
  ],
  pixels: 37,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'fallenLeafGold', d: 'M0.5,0.5h1v0.5h-1z' },
    {
      paint: [
        ['fallenLeafGold', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M0.5,1h1v0.5h-1z',
    },
    {
      paint: 'trunk',
      d: 'M-1,-2h1v0.5h-1zM-0.5,-1.5h0.5v1h-0.5zM-0.5,-0.5h1v0.5h-1zM0,0h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['haybale', 0.6],
        ['trunk', 0.4],
      ],
      d: 'M-1,-2.5h0.5v0.5h-0.5zM-1,-1.5h0.5v0.5h-0.5zM-0.5,0h0.5v0.5h-0.5z',
    },
    {
      paint: 'sledRunner',
      d: 'M-1,-3.5h1v0.5h-1zM-2,-3h2v0.5h-2zM-2,-2.5h1v0.5h-1zM-0.5,-2.5h0.5v0.5h-0.5z',
    },
    { paint: 'poolEdge', d: 'M-1.5,-3.5h0.5v0.5h-0.5z' },
    { paint: 'acornCap', d: 'M0,0.5h0.5v0.5h-0.5z' },
  ],
  pixels: 25,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
