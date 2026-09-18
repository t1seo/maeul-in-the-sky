import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'acornBody', d: 'M-0.5,0h0.5v1h-0.5z' },
    {
      paint: [
        ['acornBody', 0.65],
        ['trunk', 0.35],
      ],
      d: 'M0,0h0.5v1h-0.5z',
    },
    { paint: 'acornCap', d: 'M-0.5,-1h1v0.5h-1zM-1,-0.5h1.5v0.5h-1.5z' },
  ],
  pixels: 9,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'acornBody',
      d: 'M-1,0h0.5v0.5h-0.5zM0,0h0.5v0.5h-0.5zM-1,0.5h1.5v0.5h-1.5zM0,1h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['acornBody', 0.65],
        ['trunk', 0.35],
      ],
      d: 'M-0.5,-0.5h0.5v1h-0.5zM-1.5,0h0.5v0.5h-0.5zM0.5,0h0.5v0.5h-0.5zM0.5,0.5h1v0.5h-1zM0.5,1h0.5v0.5h-0.5z',
    },
    {
      paint: 'acornCap',
      d: 'M-1,-1h0.5v0.5h-0.5zM-1.5,-0.5h1v0.5h-1zM0,-0.5h1.5v0.5h-1.5zM1,0h0.5v0.5h-0.5z',
    },
    { paint: 'trunk', d: 'M-1.5,-1h0.5v0.5h-0.5z' },
  ],
  pixels: 21,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'acornBody', d: 'M-1,-0.5h0.5v0.5h-0.5zM-1,0h1v0.5h-1zM-0.5,0.5h0.5v0.5h-0.5z' },
    {
      paint: [
        ['acornBody', 0.65],
        ['trunk', 0.35],
      ],
      d: 'M-0.5,-0.5h1v0.5h-1zM0,0h0.5v0.5h-0.5z',
    },
    { paint: 'acornCap', d: 'M0.5,-0.5h1v0.5h-1zM1,0h1v0.5h-1z' },
    { paint: 'trunk', d: 'M0.5,0h0.5v0.5h-0.5z' },
  ],
  pixels: 12,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
