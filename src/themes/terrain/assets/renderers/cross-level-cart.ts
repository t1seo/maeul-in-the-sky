import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';
import { ellipse, group, material, path, polygon, stroke, wheel } from './buildings-art-shapes.js';

export function svgCart(x: number, y: number, c: AssetColors, _v: number): string {
  const wood = material(c.cart, c);
  return group(
    x,
    y,
    stroke('M1,-1.2 L4.2,-0.1 M0.5,-0.6 L3.6,0.5', c.trunk, 0.3),
    polygon('-2.7,-1.9 -1.2,-2.7 1.8,-1.9 0.3,-1.1', wood.light),
    polygon('-2.2,-1.8 -1.1,-2.3 1.2,-1.7 0.2,-1.3', c.trunk),
    polygon('-2.7,-1.9 0.3,-1.1 0.3,0.3 -2.7,-0.5', wood.base),
    polygon('0.3,-1.1 1.8,-1.9 1.8,-0.5 0.3,0.3', wood.dark),
    stroke('M-2.6,-1 L0.3,-0.3 1.7,-1 M-1.7,-1.5 V-0.3', c.fence, 0.18),
    wheel(-1.8, 0.4, 0.78, c),
    wheel(1.1, 0.45, 0.75, c),
  );
}

export function svgBarrel(x: number, y: number, c: AssetColors, _v: number): string {
  const wood = material(c.barrel, c);
  return group(
    x,
    y,
    path(
      'M-1.45,-3 Q0,-3.8 1.45,-3 Q2.1,-1.7 1.45,-0.1 Q0,0.8 -1.45,-0.1 Q-2,-1.6 -1.45,-3Z',
      wood.base,
    ),
    path(
      'M0.55,-3.4 L1.45,-3 Q2.1,-1.7 1.45,-0.1 Q0.9,0.3 0.3,0.4 Q0.9,-1.3 0.55,-3.4Z',
      wood.dark,
    ),
    path(
      'M-1.45,-3 Q-0.9,-3.4 -0.5,-3.4 Q-0.9,-1.6 -0.6,0.3 L-1.45,-0.1 Q-2,-1.6 -1.45,-3Z',
      wood.light,
    ),
    path(
      'M-1.72,-2.5 Q0,-1.6 1.76,-2.5 V-2.1 Q0,-1.2 -1.78,-2.1Z M-1.75,-0.9 Q0,0 1.75,-0.9 L1.62,-0.5 Q0,0.5 -1.62,-0.5Z',
      c.anvil,
    ),
    ellipse(0, -3, 1.45, 0.61, c.fence),
    ellipse(0, -3.05, 1.13, 0.43, wood.light),
    stroke('M-0.6,-3.35 L-0.6,-2.78 M0.25,-3.43 V-2.66', wood.dark, 0.16),
    ellipse(0.65, -3.05, 0.18, 0.12, c.trunk),
  );
}

function lanternHousing(x: number, y: number, c: AssetColors): string {
  const metal = material(c.lantern, c);
  return group(
    x,
    y,
    polygon('-0.8,-1.6 0,-2.2 0.8,-1.6 0,-1.2', metal.light),
    polygon('-0.7,-1.5 0,-1.2 0.7,-1.5 0.5,-0.1 0,0.2 -0.5,-0.1', c.lanternGlow),
    path(
      'M-0.8,-1.6 L-0.55,0 0,0.35 0.55,0 0.8,-1.6 0.6,-1.5 0.4,-0.2 0.1,0 V-1.25 H-0.1 V0 L-0.4,-0.2 -0.6,-1.5Z',
      metal.dark,
    ),
    stroke('M-0.1,-2.2 V-2.45', metal.base, 0.2),
  );
}

export function svgTorch(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 2)
    return group(
      x,
      y,
      path('M-0.7,0.4 L-0.5,-0.1 H0.5 L0.7,0.4Z', c.torch),
      stroke('M0,0 V-5.7 Q0,-6.4 1.2,-6.2 V-5.8', c.torch, 0.33),
      lanternHousing(1.2, -3.4, c),
    );
  const height = v === 1 ? 2.8 : 4.1;
  return group(
    x,
    y,
    polygon(`-0.25,0.5 -0.4,${-height + 0.4} 0.3,${-height + 0.5} 0.2,0.5`, c.torch),
    path(
      `M-0.65,${-height + 0.5} L-0.9,${-height - 0.3} 0.8,${-height - 0.3} 0.5,${-height + 0.5}Z`,
      c.anvil,
    ),
    path(
      `M-0.65,${-height - 0.2} Q-1.1,${-height - 1.1} -0.4,${-height - 1.6} L0,${-height - 2.3} Q0.1,${-height - 1.1} 0.65,${-height - 1.2} Q1,${-height - 0.3} 0.2,${-height - 0.1}Z`,
      c.torchFlame,
    ),
    path(
      `M-0.35,${-height - 0.2} Q-0.55,${-height - 0.7} 0,${-height - 1.3} Q0.5,${-height - 0.5} 0.2,${-height - 0.1}Z`,
      c.lanternGlow,
    ),
    stroke(`M-0.3,${-height + 0.9} L0.2,${-height + 1}`, c.fence, 0.2),
  );
}

