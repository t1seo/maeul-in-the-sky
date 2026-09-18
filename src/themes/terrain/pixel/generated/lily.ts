import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'pine',
      d: 'M-2,-1h1v0.5h-1zM-2.5,-0.5h2.5v0.5h-2.5zM0.5,-0.5h1.5v0.5h-1.5zM-2,0h3v0.5h-3zM-1.5,0.5h3v0.5h-3z',
    },
    { paint: 'leafLight', d: 'M-1,-1h0.5v0.5h-0.5z' },
    {
      paint: 'lily',
      d: 'M0,-2.5h0.5v0.5h-0.5zM-1,-2h3v0.5h-3zM-1,-1.5h2.5v0.5h-2.5zM-0.5,-1h0.5v0.5h-0.5zM0.5,-1h1v0.5h-1z',
    },
    { paint: 'sail', d: 'M0,-1h0.5v0.5h-0.5z' },
    { paint: 'flowerCenter', d: 'M0,-0.5h0.5v0.5h-0.5z' },
  ],
  pixels: 40,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
