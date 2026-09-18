import type { AssetColors } from '../../palette.js';
import { lerpColor } from '../../../../utils/color.js';
import { autumnLeaf } from './summer-autumn-art-harvest.js';

export function svgAutumnMaple(x: number, y: number, c: AssetColors, v: number): string {
  const base = v === 1 ? c.mapleOrange : c.mapleRed;
  const shade = v === 1 ? c.autumnRust : c.mapleCrimson;
  const light = v === 1 || v === 2 ? c.autumnGold : c.mapleOrange;
  const crown =
    v === 1
      ? 'M-3.1,-3.3 L-2.7,-4.3 -2.95,-4.5 -2.1,-5.2 -2.2,-5.8 -1.35,-6.12 -1.25,-6.9 -0.55,-6.8 0,-7.5 0.45,-6.7 1.25,-6.5 1.4,-5.7 2.4,-5.3 2.15,-4.5 3.1,-3.65 2.7,-2.9 1.7,-2.3 0.4,-2.65 -0.7,-2.1 -1.4,-2.5 -2.6,-2.3Z'
      : v === 2
        ? 'M-3.35,-3.7 L-2.9,-4.3 -3,-4.9 -2.1,-5.5 -1.95,-6.2 -1.1,-6.1 -0.6,-6.95 0.15,-6.5 0.65,-6.9 1.2,-5.8 2,-5.6 1.8,-4.8 2.6,-4.2 2.3,-3.4 1.5,-3.15 0.65,-3.5 0.1,-2.8 -1.1,-3.15 -1.9,-2.7 -2.3,-3.1 -3.1,-3Z'
        : 'M-3.5,-3.3 L-3.05,-4.1 -3.2,-4.5 -2.35,-4.8 -2.5,-5.5 -1.65,-5.85 -1.25,-6.75 -0.5,-6.5 0.2,-7.25 0.85,-6.35 1.8,-6.1 1.65,-5.3 2.65,-5.05 2.55,-4.4 3.45,-3.8 3.1,-2.9 2.2,-2.6 1.25,-2.85 0.45,-2.15 -0.4,-2.5 -1.15,-2.1 -2.1,-2.6 -2.9,-2.35Z';
  return `<g transform="translate(${x},${y})">
    <ellipse cx="0.35" cy="2.6" rx="2.2" ry="0.48" fill="${c.trunk}" opacity="0.15"/>
    <path d="M-0.78,2.5 Q-0.2,0.3 -0.55,-2.1 L-1.75,-3.6 -1.4,-3.7 -0.15,-2.8 0.12,-5.2 0.45,-5 0.42,-2.25 1.9,-3.5 2.1,-3.2 0.55,-1.65 Q0.38,1.2 0.9,2.6 L0.15,2.35Z" fill="${c.trunk}"/>
    <path d="M-0.55,2.34 Q-0.04,-0.8 -0.32,-2.1 L-1.3,-3.25 -0.1,-2.55 0.04,1.8Z" fill="${lerpColor(c.trunk, c.haybale, 0.38)}"/>
    <path d="${crown}" fill="${base}"/>
    <path d="M0.5,-5.1 L1.8,-4.5 2.6,-4.2 2.3,-3.4 1.5,-3.15 0.65,-3.5 0.1,-2.8 -1.1,-3.15 -1.9,-2.7 -2.3,-3.1 -0.8,-3.65Z" fill="${shade}"/>
    <path d="M-2.7,-4.35 L-2.15,-5.05 -1.65,-5.15 -1.45,-6 -0.65,-5.8 0.05,-6.5 0.35,-5.45 -0.25,-4.78 -1.25,-4.92 -1.72,-4.2Z" fill="${light}"/>
    ${v === 2 ? autumnLeaf(-1.8, 1.7, -15, 0.8, c.mapleRed, c.trunk) + autumnLeaf(1.65, 0.9, 32, 0.65, c.autumnGold, c.trunk) + autumnLeaf(2.5, -1.3, 65, 0.55, c.mapleOrange, c.trunk) : ''}
  </g>`;
}

