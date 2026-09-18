import type { AssetColors } from '../../palette.js';
import {
  at,
  ellipse,
  giwaRoof,
  jar,
  material,
  path,
  stroke,
  thatchRoof,
} from './korean-rural-shapes.js';

export function svgChoga(x: number, y: number, c: AssetColors, v: number): string {
  const variant = v % 3;
  const plaster = material(c.wall, c);
  const width = [7.5, 8.4, 7][variant];
  return at(
    x,
    y,
    path('M-6.6,-0.6 L0,2.8 L6.8,-0.6 L0,-4Z', c.path) +
      path('M-5.5,-5.8 L0,-3.1 V1.6 L-5.5,-1.1Z', plaster.light) +
      path('M0,-3.1 L5.8,-5.8 V-1.2 L0,1.6Z', plaster.dark) +
      path('M-3.8,-3.8 L-1.5,-2.7 V0.6 L-3.8,-0.5Z', c.trunk) +
      path('M1,-2.4 L3.6,-3.7 V-1.5 L1,-0.2Z', c.sail) +
      stroke('M2.2,-3 V-0.8 M1,-1.4 L3.6,-2.7 M-5.4,-1.2 L0,1.4 L5.7,-1.2', c.fence, 0.35) +
      (variant === 1
        ? at(-4.5, -1.2, path('M-2,-2.7 L0,-3.6 L1.3,-1.4 L-0.8,-0.6Z', c.haystack))
        : jar(4.8, 0, 1.1, 2.5, c)) +
      at(0, -6.3, thatchRoof(c, width, [3.7, 3.1, 4.5][variant])) +
      (variant === 2 ? path('M-6,-4 V-7 L-5,-7.4 V-4.3Z', c.chimney) : ''),
    'choga-home',
  );
}

function waterwheel(c: AssetColors, radius: number): string {
  const timber = material(c.trunk, c);
  const width = radius * 0.7;
  return (
    path(
      `M${-width},0 a${width},${radius} 0 1 0 ${width * 2},0 a${width},${radius} 0 1 0 ${-width * 2},0Z M${-width * 0.68},0 a${width * 0.68},${radius * 0.72} 0 1 1 ${width * 1.36},0 a${width * 0.68},${radius * 0.72} 0 1 1 ${-width * 1.36},0Z`,
      timber.dark,
      'fill-rule="evenodd"',
    ) +
    stroke(
      `M${-width},0 a${width},${radius} 0 1 0 ${width * 2},0 a${width},${radius} 0 1 0 ${-width * 2},0 M0,${-radius} V${radius} M${-width},0 H${width} M${-width * 0.7},${-radius * 0.7} L${width * 0.7},${radius * 0.7} M${width * 0.7},${-radius * 0.7} L${-width * 0.7},${radius * 0.7}`,
      timber.light,
      0.55,
    ) +
    ellipse(0, 0, 0.6, 0.75, c.anvil)
  );
}

export function svgKoreanWatermill(x: number, y: number, c: AssetColors, v: number): string {
  const variant = v % 3;
  const wall = material(c.wall, c);
  return at(
    x,
    y,
    path('M-8.4,-0.6 L0,3.6 L8.7,-0.5 L0,-4.8Z', c.rock) +
      path('M3.5,-4.6 L10,0 L5.3,3.1 L2.9,1.5 L6.9,-0.3 L1.2,-4Z', c.canal) +
      path('M4,-3.8 L8.8,0 L5.1,2.2 L4.3,1.7 L7.5,-0.2 L3.1,-3.2Z', c.waterLight) +
      path('M-7,-7.2 L-1,-4.5 V1.5 L-7,-1.4Z', wall.light) +
      path('M-1,-4.5 L4,-7 V-1 L-1,1.5Z', wall.dark) +
      path('M-5.8,-4.9 L-3.2,-3.7 V0.3 L-5.8,-0.9Z', c.trunk) +
      stroke('M-6.8,-6.9 V-1.5 M-1,-4.4 V1.3 M3.8,-6.6 V-1 M-4.4,-4.4 V-0.4', c.fence, 0.42) +
      at(-1.7, -7.7, thatchRoof(c, [7.5, 8.4, 7.2][variant], [3.6, 3, 4.5][variant])) +
      at([4.6, 5.1, 4.4][variant], -1.2, waterwheel(c, [3.4, 3.8, 3.1][variant])) +
      path('M-7.1,-0.6 L-2.8,1.4 L-3.9,2 L-8.3,0Z', c.path),
    'water-powered-mill',
  );
}

