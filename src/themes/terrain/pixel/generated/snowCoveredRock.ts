import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'rock',
      d: 'M-2,-0.5h1.5v0.5h-1.5zM0,-0.5h0.5v0.5h-0.5zM-2,0h2v0.5h-2zM-1.5,0.5h1v0.5h-1z',
    },
    { paint: 'boulder', d: 'M0.5,-0.5h1.5v0.5h-1.5zM0,0h2v0.5h-2zM-0.5,0.5h2v0.5h-2z' },
    {
      paint: 'snowCap',
      d: 'M0,-2h0.5v0.5h-0.5zM-1.5,-1.5h2.5v0.5h-2.5zM-2,-1h3.5v0.5h-3.5zM-0.5,-0.5h0.5v0.5h-0.5z',
    },
  ],
  pixels: 35,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'rock',
      d: 'M-3,-1h0.5v0.5h-0.5zM-3,-0.5h2.5v0.5h-2.5zM-3,0h3v1h-3zM-1.5,1h1.5v0.5h-1.5z',
    },
    { paint: 'boulder', d: 'M0,-0.5h3v1h-3zM0,0.5h2.5v1h-2.5z' },
    {
      paint: 'snowCap',
      d: 'M-1.5,-2.5h2v0.5h-2zM-2.5,-2h4.5v0.5h-4.5zM-3,-1.5h5.5v0.5h-5.5zM-2.5,-1h1v0.5h-1zM-1,-1h1.5v0.5h-1.5z',
    },
    { paint: 'ice', d: 'M-1.5,-1h0.5v0.5h-0.5zM0.5,-1h2v0.5h-2zM-0.5,-0.5h0.5v0.5h-0.5z' },
  ],
  pixels: 78,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'rock',
      d: 'M-3,-1.5h0.5v0.5h-0.5zM-3.5,-1h3v0.5h-3zM-3.5,-0.5h3.5v0.5h-3.5zM-3.5,0h3v0.5h-3zM-3,0.5h2.5v0.5h-2.5zM-2,1h1.5v0.5h-1.5zM-1,1.5h0.5v0.5h-0.5z',
    },
    {
      paint: 'boulder',
      d: 'M1.5,-1h1.5v0.5h-1.5zM0.5,-0.5h3v0.5h-3zM-0.5,0h4v0.5h-4zM-0.5,0.5h3.5v1h-3.5zM-0.5,1.5h2.5v0.5h-2.5z',
    },
    {
      paint: 'snowCap',
      d: 'M-2.5,-2.5h4v0.5h-4zM-3,-2h5.5v0.5h-5.5zM-2.5,-1.5h5v0.5h-5zM-0.5,-1h1.5v0.5h-1.5zM0,-0.5h0.5v0.5h-0.5z',
    },
    { paint: 'ice', d: 'M1,-1h0.5v0.5h-0.5z' },
  ],
  pixels: 99,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
