import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'ice',
      d: 'M0.5,-1.5h0.5v0.5h-0.5zM1,-1h1v1h-1zM-3,0h1v0.5h-1zM-0.5,0h3v0.5h-3zM-2.5,0.5h5v0.5h-5zM-1,1h2v0.5h-2z',
    },
    {
      paint: 'snowCap',
      d: 'M-1,-1.5h1.5v0.5h-1.5zM-1.5,-1h2.5v0.5h-2.5zM-2.5,-0.5h3.5v0.5h-3.5zM-2,0h1.5v0.5h-1.5z',
    },
  ],
  pixels: 45,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'ice',
      d: 'M2,-1h1v0.5h-1zM1.5,-0.5h2.5v0.5h-2.5zM-3,0h1.5v0.5h-1.5zM0,0h4v0.5h-4zM-4,0.5h8v0.5h-8zM-3,1h6v0.5h-6z',
    },
    {
      paint: 'snowCap',
      d: 'M-2,-2h2v0.5h-2zM-2.5,-1.5h4v0.5h-4zM-3,-1h5v0.5h-5zM-4,-0.5h5.5v0.5h-5.5zM-4,0h1v0.5h-1zM-1.5,0h1.5v0.5h-1.5z',
    },
  ],
  pixels: 84,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'ice',
      d: 'M1,-1.5h0.5v0.5h-0.5zM-0.5,-1h1.5v0.5h-1.5zM-1,-0.5h3v0.5h-3zM-2,0h6v0.5h-6zM-4,0.5h8v0.5h-8zM-2.5,1h5v0.5h-5z',
    },
    {
      paint: 'snowCap',
      d: 'M-1.5,-1.5h2.5v0.5h-2.5zM-2,-1h1.5v0.5h-1.5zM-3,-0.5h2v0.5h-2zM-3.5,0h1.5v0.5h-1.5z',
    },
  ],
  pixels: 63,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
