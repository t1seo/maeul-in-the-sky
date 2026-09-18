import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'trunk', d: 'M-0.5,-5.5h1v0.5h-1z' },
    {
      paint: 'haystack',
      d: 'M-0.5,-5h0.5v1h-0.5zM0.5,-5h0.5v0.5h-0.5zM-0.5,-4h1v1h-1zM1.5,-4h0.5v0.5h-0.5zM-1,-3h1.5v0.5h-1.5zM-1.5,-2.5h1v0.5h-1zM-1.5,-2h2v0.5h-2zM-2.5,-1.5h3.5v0.5h-3.5zM-2.5,-1h3v0.5h-3zM-3,-0.5h3.5v0.5h-3.5zM2.5,-0.5h0.5v0.5h-0.5zM-1.5,0h2v0.5h-2z',
    },
    {
      paint: [
        ['haystack', 0.78],
        ['shadow', 0.22],
      ],
      d: 'M0,-5h0.5v0.5h-0.5zM0,-4.5h1.5v0.5h-1.5zM0.5,-4h1v0.5h-1zM0.5,-3.5h1.5v1h-1.5zM0.5,-2.5h2v1h-2zM1,-1.5h1.5v0.5h-1.5zM0.5,-1h2v1h-2zM-2.5,0h1v0.5h-1zM0.5,0h2.5v0.5h-2.5z',
    },
    {
      paint: [
        ['haystack', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-1,-5h0.5v0.5h-0.5zM-1.5,-4.5h1v1h-1zM-2,-3.5h1.5v0.5h-1.5zM-2,-3h1v0.5h-1zM-2,-2.5h0.5v1h-0.5z',
    },
    { paint: 'fence', d: 'M-0.5,-2.5h1v0.5h-1z' },
  ],
  pixels: 96,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
