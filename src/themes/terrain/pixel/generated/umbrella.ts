import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'trunk',
      d: 'M0.5,-3.5h0.5v1h-0.5zM-0.5,0h0.5v1h-0.5zM-1,1h1v0.5h-1zM-1,1.5h0.5v0.5h-0.5z',
    },
    { paint: 'parasolRed', d: 'M0.5,-2.5h0.5v1.5h-0.5zM0,0h0.5v0.5h-0.5z' },
    {
      paint: [
        ['cherryTrunk', 0.25],
        ['parasolRed', 0.75],
      ],
      d: 'M0,-3h0.5v2h-0.5zM-0.5,-0.5h1v0.5h-1z',
    },
    {
      paint: [
        ['eggWhite', 0.38],
        ['parasolRed', 0.62],
      ],
      d: 'M-0.5,-2h0.5v1h-0.5zM-0.5,-1h1v0.5h-1z',
    },
  ],
  pixels: 21,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'trunk',
      d: 'M0.5,-3.5h0.5v0.5h-0.5zM-0.5,0h0.5v1h-0.5zM-1,1h1v0.5h-1zM-1,1.5h0.5v0.5h-0.5z',
    },
    {
      paint: 'parasolBlue',
      d: 'M0.5,-2.5h0.5v2h-0.5zM-0.5,-2h0.5v1h-0.5zM-0.5,-0.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['cherryTrunk', 0.25],
        ['parasolBlue', 0.75],
      ],
      d: 'M0,-3h1v0.5h-1zM0,-2.5h0.5v1.5h-0.5zM0,-0.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['eggWhite', 0.38],
        ['parasolBlue', 0.62],
      ],
      d: 'M-0.5,-1h1v0.5h-1z',
    },
  ],
  pixels: 21,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'trunk', d: 'M-0.5,0h1v1.5h-1zM-0.5,1.5h1.5v0.5h-1.5zM0,2h1v0.5h-1z' },
    { paint: 'parasolYellow', d: 'M0,-2.5h0.5v0.5h-0.5zM-1,-2h2v1.5h-2zM1,-0.5h0.5v0.5h-0.5z' },
    {
      paint: [
        ['eggWhite', 0.43],
        ['parasolYellow', 0.57],
      ],
      d: 'M-1.5,-2.5h1.5v0.5h-1.5zM-2,-2h1v0.5h-1zM-2.5,-1.5h1.5v1h-1.5zM-2,-0.5h1v0.5h-1z',
    },
    {
      paint: [
        ['cherryTrunk', 0.22],
        ['parasolYellow', 0.78],
      ],
      d: 'M-0.5,-3h1v0.5h-1zM0.5,-2.5h1v0.5h-1zM1,-2h1v0.5h-1zM1,-1.5h1.5v1h-1.5zM-0.5,-0.5h1v0.5h-1z',
    },
  ],
  pixels: 52,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