export function svgAutumnOak(x: number, y: number, c: AssetColors, v: number): string {
  const base = v === 1 ? c.autumnBronze : v === 2 ? c.autumnRust : c.oakGold;
  const light = v === 1 ? c.autumnOlive : v === 2 ? c.autumnBronze : c.autumnGold;
  const shade = v === 2 ? c.autumnBurgundy : c.oakBrown;
  const crown =
    v === 1
      ? 'M-3.25,-3.4 Q-3.85,-4.9 -2.5,-5.4 Q-2.65,-6.8 -1.1,-6.7 Q0,-7.25 0.75,-6.35 Q2.5,-6.4 2.45,-5 Q3.55,-4.85 3.1,-3.65 Q3.55,-2.5 2.25,-2.15 Q0.8,-1.8 0.4,-2.5 Q-0.8,-1.9 -1.6,-2.55 Q-3,-1.9 -3.25,-3.4Z'
      : v === 2
        ? 'M-3.1,-3 Q-3.8,-4.3 -2.6,-5 Q-2.75,-6.1 -1.3,-6.3 Q-0.5,-7 0.8,-6.4 Q2.2,-6.85 2.7,-5.35 Q3.7,-4.95 3.3,-3.9 Q3.8,-2.7 2.5,-2.3 Q1.1,-1.4 0.15,-2.25 Q-1.5,-1.55 -2.2,-2.45 Q-3.2,-2 -3.1,-3Z'
        : 'M-3.3,-3.4 Q-3.9,-4.6 -2.8,-5.15 Q-2.65,-6.7 -1.25,-6.45 Q-0.35,-7.3 0.75,-6.45 Q2.35,-6.8 2.7,-5.4 Q3.7,-5 3.45,-3.9 Q3.9,-2.7 2.7,-2.45 Q1.9,-1.5 0.5,-2.15 Q-0.5,-1.6 -1.55,-2.3 Q-3,-1.75 -3.3,-3.4Z';
  return `<g transform="translate(${x},${y})">
    <ellipse cx="0.4" cy="2.9" rx="2.2" ry="0.45" fill="${c.trunk}" opacity="0.16"/>
    <path d="M-1,2.8 Q-0.28,1 -0.65,-1 L-2.1,-2.8 -1.65,-3.1 -0.2,-1.8 0,-4.5 0.45,-4.6 0.55,-1.9 2,-3.25 2.35,-2.95 0.8,-1 Q0.65,1.8 1.3,2.8 L0.5,2.7 0.05,2.35 -0.5,2.8Z" fill="${c.trunk}"/>
    <path d="M-0.72,2.62 Q-0.05,1 -0.36,-1.14 L-1.5,-2.6 0,-1.55 0.2,1.8Z" fill="${lerpColor(c.trunk, c.haybale, 0.36)}"/>
    <path d="${crown}" fill="${base}"/>
    <path d="M0.6,-5.1 Q1.7,-5.65 2.55,-4.8 Q3.55,-4.4 3,-3.5 Q3.55,-2.75 2.4,-2.45 Q1.8,-1.95 0.5,-2.4 Q-0.8,-1.9 -1.8,-2.65 Q0.7,-2.35 0.6,-5.1Z" fill="${shade}"/>
    <path d="M-2.95,-4.75 Q-2.45,-5.25 -1.95,-5 Q-2.2,-6.1 -1.1,-6.12 Q-0.3,-6.7 0.4,-6.03 Q1.25,-6.3 1.7,-5.5 Q1.2,-4.65 0,-4.8 Q-1.05,-4 -2.15,-4.42Z" fill="${light}"/>
    ${v === 0 ? `<path d="M0.86,-2.4 Q1.5,-2.45 1.33,-1.8 L1.12,-1.6 Q0.72,-1.82 0.86,-2.4Z" fill="${c.acornBody}"/><path d="M0.8,-2.38 Q1.1,-2.8 1.47,-2.37Z" fill="${c.acornCap}"/>` : ''}
    ${v === 2 ? autumnLeaf(-1.45, 2.35, 15, 0.9, c.autumnBurgundy, c.trunk) : ''}
  </g>`;
}

