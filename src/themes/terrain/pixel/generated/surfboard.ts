import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'surfboardBody',
      d: 'M0,-5.5h0.5v1h-0.5zM-0.5,-4.5h1v0.5h-1zM-0.5,-4h0.5v1.5h-0.5zM0.5,-4h0.5v2h-0.5zM-1,-2.5h1v1h-1zM-1,-1.5h0.5v1.5h-0.5zM0,-0.5h0.5v0.5h-0.5zM-0.5,0h1v0.5h-1zM-0.5,0.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['surfboardBody', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M0.5,-5.5h0.5v1.5h-0.5zM0,-4h0.5v2h-0.5zM1,-4h0.5v2h-0.5zM0.5,-2h1v0.5h-1zM-0.5,-1.5h0.5v0.5h-0.5zM0.5,-1.5h0.5v0.5h-0.5zM-0.5,-1h1.5v0.5h-1.5zM-0.5,-0.5h0.5v0.5h-0.5zM0.5,-0.5h0.5v1h-0.5zM0,0.5h0.5v0.5h-0.5z',
    },
    { paint: 'parasolStripe', d: 'M-1,-3h0.5v0.5h-0.5z' },
    { paint: 'surfboardStripe', d: 'M0,-2h0.5v1h-0.5z' },
  ],
  pixels: 47,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'trunk', d: 'M0,0.5h0.5v0.5h-0.5z' },
    {
      paint: 'surfboardBody',
      d: 'M-1.5,-5.5h0.5v1h-0.5zM-1.5,-4.5h1v0.5h-1zM-1,-4h0.5v0.5h-0.5zM-1.5,-3.5h0.5v2h-0.5zM-0.5,-3.5h0.5v1h-0.5zM-1.5,-1.5h1v0.5h-1zM-1,-1h0.5v1h-0.5zM0,-1h0.5v1.5h-0.5z',
    },
    {
      paint: [
        ['surfboardBody', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M-1,-5h0.5v0.5h-0.5zM-0.5,-4.5h0.5v1h-0.5zM-1.5,-4h0.5v0.5h-0.5zM-1,-3.5h0.5v1h-0.5zM0,-3.5h0.5v1h-0.5zM-1,-2.5h1.5v1h-1.5zM0,-1.5h1v0.5h-1zM0.5,-1h0.5v1.5h-0.5zM-0.5,-0.5h0.5v1.5h-0.5z',
    },
    { paint: 'surfboardStripe', d: 'M-0.5,-1.5h0.5v1h-0.5z' },
  ],
  pixels: 43,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'surfboardBody',
      d: 'M1,-5.5h0.5v0.5h-0.5zM0.5,-5h1v1h-1zM0,-4h0.5v1h-0.5zM1,-4h0.5v1h-0.5zM-0.5,-3h1v0.5h-1zM-0.5,-2h0.5v1.5h-0.5zM-1,-0.5h0.5v0.5h-0.5zM-0.5,0h0.5v1h-0.5z',
    },
    {
      paint: [
        ['surfboardBody', 0.7],
        ['trunk', 0.3],
      ],
      d: 'M1.5,-4.5h0.5v1.5h-0.5zM0.5,-4h0.5v1h-0.5zM0.5,-3h1.5v0.5h-1.5zM-0.5,-2.5h2v0.5h-2zM1,-2h0.5v0.5h-0.5zM0.5,-1.5h1v1h-1zM-0.5,-0.5h1.5v0.5h-1.5zM0,0h1v0.5h-1zM0,0.5h0.5v0.5h-0.5z',
    },
    { paint: 'surfboardStripe', d: 'M0,-2h1v0.5h-1zM0,-1.5h0.5v1h-0.5z' },
  ],
  pixels: 44,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
