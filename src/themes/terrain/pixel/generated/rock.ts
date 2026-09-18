import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'boulder',
      d: 'M1,-2.5h0.5v0.5h-0.5zM0.5,-2h1v0.5h-1zM0,-1.5h2v1h-2zM-0.5,-0.5h2.5v0.5h-2.5zM-1,0h2.5v0.5h-2.5z',
    },
    {
      paint: 'rock',
      d: 'M-1.5,-3h2.5v1h-2.5zM-2,-2h2.5v0.5h-2.5zM-2,-1.5h2v1h-2zM-2,-0.5h1.5v0.5h-1.5zM-1.5,0h0.5v0.5h-0.5z',
    },
  ],
  pixels: 48,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'boulder',
      d: 'M1,-1.5h1.5v0.5h-1.5zM0.5,-1h2v0.5h-2zM-2.5,-0.5h5v0.5h-5zM-2,0h3.5v0.5h-3.5z',
    },
    {
      paint: 'rock',
      d: 'M-1,-3h1.5v0.5h-1.5zM-2,-2.5h3.5v0.5h-3.5zM-2.5,-2h4.5v0.5h-4.5zM-2.5,-1.5h3.5v0.5h-3.5zM-2.5,-1h3v0.5h-3z',
    },
  ],
  pixels: 56,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'boulder',
      d: 'M1,-2.5h0.5v0.5h-0.5zM1,-2h1v0.5h-1zM0.5,-1.5h1.5v0.5h-1.5zM-1,-1h2v0.5h-2zM2,-1h0.5v0.5h-0.5zM-3,-0.5h1v0.5h-1zM1,-0.5h1.5v0.5h-1.5zM-2,0h4v0.5h-4z',
    },
    {
      paint: 'rock',
      d: 'M-0.5,-3h1.5v0.5h-1.5zM-1,-2.5h2v0.5h-2zM-1.5,-2h2.5v0.5h-2.5zM-2,-1.5h2.5v0.5h-2.5zM-2.5,-1h1.5v0.5h-1.5zM1,-1h1v0.5h-1zM-2,-0.5h3v0.5h-3z',
    },
  ],
  pixels: 52,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
