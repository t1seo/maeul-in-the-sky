import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'bird',
      d: 'M-3,-6h0.5v0.5h-0.5zM-2,-6h1v0.5h-1zM2,-6h1v0.5h-1zM-2.5,-5.5h0.5v0.5h-0.5zM-1,-5.5h0.5v0.5h-0.5zM1,-5.5h2v0.5h-2zM-2.5,-5h1v0.5h-1zM0.5,-5h0.5v0.5h-0.5zM1.5,-5h1v0.5h-1zM-2,-4.5h3.5v0.5h-3.5zM-0.5,-4h1.5v0.5h-1.5zM-0.5,-3.5h0.5v0.5h-0.5z',
    },
    {
      paint: 'owl',
      d: 'M-2.5,-6h0.5v0.5h-0.5zM-2,-5.5h1v0.5h-1zM-1.5,-5h1v0.5h-1zM1,-5h0.5v0.5h-0.5z',
    },
    { paint: 'wheat', d: 'M1,-4h0.5v0.5h-0.5z' },
  ],
  pixels: 34,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'trunk', d: 'M1,-3h1v1h-1zM-2,-2.5h2.5v0.5h-2.5zM-2,-2h0.5v0.5h-0.5z' },
    { paint: 'wheat', d: 'M-1.5,-4.5h0.5v0.5h-0.5z' },
    {
      paint: 'bird',
      d: 'M-0.5,-5.5h0.5v0.5h-0.5zM-1,-5h1.5v1h-1.5zM-0.5,-4h1.5v0.5h-1.5zM-1,-3.5h2v0.5h-2zM-0.5,-3h1.5v0.5h-1.5zM0.5,-2.5h0.5v0.5h-0.5z',
    },
    { paint: 'owl', d: 'M-1,-4h0.5v0.5h-0.5z' },
  ],
  pixels: 30,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'bird',
      d: 'M-1,-7.5h1v0.5h-1zM-1,-7h0.5v0.5h-0.5zM1.5,-7h1.5v0.5h-1.5zM-0.5,-6.5h1v0.5h-1zM1,-6.5h1.5v0.5h-1.5zM-3,-6h0.5v0.5h-0.5zM-2,-6h1v0.5h-1zM0.5,-6h2.5v0.5h-2.5zM-2.5,-5.5h0.5v0.5h-0.5zM-1,-5.5h0.5v0.5h-0.5zM1,-5.5h2v0.5h-2zM-2.5,-5h1v0.5h-1zM0.5,-5h0.5v0.5h-0.5zM1.5,-5h1v0.5h-1zM-2,-4.5h3.5v0.5h-3.5zM-0.5,-4h1.5v0.5h-1.5zM-0.5,-3.5h0.5v0.5h-0.5z',
    },
    {
      paint: 'owl',
      d: 'M-0.5,-7h1v0.5h-1zM0.5,-6.5h0.5v0.5h-0.5zM-2.5,-6h0.5v0.5h-0.5zM-2,-5.5h1v0.5h-1zM-1.5,-5h1v0.5h-1zM1,-5h0.5v0.5h-0.5z',
    },
    { paint: 'wheat', d: 'M1,-4h0.5v0.5h-0.5z' },
  ],
  pixels: 51,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
