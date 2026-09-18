import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'rock', d: 'M-1.5,-1h3v0.5h-3zM-0.5,-0.5h1.5v0.5h-1.5z' },
    {
      paint: 'boulder',
      d: 'M1,-5h0.5v4h-0.5zM-2,-0.5h1.5v0.5h-1.5zM1,-0.5h1v0.5h-1zM-1.5,0h3v0.5h-3zM-0.5,0.5h1v0.5h-1z',
    },
    {
      paint: 'statue',
      d: 'M0,-5h0.5v1.5h-0.5zM-1,-4.5h0.5v0.5h-0.5zM-1.5,-4h1v0.5h-1zM-1,-3.5h0.5v2h-0.5zM0,-3.5h1v2.5h-1z',
    },
    {
      paint: [
        ['sail', 0.22],
        ['statue', 0.78],
      ],
      d: 'M-0.5,-6h0.5v0.5h-0.5zM-1,-5.5h1v1h-1zM-0.5,-4.5h0.5v3h-0.5zM-1,-1.5h1v0.5h-1z',
    },
    {
      paint: [
        ['shadow', 0.24],
        ['statue', 0.76],
      ],
      d: 'M0,-5.5h0.5v0.5h-0.5zM0.5,-4.5h0.5v1h-0.5z',
    },
  ],
  pixels: 66,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
