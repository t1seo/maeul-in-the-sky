import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'gardenSoil',
      d: 'M-3,-1h0.5v0.5h-0.5zM2,-1h1v0.5h-1zM-3,-0.5h2v0.5h-2zM1.5,-0.5h1.5v0.5h-1.5z',
    },
    {
      paint: [
        ['fence', 0.78],
        ['shadow', 0.22],
      ],
      d: 'M-0.5,-3h1v0.5h-1zM-3.5,-2.5h0.5v0.5h-0.5zM-1.5,-2.5h1.5v0.5h-1.5zM1,-2.5h1v0.5h-1zM3,-2.5h0.5v0.5h-0.5zM-3.5,-2h1.5v0.5h-1.5zM2.5,-2h1v0.5h-1zM-1.5,0h1v0.5h-1zM0.5,0h1v0.5h-1z',
    },
    {
      paint: [
        ['pig', 0.78],
        ['shadow', 0.22],
      ],
      d: 'M-2,-2.5h0.5v1h-0.5zM0,-2.5h1v0.5h-1zM1.5,-2h1v0.5h-1zM2,-1.5h0.5v0.5h-0.5zM1.5,-1h0.5v0.5h-0.5zM-1,-0.5h0.5v0.5h-0.5zM0.5,-0.5h1v0.5h-1zM-0.5,0h1v0.5h-1z',
    },
    { paint: 'pig', d: 'M-1.5,-2h0.5v0.5h-0.5zM-2,-1.5h4v0.5h-4zM-1.5,-1h3v0.5h-3z' },
    {
      paint: [
        ['pig', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-1,-2h2.5v0.5h-2.5zM-2.5,-1.5h0.5v0.5h-0.5zM-2,-1h0.5v0.5h-0.5z',
    },
    {
      paint: 'fence',
      d: 'M-3.5,-1.5h0.5v0.5h-0.5zM3,-1.5h0.5v0.5h-0.5zM-3,0h1.5v0.5h-1.5zM1.5,0h1.5v0.5h-1.5zM-2.5,0.5h4.5v0.5h-4.5z',
    },
    {
      paint: [
        ['fence', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-3.5,-1h0.5v2h-0.5zM-2.5,-1h0.5v0.5h-0.5zM3,-1h0.5v1.5h-0.5zM-0.5,-0.5h1v0.5h-1z',
    },
  ],
  pixels: 90,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
