import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'icicle',
      d: 'M-1,-3.5h1v0.5h-1zM0.5,-3.5h0.5v0.5h-0.5zM-0.5,-3h0.5v1.5h-0.5zM-0.5,-1.5h1v0.5h-1zM0,-1h0.5v0.5h-0.5z',
    },
    { paint: 'frozenWater', d: 'M0,-3.5h0.5v2h-0.5z' },
    { paint: 'snowCap', d: 'M-1,-4h2v0.5h-2z' },
  ],
  pixels: 17,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'icicle',
      d: 'M-2,-3.5h0.5v2h-0.5zM-1,-3.5h1v0.5h-1zM1,-3.5h0.5v2h-0.5zM-0.5,-3h0.5v2h-0.5zM-0.5,-1h1v0.5h-1zM0,-0.5h0.5v0.5h-0.5z',
    },
    {
      paint: 'frozenWater',
      d: 'M-1.5,-3.5h0.5v2.5h-0.5zM0,-3.5h0.5v2.5h-0.5zM1.5,-3.5h0.5v2.5h-0.5z',
    },
    { paint: 'snowCap', d: 'M-2,-4.5h4v0.5h-4zM-2.5,-4h5v0.5h-5z' },
  ],
  pixels: 50,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'icicle', d: 'M-1,-3.5h1v2.5h-1zM-0.5,-1h0.5v0.5h-0.5zM0,-0.5h0.5v0.5h-0.5z' },
    { paint: 'frozenWater', d: 'M0,-3.5h1v2h-1zM0,-1.5h0.5v1h-0.5z' },
    { paint: 'snowCap', d: 'M-0.5,-5h0.5v0.5h-0.5zM-1.5,-4.5h3v0.5h-3zM-1.5,-4h2.5v0.5h-2.5z' },
  ],
  pixels: 34,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
