import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'barrel', d: 'M-0.5,-2.5h1v0.5h-1zM-0.5,-1.5h1v1h-1zM-0.5,0h1v0.5h-1z' },
    {
      paint: [
        ['barrel', 0.76],
        ['shadow', 0.24],
      ],
      d: 'M-1,-2.5h0.5v1h-0.5zM0.5,-2.5h0.5v0.5h-0.5zM0.5,-2h1.5v1.5h-1.5zM-1.5,-0.5h0.5v0.5h-0.5zM1,-0.5h0.5v0.5h-0.5zM0.5,0h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['barrel', 0.78],
        ['sail', 0.22],
      ],
      d: 'M-1,-3.5h2v0.5h-2zM-1.5,-3h2v0.5h-2zM1,-3h0.5v0.5h-0.5zM-2,-2h1v0.5h-1zM-2,-1.5h1.5v0.5h-1.5zM-1.5,-1h1v0.5h-1zM-1,0h0.5v0.5h-0.5z',
    },
    {
      paint: 'anvil',
      d: 'M-2,-2.5h1v0.5h-1zM1,-2.5h1v0.5h-1zM-0.5,-2h1v0.5h-1zM-2,-1h0.5v0.5h-0.5zM-1,-0.5h2v0.5h-2z',
    },
    {
      paint: 'fence',
      d: 'M-0.5,-4h1v0.5h-1zM-1.5,-3.5h0.5v0.5h-0.5zM1,-3.5h0.5v0.5h-0.5zM0.5,-3h0.5v0.5h-0.5z',
    },
  ],
  pixels: 56,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
