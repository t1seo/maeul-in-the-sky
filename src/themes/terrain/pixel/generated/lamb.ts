import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'winterBirdBrown',
      d: 'M-2.5,-1.5h0.5v0.5h-0.5zM-2,-1h1v1h-1zM-1,0.5h0.5v1h-0.5zM0.5,0.5h0.5v1h-0.5z',
    },
    {
      paint: 'lambWool',
      d: 'M-1,-2h2v0.5h-2zM-1,-1.5h3v0.5h-3zM-0.5,-1h0.5v0.5h-0.5zM1.5,-1h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['lambWool', 0.77],
        ['winterBirdBrown', 0.23],
      ],
      d: 'M-2,-1.5h1v0.5h-1zM-1,-1h0.5v0.5h-0.5zM0,-1h1.5v0.5h-1.5zM-1,-0.5h3v0.5h-3zM-1.5,0h3v0.5h-3zM-0.5,0.5h1v0.5h-1z',
    },
  ],
  pixels: 41,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'winterBirdBrown',
      d: 'M-2.5,-2h0.5v0.5h-0.5zM-2.5,-1.5h1.5v0.5h-1.5zM-2,-1h1v0.5h-1zM-1.5,0.5h1v0.5h-1zM0.5,0.5h1v0.5h-1zM-1.5,1h0.5v0.5h-0.5z',
    },
    { paint: 'lambWool', d: 'M0,-2.5h0.5v0.5h-0.5zM-1.5,-2h3v0.5h-3zM-1,-1.5h3v0.5h-3z' },
    {
      paint: [
        ['lambWool', 0.77],
        ['winterBirdBrown', 0.23],
      ],
      d: 'M-2,-2h0.5v0.5h-0.5zM-1,-1h3v0.5h-3zM-1.5,-0.5h3.5v0.5h-3.5zM-1.5,0h3v0.5h-3zM-0.5,0.5h1v0.5h-1z',
    },
  ],
  pixels: 46,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'winterBirdBrown',
      d: 'M-1,-2.5h0.5v1h-0.5zM-0.5,-1.5h1v1h-1zM-3.5,-0.5h1v0.5h-1zM-3,0h0.5v0.5h-0.5zM0.5,0h0.5v0.5h-0.5zM0.5,0.5h1v0.5h-1zM2.5,0.5h0.5v0.5h-0.5zM-2.5,1h2v0.5h-2z',
    },
    { paint: 'sheep', d: 'M0.5,-3h2.5v0.5h-2.5zM-0.5,-2.5h4.5v0.5h-4.5zM0.5,-2h4v0.5h-4z' },
    {
      paint: [
        ['sheep', 0.77],
        ['winterBirdBrown', 0.23],
      ],
      d: 'M-0.5,-2h1v0.5h-1zM0.5,-1.5h3.5v1h-3.5zM0,-0.5h4v0.5h-4zM1,0h2.5v0.5h-2.5z',
    },
    { paint: 'lambWool', d: 'M-3,-1h2.5v0.5h-2.5zM-2,-0.5h2v0.5h-2z' },
    {
      paint: [
        ['lambWool', 0.77],
        ['winterBirdBrown', 0.23],
      ],
      d: 'M-2.5,-0.5h0.5v0.5h-0.5zM-2.5,0h2.5v0.5h-2.5zM-2.5,0.5h2v0.5h-2z',
    },
  ],
  pixels: 87,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
