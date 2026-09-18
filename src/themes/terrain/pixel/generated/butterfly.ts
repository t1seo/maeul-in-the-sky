import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'butterfly',
      d: 'M-2.5,-5h1v0.5h-1zM-3,-4.5h1v1h-1zM-1.5,-4.5h0.5v0.5h-0.5zM-1,-4h0.5v0.5h-0.5zM-3,-3.5h3v0.5h-3zM-2,-3h2v1.5h-2zM-1.5,-1.5h1v0.5h-1z',
    },
    {
      paint: 'butterflyWing',
      d: 'M1,-4.5h1.5v0.5h-1.5zM0.5,-4h2v0.5h-2zM0,-3.5h2.5v0.5h-2.5zM0,-3h2v0.5h-2zM0,-2.5h1.5v1h-1.5zM0.5,-1.5h1v0.5h-1z',
    },
    { paint: 'mushroom', d: 'M-2,-4.5h0.5v0.5h-0.5zM-2,-4h1v0.5h-1z' },
    { paint: 'bird', d: 'M-0.5,-4.5h1v1h-1z' },
  ],
  pixels: 59,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
