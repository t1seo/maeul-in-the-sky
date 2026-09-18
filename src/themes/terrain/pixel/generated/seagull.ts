import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'seagull',
      d: 'M-1.5,-4.5h0.5v0.5h-0.5zM0.5,-4.5h1v0.5h-1zM-2,-4h3.5v0.5h-3.5zM-1,-3.5h2v0.5h-2zM-0.5,-3h1v0.5h-1z',
    },
    { paint: 'heron', d: 'M1.5,-5h1v0.5h-1zM-3,-4.5h1.5v0.5h-1.5zM1.5,-4.5h0.5v0.5h-0.5z' },
    { paint: 'wheat', d: 'M-1,-3h0.5v0.5h-0.5z' },
  ],
  pixels: 23,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'seagull',
      d: 'M-2,-2h1.5v0.5h-1.5zM-2,-1.5h3v0.5h-3zM-1.5,-1h1v0.5h-1zM1,-1h0.5v0.5h-0.5zM-1,-0.5h1v0.5h-1zM1,-0.5h1v0.5h-1zM0,0h1.5v0.5h-1.5z',
    },
    { paint: 'heron', d: 'M-0.5,-1h1.5v0.5h-1.5zM0,-0.5h1v0.5h-1z' },
    { paint: 'wheat', d: 'M-2.5,-1.5h0.5v0.5h-0.5z' },
  ],
  pixels: 25,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'seagull',
      d: 'M1,-5h0.5v0.5h-0.5zM2.5,-5h0.5v0.5h-0.5zM1,-4.5h2v0.5h-2zM1.5,-4h1v0.5h-1zM0,-3.5h0.5v0.5h-0.5zM-2,-3h1v0.5h-1zM-0.5,-3h1v0.5h-1zM-1.5,-2.5h1.5v0.5h-1.5zM-1,-2h0.5v0.5h-0.5z',
    },
    {
      paint: 'heron',
      d: 'M0.5,-5h0.5v0.5h-0.5zM3,-5h0.5v0.5h-0.5zM0.5,-3.5h0.5v0.5h-0.5zM-2.5,-3h0.5v0.5h-0.5z',
    },
    { paint: 'wheat', d: 'M-1.5,-2h0.5v0.5h-0.5z' },
  ],
  pixels: 22,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
