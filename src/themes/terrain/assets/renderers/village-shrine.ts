import type { AssetColors } from '../../palette.js';
import { ellipse, group, material, path, polygon, stroke, wheel } from './buildings-art-shapes.js';

export function svgShrine(x: number, y: number, c: AssetColors, _v: number): string {
  const stone = material(c.shrine, c);
  return group(
    x,
    y,
    polygon('-2.1,-0.5 0,-1.4 2,-0.5 0,0.5', stone.light),
    polygon('-2.1,-0.5 0,0.5 2,-0.5 2,0 0,0.9 -2.1,0', stone.dark),
    polygon('-1.2,-3.7 0.4,-3.1 0.4,0.1 -1.2,-0.5', stone.base),
    polygon('0.4,-3.1 1.4,-3.6 1.4,-0.4 0.4,0.1', stone.dark),
    polygon('-2,-3.5 -0.5,-5.1 1,-4.6 2,-3.6 0.3,-2.8', stone.light),
    polygon('-0.5,-5.1 1,-4.6 2,-3.6 0.3,-2.8', stone.dark),
    path('M-0.85,-1 V-2.5 Q-0.45,-3.4 0,-2.2 V-0.7Z', c.shadow),
    path('M-0.67,-1.2 L-0.55,-2 -0.22,-1.8 -0.13,-0.98Z', c.fountain),
    ellipse(-0.39, -2.2, 0.22, 0.25, stone.light),
    stroke('M-1.5,-0.7 L0.4,0.1 1.6,-0.5', stone.light, 0.2),
  );
}

export function svgWagon(x: number, y: number, c: AssetColors, _v: number): string {
  const wood = material(c.wagon, c);
  const cloth = material(c.sail, c);
  return group(
    x,
    y,
    stroke('M1.4,-0.9 L3.3,0 M0.8,-1.3 L3,-0.5', c.trunk, 0.3),
    polygon('-3.5,-2.4 0.2,-1.5 2.1,-2.4 2.1,-0.2 0.2,0.7 -3.5,-0.2', wood.base),
    polygon('0.2,-1.5 2.1,-2.4 2.1,-0.2 0.2,0.7', wood.dark),
    path('M-3.6,-2.3 Q-3.8,-5.2 -1.8,-5.1 L1,-4.6 Q2.5,-4.3 2.3,-2.5 L0.2,-1.6Z', cloth.base),
    path('M-3.6,-2.3 Q-3.8,-5.2 -1.8,-5.1 Q0.2,-4.7 0.2,-1.6Z', cloth.light),
    path('M0.2,-1.6 Q0.1,-4.6 -1.8,-5.1 L1,-4.6 Q2.5,-4.3 2.3,-2.5Z', cloth.dark),
    path('M-3,-2.2 Q-3.2,-4.4 -1.8,-4.3 Q-0.5,-4 -0.4,-1.9Z', c.trunk),
    path('M-3,-2.2 Q-3.2,-4.4 -1.8,-4.3 L-2.2,-2Z', cloth.base),
    stroke('M-0.9,-4.9 Q0.7,-4.3 0.9,-1.9 M0.1,-4.8 Q1.6,-4.2 1.7,-2.2', c.fence, 0.19),
    stroke('M-3.4,-0.9 L0.2,0 2,-0.9', wood.light, 0.24),
    wheel(-2.5, 0.3, 0.78, c),
    wheel(0.8, 0.45, 0.78, c),
  );
}
