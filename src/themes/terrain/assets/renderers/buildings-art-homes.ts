import type { AssetColors } from '../../palette.js';
import { ellipse, group, material, path, polygon, stroke } from './buildings-art-shapes.js';

export function house(x: number, y: number, c: AssetColors, v: number, roofColor?: string): string {
  const roof = material(v === 1 ? c.water : v === 2 ? c.pine : roofColor || c.roofA, c);
  return group(
    x,
    y,
    polygon('-3.1,-3.1 -1.6,-5.1 0.5,-2.4 0.5,1.5 -3.1,0', c.wall),
    polygon('0.5,-2.4 3.2,-3.7 3.2,0.1 0.5,1.5', c.wallShade),
    polygon('-3.6,-3.1 -1.6,-5.8 1.1,-2.5 0.5,-2.1', roof.light),
    polygon('-1.6,-5.8 1.2,-7.1 3.8,-3.8 1.1,-2.5', roof.base),
    stroke('M0.5,-2.1 L3.8,-3.5 V-3.8', roof.dark, 0.28),
    polygon('1.7,-6.8 2.5,-7.1 2.5,-5.3 1.7,-5', c.chimney),
    polygon('1.5,-7 2.3,-7.4 2.7,-7.1 1.9,-6.7', c.wallShade),
    path('M-2.4,0.3 V-1.5 Q-1.8,-2.5 -1.2,-1 V0.8Z', c.trunk),
    polygon('-0.8,-1.8 0,-1.5 0,-0.5 -0.8,-0.8', c.lanternGlow),
    polygon('1.3,-1.8 2.4,-2.3 2.4,-1.3 1.3,-0.8', c.lanternGlow),
    stroke('M1.8,-2 V-1 M-3,0 L0.5,1.5 3.2,0.1', c.chimney, 0.22),
    v === 1
      ? group(
          0.9,
          -4.7,
          polygon('-0.6,0.1 0,-1 0.7,-0.2 0.7,0.7 -0.6,1', c.wall),
          polygon('-0.8,0.1 0,-1.3 0.9,-0.2 0.7,0', roof.dark),
          polygon('-0.2,0 0.3,-0.1 0.3,0.5 -0.2,0.6', c.shadow),
        )
      : '',
    v === 2
      ? path(
          'M-3.8,0.4 Q-4.6,-0.5 -3.9,-1 Q-3.1,-1.4 -2.8,-0.4 L-2.8,0.8Z M1.8,1.2 Q1.9,0.1 2.9,0.2 Q3.8,-0.4 4,0.6 L3,1.4Z',
          c.manorGarden,
        )
      : '',
  );
}

export function cottage(x: number, y: number, c: AssetColors, v: number): string {
  const roof = material(v === 1 ? c.water : v === 2 ? c.pine : c.roofB, c);
  return group(
    x,
    y,
    polygon('-3.5,-2.6 0.7,-1.6 0.7,1 -3.5,0', c.wall),
    polygon('0.7,-1.6 3.6,-2.8 3.6,-0.2 0.7,1', c.wallShade),
    path('M-4.1,-2.5 Q-2.8,-4.1 -2.1,-5.5 L1.7,-6.3 Q2.7,-4.4 4.2,-3 L0.9,-1.1Z', roof.base),
    path('M-4.1,-2.5 Q-2.8,-4.1 -2.1,-5.5 L0.9,-1.1Z', roof.light),
    stroke('M-4.1,-2.5 L0.9,-1.1 4.2,-3', roof.dark, 0.4),
    polygon('-2.8,-2.3 -1.6,-2 -1.6,0.4 -2.8,0.1', c.trunk),
    polygon('-0.7,-1.7 0.1,-1.5 0.1,-0.6 -0.7,-0.8', c.lanternGlow),
    polygon('1.3,-1.4 2.7,-2 2.7,-1 1.3,-0.4', c.lanternGlow),
    stroke('M-3.4,-0.4 L0.7,0.6 M1.8,-1.5 V-0.7', c.fence, 0.22),
    v === 1
      ? group(
          -0.1,
          -4.4,
          path('M-0.6,-0.9 H0.5 V0.9 H-0.6Z', c.chimney),
          polygon('-0.8,-0.9 0,-1.3 0.7,-1 0,-0.6', c.wallShade),
        )
      : '',
    v === 2
      ? group(
          -0.6,
          1.2,
          polygon('-2,0 0,-0.5 1.4,0 0.6,0.8', c.gardenSoil),
          path(
            'M-1.6,-0.2 Q-1.8,-1.2 -1.2,-1.2 Q-0.4,-1.6 -0.2,-0.5 Q0.5,-1.2 0.9,-0.4 L0.7,0.3Z',
            c.manorGarden,
          ),
        )
      : '',
  );
}

