import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'canal',
      d: 'M2,-2h1v0.5h-1zM-1,-1.5h2.5v0.5h-2.5zM3,-1.5h0.5v1h-0.5zM-3.5,-1h1.5v0.5h-1.5zM-3,0h0.5v0.5h-0.5z',
    },
    {
      paint: 'boulder',
      d: 'M1.5,-1.5h0.5v0.5h-0.5zM-4,-0.5h1v0.5h-1zM1,-0.5h3v0.5h-3zM-3.5,0h0.5v0.5h-0.5zM-2.5,0h4.5v0.5h-4.5zM-3,0.5h1.5v0.5h-1.5z',
    },
    { paint: 'fountainWater', d: 'M2,-1.5h1v0.5h-1zM-1.5,-1h4.5v0.5h-4.5zM-3,-0.5h2.5v0.5h-2.5z' },
    { paint: 'waterLight', d: 'M-2,-1h0.5v0.5h-0.5zM-0.5,-0.5h1.5v0.5h-1.5z' },
  ],
  pixels: 55,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
