import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'nestBrown', d: 'M-1.5,-3.5h1v0.5h-1zM-1,-1.5h0.5v0.5h-0.5zM-1.5,-0.5h0.5v0.5h-0.5z' },
    {
      paint: 'wreathGreen',
      d: 'M-0.5,-3h2v0.5h-2zM-1,-2.5h0.5v0.5h-0.5zM0.5,-2.5h1.5v0.5h-1.5zM-2,-2h1v1h-1zM0.5,-1.5h0.5v0.5h-0.5zM-2,-1h3v0.5h-3zM1.5,-1h0.5v0.5h-0.5zM0,-0.5h1.5v0.5h-1.5zM0,0h0.5v0.5h-0.5z',
    },
    { paint: 'autumnOlive', d: 'M-0.5,-3.5h1.5v0.5h-1.5zM-1.5,-3h1v0.5h-1zM-2,-2.5h1v0.5h-1z' },
    {
      paint: [
        ['trunk', 0.4],
        ['wreathGreen', 0.6],
      ],
      d: 'M1,-2h1v1h-1zM1,-1h0.5v0.5h-0.5zM-1,-0.5h1v0.5h-1z',
    },
  ],
  pixels: 42,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'nestBrown', d: 'M-1.5,-3.5h1v0.5h-1zM-1,-1.5h0.5v0.5h-0.5zM-1.5,-0.5h0.5v0.5h-0.5z' },
    {
      paint: 'wreathGreen',
      d: 'M0.5,-3.5h0.5v0.5h-0.5zM-0.5,-3h1v0.5h-1zM-1,-2.5h0.5v0.5h-0.5zM0.5,-2.5h0.5v0.5h-0.5zM-2,-2h0.5v1h-0.5zM1.5,-2h0.5v0.5h-0.5zM0.5,-1.5h0.5v0.5h-0.5zM-2,-1h3v0.5h-3zM1.5,-1h0.5v0.5h-0.5zM0,-0.5h1.5v0.5h-1.5zM0,0h0.5v0.5h-0.5z',
    },
    {
      paint: 'fallenLeafGold',
      d: 'M-0.5,-3.5h1v0.5h-1zM-1.5,-3h1v0.5h-1zM-2,-2.5h1v0.5h-1zM2,-2h0.5v0.5h-0.5zM1.5,-1.5h1v0.5h-1z',
    },
    {
      paint: [
        ['trunk', 0.4],
        ['wreathGreen', 0.6],
      ],
      d: 'M0.5,-3h1v0.5h-1zM1,-2.5h1v0.5h-1zM-1.5,-2h0.5v1h-0.5zM1,-2h0.5v1.5h-0.5zM-1,-0.5h1v0.5h-1z',
    },
  ],
  pixels: 44,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'nestBrown', d: 'M-1.5,-3.5h1v0.5h-1zM-1,-1.5h0.5v0.5h-0.5zM-1.5,-0.5h0.5v0.5h-0.5z' },
    {
      paint: 'wreathGreen',
      d: 'M-0.5,-3h1v0.5h-1zM-1,-2.5h0.5v0.5h-0.5zM0.5,-2.5h0.5v0.5h-0.5zM-2,-2h0.5v1h-0.5zM0.5,-1.5h0.5v0.5h-0.5zM-2,-1h1v0.5h-1zM-0.5,-1h1v0.5h-1zM1.5,-1h0.5v0.5h-0.5zM1,-0.5h0.5v0.5h-0.5z',
    },
    { paint: 'autumnOlive', d: 'M-0.5,-3.5h1.5v0.5h-1.5zM-1.5,-3h1v0.5h-1zM-2,-2.5h1v0.5h-1z' },
    {
      paint: [
        ['trunk', 0.4],
        ['wreathGreen', 0.6],
      ],
      d: 'M0.5,-3h1v0.5h-1zM1,-2.5h1v1.5h-1zM-1.5,-2h0.5v1h-0.5zM-1,-1h0.5v0.5h-0.5zM0.5,-1h1v0.5h-1z',
    },
    { paint: 'scarfRed', d: 'M-1,-0.5h2v0.5h-2zM-0.5,0h1v1h-1z' },
  ],
  pixels: 45,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
