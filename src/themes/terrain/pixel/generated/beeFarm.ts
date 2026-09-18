import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'shadow', d: 'M0.5,0h1v0.5h-1z' },
    { paint: 'trunk', d: 'M-1,-1h0.5v0.5h-0.5zM1.5,-0.5h0.5v1h-0.5zM-2,0h1v0.5h-1z' },
    {
      paint: 'beeFarm',
      d: 'M-1,-2.5h1v0.5h-1zM-2,-2h1.5v0.5h-1.5zM-1,-1.5h1v0.5h-1zM-2,-1h1v0.5h-1zM-0.5,-0.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['beeFarm', 0.78],
        ['shadow', 0.22],
      ],
      d: 'M-2,-3h0.5v0.5h-0.5zM1.5,-3h0.5v0.5h-0.5zM-2,-2.5h1v0.5h-1zM0,-2.5h2v0.5h-2zM-0.5,-2h2.5v0.5h-2.5zM-2,-1.5h1v0.5h-1zM0,-1.5h2v0.5h-2zM-0.5,-1h2.5v0.5h-2.5zM-2,-0.5h0.5v0.5h-0.5zM0,-0.5h1.5v0.5h-1.5zM-1,0h1.5v0.5h-1.5z',
    },
    {
      paint: 'roofB',
      d: 'M0,-4.5h1v0.5h-1zM0,-4h2.5v0.5h-2.5zM-2.5,-3.5h0.5v0.5h-0.5zM0,-3.5h1.5v0.5h-1.5zM0,-3h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['roofB', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-1,-4.5h1v0.5h-1zM-2,-4h2v1h-2zM-1,-3h1v0.5h-1z',
    },
    {
      paint: [
        ['roofB', 0.78],
        ['shadow', 0.22],
      ],
      d: 'M1.5,-3.5h1v0.5h-1zM0.5,-3h1v0.5h-1z',
    },
    {
      paint: [
        ['beeFarm', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-1.5,-3h0.5v0.5h-0.5zM-1.5,-0.5h1v0.5h-1z',
    },
  ],
  pixels: 79,
};
export const sprites: readonly PixelSprite[] = [variant0, variant0, variant0];
