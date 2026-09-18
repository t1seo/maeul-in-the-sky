import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'trunk',
      d: 'M1.5,-3h1v3h-1zM-1,-2.5h0.5v0.5h-0.5zM-4,-2h0.5v1h-0.5zM-4,-1h1v1h-1zM-1,-1h0.5v0.5h-0.5zM-1.5,-0.5h1v1.5h-1zM2,0h0.5v0.5h-0.5z',
    },
    {
      paint: 'gardenTree',
      d: 'M2,-7h1v0.5h-1zM2.5,-6.5h1v0.5h-1zM2.5,-6h1.5v0.5h-1.5zM2,-5.5h2.5v0.5h-2.5zM1.5,-5h2v0.5h-2zM4,-5h0.5v1h-0.5zM0.5,-4.5h2.5v0.5h-2.5zM0.5,-4h2v0.5h-2zM0,-3.5h2.5v0.5h-2.5zM3,-3.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['gardenTree', 0.78],
        ['sail', 0.22],
      ],
      d: 'M1,-7h1v0.5h-1zM0.5,-6.5h2v1h-2zM0,-5.5h2v0.5h-2zM-0.5,-5h2v0.5h-2zM-0.5,-4.5h1v1h-1z',
    },
    {
      paint: [
        ['gardenTree', 0.76],
        ['shadow', 0.24],
      ],
      d: 'M3.5,-5h0.5v0.5h-0.5zM3,-4.5h1v0.5h-1zM2.5,-4h1.5v0.5h-1.5zM2.5,-3.5h0.5v0.5h-0.5zM-4,-3h0.5v0.5h-0.5z',
    },
    {
      paint: 'parkBench',
      d: 'M-3.5,-3h0.5v0.5h-0.5zM-4,-2.5h3v0.5h-3zM-3.5,-2h3v0.5h-3zM-3.5,-1.5h4v0.5h-4zM-2.5,-1h1.5v0.5h-1.5zM-0.5,-1h0.5v0.5h-0.5z',
    },
  ],
  pixels: 115,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
