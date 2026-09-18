import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'fish',
      d: 'M0,-2.5h0.5v0.5h-0.5zM-1,-2h2v0.5h-2zM2.5,-2h0.5v0.5h-0.5zM-2,-1.5h1.5v0.5h-1.5zM0,-1.5h3v0.5h-3zM-2,-1h5v0.5h-5zM-1.5,-0.5h4.5v0.5h-4.5zM-1,0h0.5v0.5h-0.5zM2.5,0h0.5v0.5h-0.5z',
    },
    { paint: 'whaleBelly', d: 'M-0.5,-1.5h0.5v0.5h-0.5z' },
  ],
  pixels: 37,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'fish',
      d: 'M0.5,-2.5h1v0.5h-1zM2,-2.5h0.5v0.5h-0.5zM0,-2h2.5v0.5h-2.5zM0,-1.5h1.5v0.5h-1.5zM2,-1.5h0.5v0.5h-0.5zM-2.5,-0.5h3v1h-3z',
    },
  ],
  pixels: 24,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'fish',
      d: 'M0,-3h0.5v0.5h-0.5zM-0.5,-2.5h1.5v0.5h-1.5zM3,-2.5h0.5v0.5h-0.5zM-2,-2h3.5v0.5h-3.5zM2.5,-2h1v0.5h-1zM-2.5,-1.5h1.5v1h-1.5zM-0.5,-1.5h0.5v0.5h-0.5zM0.5,-1.5h0.5v0.5h-0.5zM1.5,-1.5h2v1h-2zM-0.5,-1h1.5v0.5h-1.5zM-2,-0.5h5.5v0.5h-5.5zM-1.5,0h1v0.5h-1zM2.5,0h1v0.5h-1z',
    },
    { paint: 'whaleBelly', d: 'M-1,-1.5h0.5v1h-0.5zM0,-1.5h0.5v0.5h-0.5zM1,-1.5h0.5v1h-0.5z' },
  ],
  pixels: 53,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
