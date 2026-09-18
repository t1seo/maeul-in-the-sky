import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'windmill',
      d: 'M-1.5,-6.5h1v1.5h-1zM-2,-5h1.5v2h-1.5zM-2,-3h2.5v1h-2.5zM-2,-2h1v1h-1zM-2.5,-1h1.5v1h-1.5zM-2,0h1.5v0.5h-1.5z',
    },
    {
      paint: [
        ['shadow', 0.24],
        ['windmill', 0.76],
      ],
      d: 'M-0.5,-9h0.5v1h-0.5zM-0.5,-8h1v0.5h-1zM-1,-7.5h0.5v1h-0.5zM0.5,-7.5h1v0.5h-1zM0.5,-7h0.5v0.5h-0.5zM-0.5,-6.5h1.5v0.5h-1.5zM0,-6h2v3h-2zM0.5,-3h1.5v1h-1.5zM0,-2h2v0.5h-2zM0,-1.5h2.5v1.5h-2.5zM-0.5,0h2.5v0.5h-2.5z',
    },
    { paint: 'roofA', d: 'M-1,-9h0.5v1.5h-0.5zM0.5,-8.5h1v0.5h-1zM0.5,-8h1.5v0.5h-1.5z' },
    { paint: 'trunk', d: 'M-0.5,-7.5h1v1h-1zM-0.5,-2h0.5v0.5h-0.5zM-1,-1.5h1v1.5h-1z' },
    {
      paint: 'windBlade',
      d: 'M-0.5,-11h1.5v2h-1.5zM0,-9h1v0.5h-1zM0,-8.5h0.5v0.5h-0.5zM-4,-8h3v1.5h-3zM1.5,-7.5h2.5v0.5h-2.5zM1,-7h3v1h-3zM-0.5,-6h0.5v3h-0.5z',
    },
    { paint: 'fence', d: 'M-1,-2h0.5v0.5h-0.5z' },
  ],
  pixels: 183,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
