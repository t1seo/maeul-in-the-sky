import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'watermelonRind',
      d: 'M-1.5,-1.5h3v0.5h-3zM-2,-1h4v0.5h-4zM-2,-0.5h3.5v0.5h-3.5zM-2,0h2.5v0.5h-2.5z',
    },
    {
      paint: [
        ['trunk', 0.35],
        ['watermelonRind', 0.65],
      ],
      d: 'M1.5,-0.5h0.5v0.5h-0.5zM0.5,0h1.5v0.5h-1.5zM-1.5,0.5h3v0.5h-3z',
    },
  ],
  pixels: 36,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'watermelonRind',
      d: 'M-2,-1h1v0.5h-1zM0.5,-1h1.5v0.5h-1.5zM-2,-0.5h0.5v0.5h-0.5zM1.5,-0.5h0.5v0.5h-0.5zM-2,0h1v0.5h-1zM1,0h1v0.5h-1zM-1.5,0.5h3v0.5h-3zM-0.5,1h1.5v0.5h-1.5z',
    },
    { paint: 'parasolStripe', d: 'M-1.5,-0.5h0.5v0.5h-0.5zM-1,0h0.5v0.5h-0.5z' },
    {
      paint: 'watermelonFlesh',
      d: 'M-1,-1h1.5v0.5h-1.5zM-1,-0.5h2.5v0.5h-2.5zM-0.5,0h1.5v0.5h-1.5z',
    },
  ],
  pixels: 33,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'watermelonRind',
      d: 'M-0.5,-1.5h1v0.5h-1zM-1,-1h0.5v0.5h-0.5zM0.5,-1h0.5v0.5h-0.5zM-1.5,-0.5h0.5v1h-0.5zM1,-0.5h0.5v0.5h-0.5zM1.5,0h0.5v0.5h-0.5zM-1.5,0.5h3v0.5h-3z',
    },
    { paint: 'parasolStripe', d: 'M1,0h0.5v0.5h-0.5z' },
    { paint: 'watermelonFlesh', d: 'M-0.5,-1h1v0.5h-1zM-1,-0.5h2v1h-2z' },
  ],
  pixels: 25,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
