import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'rock', d: 'M-0.5,-0.5h1v0.5h-1zM-0.5,0h1.5v0.5h-1.5z' },
    { paint: 'trunk', d: 'M0,-9h0.5v0.5h-0.5zM-0.5,-8.5h0.5v3h-0.5zM-0.5,-5.5h1v5h-1z' },
    { paint: 'wheat', d: 'M-0.5,-9.5h1v0.5h-1zM-0.5,-9h0.5v0.5h-0.5z' },
    {
      paint: 'flag',
      d: 'M0.5,-8.5h1v0.5h-1zM1.5,-8h1v0.5h-1zM1.5,-7.5h2.5v0.5h-2.5zM1.5,-7h2v0.5h-2zM1,-6.5h2.5v0.5h-2.5zM1,-6h3v0.5h-3zM2.5,-5.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['flag', 0.78],
        ['sail', 0.22],
      ],
      d: 'M0,-8.5h0.5v0.5h-0.5zM0,-8h1.5v1.5h-1.5zM0,-6.5h1v0.5h-1zM0,-6h0.5v0.5h-0.5z',
    },
  ],
  pixels: 73,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'rock', d: 'M-0.5,-0.5h1v0.5h-1zM-0.5,0h1.5v0.5h-1.5z' },
    { paint: 'trunk', d: 'M0,-9h0.5v0.5h-0.5zM-0.5,-8.5h0.5v3h-0.5zM-0.5,-5.5h1v5h-1z' },
    { paint: 'wheat', d: 'M-0.5,-9.5h1v0.5h-1zM-0.5,-9h0.5v0.5h-0.5z' },
    {
      paint: 'water',
      d: 'M1.5,-8h1v0.5h-1zM1.5,-7.5h1.5v0.5h-1.5zM1.5,-7h2v0.5h-2zM0,-6h1v0.5h-1z',
    },
    {
      paint: [
        ['sail', 0.22],
        ['water', 0.78],
      ],
      d: 'M0,-8.5h1.5v2.5h-1.5z',
    },
  ],
  pixels: 61,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'rock', d: 'M-0.5,-0.5h1v0.5h-1zM-0.5,0h1.5v0.5h-1.5z' },
    {
      paint: 'trunk',
      d: 'M0,-9h0.5v0.5h-0.5zM-0.5,-8.5h4v0.5h-4zM-0.5,-8h0.5v3.5h-0.5zM-0.5,-4.5h1v4h-1z',
    },
    { paint: 'wheat', d: 'M-0.5,-9.5h1v0.5h-1zM-0.5,-9h0.5v0.5h-0.5zM1,-7h1v1h-1z' },
    {
      paint: 'flag',
      d: 'M0.5,-8h2.5v1h-2.5zM0.5,-7h0.5v1h-0.5zM2,-7h1v1h-1zM0.5,-6h2.5v1h-2.5zM2,-5h1v0.5h-1z',
    },
    {
      paint: [
        ['flag', 0.78],
        ['sail', 0.22],
      ],
      d: 'M0,-8h0.5v3.5h-0.5z',
    },
  ],
  pixels: 79,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
