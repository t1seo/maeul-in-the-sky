import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'tulipStem',
      d: 'M-0.5,-1.5h1v0.5h-1zM-0.5,-1h2v0.5h-2zM0,-0.5h1v0.5h-1zM0,0h0.5v0.5h-0.5zM-0.5,0.5h1v0.5h-1z',
    },
    {
      paint: 'sproutGreen',
      d: 'M-1.5,-1.5h0.5v0.5h-0.5zM-1,-1h0.5v0.5h-0.5zM-1,-0.5h1v0.5h-1zM-0.5,0h0.5v0.5h-0.5z',
    },
    { paint: 'tulipRed', d: 'M-1,-3h2v0.5h-2zM-1,-2.5h1.5v0.5h-1.5z' },
    {
      paint: [
        ['cherryTrunk', 0.23],
        ['tulipRed', 0.77],
      ],
      d: 'M0.5,-2.5h0.5v0.5h-0.5zM-0.5,-2h1v0.5h-1z',
    },
  ],
  pixels: 26,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'tulipStem',
      d: 'M-0.5,-1.5h1v0.5h-1zM-0.5,-1h2v0.5h-2zM0,-0.5h1v0.5h-1zM0,0h0.5v0.5h-0.5zM-0.5,0.5h1v0.5h-1z',
    },
    {
      paint: 'sproutGreen',
      d: 'M-1.5,-1.5h0.5v0.5h-0.5zM-1,-1h0.5v0.5h-0.5zM-1,-0.5h1v0.5h-1zM-0.5,0h0.5v0.5h-0.5z',
    },
    { paint: 'tulipYellow', d: 'M-0.5,-3h1v0.5h-1zM-1,-2.5h1.5v0.5h-1.5zM-1,-2h1v0.5h-1z' },
    {
      paint: [
        ['cherryTrunk', 0.23],
        ['tulipYellow', 0.77],
      ],
      d: 'M0.5,-3h0.5v1h-0.5zM0,-2h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['eggWhite', 0.38],
        ['tulipYellow', 0.62],
      ],
      d: 'M-1,-3h0.5v0.5h-0.5z',
    },
  ],
  pixels: 27,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'tulipStem',
      d: 'M-0.5,-1.5h1v0.5h-1zM-0.5,-1h2v0.5h-2zM0,-0.5h1v0.5h-1zM0,0h0.5v0.5h-0.5zM-0.5,0.5h1v0.5h-1z',
    },
    {
      paint: 'sproutGreen',
      d: 'M-1.5,-1.5h0.5v0.5h-0.5zM-1,-1h0.5v0.5h-0.5zM-1,-0.5h1v0.5h-1zM-0.5,0h0.5v0.5h-0.5z',
    },
    {
      paint: 'tulipPurple',
      d: 'M-0.5,-3.5h0.5v0.5h-0.5zM0.5,-3.5h0.5v0.5h-0.5zM-0.5,-3h1.5v0.5h-1.5zM-1,-2.5h1.5v0.5h-1.5z',
    },
    {
      paint: [
        ['cherryTrunk', 0.23],
        ['tulipPurple', 0.77],
      ],
      d: 'M0.5,-2.5h0.5v0.5h-0.5zM-0.5,-2h1v0.5h-1z',
    },
    {
      paint: [
        ['eggWhite', 0.38],
        ['tulipPurple', 0.62],
      ],
      d: 'M-1,-3h0.5v0.5h-0.5z',
    },
  ],
  pixels: 28,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
