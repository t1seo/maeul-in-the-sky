import type { AssetColors } from '../../palette.js';
import { at, material, path, stroke } from './korean-rural-shapes.js';

export function svgRiceTerrace(x: number, y: number, c: AssetColors, v: number): string {
  const variant = v % 3;
  const earth = material(c.gardenSoil, c);
  const rows = variant === 1 ? 2 : 3;
  const terraces = Array.from({ length: rows }, (_, index) => {
    const width = 8.5 - index * [1.5, 2.2, 1.9][variant];
    const y = 2.6 - index * 2.3;
    const edge = `M${-width},0 Q-4,-3.6 0,-2.6 Q4,-2.2 ${width},-0.5 L0,3.1Z`;
    const shoots = Array.from({ length: 5 - index }, (_, column) => {
      const px = -width * 0.55 + column * 2.1;
      const py = 0.1 + Math.abs(px) * 0.12;
      return `M${px},${py} l-0.4,-1.3 M${px},${py} l0.5,-1.5`;
    }).join(' ');
    return at(
      0,
      y,
      path(edge, earth.dark) +
        path(`M${-width},-0.5 Q-4,-4.1 0,-3.1 Q4,-2.7 ${width},-1 L0,2.6Z`, c.ricePaddy) +
        path(
          `M${-width + 1.1},-0.5 Q-3.7,-3.1 0,-2.4 Q3.5,-2.2 ${width - 1.1},-1 L0,1.8Z`,
          c.ricePaddyWater,
        ) +
        stroke(shoots, c.leaf, 0.42) +
        stroke(`M${-width + 0.4},-0.7 Q-4,-3.7 0,-2.9`, c.leafLight, 0.3),
    );
  }).join('');
  return at(x, y, terraces, 'contoured-rice-terraces');
}

function cabbage(c: AssetColors, radish: boolean): string {
  const leaf = material(c.bush, c);
  return (
    (radish ? path('M-0.45,-0.1 Q-0.5,1 0,1.5 Q0.6,0.3 0.45,-0.3Z', c.sail) : '') +
    path(
      'M-1.1,0 Q-1.7,-1.6 -0.5,-1.5 Q-0.8,-2.4 0.3,-2 Q1.4,-2.3 1.5,-1 Q2,-0.3 1.1,0.4 Q0.1,1.1 -1.1,0Z',
      leaf.dark,
    ) +
    path(
      'M-0.9,-0.2 Q-1.2,-1.6 -0.3,-1.2 Q-0.1,-2.2 0.7,-1.3 Q1.4,-1 0.8,0 Q0.1,0.7 -0.9,-0.2Z',
      leaf.light,
    ) +
    stroke('M0,0.1 V-1.2 M0,-0.2 L-0.6,-0.7 M0,-0.5 L0.7,-1', c.ricePaddy, 0.22)
  );
}

export function svgKimchiGarden(x: number, y: number, c: AssetColors, v: number): string {
  const variant = v % 3;
  const earth = material(c.gardenSoil, c);
  const heads = Array.from({ length: variant === 1 ? 5 : 6 }, (_, index) => {
    const row = index % 2;
    const column = Math.floor(index / 2);
    return at(
      -4.4 + column * 3.2 + row * 1.8,
      -0.7 + column * 1.4 - row * 2.1,
      cabbage(c, variant === 2 && row === 0),
    );
  }).join('');
  return at(
    x,
    y,
    path('M-8,-0.8 L-0.7,-4.6 L8,0 L0.5,4Z', earth.dark) +
      path('M-8,-1.4 L-0.7,-5.2 L8,-0.6 L0.5,3.4Z', earth.base) +
      stroke('M-7.6,-1.4 L0.5,3 M-5,-2.7 L3,1.6 M-2.5,-3.9 L5.6,0.3', earth.light, 0.6) +
      heads +
      (variant === 1 ? path('M5.7,-1.1 V-4.4 L7.4,-3.6 V-2.8 L6.1,-3.4 V-0.8Z', c.fence) : ''),
    'cabbage-radish-garden',
  );
}
