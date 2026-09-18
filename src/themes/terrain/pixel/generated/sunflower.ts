import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'tulipStem',
      d: 'M-1.5,-2.5h1v0.5h-1zM1,-2.5h0.5v0.5h-0.5zM-1.5,-2h3v0.5h-3zM-1,-1.5h1.5v0.5h-1.5zM0,-1h0.5v1h-0.5zM-0.5,0h1v0.5h-1z',
    },
    {
      paint: 'sunflowerPetal',
      d: 'M-1,-5h0.5v0.5h-0.5zM0,-5h0.5v0.5h-0.5zM-1.5,-4.5h3v0.5h-3zM-1.5,-4h0.5v1h-0.5zM0.5,-4h1v0.5h-1zM1,-3.5h0.5v0.5h-0.5zM-1.5,-3h1v0.5h-1zM0.5,-3h0.5v0.5h-0.5zM-0.5,-2.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['parasolStripe', 0.4],
        ['sunflowerPetal', 0.6],
      ],
      d: 'M-0.5,-5h0.5v0.5h-0.5z',
    },
    { paint: 'sunflowerCenter', d: 'M-0.5,-4h1v1h-1z' },
    {
      paint: [
        ['sunflowerCenter', 0.55],
        ['sunflowerPetal', 0.45],
      ],
      d: 'M-1,-4h0.5v1h-0.5zM0.5,-3.5h0.5v0.5h-0.5zM-0.5,-3h1v0.5h-1zM0,-2.5h1v0.5h-1z',
    },
  ],
  pixels: 45,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'tulipStem',
      d: 'M1,-3h0.5v0.5h-0.5zM-2.5,-2.5h1v0.5h-1zM0,-2.5h0.5v0.5h-0.5zM1,-2.5h1.5v0.5h-1.5zM-2.5,-2h5v0.5h-5zM-2,-1.5h1.5v0.5h-1.5zM0,-1.5h1.5v0.5h-1.5zM-1.5,-1h1v1.5h-1zM1,-1h0.5v2h-0.5zM-1.5,0.5h0.5v0.5h-0.5z',
    },
    {
      paint: 'sunflowerPetal',
      d: 'M0,-6h0.5v0.5h-0.5zM1,-6h0.5v0.5h-0.5zM2,-6h0.5v0.5h-0.5zM-0.5,-5.5h1v0.5h-1zM1.5,-5.5h1v0.5h-1zM-2,-5h0.5v0.5h-0.5zM-1,-5h1.5v0.5h-1.5zM2,-5h0.5v1h-0.5zM-2,-4.5h2.5v0.5h-2.5zM-2.5,-4h0.5v1h-0.5zM-0.5,-4h1v0.5h-1zM1.5,-4h1v0.5h-1zM-0.5,-3.5h1.5v0.5h-1.5zM1.5,-3.5h0.5v0.5h-0.5zM-2.5,-3h1v0.5h-1zM-0.5,-3h0.5v0.5h-0.5zM-1.5,-2.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['parasolStripe', 0.4],
        ['sunflowerPetal', 0.6],
      ],
      d: 'M0.5,-6h0.5v0.5h-0.5zM-1.5,-5h0.5v0.5h-0.5z',
    },
    { paint: 'sunflowerCenter', d: 'M0.5,-5h1v1h-1zM-1.5,-4h1v1h-1z' },
    {
      paint: [
        ['sunflowerCenter', 0.55],
        ['sunflowerPetal', 0.45],
      ],
      d: 'M0.5,-5.5h1v0.5h-1zM1.5,-5h0.5v1h-0.5zM-2,-4h0.5v1h-0.5zM0.5,-4h1v0.5h-1zM1,-3.5h0.5v0.5h-0.5zM-1.5,-3h1v0.5h-1zM-1,-2.5h1v0.5h-1z',
    },
  ],
  pixels: 89,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'tulipStem',
      d: 'M0,-3h0.5v0.5h-0.5zM-3.5,-2.5h0.5v0.5h-0.5zM-1.5,-2.5h1v0.5h-1zM0,-2.5h1.5v0.5h-1.5zM3,-2.5h0.5v0.5h-0.5zM-3.5,-2h7v0.5h-7zM-3,-1.5h1.5v0.5h-1.5zM-1,-1.5h1.5v0.5h-1.5zM1,-1.5h1.5v0.5h-1.5zM-2.5,-1h1v1h-1zM0,-1h0.5v0.5h-0.5zM2,-1h0.5v2h-0.5zM-0.5,-0.5h1v1h-1zM-2.5,0h0.5v1h-0.5z',
    },
    {
      paint: 'sunflowerPetal',
      d: 'M-1,-6h0.5v0.5h-0.5zM0,-6h1.5v0.5h-1.5zM-1.5,-5.5h1v0.5h-1zM0.5,-5.5h1v0.5h-1zM-3,-5h0.5v0.5h-0.5zM-2,-5h1v0.5h-1zM1,-5h1.5v0.5h-1.5zM-3,-4.5h2v0.5h-2zM1,-4.5h2.5v0.5h-2.5zM-3.5,-4h0.5v1h-0.5zM-1.5,-4h1v0.5h-1zM0.5,-4h1v1.5h-1zM3,-4h0.5v0.5h-0.5zM-1.5,-3.5h1.5v0.5h-1.5zM3,-3.5h1v0.5h-1zM-3.5,-3h1v0.5h-1zM-1.5,-3h0.5v0.5h-0.5zM2.5,-3h1v0.5h-1zM-3,-2.5h1v0.5h-1zM1.5,-2.5h1v0.5h-1z',
    },
    {
      paint: [
        ['parasolStripe', 0.4],
        ['sunflowerPetal', 0.6],
      ],
      d: 'M-0.5,-6h0.5v0.5h-0.5zM-2.5,-5h0.5v0.5h-0.5z',
    },
    {
      paint: 'sunflowerCenter',
      d: 'M-0.5,-5h1v1h-1zM-2.5,-4h1v1h-1zM2,-4h0.5v0.5h-0.5zM1.5,-3.5h1v0.5h-1z',
    },
    {
      paint: [
        ['sunflowerCenter', 0.55],
        ['sunflowerPetal', 0.45],
      ],
      d: 'M-0.5,-5.5h1v0.5h-1zM-1,-5h0.5v1h-0.5zM0.5,-5h0.5v1h-0.5zM-3,-4h0.5v1h-0.5zM-0.5,-4h1v0.5h-1zM1.5,-4h0.5v0.5h-0.5zM2.5,-4h0.5v1h-0.5zM0,-3.5h0.5v0.5h-0.5zM-2.5,-3h1v0.5h-1zM1.5,-3h1v0.5h-1zM-2,-2.5h0.5v0.5h-0.5zM2.5,-2.5h0.5v0.5h-0.5z',
    },
  ],
  pixels: 127,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
