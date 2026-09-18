import type { AssetColors } from '../../palette.js';
import { lerpColor } from '../../../../utils/color.js';
import { autumnLeaf, orchardFruit, wovenBasket } from './summer-autumn-art-harvest.js';

export function svgAppleBasket(x: number, y: number, c: AssetColors, v: number): string {
  const fruit =
    orchardFruit(-0.85, -1.12, 0.54, c.appleRed, c) +
    orchardFruit(0.65, -1.2, 0.6, c.appleRed, c) +
    orchardFruit(-0.1, -0.9, 0.48, c.pearGreen, c) +
    (v === 1 ? orchardFruit(-0.12, -1.98, 0.56, c.appleRed, c) : '');
  return `<g transform="translate(${x},${y})">
    <ellipse cx="0.2" cy="0.92" rx="1.9" ry="0.35" fill="${c.trunk}" opacity="0.16"/>
    ${wovenBasket(fruit, c, v === 2)}
    ${v === 1 ? orchardFruit(2.18, 0.5, 0.47, c.appleRed, c) : ''}
    ${v === 2 ? autumnLeaf(-1.9, 0.78, -15, 0.68, c.fallenLeafGold, c.trunk) : ''}
  </g>`;
}

export function svgRake(x: number, y: number, c: AssetColors, v: number): string {
  const leaves =
    v === 1
      ? autumnLeaf(-1.8, 0.8, -15, 1.05, c.fallenLeafOrange, c.trunk) +
        autumnLeaf(-1.08, 0.63, 20, 0.9, c.fallenLeafRed, c.trunk) +
        autumnLeaf(-2.2, 1.1, 12, 0.7, c.fallenLeafGold, c.trunk)
      : v === 2
        ? autumnLeaf(0.95, 1.13, -20, 0.8, c.fallenLeafGold, c.trunk)
        : '';
  const angle = v === 1 ? 27 : v === 2 ? -18 : 0;
  return `<g transform="translate(${x},${y})">
    ${leaves}
    <g transform="rotate(${angle})">
      <path d="M-0.15,0.95 L-0.13,-3.1 0.17,-3.1 0.15,0.95Z" fill="${c.trunk}"/>
      <path d="M-0.06,0.65 V-2.98" stroke="${lerpColor(c.trunk, c.haybale, 0.6)}" stroke-width="0.12"/>
      <path d="M-0.3,-3.18 L0,-2.68 0.3,-3.18Z" fill="${c.sledRunner}"/>
      <path d="M-1.05,-3.35 H1.05 V-3.07 H0.89 V-2.25 H0.67 V-3.07 H0.36 V-2.25 H0.14 V-3.07 H-0.14 V-2.25 H-0.36 V-3.07 H-0.67 V-2.25 H-0.89 V-3.07 H-1.05Z" fill="${c.sledRunner}"/>
      <path d="M-1,-3.31 H1" stroke="${c.poolEdge}" stroke-width="0.12"/>
      <path d="M-0.19,0.63 H0.2 V1 H-0.19Z" fill="${c.acornCap}"/>
    </g>
  </g>`;
}
