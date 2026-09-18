import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'sprinklerMetal',
      d: 'M-1,-1h2v0.5h-2zM-0.5,-0.5h1v0.5h-1zM-1,0h2v0.5h-2zM-1.5,0.5h3v0.5h-3zM-0.5,1h1v0.5h-1z',
    },
    { paint: 'poolEdge', d: 'M0,-1.5h0.5v0.5h-0.5z' },
    {
      paint: 'poolWater',
      d: 'M1,-2.5h0.5v0.5h-0.5zM-2,-2h1v0.5h-1zM1,-2h1v0.5h-1zM-2.5,-1.5h1v0.5h-1zM-1,-1.5h0.5v0.5h-0.5zM0.5,-1.5h0.5v0.5h-0.5zM2,-1.5h0.5v0.5h-0.5z',
    },
    { paint: 'waterLight', d: 'M1.5,-1.5h0.5v0.5h-0.5zM-2.5,-0.5h1v0.5h-1zM1.5,-0.5h1v0.5h-1z' },
  ],
  pixels: 34,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'sprinklerMetal',
      d: 'M-1,-1h2v0.5h-2zM-0.5,-0.5h1v0.5h-1zM-1,0h2v0.5h-2zM-1.5,0.5h3v0.5h-3zM-0.5,1h1v0.5h-1z',
    },
    { paint: 'poolEdge', d: 'M0,-1.5h0.5v0.5h-0.5z' },
    {
      paint: 'poolWater',
      d: 'M-2,-2.5h0.5v0.5h-0.5zM1.5,-2.5h0.5v0.5h-0.5zM-2.5,-2h1.5v0.5h-1.5zM1,-2h1.5v0.5h-1.5zM-3,-1.5h1v0.5h-1zM-1.5,-1.5h1v0.5h-1zM0.5,-1.5h0.5v0.5h-0.5zM2.5,-1.5h0.5v0.5h-0.5z',
    },
    { paint: 'waterLight', d: 'M2,-1.5h0.5v0.5h-0.5zM-3,-0.5h1v0.5h-1zM2,-0.5h1v0.5h-1z' },
  ],
  pixels: 38,
};
const variant2: PixelSprite = {
  layers: [
    {
      paint: 'sprinklerMetal',
      d: 'M0,-1.5h0.5v0.5h-0.5zM-1,-1h2v0.5h-2zM-0.5,-0.5h1v0.5h-1zM-1,0h2v0.5h-2zM-1.5,0.5h3v0.5h-3zM-0.5,1h1v0.5h-1z',
    },
    {
      paint: 'poolWater',
      d: 'M0,-4h0.5v0.5h-0.5zM-0.5,-3.5h1.5v0.5h-1.5zM-0.5,-3h0.5v1h-0.5zM0.5,-3h0.5v0.5h-0.5zM-2,-2.5h1v0.5h-1zM1,-2.5h1v0.5h-1zM-2,-2h2v0.5h-2zM0.5,-2h1.5v0.5h-1.5zM-2.5,-1.5h1v0.5h-1zM-1,-1.5h1v0.5h-1zM0.5,-1.5h0.5v0.5h-0.5zM2,-1.5h0.5v0.5h-0.5z',
    },
    { paint: 'waterLight', d: 'M1.5,-1.5h0.5v0.5h-0.5zM-2.5,-0.5h1v0.5h-1zM1.5,-0.5h1v0.5h-1z' },
  ],
  pixels: 48,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
