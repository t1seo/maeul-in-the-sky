import type { PixelSprite } from '../types.js';
const variant0: PixelSprite = {
  layers: [
    {
      paint: 'birdhouseWood',
      d: 'M-2.5,-0.5h0.5v0.5h-0.5zM2,-0.5h0.5v1h-0.5zM-2.5,0h1v0.5h-1zM-2.5,0.5h5v0.5h-5zM-1,1h2v0.5h-2z',
    },
    { paint: 'gardenSoil', d: 'M-2,-0.5h0.5v0.5h-0.5zM-1.5,0h3.5v0.5h-3.5z' },
    { paint: 'tulipStem', d: 'M-1.5,-0.5h1v0.5h-1zM1.5,-0.5h0.5v0.5h-0.5z' },
    {
      paint: [
        ['cherryTrunk', 0.17],
        ['tulipRed', 0.83],
      ],
      d: 'M-2,-1h1.5v0.5h-1.5zM0,-1h0.5v0.5h-0.5zM-0.5,-0.5h1v0.5h-1z',
    },
    { paint: 'tulipRed', d: 'M-2,-1.5h1v0.5h-1z' },
    {
      paint: [
        ['cherryTrunk', 0.17],
        ['tulipYellow', 0.83],
      ],
      d: 'M-1,-1.5h0.5v0.5h-0.5zM0,-1.5h0.5v0.5h-0.5zM-0.5,-1h0.5v0.5h-0.5z',
    },
    { paint: 'tulipYellow', d: 'M-0.5,-2h1v0.5h-1zM-0.5,-1.5h0.5v0.5h-0.5z' },
    {
      paint: [
        ['cherryTrunk', 0.17],
        ['crocusPurple', 0.83],
      ],
      d: 'M1,-1h1v0.5h-1zM0.5,-0.5h1v0.5h-1z',
    },
    { paint: 'crocusPurple', d: 'M0.5,-1.5h1v0.5h-1zM0.5,-1h0.5v0.5h-0.5z' },
  ],
  pixels: 51,
};
const variant1: PixelSprite = {
  layers: [
    {
      paint: 'birdhouseWood',
      d: 'M-2.5,-0.5h0.5v0.5h-0.5zM2,-0.5h0.5v0.5h-0.5zM-2.5,0h1v0.5h-1zM-2.5,0.5h2.5v0.5h-2.5zM-0.5,1h0.5v0.5h-0.5z',
    },
    { paint: 'gardenSoil', d: 'M0,-0.5h0.5v0.5h-0.5zM-1,0h1.5v0.5h-1.5z' },
    {
      paint: [
        ['birdhouseWood', 0.75],
        ['shadow', 0.25],
      ],
      d: 'M-1,-1h0.5v0.5h-0.5zM0,-1h0.5v0.5h-0.5zM1,-0.5h0.5v0.5h-0.5zM-1.5,0h0.5v0.5h-0.5zM0.5,0h2v0.5h-2zM0,0.5h2.5v0.5h-2.5zM0,1h0.5v0.5h-0.5z',
    },
    { paint: 'tulipStem', d: 'M-0.5,-1h0.5v0.5h-0.5zM-2,-0.5h2v0.5h-2zM0.5,-0.5h0.5v0.5h-0.5z' },
    {
      paint: [
        ['cherryTrunk', 0.17],
        ['tulipRed', 0.83],
      ],
      d: 'M-1.5,-1.5h0.5v0.5h-0.5zM-2,-1h1v0.5h-1zM1,-1h0.5v0.5h-0.5zM2,-1h0.5v0.5h-0.5zM1.5,-0.5h0.5v0.5h-0.5z',
    },
    { paint: 'tulipRed', d: 'M-2,-1.5h0.5v0.5h-0.5zM1.5,-1h0.5v0.5h-0.5z' },
    {
      paint: [
        ['cherryTrunk', 0.17],
        ['tulipYellow', 0.83],
      ],
      d: 'M-1,-1.5h1v0.5h-1z',
    },
    { paint: 'tulipYellow', d: 'M-1,-2h1v0.5h-1z' },
    {
      paint: [
        ['cherryTrunk', 0.17],
        ['crocusPurple', 0.83],
      ],
      d: 'M0,-1.5h0.5v0.5h-0.5zM1,-1.5h0.5v0.5h-0.5zM0.5,-1h0.5v0.5h-0.5z',
    },
    { paint: 'crocusPurple', d: 'M0.5,-1.5h0.5v0.5h-0.5z' },
  ],
  pixels: 50,
};
export const sprites: readonly PixelSprite[] = [variant0, variant1, variant0];
