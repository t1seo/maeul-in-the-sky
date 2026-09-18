import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'tulipStem',
      d: 'M1,-1.5h0.5v0.5h-0.5zM-1.5,-1h0.5v0.5h-0.5zM0.5,-1h1v0.5h-1zM-1,-0.5h2.5v0.5h-2.5zM-1,0h2v0.5h-2zM-0.5,0.5h1v0.5h-1z',
    },
    { paint: 'sproutGreen', d: 'M-1,-1h0.5v0.5h-0.5z' },
    {
      paint: 'crocusPurple',
      d: 'M0,-2.5h0.5v0.5h-0.5zM-1,-2h2v0.5h-2zM-1,-1.5h0.5v0.5h-0.5zM0,-1.5h1v0.5h-1zM-0.5,-1h1v0.5h-1z',
    },
    {
      paint: [
        ['crocusPurple', 0.57],
        ['eggWhite', 0.43],
      ],
      d: 'M-0.5,-1.5h0.5v0.5h-0.5z',
    },
  ],
  pixels: 27,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'tulipStem',
      d: 'M1,-1.5h0.5v1h-0.5zM-1.5,-1h1v0.5h-1zM-1,-0.5h2.5v0.5h-2.5zM-1,0h2v0.5h-2zM-0.5,0.5h1v0.5h-1z',
    },
    {
      paint: 'crocusYellow',
      d: 'M-0.5,-2h1.5v0.5h-1.5zM-1,-1.5h0.5v0.5h-0.5zM0,-1.5h1v0.5h-1zM-0.5,-1h1.5v0.5h-1.5z',
    },
    {
      paint: [
        ['crocusYellow', 0.57],
        ['eggWhite', 0.43],
      ],
      d: 'M-1,-2h0.5v0.5h-0.5zM-0.5,-1.5h0.5v0.5h-0.5z',
    },
  ],
  pixels: 26,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'tulipStem',
      d: 'M1,-1.5h0.5v0.5h-0.5zM-1.5,-1h1v0.5h-1zM0.5,-1h1v0.5h-1zM-1,-0.5h2.5v0.5h-2.5zM-1,0h2v0.5h-2zM-0.5,0.5h1v0.5h-1z',
    },
    {
      paint: 'cherryPetalWhite',
      d: 'M0,-2.5h0.5v0.5h-0.5zM-1,-2h2v0.5h-2zM-1,-1.5h0.5v0.5h-0.5zM0.5,-1.5h0.5v0.5h-0.5zM0,-1h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['cherryPetalWhite', 0.57],
        ['eggWhite', 0.43],
      ],
      d: 'M-0.5,-1.5h1v0.5h-1zM-0.5,-1h0.5v0.5h-0.5z',
    },
  ],
  pixels: 27,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
