import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'trunk', d: 'M-4,-4.5h0.5v5h-0.5zM3.5,-4.5h0.5v5h-0.5z' },
    { paint: 'fence', d: 'M3,-4.5h0.5v1h-0.5zM-3.5,-4h5.5v0.5h-5.5z' },
    {
      paint: 'laundry',
      d: 'M-3.5,-3.5h2v1h-2zM1.5,-3.5h1.5v2h-1.5zM-3,-2.5h1v0.5h-1zM-3.5,-2h1.5v0.5h-1.5z',
    },
    { paint: 'sail', d: 'M-1,-3.5h2v2.5h-2z' },
    { paint: 'wallShade', d: 'M2,-4h1v0.5h-1z' },
  ],
  pixels: 80,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