export function svgAutumnBirch(x: number, y: number, c: AssetColors, v: number): string {
  const leaf = v === 1 ? lerpColor(c.birchYellow, c.parasolStripe, 0.3) : c.birchYellow;
  const crown =
    v === 2
      ? 'M-3,-3.8 Q-3.2,-4.85 -2.3,-5.05 Q-2.15,-5.7 -1.25,-5.35 L-0.95,-4.4 Q-1.1,-3.35 -2.15,-3.4Z M0.1,-4.5 Q-0.15,-5.2 0.7,-5.45 Q1.6,-5.65 1.95,-4.75 L1.55,-3.9 0.55,-4.05Z'
      : v === 1
        ? 'M-2.55,-3.65 Q-2.9,-4.45 -2,-4.8 Q-1.9,-5.65 -0.85,-5.5 Q0.2,-5.8 0.65,-5.12 Q1.85,-5.4 2.1,-4.35 Q2.65,-3.65 1.85,-3.1 Q2,-2.15 1.05,-1.9 L0.15,-2.4 Q-0.85,-1.7 -1.35,-2.5 Q-2.5,-2.25 -2.55,-3.65Z'
        : 'M-2.55,-3.5 Q-2.9,-4.25 -2.05,-4.6 Q-2.25,-5.4 -1.25,-5.3 Q-0.6,-5.95 0.15,-5.45 Q1.1,-5.8 1.6,-5 Q2.4,-4.8 2.15,-3.9 Q2.75,-3.1 1.95,-2.75 Q2.25,-1.9 1.2,-1.8 Q0.35,-1.2 -0.25,-2 Q-1.3,-1.3 -1.75,-2.3 Q-2.65,-2.2 -2.55,-3.5Z';
  return `<g transform="translate(${x},${y})">
    <ellipse cx="0.2" cy="2.9" rx="1.45" ry="0.35" fill="${c.trunk}" opacity="0.13"/>
    <path d="M-0.6,2.9 Q-0.15,0.2 -0.45,-2.55 L-2,-4 -1.8,-4.2 -0.3,-3.1 -0.22,-5.35 0.12,-5.35 0.15,-3.45 1.7,-4.6 1.9,-4.35 0.22,-2.7 Q0.1,0.6 0.53,2.9Z" fill="${c.birchBark}"/>
    <path d="M0.12,-2.2 Q0,0.6 0.53,2.9 H0.22 Q-0.1,0.1 -0.05,-2.2Z" fill="${lerpColor(c.birchBark, c.trunk, 0.35)}"/>
    <path d="M-0.3,0.25 h0.35 M-0.34,1.27 h0.23 M-0.18,2.15 h0.5 M-0.25,-1 h0.3" stroke="${c.trunk}" stroke-width="0.15"/>
    <path d="${crown}" fill="${leaf}"/>
    <path d="M-2.72,-4.4 Q-2.75,-4.95 -2.1,-4.98 Q-1.7,-5.65 -1.3,-5.2 L-1.05,-4.55 -1.85,-4.18Z M0.2,-4.8 Q0.6,-5.43 1.25,-5.1 L1.6,-4.7 0.85,-4.4Z" fill="${lerpColor(leaf, c.parasolStripe, 0.32)}"/>
    ${v === 2 ? autumnLeaf(-1.4, 2.55, -10, 0.72, leaf, c.trunk) : `<path d="M0.72,-3.38 Q1.1,-2.4 1.9,-2.6 Q2,-1.95 1.1,-2.1 L0.4,-2.58Z" fill="${c.autumnGold}"/>`}
  </g>`;
}

