import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: [
        ['cobble', 0.76],
        ['shadow', 0.24],
      ],
      d: 'M-2.5,-0.5h1.5v0.5h-1.5zM0.5,-0.5h0.5v0.5h-0.5zM1.5,-0.5h1v0.5h-1zM-1.5,0h0.5v0.5h-0.5zM0,0h0.5v0.5h-0.5zM-0.5,0.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['cobble', 0.78],
        ['sail', 0.22],
      ],
      d: 'M-2.5,-1.5h1.5v0.5h-1.5zM-3,-1h2v0.5h-2zM0.5,-1h2v0.5h-2zM-1,-0.5h1.5v0.5h-1.5zM1,-0.5h0.5v0.5h-0.5zM-1,0h1v0.5h-1z',
    },
  ],
  pixels: 26,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: [
        ['cobble', 0.76],
        ['shadow', 0.24],
      ],
      d: 'M-3.5,-0.5h2v0.5h-2zM-0.5,-0.5h0.5v0.5h-0.5zM-1,0h0.5v0.5h-0.5zM0,0h2.5v0.5h-2.5zM3,0h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['cobble', 0.78],
        ['sail', 0.22],
      ],
      d: 'M-3,-1.5h1v0.5h-1zM-3.5,-1h3.5v0.5h-3.5zM0.5,-1h1v0.5h-1zM-1.5,-0.5h1v0.5h-1zM0,-0.5h3.5v0.5h-3.5zM2.5,0h0.5v0.5h-0.5z',
    },
  ],
  pixels: 33,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: [
        ['cobble', 0.76],
        ['shadow', 0.24],
      ],
      d: 'M-3,-1h1v0.5h-1zM-1.5,-1h0.5v0.5h-0.5zM1,-1h0.5v0.5h-0.5zM2,-1h1v0.5h-1zM-0.5,0h1v0.5h-1zM-2.5,0.5h1.5v0.5h-1.5zM1,0.5h1.5v0.5h-1.5z',
    },
    {
      paint: [
        ['cobble', 0.78],
        ['sail', 0.22],
      ],
      d: 'M-3,-1.5h2v0.5h-2zM1,-1.5h2v0.5h-2zM-2,-1h0.5v1h-0.5zM-1,-1h2v1h-2zM1.5,-1h0.5v1h-0.5zM-3,0h2v0.5h-2zM1,0h2v0.5h-2z',
    },
  ],
  pixels: 42,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
