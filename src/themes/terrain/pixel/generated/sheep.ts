import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'shadow', d: 'M-0.5,0h1v0.5h-1zM1,0h0.5v0.5h-0.5z' },
    {
      paint: 'sheepHead',
      d: 'M-2.5,-4.5h0.5v0.5h-0.5zM-3.5,-4h1.5v1.5h-1.5zM-3.5,-2.5h1v0.5h-1zM-2,-1h1.5v1.5h-1.5zM1.5,-1h1v0.5h-1zM0.5,-0.5h2v0.5h-2zM0.5,0h0.5v0.5h-0.5zM1.5,0h1v0.5h-1z',
    },
    {
      paint: 'sheep',
      d: 'M1,-4h1v0.5h-1zM1,-3.5h1.5v0.5h-1.5zM0.5,-3h2v0.5h-2zM-2.5,-2.5h4.5v0.5h-4.5zM-2.5,-2h4v0.5h-4zM-2.5,-1.5h1.5v0.5h-1.5zM-0.5,-1.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['shadow', 0.22],
        ['sheep', 0.78],
      ],
      d: 'M-2,-4h0.5v0.5h-0.5zM2,-2.5h1v0.5h-1zM1.5,-2h1.5v0.5h-1.5zM-1,-1.5h0.5v0.5h-0.5zM0,-1.5h2.5v0.5h-2.5zM-0.5,-1h2v0.5h-2z',
    },
    {
      paint: [
        ['sheep', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-1.5,-4.5h2.5v1h-2.5zM-2,-3.5h3v0.5h-3zM-2,-3h2.5v0.5h-2.5z',
    },
  ],
  pixels: 100,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'shadow', d: 'M-0.5,0h1v0.5h-1zM1,0h0.5v0.5h-0.5z' },
    {
      paint: 'sheepHead',
      d: 'M-3.5,-2.5h1.5v1.5h-1.5zM-3.5,-1h3v0.5h-3zM1.5,-1h1v0.5h-1zM-3,-0.5h0.5v0.5h-0.5zM-2,-0.5h1.5v1h-1.5zM0.5,-0.5h2v0.5h-2zM0.5,0h0.5v0.5h-0.5zM1.5,0h1v0.5h-1z',
    },
    {
      paint: 'sheep',
      d: 'M1,-4h1v0.5h-1zM1,-3.5h1.5v0.5h-1.5zM0.5,-3h2v0.5h-2zM-2,-2.5h4v0.5h-4zM-1.5,-2h3v0.5h-3zM-2,-1.5h1v0.5h-1zM-0.5,-1.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['shadow', 0.22],
        ['sheep', 0.78],
      ],
      d: 'M2,-2.5h1v0.5h-1zM-2,-2h0.5v0.5h-0.5zM1.5,-2h1.5v0.5h-1.5zM-1,-1.5h0.5v0.5h-0.5zM0,-1.5h2.5v0.5h-2.5zM-0.5,-1h2v0.5h-2z',
    },
    {
      paint: [
        ['sheep', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-1.5,-4.5h2.5v0.5h-2.5zM-2,-4h3v0.5h-3zM-2.5,-3.5h3.5v0.5h-3.5zM-2.5,-3h3v0.5h-3z',
    },
  ],
  pixels: 100,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'sheep',
      d: 'M1.5,-2h1v0.5h-1zM-2,-1.5h5v0.5h-5zM-2.5,-1h4.5v0.5h-4.5zM-2.5,-0.5h1.5v0.5h-1.5z',
    },
    {
      paint: [
        ['shadow', 0.22],
        ['sheep', 0.78],
      ],
      d: 'M-2,-2h0.5v0.5h-0.5zM-2.5,-1.5h0.5v0.5h-0.5zM2,-1h1v0.5h-1zM-1,-0.5h4v0.5h-4zM-2,0h4.5v0.5h-4.5z',
    },
    {
      paint: [
        ['sheep', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-1,-3h1v0.5h-1zM-1.5,-2.5h3v1h-3z',
    },
    { paint: 'sheepHead', d: 'M-3,-2.5h1.5v0.5h-1.5zM-3.5,-2h1.5v0.5h-1.5zM-3,-1.5h0.5v0.5h-0.5z' },
  ],
  pixels: 66,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
