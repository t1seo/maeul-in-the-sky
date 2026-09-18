import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: [
        ['doghouse', 0.78],
        ['sail', 0.22],
      ],
      d: 'M-2.5,-2h1.5v0.5h-1.5zM-2.5,-1.5h1v1.5h-1zM-0.5,-1.5h1v0.5h-1zM0,-1h0.5v1h-0.5zM-0.5,0h1v0.5h-1z',
    },
    {
      paint: [
        ['doghouse', 0.76],
        ['shadow', 0.24],
      ],
      d: 'M-1,-2h0.5v0.5h-0.5zM1,-2h1v0.5h-1zM0.5,-1.5h1.5v1.5h-1.5zM-0.5,-1h0.5v1h-0.5zM0.5,0h1v0.5h-1z',
    },
    {
      paint: 'roofA',
      d: 'M-1.5,-4h0.5v0.5h-0.5zM-2,-3.5h1.5v0.5h-1.5zM-2.5,-3h2.5v0.5h-2.5zM2,-3h0.5v1h-0.5zM-3,-2.5h3v0.5h-3zM-0.5,-2h1v0.5h-1z',
    },
    {
      paint: [
        ['roofA', 0.76],
        ['shadow', 0.24],
      ],
      d: 'M-1,-4h1.5v0.5h-1.5zM-0.5,-3.5h2v0.5h-2zM0,-3h2v1h-2zM0.5,-2h0.5v0.5h-0.5z',
    },
    { paint: 'trunk', d: 'M-1.5,-1.5h1v1.5h-1zM-1,0h0.5v0.5h-0.5z' },
    { paint: 'deer', d: 'M2,-1h2.5v1h-2.5zM2.5,0h1.5v0.5h-1.5z' },
  ],
  pixels: 86,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
