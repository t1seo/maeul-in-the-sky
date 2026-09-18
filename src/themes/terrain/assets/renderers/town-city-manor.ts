import type { AssetColors } from '../../palette.js';
import { group, material, path, polygon, stroke } from './buildings-art-shapes.js';

export function svgManor(x: number, y: number, c: AssetColors, _v: number): string {
  const wall = material(c.manor, c);
  const roof = material(c.roofA, c);
  return group(
    x,
    y,
    polygon('-4,-4.5 0.9,-3.2 0.9,1.7 -4,0.3', wall.light),
    polygon('0.9,-3.2 3.9,-4.6 3.9,0.3 0.9,1.7', wall.dark),
    polygon('-4.6,-4.6 -2,-7.3 1.9,-8.1 4.5,-4.6 0.9,-2.8', roof.base),
    polygon('-4.6,-4.6 -2,-7.3 -0.1,-6.2 0.9,-2.8', roof.light),
    polygon('1.8,-7.9 2.6,-8.3 2.6,-6.3 1.8,-5.9', c.chimney),
    polygon('1.5,-8.1 2.4,-8.6 2.9,-8.3 2,-7.8', c.wallShade),
    path(
      'M-3.3,-3.9 L-2.5,-3.7 V-2.6 L-3.3,-2.8Z M-1.8,-3.5 L-1,-3.3 V-2.2 L-1.8,-2.4Z M0,-3 L0.6,-2.8 V-1.8 L0,-2Z M1.6,-2.9 L2.3,-3.2 V-2 L1.6,-1.7Z M2.8,-3.5 L3.4,-3.8 V-2.5 L2.8,-2.2Z',
      c.lanternGlow,
    ),
    stroke('M-3.9,-1.9 L0.9,-0.6 3.8,-1.9', c.wallShade, 0.25),
    path('M-2,0.9 V-1 Q-1.3,-2.2 -0.6,-0.6 V1.3Z', c.trunk),
    polygon('-2.8,-1.5 -1.6,-2.8 -0.3,-2.4 0.4,-0.8 -1,-0.4', roof.base),
    path('M-2.5,-1.2 H-2.2 V0.7 H-2.5Z M-0.1,-0.6 H0.2 V1.4 H-0.1Z', c.wall),
    polygon('-2.7,0.9 -0.8,1.5 0.5,1 -0.7,0.6', c.chimney),
    polygon('-2.9,1.2 -0.8,1.9 0.7,1.3 0.7,1.6 -0.8,2.3 -2.9,1.6', c.wallShade),
    path(
      'M-4.4,0.5 Q-4.8,-0.6 -3.7,-0.7 Q-2.8,-0.4 -3,0.9Z M1.4,1.6 Q1.2,0.4 2.3,0.5 L3.8,-0.1 Q4.7,0.4 4.1,1.1 L2.2,2Z',
      c.manorGarden,
    ),
    stroke('M-4.2,0.1 L-3.4,0.4 M1.8,1.1 L3.9,0.3', c.leafLight, 0.23),
  );
}
