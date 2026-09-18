import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'rock', d: 'M-0.5,0h1v0.5h-1z' },
    { paint: 'lantern', d: 'M-0.5,-7h0.5v0.5h-0.5zM-0.5,-4h1v4h-1z' },
    {
      paint: [
        ['lantern', 0.78],
        ['sail', 0.22],
      ],
      d: 'M-0.5,-6.5h1v0.5h-1zM-1,-6h2v0.5h-2zM-1,-5.5h0.5v1h-0.5zM0.5,-5.5h0.5v1h-0.5zM-0.5,-4.5h1v0.5h-1z',
    },
    { paint: 'lanternGlow', d: 'M-0.5,-5.5h1v1h-1z' },
    {
      paint: [
        ['lantern', 0.76],
        ['shadow', 0.24],
      ],
      d: 'M-1,-4.5h0.5v0.5h-0.5zM0.5,-4.5h0.5v0.5h-0.5z',
    },
  ],
  pixels: 37,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
