import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: [
        ['owl', 0.75],
        ['shadow', 0.25],
      ],
      d: 'M-2,-1h1v0.5h-1zM1,-1h0.5v0.5h-0.5zM-1.5,-0.5h0.5v0.5h-0.5zM-0.5,-0.5h1v1h-1z',
    },
    { paint: 'cherryTrunk', d: 'M-0.5,0.5h0.5v0.5h-0.5zM0.5,0.5h0.5v0.5h-0.5z' },
    { paint: 'owl', d: 'M-0.5,-1.5h1.5v0.5h-1.5zM-1,-1h0.5v1.5h-0.5zM0,-1h0.5v0.5h-0.5z' },
    { paint: 'tulipRed', d: 'M0.5,-1h0.5v0.5h-0.5zM0.5,-0.5h1v0.5h-1zM0.5,0h0.5v0.5h-0.5z' },
    {
      paint: [
        ['owl', 0.73],
        ['shadow', 0.27],
      ],
      d: 'M0,0.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['eggWhite', 0.27],
        ['owl', 0.73],
      ],
      d: 'M1,-1.5h0.5v0.5h-0.5zM-0.5,-1h0.5v0.5h-0.5z',
    },
    { paint: 'tulipYellow', d: 'M1.5,-1h0.5v0.5h-0.5z' },
  ],
  pixels: 25,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: [
        ['owl', 0.75],
        ['shadow', 0.25],
      ],
      d: 'M-2,-1h1v0.5h-1zM-1.5,-0.5h0.5v0.5h-0.5zM-0.5,-0.5h0.5v0.5h-0.5zM-0.5,0h1v0.5h-1z',
    },
    { paint: 'cherryTrunk', d: 'M-0.5,0.5h1.5v0.5h-1.5z' },
    {
      paint: 'owl',
      d: 'M0,-2h1v0.5h-1zM-0.5,-1.5h1v0.5h-1zM-1,-1h0.5v1.5h-0.5zM1,-0.5h0.5v0.5h-0.5z',
    },
    { paint: 'tulipRed', d: 'M0,-1h1v1h-1zM0.5,0h0.5v0.5h-0.5z' },
    {
      paint: [
        ['eggWhite', 0.27],
        ['owl', 0.73],
      ],
      d: 'M0.5,-1.5h1v0.5h-1zM-0.5,-1h0.5v0.5h-0.5zM1,-1h0.5v0.5h-0.5z',
    },
    { paint: 'tulipYellow', d: 'M1.5,-2h0.5v0.5h-0.5zM1.5,-1h0.5v0.5h-0.5z' },
  ],
  pixels: 28,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant0];