export function svgFlag(x: number, y: number, c: AssetColors, v: number): string {
  const cloth = material(v === 1 ? c.water : c.flag, c);
  const banner = v === 2;
  const outline = banner
    ? 'M0,-8 H2.8 V-4.7 L1.4,-5.3 0,-4.7Z'
    : v === 1
      ? 'M0,-8 Q1.5,-8.4 3.6,-6.8 Q1.7,-6.8 0,-5.5Z'
      : 'M0,-8 Q1.1,-8.5 2,-7.8 Q3,-7.2 4,-7.6 L3,-6.5 3.7,-5.6 Q2.4,-5.1 1.4,-5.8 Q0.6,-6.3 0,-5.8Z';
  return group(
    x,
    y,
    polygon('-0.7,0 -0.2,-0.5 0.4,-0.3 0.8,0.2 -0.1,0.6', c.rock),
    stroke('M-0.1,0.1 V-8.8', c.trunk, 0.3),
    ellipse(-0.1, -9, 0.25, 0.27, c.wheat),
    path(outline, cloth.base),
    path(
      banner ? 'M0,-8 H0.55 V-4.95 L0,-4.7Z' : 'M0,-8 Q0.8,-8.3 1.4,-8 L1.3,-6.1 Q0.5,-6.2 0,-5.8Z',
      cloth.light,
    ),
    banner ? stroke('M-0.35,-8.2 H3', c.trunk, 0.25) : '',
    banner ? path('M1.1,-7 L1.9,-7.2 1.9,-6.2 1.4,-5.8 1.1,-6.2Z', c.wheat) : '',
  );
}

export function svgCobblePath(x: number, y: number, c: AssetColors, v: number): string {
  const stones: readonly (readonly [number, number])[] =
    v === 1
      ? [
          [-2.5, -0.6],
          [-0.8, -0.4],
          [0.9, -0.2],
          [2.6, 0],
        ]
      : v === 2
        ? [
            [-1.8, -1],
            [0, -0.3],
            [1.8, 0.4],
            [-1.8, 0.4],
            [1.8, -1],
          ]
        : [
            [-1.9, -0.7],
            [-0.3, 0.1],
            [1.4, -0.5],
          ];
  const stone = material(c.cobble, c);
  return group(
    x,
    y,
    ...stones.map(([px, py]) =>
      group(
        px,
        py,
        path('M-0.8,-0.1 L-0.2,-0.45 0.75,-0.25 0.85,0.25 0.1,0.55 -0.75,0.3Z', stone.dark),
        path('M-0.8,-0.2 L-0.2,-0.55 0.75,-0.35 0.85,0.05 0.1,0.3 -0.75,0.1Z', stone.light),
      ),
    ),
  );
}

export function svgSmoke(x: number, y: number, c: AssetColors, _v: number): string {
  return group(
    x,
    y,
    `<g opacity="0.8">${path('M-0.7,-4.4 Q-1.7,-5 -1.1,-5.8 Q-1.5,-6.9 -0.4,-7.1 Q-0.2,-8.3 0.9,-8 Q2,-7.6 1.2,-6.7 Q1.7,-5.7 0.6,-5.3 Q0.5,-4.3 -0.7,-4.4Z', c.smoke)}${motionMarkup('<animateTransform attributeName="transform" type="translate" values="0 0;0.6 -2;0 0" dur="4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.8;0.18;0.8" dur="4s" repeatCount="indefinite"/>')}</g>`,
    `<g opacity="0.5">${path('M-0.25,-3.9 Q0.6,-4.7 1,-4 Q1.5,-4.1 1.6,-3.5 Q0.9,-3 0.3,-3.4Z', c.smoke)}${motionMarkup('<animateTransform attributeName="transform" type="translate" values="0 0;0.3 -3;0 0" dur="3.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0.12;0.5" dur="3.5s" repeatCount="indefinite"/>')}</g>`,
  );
}

