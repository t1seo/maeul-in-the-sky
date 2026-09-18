import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'rabbit',
      d: 'M-2,-3.5h1.5v1h-1.5zM-2,-2.5h2v0.5h-2zM-2,-2h1.5v0.5h-1.5zM-1.5,-1.5h2.5v1h-2.5zM-1.5,-0.5h3v0.5h-3z',
    },
    { paint: 'mushroom', d: 'M-0.5,-2h1.5v0.5h-1.5zM1,-1.5h1v1h-1z' },
  ],
  pixels: 36,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'rabbit',
      d: 'M-2,-3.5h1.5v1h-1.5zM-2,-2.5h3v0.5h-3zM-2,-2h1.5v0.5h-1.5zM1,-2h0.5v0.5h-0.5zM-1.5,-1.5h2.5v0.5h-2.5zM-2,-1h3v0.5h-3zM1.5,-1h0.5v0.5h-0.5zM-2,-0.5h0.5v0.5h-0.5zM1,-0.5h1v0.5h-1zM1.5,0h0.5v0.5h-0.5z',
    },
    { paint: 'mushroom', d: 'M-0.5,-2h1.5v0.5h-1.5zM1,-1.5h1v0.5h-1zM1,-1h0.5v0.5h-0.5z' },
  ],
  pixels: 38,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'rabbit',
      d: 'M-2.5,-3h1.5v1h-1.5zM0.5,-3h1v0.5h-1zM0.5,-2.5h1.5v1h-1.5zM-2.5,-2h2v0.5h-2zM-2,-1.5h1v0.5h-1zM0,-1.5h2v0.5h-2zM2.5,-1.5h0.5v0.5h-0.5zM-2,-1h2.5v0.5h-2.5zM1,-1h2v0.5h-2zM-2,-0.5h5.5v0.5h-5.5z',
    },
    {
      paint: 'mushroom',
      d: 'M-0.5,-2h0.5v0.5h-0.5zM2,-2h0.5v1h-0.5zM-1,-1.5h1v0.5h-1zM3,-1.5h0.5v1h-0.5zM0.5,-1h0.5v0.5h-0.5z',
    },
  ],
  pixels: 53,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
