import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'trunk', d: 'M0,-2.5h0.5v0.5h-0.5zM-0.5,-2h1v2.5h-1z' },
    {
      paint: 'gardenTree',
      d: 'M-0.5,-6.5h1v0.5h-1zM-1.5,-6h3v0.5h-3zM-2,-5.5h1v0.5h-1zM0.5,-5.5h0.5v1.5h-0.5zM1.5,-5.5h0.5v0.5h-0.5zM-2,-5h0.5v0.5h-0.5zM2,-5h0.5v0.5h-0.5zM-2,-4.5h2v0.5h-2zM-2.5,-4h3.5v0.5h-3.5zM-2.5,-3.5h3v0.5h-3zM-2,-3h1.5v0.5h-1.5z',
    },
    {
      paint: 'bushDark',
      d: 'M1,-5.5h0.5v0.5h-0.5zM1,-5h1v0.5h-1zM1,-4.5h1.5v1h-1.5zM0.5,-3.5h2v0.5h-2zM-0.5,-3h2.5v0.5h-2.5zM-1,-2.5h1v0.5h-1zM0.5,-2.5h0.5v0.5h-0.5z',
    },
    { paint: 'leafLight', d: 'M-1,-5.5h1.5v0.5h-1.5zM-1.5,-5h2v0.5h-2zM0,-4.5h0.5v0.5h-0.5z' },
  ],
  pixels: 76,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'trunk', d: 'M-0.5,-2h1v2.5h-1z' },
    {
      paint: 'gardenTree',
      d: 'M-0.5,-7h0.5v0.5h-0.5zM-1,-6.5h1v1.5h-1zM0.5,-6h0.5v0.5h-0.5zM-0.5,-5h0.5v1.5h-0.5zM-1.5,-4.5h0.5v1.5h-0.5zM-0.5,-3.5h1v1h-1zM-2,-3h1v0.5h-1zM-1.5,-2.5h2v0.5h-2z',
    },
    {
      paint: 'bushDark',
      d: 'M0,-6.5h0.5v1h-0.5zM0,-5.5h1v1h-1zM0,-4.5h1.5v1h-1.5zM0.5,-3.5h1v0.5h-1zM0.5,-3h1.5v0.5h-1.5zM0.5,-2.5h1v0.5h-1z',
    },
    { paint: 'leafLight', d: 'M-1,-5h0.5v2.5h-0.5z' },
  ],
  pixels: 58,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'trunk', d: 'M-0.5,-2.5h1v3h-1z' },
    {
      paint: 'gardenTree',
      d: 'M-0.5,-6.5h1v0.5h-1zM-1.5,-6h0.5v0.5h-0.5zM1,-6h0.5v0.5h-0.5zM1.5,-5.5h0.5v0.5h-0.5zM2,-5h0.5v0.5h-0.5zM1.5,-4.5h1v0.5h-1zM-2.5,-4h5v0.5h-5zM-2.5,-3.5h3v0.5h-3zM1,-3.5h1.5v0.5h-1.5zM-2,-3h4v0.5h-4zM0.5,-2.5h0.5v0.5h-0.5z',
    },
    {
      paint: 'flower',
      d: 'M-1,-6h2v0.5h-2zM-0.5,-5.5h1v0.5h-1zM1,-5.5h0.5v0.5h-0.5zM-1.5,-5h3.5v0.5h-3.5zM-2,-4.5h3.5v0.5h-3.5z',
    },
    {
      paint: 'flowerAlt',
      d: 'M-1.5,-5.5h1v0.5h-1zM0.5,-5.5h0.5v0.5h-0.5zM-2,-5h0.5v0.5h-0.5zM0.5,-3.5h0.5v0.5h-0.5z',
    },
  ],
  pixels: 74,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
