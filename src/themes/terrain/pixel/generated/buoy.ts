import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'waterLight', d: 'M-2,0h1v0.5h-1zM0.5,0h1v0.5h-1zM-1,0.5h2v0.5h-2z' },
    {
      paint: 'buoy',
      d: 'M-0.5,-4.5h1.5v1h-1.5zM-0.5,-3.5h1v1h-1zM-1,-2.5h2v0.5h-2zM0.5,-1.5h0.5v0.5h-0.5zM-1,-1h2v1h-2zM-1,0h1.5v0.5h-1.5z',
    },
    { paint: 'sail', d: 'M-1,-2h2v0.5h-2zM-1,-1.5h1.5v0.5h-1.5z' },
  ],
  pixels: 41,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