export function svgSignpost(x: number, y: number, c: AssetColors, _v: number): string {
  const wood = material(c.signpost, c);
  return group(
    x,
    y,
    path('M-0.3,0.4 L-0.45,-5.4 0.2,-5.5 0.35,0.4Z', wood.dark),
    polygon('-1,-4.9 2.1,-5.2 3,-4.6 2.3,-3.9 -1,-3.8', wood.light),
    polygon('-2.4,-3.8 1.4,-3.6 1.4,-2.4 -2.4,-2.6 -3.2,-3.3', wood.base),
    stroke('M-0.5,-4.4 L1.9,-4.6 M-2.1,-3.2 L0.8,-3', wood.dark, 0.19),
    ellipse(-0.1, -4.4, 0.11, 0.11, c.anvil),
    ellipse(-0.1, -3.1, 0.11, 0.11, c.anvil),
    polygon('-0.8,0.2 -0.3,-0.2 0.5,0 0.9,0.4 0,0.7', c.rock),
  );
}

export function svgLantern(x: number, y: number, c: AssetColors, _v: number): string {
  return group(
    x,
    y,
    polygon('-0.65,0.1 0,-0.2 0.65,0.1 0,0.5', c.rock),
    stroke('M0,0.1 V-3.9', c.lantern, 0.32),
    lanternHousing(0, -4.1, c),
    path('M-0.35,-3.9 H0.35 L0.18,-3.6 H-0.18Z', c.lantern),
  );
}

export function svgWoodpile(x: number, y: number, c: AssetColors, _v: number): string {
  const wood = material(c.woodpile, c);
  const logs: readonly (readonly [number, number])[] = [
    [-2.3, -0.5],
    [-0.6, -0.1],
    [-1.3, -1.3],
    [-0.7, -2.25],
  ];
  return group(
    x,
    y,
    ...logs.map(([px, py]) =>
      group(
        px,
        py,
        path('M0,-0.6 L2.5,-1.2 Q3,-0.9 2.7,-0.2 L0.2,0.5Z', wood.dark),
        path('M0,-0.6 L2.5,-1.2 2.85,-0.95 0.35,-0.1Z', wood.light),
        ellipse(0, 0, 0.57, 0.57, c.fence),
        path('M-0.3,-0.2 Q0.25,-0.45 0.3,0.1 L0,0.25', wood.base, 'stroke="none"'),
      ),
    ),
  );
}

export function svgPuddle(x: number, y: number, c: AssetColors, _v: number): string {
  const water = material(c.puddle, c);
  return group(
    x,
    y,
    path(
      'M-2.5,-0.5 Q-1.9,-1.2 -0.4,-0.9 Q0.7,-1.3 1.3,-0.8 Q2.8,-0.9 2.5,0 Q1.9,0.6 0.4,0.4 Q-0.5,0.9 -1.1,0.3 Q-2.8,0.3 -2.5,-0.5Z',
      water.dark,
    ),
    path(
      'M-2.3,-0.5 Q-1.8,-1 -0.4,-0.8 Q0.7,-1.1 1.3,-0.7 Q2.5,-0.8 2.3,-0.2 Q1.6,0.3 0.3,0.2 Q-0.6,0.7 -1.1,0.1 Q-2.7,0.1 -2.3,-0.5Z',
      c.puddle,
    ),
    stroke('M-1.8,-0.45 Q-1.1,-0.7 -0.3,-0.5 M0.6,0 Q1.4,0.15 1.8,-0.15', c.waterLight, 0.16),
  );
}

export function svgCampfire(x: number, y: number, c: AssetColors, _v: number): string {
  return group(
    x,
    y,
    path(
      'M-2.1,-0.4 L-1.3,-1 -0.5,-0.9 0,-1.2 1,-1 2,-0.5 2.2,0.1 1.2,0.6 0.4,0.5 -0.7,0.7 -1.9,0.3Z',
      c.boulder,
    ),
    path('M-1.6,-0.4 L-1.1,-0.7 1.7,0.1 1.2,0.4Z M-1.1,0.3 L-1.5,0 1.2,-0.8 1.6,-0.4Z', c.campfire),
    ellipse(-1.35, 0.15, 0.28, 0.21, c.fence),
    ellipse(1.45, 0.25, 0.26, 0.22, c.fence),
    `<g opacity="0.9">${path('M-0.9,-0.3 Q-1.5,-1.2 -0.7,-2 L-0.2,-3.3 Q0.3,-2.8 0.3,-2 L0.9,-2.4 Q1.6,-1.1 0.6,-0.3Z', c.campfireFlame)}${motionMarkup('<animate attributeName="opacity" values="0.9;0.6;0.9" dur="1.5s" repeatCount="indefinite"/>')}</g>`,
    path('M-0.5,-0.4 Q-0.9,-1 0,-2 Q0.1,-1.1 0.5,-1.3 Q0.9,-0.6 0.3,-0.3Z', c.lanternGlow),
  );
}