export function svgAutumnGinkgo(x: number, y: number, c: AssetColors, v: number): string {
  const crown =
    v === 2
      ? 'M-1.9,-3.85 Q-2.35,-4.9 -1.25,-5.35 L-0.9,-6 0,-5.75 0.6,-6.2 Q1.8,-5.8 2,-4.85 Q2.4,-4 1.3,-3.55 L0.35,-3.95 -0.55,-3.4Z'
      : v === 1
        ? 'M-2.55,-3.8 Q-2.95,-4.8 -1.9,-5.45 Q-1.25,-6.4 -0.3,-5.9 Q0.45,-6.7 1.15,-5.95 Q2.6,-5.55 2.6,-4.4 L2,-3.65 0.8,-3.8 0,-3.2 -0.65,-3.6 -1.75,-3.25Z'
        : 'M-3.05,-3.05 Q-3.75,-4.3 -2.65,-4.85 Q-2.65,-5.9 -1.55,-5.8 Q-0.9,-6.8 0,-6.2 Q0.7,-6.95 1.35,-6 Q2.55,-5.85 2.45,-4.95 Q3.65,-4.1 3.1,-3.15 L2.2,-2.6 1.1,-2.95 0.1,-2.35 -0.85,-2.8 -2,-2.4Z';
  const carpet = v === 2 ? 3.15 : 2.15;
  return `<g transform="translate(${x},${y})">
    ${v > 0 ? `<path d="M-${carpet},1.4 Q-2,0.55 -0.7,0.85 Q1.3,0.3 ${carpet},1.35 Q2.6,2.2 0.8,1.9 Q-1.6,2.2 -${carpet},1.4Z" fill="${c.autumnGold}"/>` : ''}
    <path d="M-0.65,2 Q-0.16,0.2 -0.37,-2.1 L-2,-4 -1.68,-4.15 -0.2,-2.8 -0.05,-5.65 0.27,-5.55 0.24,-3.25 1.7,-4.85 2,-4.65 0.42,-2.6 Q0.3,0.5 0.75,2Z" fill="${c.trunk}"/>
    <path d="M-0.45,1.85 Q-0.1,-0.4 -0.2,-2.1 L0.07,-2.22 0.07,1.6Z" fill="${lerpColor(c.trunk, c.haybale, 0.38)}"/>
    <path d="${crown}" fill="${c.ginkgoYellow}"/>
    <path d="M0.6,-5.35 Q1.75,-5.5 1.8,-4.8 Q2.35,-4.1 1.3,-3.8 L0.35,-4.15 -0.55,-3.65 -1.2,-3.9 Q0.85,-4 0.6,-5.35Z" fill="${c.autumnGold}"/>
    <path d="M-1.9,-4.72 Q-2,-5.28 -1.2,-5.33 L-0.85,-5.78 -0.05,-5.45 0.55,-5.9 1.04,-5.57 Q0.7,-4.65 -0.4,-4.7 L-1,-4.2Z" fill="${lerpColor(c.ginkgoYellow, c.parasolStripe, 0.36)}"/>
    ${v > 0 ? `<path d="M-2.1,1.4 l0.45,-0.35 0.55,0.25 -0.35,0.33Z M0.5,1.4 l0.5,-0.5 0.65,0.25 -0.45,0.48Z" fill="${c.ginkgoYellow}"/>` : ''}
  </g>`;
}

export function svgFallenLeaves(x: number, y: number, c: AssetColors, v: number): string {
  const leaves =
    v === 1
      ? autumnLeaf(-1.65, 0.05, 14, 1, c.fallenLeafGold, c.trunk) +
        autumnLeaf(0.5, 0.5, -25, 0.95, c.fallenLeafBrown, c.trunk)
      : v === 2
        ? autumnLeaf(-2, 0.4, -18, 1.15, c.fallenLeafRed, c.trunk) +
          autumnLeaf(-0.6, 0.18, 25, 0.95, c.fallenLeafGold, c.trunk) +
          autumnLeaf(0.6, 0.75, -8, 0.85, c.fallenLeafOrange, c.trunk)
        : autumnLeaf(-1.65, 0.2, -20, 1.05, c.fallenLeafRed, c.trunk) +
          autumnLeaf(0.35, 0.35, 28, 0.9, c.fallenLeafOrange, c.trunk);
  return `<g transform="translate(${x},${y})">${leaves}</g>`;
}

