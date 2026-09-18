import type { AssetColors } from '../../palette.js';
import { at, ellipse, giwaRoof, jar, material, path, stroke } from './korean-rural-shapes.js';

export function svgHanok(x: number, y: number, c: AssetColors, v: number): string {
  const variant = v % 3;
  const wall = material(c.wall, c);
  const wood = material(c.trunk, c);
  const span = [8.3, 9.1, 7.8][variant];
  const rise = [4.1, 3.6, 4.9][variant];
  return at(
    x,
    y,
    `<g opacity="0.18">${ellipse(0.6, 1.8, 7.7, 1.3, c.shadow)}</g>` +
      path('M-7,-0.6 L0,2.9 L7.4,-0.4 L0.1,-4Z', c.rock) +
      path('M-7,-0.6 L0,2.9 L0,3.5 L-7,0Z', c.boulder) +
      path('M-6,-7.1 L0,-4.3 V1.7 L-6,-1.1Z', wall.light) +
      path('M0,-4.3 L6.2,-7.2 V-1.2 L0,1.7Z', wall.dark) +
      path('M-5.7,-1.5 L0,1.2 L5.9,-1.5 L5.9,-0.7 L0,2 L-5.7,-0.7Z', wood.base) +
      `<g data-part="wooden-lattice">` +
      path('M-4.9,-5.5 L-1,-3.6 V-0.1 L-4.9,-2Z', c.sail) +
      path('M0.9,-3.6 L4.8,-5.5 V-2 L0.9,-0.1Z', c.wall) +
      stroke(
        'M-5.8,-6.9 V-1.1 M0,-4.5 V1.7 M6,-7 V-1.1 M-4.9,-5.5 V-2 L-1,-0.1 V-3.6Z M-3.6,-4.9 V-1.3 M-2.3,-4.2 V-0.7 M-4.9,-3.8 L-1,-1.9 M0.9,-3.6 V-0.1 L4.8,-2 V-5.5Z M2.2,-4.2 V-0.7 M3.5,-4.9 V-1.4 M0.9,-1.8 L4.8,-3.7',
        wood.base,
        0.35,
      ) +
      '</g>' +
      (variant === 1
        ? path('M-6.4,-0.3 L-3.7,1 L-5.2,1.8 L-7.8,0.5Z', c.path)
        : path('M1.1,1.5 L3.8,0.2 L5,0.9 L2.3,2.3Z', c.path)) +
      (variant === 2 ? jar(-6.3, -0.2, 1.15, 2.7, c) : '') +
      at(0, -7.5, giwaRoof(c, span, rise)),
  );
}

export function svgPavilion(x: number, y: number, c: AssetColors, v: number): string {
  const variant = v % 3;
  const wood = material(c.trunk, c);
  const span = [7.8, 8.5, 7.2][variant];
  const platform = variant === 1 ? 6.5 : 5.7;
  return at(
    x,
    y,
    `<g opacity="0.18">${ellipse(0.5, 1.8, 6.4, 1.1, c.shadow)}</g>` +
      path(`M${-platform},-0.7 L0,2.7 L${platform},-0.7 L0,-4Z`, c.rock) +
      path(`M${-platform},-0.7 V0.2 L0,3.4 V2.7Z`, c.boulder) +
      path('M-5,-1.4 L0,1.4 L5,-1.4 L0,-4.2Z', wood.light) +
      stroke('M-3.5,-1.8 L1.2,0.7 M-1.8,-2.8 L3,-0.2', wood.base, 0.26) +
      `<g data-part="open-pillars">` +
      path('M-4.8,-8 V-1.4 L-4.1,-1 V-7.7Z M-0.4,-10.1 V-3.5 L0.4,-3.3 V-10Z', wood.dark) +
      path('M-0.4,-5.8 V1.5 L0.4,1.3 V-6.1Z M4.1,-7.7 V-1 L4.8,-1.4 V-8Z', wood.base) +
      stroke('M-4.7,-7.8 V-1.4 M-0.3,-5.7 V1.2 M4.2,-7.7 V-1.2', wood.light, 0.22) +
      '</g>' +
      stroke(
        'M-4.7,-3.4 L0,-0.8 L4.7,-3.4 M-3.1,-2.5 V-0.6 M-1.6,-1.6 V0.1 M1.7,-1.7 V0 M3.2,-2.6 V-0.8',
        wood.base,
        0.45,
      ) +
      path('M-1,2 L1.3,0.8 L3.4,1.8 L1.2,3Z', c.path) +
      at(0, -7.8, giwaRoof(c, span, [4.4, 3.8, 5][variant])),
  );
}

