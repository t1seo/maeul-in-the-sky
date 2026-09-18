import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'cherryTrunk', d: 'M-0.5,-1h1v2.5h-1z' },
    {
      paint: [
        ['cherryPetalPink', 0.83],
        ['cherryTrunk', 0.17],
      ],
      d: 'M0.5,-4h0.5v1h-0.5zM-2.5,-3h0.5v1h-0.5zM-0.5,-3h1.5v0.5h-1.5zM-1.5,-2.5h2v0.5h-2zM-2,-2h2v0.5h-2zM0.5,-2h1.5v0.5h-1.5zM-2,-1.5h4v0.5h-4z',
    },
    {
      paint: 'cherryPetalPink',
      d: 'M-1.5,-4h0.5v0.5h-0.5zM-0.5,-4h1v1h-1zM-2,-3.5h1v0.5h-1zM-2,-3h1.5v0.5h-1.5zM-2,-2.5h0.5v0.5h-0.5zM0.5,-2.5h1v0.5h-1zM0,-2h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['blossomWhite', 0.6],
        ['cherryPetalPink', 0.4],
      ],
      d: 'M-1,-4h0.5v1h-0.5z',
    },
  ],
  pixels: 52,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'cherryTrunk', d: 'M-0.5,-0.5h1v2h-1z' },
    {
      paint: [
        ['cherryPetalPink', 0.82],
        ['cherryTrunk', 0.18],
      ],
      d: 'M0,-2.5h2.5v0.5h-2.5zM-1,-2h3.5v0.5h-3.5zM-1.5,-1.5h4v0.5h-4zM-2,-1h4v0.5h-4z',
    },
    {
      paint: 'cherryPetalPink',
      d: 'M-1.5,-3.5h2v0.5h-2zM-2,-3h3.5v0.5h-3.5zM-2.5,-2.5h2.5v0.5h-2.5zM-2.5,-2h1.5v0.5h-1.5zM-2.5,-1.5h1v0.5h-1z',
    },
  ],
  pixels: 57,
};
const variant2: PixelSprite = {
  layers: [
    { paint: 'cherryTrunk', d: 'M-1,-2h0.5v0.5h-0.5zM-0.5,-1.5h0.5v0.5h-0.5zM-0.5,-1h1v2.5h-1z' },
    {
      paint: [
        ['cherryPetalPink', 0.82],
        ['cherryTrunk', 0.18],
      ],
      d: 'M0.5,-3h1.5v0.5h-1.5zM-0.5,-2.5h3v1h-3zM-1.5,-1.5h0.5v1.5h-0.5zM0,-1.5h0.5v0.5h-0.5zM1.5,-1.5h1v1.5h-1zM-2.5,0h1v0.5h-1zM1.5,0h0.5v0.5h-0.5z',
    },
    {
      paint: 'cherryPetalPink',
      d: 'M-0.5,-4h1.5v0.5h-1.5zM-2,-3.5h3.5v0.5h-3.5zM-2,-3h2.5v0.5h-2.5zM-2.5,-2.5h2v0.5h-2zM-2.5,-2h1.5v0.5h-1.5zM-2.5,-1.5h1v1.5h-1z',
    },
  ],
  pixels: 68,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant2];
