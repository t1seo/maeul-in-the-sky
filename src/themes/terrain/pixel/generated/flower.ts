import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'pine',
      d: 'M-0.5,-2.5h0.5v0.5h-0.5zM-1.5,-2h3v1h-3zM-1.5,-1h2v0.5h-2zM-0.5,-0.5h1v0.5h-1z',
    },
    {
      paint: 'flower',
      d: 'M-0.5,-4.5h1v0.5h-1zM-1.5,-4h0.5v0.5h-0.5zM-0.5,-4h2v0.5h-2zM-1.5,-3.5h1v0.5h-1zM0.5,-3.5h1v0.5h-1zM-1.5,-3h2.5v0.5h-2.5zM-1,-2.5h0.5v0.5h-0.5zM0,-2.5h1v0.5h-1z',
    },
    { paint: 'flowerAlt', d: 'M-1,-4h0.5v0.5h-0.5z' },
    { paint: 'flowerCenter', d: 'M-0.5,-3.5h1v0.5h-1z' },
  ],
  pixels: 41,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'pine',
      d: 'M-0.5,-2.5h0.5v0.5h-0.5zM-1.5,-2h3v1h-3zM-1.5,-1h2v0.5h-2zM-0.5,-0.5h1v0.5h-1z',
    },
    {
      paint: 'flowerCenter',
      d: 'M-1,-4.5h1.5v0.5h-1.5zM-1,-4h2.5v0.5h-2.5zM-1.5,-3.5h1v0.5h-1zM0.5,-3.5h1.5v0.5h-1.5zM-1.5,-3h3v0.5h-3zM-1.5,-2.5h1v0.5h-1zM0,-2.5h1v0.5h-1z',
    },
    { paint: 'flower', d: 'M-0.5,-3.5h1v0.5h-1z' },
  ],
  pixels: 44,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'pine',
      d: 'M-1.5,-2.5h1v1h-1zM0.5,-2h1v0.5h-1zM-1.5,-1.5h3v0.5h-3zM-1.5,-1h2v0.5h-2zM-0.5,-0.5h1v0.5h-1z',
    },
    {
      paint: 'wildflower',
      d: 'M0,-4.5h1.5v0.5h-1.5zM-2,-4h3.5v1h-3.5zM-1.5,-3h3v0.5h-3zM-0.5,-2.5h1.5v0.5h-1.5zM-0.5,-2h1v0.5h-1z',
    },
  ],
  pixels: 46,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
