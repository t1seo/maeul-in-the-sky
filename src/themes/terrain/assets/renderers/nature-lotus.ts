import type { AssetColors } from '../../palette.js';
import { lotusBloom, lotusLeaf, naturePool } from './nature-water-shapes.js';

const LOTUS = [
  {
    leaves: [
      [-4.4, -0.6, 0.7],
      [1.5, -0.8, 0.9],
      [-1.2, 0.7, 0.85],
      [4.5, 0.3, 0.6],
    ],
    blooms: [
      [-3.4, -0.7, 0.8],
      [2.2, -0.6, 1.1],
      [0, 0.9, 0.62],
    ],
    reeds: 'M-5.8,-1 Q-6,-3.8 -5.4,-4.6 L-5.4,-1.4 Q-4.7,-3.9 -4.4,-3.4 L-4.9,-1.1Z',
  },
  {
    leaves: [
      [-4.5, 0.5, 0.8],
      [-1.7, -0.3, 0.95],
      [3.9, -1.8, 0.9],
    ],
    blooms: [
      [-2.5, -0.2, 1.25],
      [4.1, -1.9, 0.8],
    ],
    reeds:
      'M1.9,-1.9 Q1,-4 1.3,-4.8 L2.3,-2.2 Q2.6,-5.1 3,-5.2 L2.8,-2.1Z M-6,.6 Q-6.7,-1.3 -6.1,-2.5 L-5.5,.3Z',
  },
  {
    leaves: [
      [-4.6, -0.2, 0.75],
      [-1.8, -1.7, 0.9],
      [2.2, -1.4, 0.75],
      [4.7, 0, 0.8],
      [0.2, 1.1, 0.95],
    ],
    blooms: [
      [-4, -0.3, 0.75],
      [-0.7, -1.6, 1.4],
      [4.2, -0.1, 0.85],
      [0.5, 1, 0.75],
    ],
    reeds: 'M-5.8,-.8 Q-6.9,-3.4 -6.1,-3.8 L-5.5,-1.5 -5.1,-4.1 -4.9,-1.2Z',
  },
] as const;

export function svgLotusPond(x: number, y: number, c: AssetColors, v: number): string {
  const pond = LOTUS[v] ?? LOTUS[0];
  return (
    `<g transform="translate(${x},${y})">${naturePool(c, v)}` +
    `<path d="${pond.reeds}" fill="${c.reeds}"/>` +
    pond.leaves.map(([dx, dy, size]) => lotusLeaf(c, dx, dy, size)).join('') +
    pond.blooms.map(([dx, dy, size]) => lotusBloom(c, dx, dy, size)).join('') +
    '</g>'
  );
}
