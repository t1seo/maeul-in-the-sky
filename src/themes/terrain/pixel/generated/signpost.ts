import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: [
        ['shadow', 0.24],
        ['signpost', 0.76],
      ],
      d: 'M-0.5,-5.5h1v0.5h-1zM-0.5,-2.5h1v2.5h-1z',
    },
    {
      paint: [
        ['sail', 0.22],
        ['signpost', 0.78],
      ],
      d: 'M0.5,-5.5h2v0.5h-2zM-1,-5h4v1h-4zM1,-4h1.5v0.5h-1.5z',
    },
    {
      paint: 'signpost',
      d: 'M-3,-4h4v0.5h-4zM-3.5,-3.5h5v0.5h-5zM-3,-3h4.5v0.5h-4.5zM0.5,-2.5h1v0.5h-1z',
    },
    { paint: 'rock', d: 'M-1,0h2v0.5h-2zM-0.5,0.5h1v0.5h-1z' },
  ],
  pixels: 70,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
