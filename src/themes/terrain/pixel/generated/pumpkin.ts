import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'pumpkin',
      d: 'M-2,-2.5h1v0.5h-1zM0.5,-2.5h0.5v1h-0.5zM-2.5,-2h1v0.5h-1zM-1,-2h1v0.5h-1zM-2.5,-1.5h0.5v1h-0.5zM-1,-1.5h0.5v1h-0.5zM0.5,-1.5h1v2h-1zM-2,-0.5h1.5v0.5h-1.5zM-1,0h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['pumpkin', 0.78],
        ['shadow', 0.22],
      ],
      d: 'M-0.5,-2.5h1v0.5h-1zM1,-2.5h1v0.5h-1zM1,-2h1.5v0.5h-1.5zM1.5,-1.5h1v1.5h-1zM-1.5,0h0.5v0.5h-0.5zM1.5,0h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['pumpkin', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-1,-2.5h0.5v0.5h-0.5zM-1.5,-2h0.5v0.5h-0.5zM0,-2h0.5v0.5h-0.5zM-2,-1.5h1v1h-1zM-0.5,-1.5h1v2h-1z',
    },
    { paint: 'trunk', d: 'M0,-3.5h0.5v0.5h-0.5zM-0.5,-3h1v0.5h-1z' },
    { paint: 'pine', d: 'M0.5,-3.5h1.5v0.5h-1.5zM0.5,-3h1v0.5h-1z' },
  ],
  pixels: 62,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
