import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'shadow', d: 'M-1.5,0h0.5v0.5h-0.5zM0.5,0h2v0.5h-2z' },
    { paint: 'trunk', d: 'M-1,-3h2v0.5h-2zM0,-2.5h1v0.5h-1zM0,-2h0.5v2h-0.5zM-1,0h1.5v0.5h-1.5z' },
    {
      paint: [
        ['snowCap', 0.3],
        ['trunk', 0.7],
      ],
      d: 'M-0.5,-2.5h0.5v2h-0.5zM-1,-0.5h1v0.5h-1z',
    },
    {
      paint: 'orchard',
      d: 'M1.5,-7.5h0.5v0.5h-0.5zM0,-7h2v0.5h-2zM3,-7h0.5v0.5h-0.5zM-0.5,-6.5h3v0.5h-3zM-1.5,-6h3v0.5h-3zM2,-6h0.5v0.5h-0.5zM-1.5,-5.5h4v0.5h-4zM-2.5,-5h5v0.5h-5zM3.5,-5h0.5v0.5h-0.5zM-3.5,-4.5h2v0.5h-2zM-1,-4.5h1v0.5h-1zM-3,-4h3v0.5h-3zM-2.5,-3.5h1v0.5h-1z',
    },
    {
      paint: [
        ['orchard', 0.78],
        ['shadow', 0.22],
      ],
      d: 'M2,-7h1v0.5h-1zM2.5,-6.5h1v2h-1zM1,-4.5h2.5v0.5h-2.5zM1,-4h2v0.5h-2zM-1.5,-3.5h4v0.5h-4z',
    },
    {
      paint: [
        ['orchard', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-1.5,-8.5h3v0.5h-3zM-2,-8h3.5v0.5h-3.5zM-2,-7.5h1.5v0.5h-1.5zM0,-7.5h1.5v0.5h-1.5zM-2.5,-7h2v0.5h-2zM-3,-6.5h2.5v0.5h-2.5zM-3.5,-6h2v0.5h-2zM-3.5,-5.5h1v1h-1z',
    },
    {
      paint: 'orchardFruit',
      d: 'M-0.5,-7.5h0.5v1h-0.5zM1.5,-6h0.5v0.5h-0.5zM-2.5,-5.5h1v0.5h-1zM-1.5,-4.5h0.5v0.5h-0.5zM0,-4.5h1v1h-1z',
    },
  ],
  pixels: 149,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
