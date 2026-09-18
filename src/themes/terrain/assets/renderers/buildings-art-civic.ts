import type { AssetColors } from '../../palette.js';
import { ellipse, group, material, path, polygon, stroke } from './buildings-art-shapes.js';

export function castle(x: number, y: number, c: AssetColors): string {
  const stone = material(c.castle, c);
  const roof = material(c.castleRoof, c);
  return group(
    x,
    y,
    polygon('-0.9,-9.7 0.4,-9.2 0.4,-3 -0.9,-3.5', stone.light),
    polygon('0.4,-9.2 1.6,-9.8 1.6,-3.6 0.4,-3', stone.dark),
    polygon('-1.4,-9.8 0,-12.4 0.4,-9', roof.light),
    polygon('0,-12.4 2,-9.9 0.4,-9', roof.dark),
    polygon('-3.5,-5.9 0.4,-4.4 3.5,-5.9 3.5,-0.7 0.4,0.7 -3.5,-0.8', stone.base),
    polygon('0.4,-4.4 3.5,-5.9 3.5,-0.7 0.4,0.7', stone.dark),
    path(
      'M-3.5,-5.9 V-7.1 L-2.6,-6.8 V-6 L-1.8,-5.7 V-6.5 L-0.8,-6.1 V-5.3 L0.2,-4.9 V-5.7 L1.1,-6.1 V-5.3 L2,-5.7 V-6.5 L2.8,-6.9 V-6.1 L3.5,-6.4 V-5.9 L0.4,-4.4Z',
      stone.light,
    ),
    path('M-2.5,-0.5 V-2.5 Q-1.5,-4.4 -0.5,-1.8 V0.3Z', c.shadow),
    path('M-2.3,-0.4 V-2.2 Q-1.5,-3.7 -0.7,-1.8 V0.2Z', c.trunk),
    stroke('M-1.8,-2.4 V-0.3 M-1.3,-2.2 V-0.1', c.fence, 0.2),
    path(
      'M1.2,-4.1 L1.7,-4.3 V-2.7 L1.2,-2.5Z M2.3,-4.6 L2.8,-4.8 V-3.2 L2.3,-3Z M-0.5,-8.7 L0,-8.5 V-7.2 L-0.5,-7.4Z',
      c.shadow,
    ),
    stroke('M-3.3,-3.9 L-2.5,-3.6 M-0.7,-3 L0.3,-2.6 M1,-1.3 L2,-1.8', stone.dark, 0.18),
  );
}

export function cathedral(x: number, y: number, c: AssetColors): string {
  const stone = material(c.cathedral, c);
  const roof = material(c.roofA, c);
  return group(
    x,
    y,
    polygon('-3.5,-5.8 -1.5,-8.7 0.8,-5.2 0.8,1.7 -3.5,0', stone.light),
    polygon('0.8,-5.2 3.7,-6.5 3.7,0.4 0.8,1.7', stone.dark),
    polygon('-4.1,-5.8 -1.6,-9.5 1.4,-5.3 0.8,-4.8', roof.light),
    polygon('-1.6,-9.5 1.2,-10.6 4.4,-6.6 1.4,-5.3', roof.base),
    path(
      'M-3.5,0 V-6.3 H-2.9 V0.2Z M0.1,1.4 V-4.8 H0.8 V1.7Z M1.5,1.2 V-4.8 L2,-5 V1Z M3,0.6 V-5.5 L3.6,-5.8 V0.4Z',
      stone.base,
    ),
    path('M-2.4,0.4 V-2.1 L-1.3,-3.8 -0.3,-1.4 V1.2Z', c.shadow),
    path('M-2.1,0.5 V-1.8 L-1.3,-3 -0.6,-1.3 V1Z', c.trunk),
    ellipse(-1.4, -5.5, 1.05, 1.18, c.chimney),
    ellipse(-1.4, -5.6, 0.78, 0.88, c.cathedralWindow),
    stroke(
      'M-1.4,-6.4 V-4.8 M-2.1,-5.6 H-0.7 M-1.9,-6.1 L-0.9,-5.1 M-1.9,-5.1 L-0.9,-6.1',
      c.wall,
      0.16,
    ),
    path('M2.2,-1.2 V-3.8 L2.6,-4.8 2.9,-4.1 V-1.5Z', c.cathedralWindow),
    polygon('-3.9,-5.7 -3.9,-8.1 -3.4,-8.4 -2.9,-7.9 -2.9,-5.4', stone.base),
    polygon('-4.2,-8 -3.5,-10.8 -2.7,-7.8', roof.dark),
    stroke('M-1.6,-11.9 V-9.5 M-2.3,-11 H-0.9', c.church, 0.33),
  );
}

export function gatehouse(x: number, y: number, c: AssetColors): string {
  const stone = material(c.gatehouse, c);
  return group(
    x,
    y,
    path(
      'M-3.4,0 V-6.5 L0.5,-5.3 3.3,-6.6 V-0.4 L1.4,0.5 V-2.8 Q0.4,-5.7 -0.9,-2.6 V0.7Z',
      stone.base,
    ),
    path('M0.5,-5.3 L3.3,-6.6 V-0.4 L1.4,0.5 V-2.8 Q1.1,-4.1 0.5,-4.3Z', stone.dark),
    path(
      'M-3.4,-6.5 V-7.5 L-2.4,-7.2 V-6.5 L-1.5,-6.2 V-6.9 L-0.4,-6.6 V-5.9 L0.5,-5.6 1.1,-5.9 V-6.6 L2,-7 V-6.3 L2.5,-6.6 V-7.3 L3.3,-7.6 V-6.6 L0.5,-5.3Z',
      stone.light,
    ),
    path(
      'M-0.9,0.7 V-2.6 Q0.4,-5.7 1.4,-2.8 V0.5 L0.8,0.8 V-2.7 Q0.1,-4.3 -0.5,-2.6 V0.9Z',
      c.chimney,
    ),
    stroke('M-0.3,-3.4 V-2 M0.2,-3.7 V-2 M0.7,-3.4 V-2 M-0.4,-2.4 H0.9', c.trunk, 0.2),
    path('M-2.7,-4.3 L-2,-4.1 V-2.8 L-2.7,-3Z M2,-4.6 L2.6,-4.9 V-3.6 L2,-3.3Z', c.shadow),
    stroke('M-3.3,-1.1 L-1.6,-0.6 M1.8,-0.8 L3.1,-1.4', stone.light, 0.3),
  );
}
