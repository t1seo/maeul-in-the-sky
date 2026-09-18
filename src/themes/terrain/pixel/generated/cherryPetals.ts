import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'cherryPetalPink', d: 'M1,-1h1v0.5h-1zM-2,-0.5h1v1h-1zM0,0h1v0.5h-1z' },
    {
      paint: 'cherryPetalWhite',
      d: 'M1,-0.5h0.5v0.5h-0.5zM-0.5,0h0.5v0.5h-0.5zM0,0.5h0.5v0.5h-0.5z',
    },
  ],
  pixels: 11,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'cherryPetalPink',
      d: 'M-1,-1h1.5v0.5h-1.5zM-2,-0.5h1.5v0.5h-1.5zM0.5,-0.5h1.5v0.5h-1.5zM-2.5,0h2v0.5h-2zM1,0h1.5v0.5h-1.5zM-1.5,0.5h2.5v0.5h-2.5z',
    },
    { paint: 'cherryPetalWhite', d: 'M-0.5,-0.5h1v0.5h-1zM-0.5,0h1.5v0.5h-1.5z' },
  ],
  pixels: 26,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'cherryPetalPink',
      d: 'M0.5,-2.5h1v0.5h-1zM-1,-1.5h1.5v0.5h-1.5zM-0.5,-1h0.5v0.5h-0.5zM-2,-0.5h1v1h-1z',
    },
    { paint: 'cherryPetalWhite', d: 'M1.5,-2.5h0.5v0.5h-0.5zM1,-2h0.5v0.5h-0.5z' },
  ],
  pixels: 12,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