export function svgStoneWall(x: number, y: number, c: AssetColors, v: number): string {
  const variant = v % 3;
  const stone = material(c.rock, c);
  const height = [3.7, 4.7, 4.1][variant];
  const end = [6.6, 5.7, 7.4][variant];
  return at(
    x,
    y,
    path(`M-7,0 L${end},6 L8,4.5 L-5.5,-1.5Z`, stone.dark) +
      path(`M-7,${-height} L${end},${5 - height} V5.6 L-7,-0.4Z`, stone.base) +
      path(`M${end},${5 - height} L8,${3.5 - height} V4 L${end},5.6Z`, stone.dark) +
      path(
        `M-6.6,${1 - height} l2.2,0.9 v1.1 l-2.2,-0.9Z M-3.9,${2.1 - height} l2.4,1 v1.1 l-2.4,-1Z M-0.9,${3.2 - height} l2.3,1 v1.1 l-2.3,-1Z M2,${4.4 - height} l2.5,1 v1.1 l-2.5,-1Z`,
        stone.light,
      ) +
      stroke(
        `M-7,${-height + 1.9} L${end},${6.9 - height} M-4.1,${-height + 1.2} v1.6 M-1,${-height + 2.3} v1.6 M2,${-height + 3.5} v1.6 M-5.5,${-height + 2.6} v1.1 M0.5,${-height + 4.8} v1.1`,
        stone.dark,
        0.25,
      ) +
      path(
        `M-7.5,${-height - 0.4} L-5.8,${-height - 1.4} L8.2,${3.6 - height} L${end},${5.3 - height}Z`,
        c.anvil,
      ) +
      stroke(
        `M-7.4,${-height - 0.5} L${end},${4.8 - height} M-4.9,${-height + 0.3} l1.3,-0.7 M-1.5,${-height + 1.5} l1.3,-0.7 M1.9,${-height + 2.7} l1.3,-0.7 M5.3,${-height + 3.9} l1.3,-0.7`,
        stone.light,
        0.35,
      ) +
      (variant === 2
        ? path('M-6.8,-0.3 l1.3,0.5 l-0.1,-0.8 l-0.7,-0.1Z M4.4,5.1 l1,0.2 l0.2,-0.8Z', c.moss)
        : ''),
    'stacked-stones',
  );
}

export function svgOnggi(x: number, y: number, c: AssetColors, v: number): string {
  const variant = v % 3;
  const positions = [
    [
      [-3, -0.5, 1.6, 3.8],
      [1, -1.1, 2.15, 5.5],
      [3.9, 1, 1.45, 2.9],
    ],
    [
      [-3.6, -0.1, 1.7, 4.6],
      [0.1, 0.5, 2.25, 5.9],
      [4.1, 0.2, 1.25, 2.4],
    ],
    [
      [-3.8, -1, 1.5, 3.4],
      [-0.2, -1.5, 1.8, 4.7],
      [3.5, -0.7, 1.8, 5.2],
      [0.4, 1.4, 1.5, 2.8],
    ],
  ][variant];
  return at(
    x,
    y,
    path('M-6,-0.5 L0,2.7 L6.2,-0.3 L0,-3.4Z', c.rock) +
      path('M-6,-0.5 V0.2 L0,3.4 L6.2,0.4 V-0.3 L0,2.7Z', c.boulder) +
      positions.map(([px, py, radius, height]) => jar(px, py, radius, height, c)).join(''),
    'earthenware-jars',
  );
}
