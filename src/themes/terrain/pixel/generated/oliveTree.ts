import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'shadow', d: 'M-1.5,0h0.5v0.5h-0.5zM0.5,0h2v0.5h-2z' },
    { paint: 'trunk', d: 'M-1,-3h2v0.5h-2zM0,-2.5h0.5v2.5h-0.5zM-1,0h1.5v0.5h-1.5z' },
    {
      paint: [
        ['snowCap', 0.3],
        ['trunk', 0.7],
      ],
      d: 'M-0.5,-2.5h0.5v2h-0.5zM-1,-0.5h1v0.5h-1z',
    },
    {
      paint: 'oliveGreen',
      d: 'M-0.5,-5h2.5v0.5h-2.5zM2.5,-5h0.5v0.5h-0.5zM-1.5,-4.5h3.5v0.5h-3.5zM-3,-4h4v0.5h-4zM-2.5,-3.5h2.5v0.5h-2.5zM2.5,-3.5h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['oliveGreen', 0.78],
        ['shadow', 0.22],
      ],
      d: 'M-1,-5h0.5v0.5h-0.5zM2,-5h0.5v0.5h-0.5zM-2,-4.5h0.5v0.5h-0.5zM2,-4.5h1v0.5h-1zM1,-4h2v0.5h-2zM0,-3.5h2.5v0.5h-2.5z',
    },
    {
      paint: [
        ['oliveGreen', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-1.5,-6.5h1.5v0.5h-1.5zM-1.5,-6h2.5v0.5h-2.5zM-2.5,-5.5h4.5v0.5h-4.5zM-3,-5h2v0.5h-2zM-3,-4.5h1v0.5h-1z',
    },
  ],
  pixels: 87,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'shadow', d: 'M-1.5,0h0.5v0.5h-0.5zM1,0h1.5v0.5h-1.5z' },
    {
      paint: 'trunk',
      d: 'M-1.5,-3h2.5v0.5h-2.5zM-1.5,-2.5h1v0.5h-1zM0,-2.5h0.5v2.5h-0.5zM-1,-2h0.5v2h-0.5zM-1,0h2v0.5h-2z',
    },
    {
      paint: [
        ['snowCap', 0.3],
        ['trunk', 0.7],
      ],
      d: 'M-0.5,-2.5h0.5v2.5h-0.5z',
    },
    {
      paint: 'oliveGreen',
      d: 'M1,-6h1.5v0.5h-1.5zM-1,-5.5h4v0.5h-4zM-1.5,-5h0.5v0.5h-0.5zM0,-5h3.5v0.5h-3.5zM-2.5,-4.5h0.5v0.5h-0.5zM-1.5,-4.5h3v0.5h-3zM-3,-4h3.5v0.5h-3.5zM-3.5,-3.5h3.5v0.5h-3.5z',
    },
    {
      paint: [
        ['oliveGreen', 0.78],
        ['shadow', 0.22],
      ],
      d: 'M-1,-5h1v0.5h-1zM-2,-4.5h0.5v0.5h-0.5zM1.5,-4.5h2v0.5h-2zM0.5,-4h3v0.5h-3zM0,-3.5h3v0.5h-3zM1,-3h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['oliveGreen', 0.7],
        ['snowCap', 0.3],
      ],
      d: 'M-2,-6.5h2.5v0.5h-2.5zM-2.5,-6h3.5v0.5h-3.5zM-3,-5.5h2v0.5h-2zM-3.5,-5h2v0.5h-2zM-3.5,-4.5h1v0.5h-1zM-3.5,-4h0.5v0.5h-0.5z',
    },
  ],
  pixels: 112,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant0];
