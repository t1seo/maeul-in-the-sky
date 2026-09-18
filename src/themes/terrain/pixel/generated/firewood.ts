import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'shadow', d: 'M1.5,0.5h0.5v0.5h-0.5z' },
    {
      paint: 'firewoodLog',
      d: 'M0,-1.5h0.5v0.5h-0.5zM1,-1h0.5v0.5h-0.5zM-1.5,-0.5h0.5v0.5h-0.5zM0,-0.5h2.5v0.5h-2.5zM-0.5,0h0.5v0.5h-0.5zM0.5,0h2v0.5h-2zM0.5,0.5h1v0.5h-1z',
    },
    {
      paint: 'roofB',
      d: 'M0.5,-1.5h0.5v0.5h-0.5zM-1,-0.5h0.5v0.5h-0.5zM-1.5,0h1v0.5h-1zM0,0h0.5v0.5h-0.5zM-1.5,0.5h2v0.5h-2z',
    },
    { paint: 'snowCap', d: 'M1,-1.5h0.5v0.5h-0.5zM-1,-1h2v0.5h-2zM-0.5,-0.5h0.5v0.5h-0.5z' },
  ],
  pixels: 31,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'shadow', d: 'M1.5,0.5h0.5v0.5h-0.5z' },
    {
      paint: 'firewoodLog',
      d: 'M0.5,-2.5h0.5v0.5h-0.5zM0.5,-1.5h1.5v0.5h-1.5zM0,-1h2.5v0.5h-2.5zM0.5,-0.5h2.5v0.5h-2.5zM1,0h1.5v0.5h-1.5zM-1.5,0.5h0.5v0.5h-0.5zM0,0.5h0.5v0.5h-0.5zM1,0.5h0.5v0.5h-0.5z',
    },
    {
      paint: 'roofB',
      d: 'M-0.5,-2h0.5v0.5h-0.5zM-1.5,-1h1.5v0.5h-1.5zM-2,-0.5h2.5v0.5h-2.5zM-2.5,0h3.5v0.5h-3.5zM-2,0.5h0.5v0.5h-0.5zM-1,0.5h1v0.5h-1zM0.5,0.5h0.5v0.5h-0.5z',
    },
    {
      paint: 'snowCap',
      d: 'M1,-2.5h0.5v0.5h-0.5zM-1,-2h0.5v0.5h-0.5zM0,-2h2v0.5h-2zM-1,-1.5h1.5v0.5h-1.5z',
    },
  ],
  pixels: 50,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'shadow', d: 'M1.5,0.5h0.5v0.5h-0.5z' },
    {
      paint: 'bareBranch',
      d: 'M2.5,-2h0.5v2.5h-0.5zM-2.5,-1.5h0.5v2.5h-0.5zM-1,-1h0.5v0.5h-0.5zM-1.5,-0.5h0.5v0.5h-0.5zM0,0h0.5v0.5h-0.5z',
    },
    {
      paint: 'firewoodLog',
      d: 'M0,-1h1.5v0.5h-1.5zM0,-0.5h2.5v0.5h-2.5zM-0.5,0h0.5v0.5h-0.5zM0.5,0h2v0.5h-2zM0.5,0.5h1v0.5h-1z',
    },
    {
      paint: 'roofB',
      d: 'M-0.5,-1h0.5v0.5h-0.5zM-1,-0.5h1v0.5h-1zM-1.5,0h1v0.5h-1zM-1.5,0.5h2v0.5h-2z',
    },
    {
      paint: 'snowCap',
      d: 'M-1.5,-3.5h2.5v0.5h-2.5zM-2.5,-3h5.5v0.5h-5.5zM-2,-2.5h4.5v0.5h-4.5zM0.5,-2h1v0.5h-1z',
    },
    {
      paint: 'sledWood',
      d: 'M-3,-2.5h1v0.5h-1zM2.5,-2.5h1v0.5h-1zM-3,-2h3.5v0.5h-3.5zM1.5,-2h1v0.5h-1zM-0.5,-1.5h2.5v0.5h-2.5z',
    },
  ],
  pixels: 83,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
