import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'mushroom', d: 'M-0.5,-1h1v1h-1zM-0.5,0h0.5v0.5h-0.5z' },
    { paint: 'stump', d: 'M-2,-2h0.5v0.5h-0.5zM1.5,-2h0.5v0.5h-0.5zM-1.5,-1.5h3v0.5h-3z' },
    { paint: 'mushroomCap', d: 'M-1,-3h2v0.5h-2zM-1.5,-2.5h3v1h-3z' },
  ],
  pixels: 29,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'mushroom', d: 'M0.5,-2h0.5v0.5h-0.5zM0.5,-1.5h1v1.5h-1zM-1.5,-1h1v1h-1z' },
    { paint: 'stump', d: 'M1,-2h0.5v0.5h-0.5z' },
    {
      paint: 'trunk',
      d: 'M0,-3h1.5v1h-1.5zM-1.5,-2.5h1v0.5h-1zM-2,-2h2.5v0.5h-2.5zM-2.5,-1.5h3v0.5h-3z',
    },
  ],
  pixels: 31,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'mushroom', d: 'M-0.5,-2.5h1v2.5h-1zM-0.5,0h0.5v0.5h-0.5z' },
    { paint: 'mushroomCap', d: 'M-0.5,-4h1v0.5h-1zM-1,-3.5h2v1h-2z' },
  ],
  pixels: 21,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
