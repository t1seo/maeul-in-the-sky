import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'cherryTrunk',
      d: 'M0.5,-2.5h0.5v0.5h-0.5zM0,-2h1v0.5h-1zM0,-1.5h0.5v1.5h-0.5zM0,0h1v2.5h-1z',
    },
    { paint: 'cherryBranch', d: 'M-0.5,-2h0.5v3.5h-0.5zM-1,1.5h1v1h-1z' },
    {
      paint: [
        ['cherryTrunk', 0.21],
        ['peachPink', 0.79],
      ],
      d: 'M-2,-7h3v0.5h-3zM-2.5,-6.5h0.5v0.5h-0.5zM0.5,-6.5h2v0.5h-2zM2,-6h1v1h-1zM-3,-5.5h0.5v0.5h-0.5zM-3.5,-5h0.5v2.5h-0.5zM2.5,-5h1v0.5h-1zM3,-4.5h0.5v1h-0.5zM-2,-3.5h0.5v0.5h-0.5zM1.5,-3.5h0.5v0.5h-0.5zM2.5,-3.5h1v0.5h-1zM1,-3h0.5v0.5h-0.5zM2,-3h1v0.5h-1zM-3,-2.5h2v0.5h-2zM-0.5,-2.5h1v0.5h-1zM1,-2.5h1.5v0.5h-1.5z',
    },
    {
      paint: 'peachPink',
      d: 'M-2,-6.5h0.5v0.5h-0.5zM-2.5,-6h0.5v0.5h-0.5zM-0.5,-6h2.5v0.5h-2.5zM-1,-5.5h3v0.5h-3zM-3,-5h5.5v0.5h-5.5zM-3,-4.5h6v1h-6zM-3,-3.5h0.5v0.5h-0.5zM-1.5,-3.5h3v0.5h-3zM-3,-3h4v0.5h-4zM-1,-2.5h0.5v0.5h-0.5z',
    },
    {
      paint: 'blossomWhite',
      d: 'M-1,-6.5h1.5v0.5h-1.5zM-2,-6h1.5v0.5h-1.5zM-2.5,-5.5h1.5v0.5h-1.5z',
    },
    {
      paint: 'sproutGreen',
      d: 'M-2.5,-3.5h0.5v0.5h-0.5zM2,-3.5h0.5v0.5h-0.5zM1.5,-3h0.5v0.5h-0.5z',
    },
    { paint: 'cherryPetalPink', d: 'M-1.5,-6.5h0.5v0.5h-0.5z' },
  ],
  pixels: 145,
};
const variant1: PixelSprite = {
  layers: [
    { paint: 'cherryTrunk', d: 'M0,-2h1v0.5h-1zM0,-1.5h0.5v1.5h-0.5zM0,0h1v2.5h-1z' },
    { paint: 'cherryBranch', d: 'M-0.5,-2h0.5v3.5h-0.5zM-1,1.5h1v1h-1z' },
    {
      paint: [
        ['cherryTrunk', 0.21],
        ['peachPink', 0.79],
      ],
      d: 'M0,-6h1v0.5h-1zM-1.5,-5.5h0.5v0.5h-0.5zM1,-5.5h0.5v0.5h-0.5zM1.5,-5h1v0.5h-1zM-2,-4.5h0.5v0.5h-0.5zM2,-4.5h0.5v1h-0.5zM-2.5,-4h0.5v0.5h-0.5zM-2,-3.5h0.5v0.5h-0.5zM1.5,-3.5h0.5v0.5h-0.5zM-2.5,-3h0.5v0.5h-0.5zM1,-3h0.5v0.5h-0.5zM2,-3h0.5v0.5h-0.5zM-2,-2.5h1.5v0.5h-1.5zM1,-2.5h1v0.5h-1z',
    },
    {
      paint: 'peachPink',
      d: 'M-1,-5.5h0.5v0.5h-0.5zM0.5,-5.5h0.5v0.5h-0.5zM0,-5h1.5v0.5h-1.5zM-0.5,-4.5h2.5v0.5h-2.5zM-2,-4h4v0.5h-4zM-1.5,-3.5h3v0.5h-3zM-2,-3h3v0.5h-3zM-0.5,-2.5h1.5v0.5h-1.5z',
    },
    { paint: 'blossomWhite', d: 'M-0.5,-5.5h1v0.5h-1zM-1.5,-5h1.5v0.5h-1.5zM-1.5,-4.5h1v0.5h-1z' },
    {
      paint: 'sproutGreen',
      d: 'M-2.5,-3.5h0.5v0.5h-0.5zM2,-3.5h0.5v0.5h-0.5zM1.5,-3h0.5v0.5h-0.5z',
    },
  ],
  pixels: 89,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant0];
