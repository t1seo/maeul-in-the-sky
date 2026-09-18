import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'log',
      d: 'M0.5,-2h0.5v0.5h-0.5zM3,-1.5h0.5v0.5h-0.5zM-2.5,-1h0.5v0.5h-0.5zM-1,-1h4.5v0.5h-4.5zM-2.5,-0.5h6v0.5h-6z',
    },
    { paint: 'fence', d: 'M-2.5,-1.5h5.5v0.5h-5.5zM-3.5,-1h1v1h-1zM-2,-1h0.5v0.5h-0.5z' },
    {
      paint: 'trunk',
      d: 'M-1.5,-1h0.5v0.5h-0.5zM-3.5,0h0.5v0.5h-0.5zM-2.5,0h6v0.5h-6zM-2.5,0.5h0.5v0.5h-0.5z',
    },
    {
      paint: 'stump',
      d: 'M-3.5,-1.5h1v0.5h-1zM-4,-1h0.5v1.5h-0.5zM-3,0h0.5v0.5h-0.5zM-3.5,0.5h1v0.5h-1z',
    },
  ],
  pixels: 63,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
