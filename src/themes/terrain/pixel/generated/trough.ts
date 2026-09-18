import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'trunk', d: 'M-2.5,0.5h0.5v0.5h-0.5zM1.5,0.5h1v1h-1zM-2.5,1h1v0.5h-1z' },
    {
      paint: 'trough',
      d: 'M-2,-1.5h1v0.5h-1zM1,-1.5h0.5v0.5h-0.5zM-3,-1h1v0.5h-1zM2,-1h1v0.5h-1zM-3,-0.5h3.5v0.5h-3.5zM1,-0.5h1v1h-1zM2.5,-0.5h0.5v0.5h-0.5zM-2.5,0h2.5v0.5h-2.5zM-2,0.5h2v0.5h-2zM1,0.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['shadow', 0.22],
        ['trough', 0.78],
      ],
      d: 'M0.5,-0.5h0.5v0.5h-0.5zM2,-0.5h0.5v1h-0.5zM0,0h1v1h-1z',
    },
    {
      paint: [
        ['snowCap', 0.3],
        ['trough', 0.7],
      ],
      d: 'M-1,-2h2v0.5h-2zM-2.5,-1.5h0.5v0.5h-0.5zM-1,-1.5h1v0.5h-1zM0.5,-1.5h0.5v0.5h-0.5zM1.5,-1.5h1v0.5h-1zM-2,-1h1v0.5h-1zM0.5,-1h1.5v0.5h-1.5z',
    },
    { paint: 'tidePools', d: 'M0,-1.5h0.5v0.5h-0.5zM-1,-1h1.5v0.5h-1.5z' },
  ],
  pixels: 62,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
