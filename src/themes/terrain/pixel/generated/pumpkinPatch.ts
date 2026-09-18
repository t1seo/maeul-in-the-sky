import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'autumnOlive',
      d: 'M-1,-2h2v0.5h-2zM2,-2h0.5v0.5h-0.5zM-2,-1.5h1v0.5h-1zM1,-1.5h1.5v0.5h-1.5zM-2.5,-1h1v0.5h-1zM1.5,-1h1v0.5h-1zM-3,-0.5h1v0.5h-1zM2,-0.5h0.5v1h-0.5zM-2.5,0h0.5v0.5h-0.5z',
    },
    {
      paint: 'pumpkin',
      d: 'M-1.5,-1h0.5v0.5h-0.5zM-0.5,-1h0.5v0.5h-0.5zM-2,-0.5h1.5v1.5h-1.5zM0.5,-0.5h1v0.5h-1zM0,0h1.5v0.5h-1.5zM0,0.5h1v0.5h-1z',
    },
    { paint: 'autumnRust', d: 'M0,-0.5h0.5v0.5h-0.5zM1.5,0h0.5v0.5h-0.5zM-0.5,0.5h0.5v0.5h-0.5z' },
    {
      paint: [
        ['autumnGold', 0.55],
        ['pumpkin', 0.45],
      ],
      d: 'M-0.5,-0.5h0.5v1h-0.5zM1,0.5h1v0.5h-1z',
    },
    { paint: 'trunk', d: 'M-1,-1.5h0.5v1h-0.5z' },
  ],
  pixels: 46,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'autumnOlive',
      d: 'M-1,-2h2v0.5h-2zM2,-2h0.5v0.5h-0.5zM-2,-1.5h0.5v0.5h-0.5zM1,-1.5h1.5v0.5h-1.5zM1.5,-1h1v0.5h-1zM-3,-0.5h1v0.5h-1zM2,-0.5h0.5v1h-0.5zM-2.5,0h0.5v0.5h-0.5z',
    },
    {
      paint: 'pumpkin',
      d: 'M-1,-1.5h0.5v0.5h-0.5zM-2.5,-1h1.5v0.5h-1.5zM1,-1h0.5v0.5h-0.5zM-2,-0.5h1v0.5h-1zM0,-0.5h1.5v0.5h-1.5zM-2,0h2v0.5h-2zM0.5,0h1v1h-1zM-1,0.5h1v1h-1z',
    },
    { paint: 'autumnRust', d: 'M-0.5,-1h0.5v1h-0.5zM1.5,-0.5h0.5v1h-0.5z' },
    {
      paint: [
        ['autumnGold', 0.55],
        ['pumpkin', 0.45],
      ],
      d: 'M-1,-1h0.5v1h-0.5zM0,0h0.5v1.5h-0.5zM1.5,0.5h0.5v0.5h-0.5z',
    },
    { paint: 'trunk', d: 'M-1.5,-1.5h0.5v0.5h-0.5zM0.5,-1h0.5v0.5h-0.5z' },
  ],
  pixels: 50,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'autumnOlive',
      d: 'M-1,-2h2v0.5h-2zM2,-2h0.5v0.5h-0.5zM-2,-1.5h1v0.5h-1zM1,-1.5h1.5v0.5h-1.5zM-2.5,-1h1v0.5h-1zM1.5,-1h1v0.5h-1zM-3,-0.5h1v0.5h-1zM2,-0.5h0.5v1h-0.5zM-2.5,0h0.5v0.5h-0.5z',
    },
    {
      paint: 'pumpkin',
      d: 'M-1.5,-1h2.5v0.5h-2.5zM-2,-0.5h3v1h-3zM-2,0.5h2.5v0.5h-2.5zM-1.5,1h2v0.5h-2z',
    },
    {
      paint: 'autumnRust',
      d: 'M1,-1h0.5v0.5h-0.5zM1,-0.5h1v1h-1zM0.5,0.5h1v0.5h-1zM0.5,1h0.5v0.5h-0.5z',
    },
    { paint: 'trunk', d: 'M-0.5,-1.5h1v0.5h-1z' },
  ],
  pixels: 55,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
