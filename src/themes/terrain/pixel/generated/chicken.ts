import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'wheat',
      d: 'M-2.5,-3.5h1v1h-1zM-0.5,-0.5h0.5v0.5h-0.5zM0.5,-0.5h1v1h-1zM-1,0h1v0.5h-1zM-1,0.5h2.5v0.5h-2.5z',
    },
    {
      paint: 'chicken',
      d: 'M1.5,-4h0.5v0.5h-0.5zM1,-3.5h2v0.5h-2zM0.5,-3h2.5v0.5h-2.5zM0,-2.5h3v0.5h-3zM-1.5,-2h1.5v1h-1.5zM1.5,-2h1v1h-1zM-1,-1h3v0.5h-3z',
    },
    {
      paint: [
        ['chicken', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-1.5,-3.5h1.5v0.5h-1.5zM-1.5,-3h2v0.5h-2zM-1,-2.5h1v0.5h-1z',
    },
    {
      paint: [
        ['chicken', 0.78],
        ['shadow', 0.22],
      ],
      d: 'M-1.5,-2.5h0.5v0.5h-0.5zM0,-2h1.5v1h-1.5z',
    },
    { paint: 'flag', d: 'M-2,-4.5h2v1h-2z' },
    { paint: 'trunk', d: 'M0,0h0.5v0.5h-0.5z' },
  ],
  pixels: 73,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'wheat',
      d: 'M-2.5,-1h0.5v0.5h-0.5zM-3,-0.5h0.5v0.5h-0.5zM-0.5,-0.5h0.5v0.5h-0.5zM0.5,-0.5h1v1h-1zM-1,0h1v0.5h-1zM-1,0.5h2.5v0.5h-2.5z',
    },
    {
      paint: 'chicken',
      d: 'M2,-3.5h1v1h-1zM0,-3h0.5v0.5h-0.5zM-1,-2.5h0.5v0.5h-0.5zM1.5,-2.5h1.5v0.5h-1.5zM-1,-2h1v1h-1zM1.5,-2h1v1h-1zM-0.5,-1h2v0.5h-2z',
    },
    {
      paint: [
        ['chicken', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-0.5,-2.5h2v0.5h-2zM-2.5,-1.5h1.5v0.5h-1.5zM-2,-1h1v0.5h-1z',
    },
    {
      paint: [
        ['chicken', 0.78],
        ['shadow', 0.22],
      ],
      d: 'M0,-2h1.5v1h-1.5zM0,-0.5h0.5v0.5h-0.5z',
    },
    { paint: 'flag', d: 'M-2,-2.5h1v0.5h-1zM-2.5,-2h1.5v0.5h-1.5zM-2,-0.5h0.5v0.5h-0.5z' },
    { paint: 'trunk', d: 'M0,0h0.5v0.5h-0.5z' },
  ],
  pixels: 58,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'shadow', d: 'M1.5,0h0.5v0.5h-0.5z' },
    {
      paint: 'wheat',
      d: 'M-2.5,-3.5h1v1h-1zM2,-1h2v0.5h-2zM-0.5,-0.5h0.5v0.5h-0.5zM0.5,-0.5h4v0.5h-4zM-1,0h1v0.5h-1zM0.5,0h1v0.5h-1zM2,0h0.5v0.5h-0.5zM3,0h1v0.5h-1zM-1,0.5h2.5v0.5h-2.5z',
    },
    {
      paint: 'chicken',
      d: 'M1.5,-4h0.5v0.5h-0.5zM1,-3.5h2v0.5h-2zM0.5,-3h2.5v0.5h-2.5zM0,-2.5h3v0.5h-3zM-1.5,-2h1.5v1h-1.5zM1.5,-2h1v1h-1zM-1,-1h3v0.5h-3z',
    },
    {
      paint: [
        ['chicken', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-1.5,-3.5h1.5v0.5h-1.5zM-1.5,-3h2v0.5h-2zM-1,-2.5h1v0.5h-1z',
    },
    {
      paint: [
        ['chicken', 0.78],
        ['shadow', 0.22],
      ],
      d: 'M-1.5,-2.5h0.5v0.5h-0.5zM0,-2h1.5v1h-1.5z',
    },
    { paint: 'flag', d: 'M-2,-4.5h2v1h-2z' },
    { paint: 'trunk', d: 'M0,0h0.5v0.5h-0.5z' },
  ],
  pixels: 87,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
