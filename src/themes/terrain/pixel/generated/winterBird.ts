import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'bareBranch',
      d: 'M-1,-0.5h0.5v0.5h-0.5zM0.5,-0.5h0.5v0.5h-0.5zM-1.5,0h1v0.5h-1zM0,0h1v0.5h-1z',
    },
    {
      paint: 'winterBirdRed',
      d: 'M-1,-3.5h1v0.5h-1zM-1.5,-3h1.5v0.5h-1.5zM-2,-2.5h2.5v0.5h-2.5zM-1,-2h1v1h-1zM1,-2h1.5v1h-1.5zM-2,-1.5h0.5v0.5h-0.5zM-1.5,-1h1.5v0.5h-1.5zM0.5,-1h0.5v0.5h-0.5zM2,-1h0.5v0.5h-0.5zM-0.5,-0.5h1v0.5h-1z',
    },
    { paint: 'scarfRed', d: 'M0,-2h1v1h-1zM0,-1h0.5v0.5h-0.5zM1,-1h1v0.5h-1z' },
    { paint: 'snowmanCoal', d: 'M-1.5,-2h0.5v1h-0.5z' },
    { paint: 'snowmanCarrot', d: 'M-2.5,-2h1v0.5h-1z' },
  ],
  pixels: 45,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'bareBranch', d: 'M-1.5,0h1v0.5h-1zM0,0h1v0.5h-1z' },
    {
      paint: 'winterBirdBrown',
      d: 'M-1,-3.5h0.5v0.5h-0.5zM-2,-3h2.5v0.5h-2.5zM-2,-2.5h0.5v0.5h-0.5zM-0.5,-2.5h1.5v0.5h-1.5zM0.5,-2h1.5v0.5h-1.5zM-2,-1.5h0.5v0.5h-0.5zM1,-1.5h1.5v0.5h-1.5zM-1.5,-1h3v0.5h-3zM2,-1h0.5v0.5h-0.5zM-1,-0.5h0.5v0.5h-0.5zM0,-0.5h1v0.5h-1z',
    },
    { paint: 'firewoodLog', d: 'M0,-2h0.5v0.5h-0.5zM0,-1.5h1v0.5h-1zM1.5,-1h0.5v0.5h-0.5z' },
    { paint: 'winterBirdRed', d: 'M-1.5,-2.5h1v0.5h-1zM-1.5,-2h1.5v1h-1.5z' },
    { paint: 'snowCap', d: 'M-0.5,-0.5h0.5v0.5h-0.5z' },
    { paint: 'snowmanCarrot', d: 'M-2.5,-2h1v0.5h-1z' },
  ],
  pixels: 46,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'bareBranch', d: 'M-1,-0.5h0.5v0.5h-0.5zM-1.5,0h1v0.5h-1zM0,0h1v0.5h-1z' },
    {
      paint: 'winterBirdBrown',
      d: 'M-1.5,-3h1.5v0.5h-1.5zM-2,-2.5h2.5v0.5h-2.5zM-0.5,-2h1v1h-1zM1,-2h0.5v0.5h-0.5zM-2,-1.5h0.5v0.5h-0.5zM1,-1.5h1.5v0.5h-1.5zM-1.5,-1h1.5v0.5h-1.5zM0.5,-1h0.5v0.5h-0.5zM2,-1h0.5v0.5h-0.5zM-0.5,-0.5h1v0.5h-1z',
    },
    { paint: 'firewoodLog', d: 'M0.5,-2h0.5v1h-0.5zM0,-1h0.5v0.5h-0.5zM1,-1h1v0.5h-1z' },
    { paint: 'wall', d: 'M-1.5,-2h1v1h-1z' },
    { paint: 'snowmanCarrot', d: 'M-2.5,-2h1v0.5h-1z' },
  ],
  pixels: 40,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
