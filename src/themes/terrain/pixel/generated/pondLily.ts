import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'pine',
      d: 'M-1.5,-1h1v0.5h-1zM-2,-0.5h1v0.5h-1zM0.5,-0.5h1.5v0.5h-1.5zM-2,0h3.5v0.5h-3.5zM-1,0.5h2.5v0.5h-2.5z',
    },
    { paint: 'leafLight', d: 'M-1,-0.5h1.5v0.5h-1.5z' },
    { paint: 'flower', d: 'M-1,-1.5h2v0.5h-2zM-0.5,-1h0.5v0.5h-0.5zM0.5,-1h1v0.5h-1z' },
    { paint: 'flowerAlt', d: 'M0,-1h0.5v0.5h-0.5z' },
  ],
  pixels: 30,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