export function church(x: number, y: number, c: AssetColors, v: number): string {
  const roof = material(c.roofA, c);
  const stone = material(c.church, c);
  if (v === 2)
    return group(
      x,
      y,
      polygon('-2.7,-2.5 -1.3,-4.2 0.4,-2.2 0.4,0.8 -2.7,-0.5', stone.light),
      polygon('0.4,-2.2 2.2,-3 2.2,0 0.4,0.8', stone.dark),
      polygon('-3,-2.7 -1.4,-4.7 0.5,-5.4 2.7,-3.2 0.4,-1.9', roof.base),
      polygon('-3,-2.7 -1.4,-4.7 0.4,-1.9', roof.light),
      path('M-1.8,-0.1 V-1.5 Q-1.3,-2.6 -0.7,-1.2 V0.4Z', c.trunk),
      stroke('M-1.4,-6.2 V-4.7 M-1.9,-5.7 H-0.9', c.church, 0.32),
      ellipse(-1.3, -3.1, 0.35, 0.4, c.cathedralWindow),
    );
  const bell = v === 1;
  return group(
    x,
    y,
    polygon('-2.9,-4.2 0,-3 0,1 -2.9,-0.3', stone.base),
    polygon('0,-3 3,-4.4 3,-0.4 0,1', stone.dark),
    polygon('-3.4,-4.2 -1.2,-6.8 1.6,-5.8 3.5,-4.3 0,-2.6', roof.base),
    polygon('-3.4,-4.2 -1.2,-6.8 0,-2.6', roof.light),
    polygon('-1.6,-8.7 0.2,-8 0.2,0.5 -1.6,-0.2', stone.light),
    polygon('0.2,-8 1.1,-8.5 1.1,0 0.2,0.5', stone.dark),
    bell
      ? path('M-1.9,-8.5 L-0.8,-10.2 0.5,-8.2 1.4,-8.7 -0.1,-10.6 -0.8,-10.2Z', roof.base)
      : polygon('-2,-8.6 -0.7,-11 1.5,-8.6 0.2,-7.9', roof.base),
    path('M-1.1,0 V-2 Q-0.6,-3.3 -0.1,-1.7 V0.4Z', c.trunk),
    bell
      ? path('M-1.25,-6.3 V-7.2 Q-0.7,-8.5 -0.15,-7 V-5.9Z', c.shadow)
      : polygon('-1.2,-7.3 -0.3,-6.9 -0.3,-5.9 -1.2,-6.3', c.cathedralWindow),
    bell
      ? path('M-1.1,-6.4 L-0.95,-7.1 -0.55,-7 -0.3,-6.1Z', c.wheat)
      : stroke('M-0.7,-12.3 V-11 M-1.3,-11.8 H-0.1', c.church, 0.32),
    path(
      'M1.6,-3.8 L2.2,-4.1 V-2.2 L1.6,-1.9Z M2.5,-4.2 L2.8,-4.3 V-2.5 L2.5,-2.3Z',
      c.cathedralWindow,
    ),
  );
}
