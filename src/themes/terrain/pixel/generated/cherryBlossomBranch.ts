import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    { paint: 'cherryBranch', d: 'M1,-2h0.5v0.5h-0.5zM0,-1h0.5v0.5h-0.5zM-0.5,-0.5h1v1h-1z' },
    {
      paint: [
        ['blossomPink', 0.83],
        ['cherryTrunk', 0.17],
      ],
      d: 'M1.5,-4h0.5v0.5h-0.5zM1,-3.5h1v0.5h-1zM0,-3h1.5v0.5h-1.5zM0.5,-2.5h0.5v1h-0.5zM-0.5,-1.5h1.5v0.5h-1.5z',
    },
    { paint: 'blossomPink', d: 'M0.5,-4h1v0.5h-1zM0,-3.5h1v0.5h-1zM-0.5,-2.5h1v1h-1z' },
    {
      paint: [
        ['blossomPink', 0.4],
        ['blossomWhite', 0.6],
      ],
      d: 'M1.5,-3h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['blossomWhite', 0.83],
        ['cherryTrunk', 0.17],
      ],
      d: 'M1,-2.5h1.5v0.5h-1.5zM1.5,-2h0.5v0.5h-0.5z',
    },
  ],
  pixels: 30,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'cherryBranch',
      d: 'M-1,-2h0.5v0.5h-0.5zM-1.5,-1.5h1.5v1h-1.5zM-1,-0.5h1.5v0.5h-1.5zM-0.5,0h0.5v0.5h-0.5z',
    },
    {
      paint: [
        ['blossomPink', 0.83],
        ['cherryTrunk', 0.17],
      ],
      d: 'M-4.5,-2.5h0.5v0.5h-0.5zM-3.5,-2.5h1v0.5h-1zM-4,-2h1.5v0.5h-1.5zM-1.5,-2h0.5v0.5h-0.5zM-3.5,-1.5h0.5v0.5h-0.5zM-2.5,-1.5h1v0.5h-1z',
    },
    { paint: 'blossomPink', d: 'M-4,-3h1.5v0.5h-1.5zM-4,-2.5h0.5v0.5h-0.5zM-2.5,-2.5h1v1h-1z' },
    {
      paint: [
        ['blossomWhite', 0.83],
        ['cherryTrunk', 0.17],
      ],
      d: 'M-1,-3h0.5v0.5h-0.5zM-1.5,-2.5h1v0.5h-1z',
    },
    { paint: 'blossomWhite', d: 'M-1.5,-3h0.5v0.5h-0.5z' },
  ],
  pixels: 33,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant0];
