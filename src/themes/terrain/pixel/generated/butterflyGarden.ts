import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'butterflyWing', d: 'M-2.5,-1.5h1.5v0.5h-1.5zM-2,-1h1v1h-1z' },
    {
      paint: 'butterfly',
      d: 'M0,-2.5h0.5v0.5h-0.5zM-0.5,-2h1.5v0.5h-1.5zM-1,-1.5h0.5v0.5h-0.5zM0,-1.5h1v0.5h-1zM-0.5,-1h0.5v0.5h-0.5zM0.5,-1h0.5v0.5h-0.5zM-1,-0.5h1v0.5h-1zM-0.5,0h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['butterfly', 0.5],
        ['eggWhite', 0.5],
      ],
      d: 'M-0.5,-1.5h0.5v0.5h-0.5z',
    },
    { paint: 'cherryTrunk', d: 'M1,-2h0.5v0.5h-0.5zM-1,-1h0.5v0.5h-0.5z' },
    { paint: 'tulipPurple', d: 'M1.5,-2.5h0.5v0.5h-0.5zM1,-1.5h1v1h-1z' },
    {
      paint: [
        ['eggWhite', 0.5],
        ['tulipPurple', 0.5],
      ],
      d: 'M1.5,-2h0.5v0.5h-0.5z',
    },
  ],
  pixels: 28,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'butterflyWing',
      d: 'M1.5,-2.5h0.5v0.5h-0.5zM-2.5,-2h1v1h-1zM1,-2h1v0.5h-1zM1.5,-1.5h0.5v0.5h-0.5zM-2,-1h0.5v0.5h-0.5zM-1,-0.5h1v0.5h-1zM-0.5,0h0.5v0.5h-0.5z',
    },
    { paint: 'butterfly', d: 'M-1.5,-2h1v1.5h-1z' },
    {
      paint: 'tulipPurple',
      d: 'M0.5,-2.5h0.5v1h-0.5zM0.5,-1.5h1v0.5h-1zM0.5,-1h0.5v0.5h-0.5zM0,-0.5h1v1h-1zM0.5,0.5h0.5v0.5h-0.5z',
    },
  ],
  pixels: 28,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant0];