export function svgHanokGate(x: number, y: number, c: AssetColors, v: number): string {
  const variant = v % 3;
  const wood = material(c.trunk, c);
  const stone = material(c.rock, c);
  const top = [-7.6, -8.8, -7.3][variant];
  return at(
    x,
    y,
    path('M-7.5,-1 L0,2.8 L8,-1 L0,-5Z', stone.base) +
      path('M-7.5,-1 V0 L0,3.8 L8,0 V-1 L0,2.8Z', stone.dark) +
      path(
        `M-4.8,${top} L-3.7,${top + 0.5} V0 L-4.8,-0.5Z M3.7,${top - 0.5} L4.8,${top - 1} V-0.5 L3.7,0Z`,
        wood.base,
      ) +
      path(
        `M-4.8,${top} L0,${top + 2.4} L4.8,${top} V${top + 1.2} L0,${top + 3.6} L-4.8,${top + 1.2}Z`,
        wood.dark,
      ) +
      path('M-3.7,-4.8 L-1.4,-3.7 V0.2 L-3.7,-0.9Z M1.4,-3.7 L3.7,-4.8 V-0.9 L1.4,0.2Z', c.roofA) +
      stroke(
        'M-3,-4.3 V-0.7 M-2.2,-3.9 V-0.3 M2.2,-3.9 V-0.3 M3,-4.3 V-0.7 M-3.5,-2.4 L-1.7,-1.5 M1.7,-1.5 L3.5,-2.4',
        wood.light,
        0.3,
      ) +
      path(
        'M-5.4,-1.4 L-3.3,-0.3 L-3.3,0.6 L-5.4,-0.5Z M3.3,-0.3 L5.4,-1.4 V-0.5 L3.3,0.6Z',
        stone.light,
      ) +
      (variant === 2
        ? path(
            'M-8.5,-2.8 L-5.1,-1.1 V-3.5 L-8.5,-5.1Z M5.1,-1.1 L8.5,-2.8 V-5.1 L5.1,-3.5Z',
            c.wall,
          )
        : '') +
      at(0, top - 0.3, giwaRoof(c, [8.5, 7.9, 9.2][variant], [4.2, 4.4, 3.7][variant])),
    'courtyard-gate',
  );
}

function estateWing(c: AssetColors, width: number, roofHeight: number): string {
  const wall = material(c.wall, c);
  return (
    path(`M${-width + 1},-4.7 L0,-2 V1.4 L${-width + 1},-1.3Z`, wall.light) +
    path(`M0,-2 L${width - 1},-4.7 V-1.3 L0,1.4Z`, wall.dark) +
    stroke(
      `M${-width + 1},-4.5 V-1.4 M0,-1.9 V1.3 M${width - 1},-4.5 V-1.4 M-2,-3.2 V0.2 M2,-3.2 V0.2 M${-width + 1},-2.7 L0,-0.1 L${width - 1},-2.7`,
      c.trunk,
      0.42,
    ) +
    at(0, -5.4, giwaRoof(c, width, roofHeight, 2.3))
  );
}

export function svgHanokEstate(x: number, y: number, c: AssetColors, v: number): string {
  const variant = v % 3;
  const stone = material(c.rock, c);
  const courtyard = material(c.path, c);
  return at(
    x,
    y,
    path('M-10.5,-1.8 L-0.2,4.3 L10.8,-0.8 L0.6,-6.8Z', stone.dark) +
      path('M-10.5,-2.5 L-0.2,3.5 L10.8,-1.6 L0.6,-7.6Z', courtyard.light) +
      at(0, -5.5, estateWing(c, [8.5, 9.3, 8][variant], [4.2, 3.7, 4.8][variant])) +
      at(-6, -0.7, estateWing(c, [4.7, 4.4, 5][variant], 2.5)) +
      (variant === 1
        ? stroke(
            'M3.2,-5.6 V0.6 M6.6,-4.1 V2 M9.8,-5.6 V0.4 M3.2,-1.4 L6.6,0.2 L9.8,-1.4',
            c.trunk,
            0.65,
          )
        : at(6.1, -0.9, estateWing(c, 4.3, 2.4))) +
      path('M-2.8,1 L0,2.5 L3,1.1 L3,1.7 L0,3.2 L-2.8,1.7Z', c.rock) +
      path('M-1.3,2.6 L0.1,3.3 L1.8,2.5 L3.4,3.3 L1.3,4.3 L-0.5,3.4Z', c.path) +
      (variant === 1 ? at(6.6, -6.3, giwaRoof(c, 4.5, 2.4)) : jar(3.1, 0.6, 1, 2.4, c)) +
      (variant === 2 ? path('M-0.5,-0.2 L0.2,0.2 L1.3,-0.4 L0.6,-0.8Z', c.manorGarden) : ''),
    'hanok-courtyard-estate',
  );
}