export function svgLeafSwirl(x: number, y: number, c: AssetColors, v: number): string {
  const leaves =
    v === 1
      ? autumnLeaf(-1.45, -2.5, -38, 0.78, c.fallenLeafRed, c.trunk) +
        autumnLeaf(1.2, -0.8, 65, 0.85, c.mapleRed, c.trunk)
      : v === 2
        ? autumnLeaf(-1.3, -0.6, 8, 0.95, c.fallenLeafGold, c.trunk) +
          autumnLeaf(1.15, -2.65, -35, 0.8, c.oakGold, c.trunk)
        : autumnLeaf(-1.7, -1.25, -28, 0.8, c.fallenLeafRed, c.trunk) +
          autumnLeaf(0.05, -2.9, 35, 0.76, c.fallenLeafOrange, c.trunk) +
          autumnLeaf(1.6, -0.4, 68, 0.7, c.fallenLeafGold, c.trunk);
  return `<g transform="translate(${x},${y})">${leaves}<path d="M-1.8,-0.25 Q-0.5,0.15 0.1,-0.7 M0.7,-2.4 Q1.55,-2.22 1.8,-1.7" fill="none" stroke="${c.fallenLeafGold}" stroke-width="0.12" opacity="0.4"/></g>`;
}

function oakNut(x: number, y: number, angle: number, c: AssetColors, cap: boolean): string {
  return `<g transform="translate(${x},${y}) rotate(${angle})">
    <path d="M-0.55,-0.3 Q0,-0.55 0.55,-0.3 Q0.65,0.52 0,0.88 Q-0.65,0.5 -0.55,-0.3Z" fill="${c.acornBody}"/>
    <path d="M0.22,-0.36 Q0.65,-0.45 0.55,0.2 Q0.45,0.68 0,0.88 Q0.18,0.1 0.22,-0.36Z" fill="${lerpColor(c.acornBody, c.trunk, 0.35)}"/>
    <path d="M-0.34,-0.05 Q-0.4,0.18 -0.19,0.42" fill="none" stroke="${lerpColor(c.acornBody, c.haybale, 0.65)}" stroke-width="0.15"/>
    ${cap ? `<path d="M-0.64,-0.27 Q-0.6,-0.93 0,-0.88 Q0.64,-0.8 0.64,-0.27 Q0,0 -0.64,-0.27Z" fill="${c.acornCap}"/><path d="M-0.1,-0.77 L0.05,-1.18 M-0.35,-0.59 L-0.12,-0.4 M0.12,-0.61 L0.37,-0.43" stroke="${c.trunk}" stroke-width="0.15"/>` : ''}
  </g>`;
}

export function svgAcorn(x: number, y: number, c: AssetColors, v: number): string {
  const nuts =
    v === 1
      ? oakNut(-0.75, 0.1, -25, c, true) + oakNut(0.65, 0.35, 22, c, true)
      : oakNut(v === 2 ? -0.5 : 0, 0, v === 2 ? -55 : -10, c, v !== 2);
  return `<g transform="translate(${x},${y})">${nuts}
    ${v === 2 ? `<path d="M0.35,0.4 Q0.35,-0.35 1.02,-0.35 Q1.7,-0.35 1.63,0.4 Q1,0.75 0.35,0.4Z" fill="${c.acornCap}"/><ellipse cx="0.98" cy="0.35" rx="0.48" ry="0.19" fill="${c.trunk}"/><path d="M0.98,-0.3 L1.2,-0.65" stroke="${c.acornCap}" stroke-width="0.16"/>` : ''}
  </g>`;
}
