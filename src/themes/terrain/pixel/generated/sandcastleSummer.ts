import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'sandcastleWall',
      d: 'M-1.5,-1h2v0.5h-2zM-2,-0.5h2v0.5h-2zM1,-0.5h0.5v0.5h-0.5zM-2.5,0h2.5v0.5h-2.5zM1,0h1.5v0.5h-1.5zM-2,0.5h4.5v0.5h-4.5zM-0.5,1h1.5v0.5h-1.5z',
    },
    {
      paint: [
        ['sandcastleWall', 0.73],
        ['trunk', 0.27],
      ],
      d: 'M0.5,-1h1v0.5h-1zM0,-0.5h1v1h-1z',
    },
    {
      paint: [
        ['parasolStripe', 0.4],
        ['sandcastleWall', 0.6],
      ],
      d: 'M0,-2h0.5v0.5h-0.5zM-1,-1.5h2v0.5h-2z',
    },
  ],
  pixels: 40,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'sandcastleWall',
      d: 'M-1.5,-2h0.5v0.5h-0.5zM0.5,-2h0.5v0.5h-0.5zM-1.5,-1.5h1.5v1h-1.5zM-2,-0.5h2v0.5h-2zM-2.5,0h2.5v0.5h-2.5zM1.5,0h1v0.5h-1zM-2,0.5h4.5v0.5h-4.5zM-0.5,1h1.5v0.5h-1.5z',
    },
    {
      paint: [
        ['sandcastleWall', 0.73],
        ['trunk', 0.27],
      ],
      d: 'M1,-2h0.5v0.5h-0.5zM0,-1.5h1.5v2h-1.5z',
    },
    {
      paint: [
        ['parasolStripe', 0.4],
        ['sandcastleWall', 0.6],
      ],
      d: 'M-1.5,-2.5h1v0.5h-1zM0,-2.5h1.5v0.5h-1.5zM-1,-2h1.5v0.5h-1.5z',
    },
    { paint: 'bareBranch', d: 'M-0.5,-4h0.5v0.5h-0.5zM-0.5,-3.5h1v1h-1zM-0.5,-2.5h0.5v0.5h-0.5z' },
    { paint: 'parasolRed', d: 'M0,-4.5h0.5v0.5h-0.5zM0,-4h1v0.5h-1z' },
  ],
  pixels: 61,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'sandcastleWall',
      d: 'M-1,-3h1.5v0.5h-1.5zM-1,-2.5h1v1h-1zM0.5,-2.5h0.5v1h-0.5zM-2.5,-1.5h2.5v0.5h-2.5zM1,-1.5h0.5v0.5h-0.5zM-2.5,-1h4v0.5h-4zM-2.5,-0.5h1v1h-1zM-1,-0.5h2.5v0.5h-2.5zM-1,0h0.5v0.5h-0.5zM0.5,0h0.5v0.5h-0.5zM2,0h0.5v1h-0.5zM-2,0.5h3.5v0.5h-3.5zM-0.5,1h1.5v0.5h-1.5z',
    },
    {
      paint: [
        ['sandcastleWall', 0.73],
        ['trunk', 0.27],
      ],
      d: 'M0.5,-3h0.5v0.5h-0.5zM0,-2.5h0.5v1h-0.5zM0,-1.5h1v0.5h-1zM1.5,-1.5h0.5v0.5h-0.5zM1.5,-1h1v1h-1zM-1.5,-0.5h0.5v1h-0.5zM-0.5,0h1v0.5h-1zM1,0h1v0.5h-1zM1.5,0.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['parasolStripe', 0.4],
        ['sandcastleWall', 0.6],
      ],
      d: 'M-1,-3.5h2v0.5h-2zM1,-2.5h1v1h-1zM-2.5,-2h1.5v0.5h-1.5z',
    },
  ],
  pixels: 74,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
