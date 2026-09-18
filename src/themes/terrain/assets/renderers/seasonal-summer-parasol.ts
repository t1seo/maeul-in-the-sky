import type { AssetColors } from '../../palette.js';
import { lerpColor } from '../../../../utils/color.js';

export function svgParasol(x: number, y: number, c: AssetColors, v: number): string {
  const color = v === 1 ? c.parasolBlue : v === 2 ? c.parasolYellow : c.parasolRed;
  const h = v === 1 ? -5.6 : v === 2 ? -4.9 : -5.3;
  const w = v === 1 ? 3.5 : 3.15;
  const shade = lerpColor(color, c.trunk, 0.3);
  return `<g transform="translate(${x},${y})">
    <ellipse cx="0.55" cy="0.65" rx="2.15" ry="0.55" fill="${c.trunk}" opacity="0.15"/>
    <path d="M-0.18,0.65 L-0.12,${h} 0.15,${h} 0.2,0.6Z" fill="${c.bareBranch}"/>
    <path d="M-0.12,-3.2 V0.4" stroke="${c.sandcastleWall}" stroke-width="0.12"/>
    <path d="M-${w},-3.5 Q0,-2.4 ${w},-3.5 L0,${h}Z" fill="${shade}"/>
    <path d="M-${w},-3.5 Q-2.2,${h + 0.15} 0,${h} Q2.5,${h + 0.15} ${w},-3.5 Q2.2,-3.12 1.3,-3.42 Q0,-2.88 -1.35,-3.42 Q-2.5,-3.1 -${w},-3.5Z" fill="${color}"/>
    <path d="M0,${h} Q-1.9,${h + 0.55} -1.35,-3.42 Q-2.3,-3.1 -${w},-3.5 Q-2.2,${h + 0.15} 0,${h}Z" fill="${lerpColor(color, c.parasolStripe, 0.38)}"/>
    <path d="M0,${h} Q-0.7,-4.5 -1.35,-3.42 Q0,-2.88 1.3,-3.42 Q0.7,-4.5 0,${h}Z" fill="${c.parasolStripe}"/>
    <path d="M0,${h} Q1.8,${h + 0.55} 1.3,-3.42 Q2.2,-3.12 ${w},-3.5" fill="${shade}"/>
    <path d="M-0.12,${h + 0.03} L0,${h - 0.25} 0.15,${h + 0.04}Z" fill="${c.bareBranch}"/>
  </g>`;
}

export function svgBeachTowel(x: number, y: number, c: AssetColors, v: number): string {
  const color = v === 1 ? c.beachTowelB : v === 2 ? c.parasolYellow : c.beachTowelA;
  const shade = lerpColor(color, c.trunk, 0.25);
  return `<g transform="translate(${x},${y})">
    <path d="M-3.1,0 L-0.55,-1.45 3.05,-0.18 0.5,1.35Z" fill="${color}"/>
    <path d="M-3.1,0 V0.27 L0.5,1.64 3.05,0.05 V-0.18 L0.5,1.35Z" fill="${shade}"/>
    <path d="M-2.63,0.04 L-0.17,-1.25 M-1.95,0.3 L0.48,-1.02 M-0.2,0.95 L2.18,-0.37" stroke="${c.parasolStripe}" stroke-width="${v === 0 ? 0.32 : 0.16}"/>
    <path d="M-2.72,0.36 l-0.3,0.18 M-1.95,0.65 l-0.3,0.2 M-1.2,0.94 l-0.3,0.2 M-0.4,1.23 l-0.3,0.2 M0.35,1.52 l-0.3,0.2" stroke="${c.parasolStripe}" stroke-width="0.16"/>
    ${v === 2 ? `<path d="M2.3,0.25 L3.05,-0.18 Q3.6,-0.75 2.98,-0.92 L2.3,-0.5Z" fill="${shade}"/><path d="M2.3,-0.5 L2.98,-0.92 Q3.27,-0.72 3.05,-0.4Z" fill="${c.parasolStripe}"/>` : ''}
    ${v === 1 ? `<path d="M-2.92,-0.3 Q-3.2,-0.85 -2.78,-1.07 L-0.62,-1.75 Q-0.17,-1.65 -0.26,-1.18 L-2.4,-0.35Z" fill="${color}"/><path d="M-2.88,-0.48 Q-3.18,-0.84 -2.75,-1 Q-2.37,-1 -2.43,-0.53Z" fill="${shade}"/>` : ''}
    ${v === 2 ? `<path d="M-0.45,-0.78 L0.15,-0.65 0.25,-0.16 Q-0.15,0.09 -0.5,-0.24Z M0.48,-0.46 L1.13,-0.31 1.16,0.16 Q0.74,0.4 0.49,0.03Z" fill="${c.watermelonSeed}"/><path d="M0.12,-0.51 L0.53,-0.35 M-0.45,-0.64 L-0.7,-0.83 M1.03,-0.25 L1.45,-0.57" stroke="${c.watermelonSeed}" stroke-width="0.18"/>` : ''}
  </g>`;
}

function sandTower(x: number, y: number, w: number, h: number, c: AssetColors): string {
  const shade = lerpColor(c.sandcastleWall, c.trunk, 0.27);
  return `<g transform="translate(${x},${y})">
    <path d="M-${w},${-h} L-${w + 0.15},0 Q0,0.65 ${w + 0.15},0 L${w},${-h}Z" fill="${c.sandcastleWall}"/>
    <path d="M0.3,${-h} L${w},${-h} ${w + 0.15},0 Q0.5,0.4 0.25,0.35Z" fill="${shade}"/>
    <path d="M-${w},${-h} V${-h - 0.42} L-${w * 0.5},${-h - 0.48} V${-h - 0.15} L0,${-h - 0.12} V${-h - 0.5} L${w * 0.5},${-h - 0.43} V${-h - 0.1} L${w},${-h - 0.2} V${-h} Q0,${-h + 0.4} -${w},${-h}Z" fill="${lerpColor(c.sandcastleWall, c.parasolStripe, 0.4)}"/>
    <path d="M-0.22,0 V-0.5 Q0,-0.86 0.25,-0.5 V0.08Z" fill="${shade}"/>
  </g>`;
}

export function svgSandcastleSummer(x: number, y: number, c: AssetColors, v: number): string {
  const castle =
    v === 2
      ? sandTower(-1.4, 0.25, 0.7, 1.8, c) +
        sandTower(1.3, 0.45, 0.72, 2.2, c) +
        sandTower(0, -0.3, 0.6, 2.75, c)
      : sandTower(0, 0.4, v === 1 ? 1.35 : 1.05, v === 1 ? 2.3 : 1.5, c);
  return `<g transform="translate(${x},${y})">
    <path d="M-2.6,0.2 Q-1.7,-0.7 0,-0.3 Q2.2,-0.3 2.6,0.6 Q1.2,1.4 -0.5,1.12 Q-2.1,1 -2.6,0.2Z" fill="${c.sandcastleWall}" opacity="0.55"/>
    ${castle}
    ${v === 1 ? `<path d="M0,-2 V-4.1" stroke="${c.bareBranch}" stroke-width="0.15"/><path d="M0,-4.1 Q0.6,-4.22 1.15,-3.8 L0,-3.4Z" fill="${c.parasolRed}"/>` : ''}
    ${v === 2 ? `<path d="M-1,0.5 V-0.9 L0,-0.7 1,-0.85 V0.75Z" fill="${c.sandcastleWall}"/><path d="M-0.28,0.55 V-0.05 Q0,-0.5 0.28,-0.05 V0.65Z" fill="${lerpColor(c.sandcastleWall, c.trunk, 0.35)}"/>` : ''}
  </g>`;
}

export function svgSurfboard(x: number, y: number, c: AssetColors, v: number): string {
  const angle = v === 1 ? -14 : v === 2 ? 14 : 5;
  const tail = v === 1 ? '0.45,0.55 0,0.18 -0.45,0.55' : '0.45,0.75 -0.35,0.8';
  return `<g transform="translate(${x},${y})">
    <ellipse cx="0.35" cy="0.8" rx="0.85" ry="0.25" fill="${c.trunk}" opacity="0.15"/>
    <g transform="rotate(${angle})">
      <path d="M-0.35,0.8 C-1,-1 -1.05,-3.75 0,-5.4 C1.2,-4.15 1.15,-1.7 0.5,0.65 L${tail}Z" fill="${c.surfboardBody}"/>
      <path d="M0,-5.4 C1.2,-4.15 1.15,-1.7 0.5,0.65 L0.24,0.55 C0.8,-1.4 0.8,-3.9 0,-5.4Z" fill="${lerpColor(c.surfboardBody, c.trunk, 0.3)}"/>
      <path d="M-0.2,-4.72 Q-0.95,-2.9 -0.48,-0.1" fill="none" stroke="${c.parasolStripe}" stroke-width="0.18"/>
      <path d="M-0.18,-4.35 Q0.3,-3.2 0.22,-1 L-0.05,0.25 -0.26,-0.05 Q0,-2.75 -0.18,-4.35Z" fill="${c.surfboardStripe}"/>
      ${v === 2 ? `<path d="M-0.68,-2.4 L0.72,-1.95 0.65,-1.42 -0.62,-1.87Z" fill="${c.surfboardStripe}"/>` : ''}
    </g>
  </g>`;
}

export function svgIceCreamCartAsset(x: number, y: number, c: AssetColors, v: number): string {
  const shade = lerpColor(c.iceCreamCart, c.trunk, 0.35);
  return `<g transform="translate(${x},${y})">
    <ellipse cx="0.4" cy="1.05" rx="2.4" ry="0.5" fill="${c.trunk}" opacity="0.16"/>
    <path d="M-1.1,0.1 L-1.2,0.95 M1.7,-0.1 L1.8,0.85 M1.8,-1.5 L2.7,-1.85 3,-1.5" fill="none" stroke="${c.sprinklerMetal}" stroke-width="0.23"/>
    <path d="M-1.8,-1.75 L0.55,-1.23 0.55,0.7 -1.8,0.1Z" fill="${c.iceCreamCart}"/>
    <path d="M0.55,-1.23 L2.1,-2 2.1,-0.1 0.55,0.7Z" fill="${shade}"/>
    <path d="M-1.8,-1.75 L-0.4,-2.47 2.1,-2 0.55,-1.23Z" fill="${c.parasolStripe}"/>
    <path d="M-0.65,-1.96 L0,-2.28 1.22,-2.02 0.58,-1.68Z" fill="${shade}"/>
    <path d="M-0.4,-2.3 V-4.25" stroke="${c.bareBranch}" stroke-width="0.22"/>
    <path d="M-2.65,-3.45 Q-1.8,-4.8 -0.4,-4.7 Q1.25,-4.5 1.9,-3.5 Q0.9,-3.03 -0.35,-3.3 Q-1.65,-3 -2.65,-3.45Z" fill="${c.iceCreamUmbrella}"/>
    <path d="M-0.4,-4.7 Q-1.6,-4.2 -1.45,-3.28 L-0.35,-3.3 Q0.15,-4.15 -0.4,-4.7Z" fill="${c.parasolStripe}"/>
    <path d="M-0.4,-4.7 Q0.85,-4.25 1.9,-3.5 L0.65,-3.23Z" fill="${lerpColor(c.iceCreamUmbrella, c.trunk, 0.25)}"/>
    <circle cx="-1.22" cy="0.62" r="0.5" fill="${c.sprinklerMetal}"/><circle cx="1.58" cy="0.38" r="0.43" fill="${c.sprinklerMetal}"/>
    <path d="M-1.4,0.62 h0.35 M1.43,0.38 h0.3" stroke="${c.parasolStripe}" stroke-width="0.18"/>
    <path d="M-0.9,-0.7 L-0.2,-0.55 -0.55,0.1Z" fill="${c.sandcastleWall}"/><circle cx="-0.54" cy="-0.76" r="0.4" fill="${c.parasolStripe}"/>
    ${v === 1 ? `<path d="M2.05,-2 V-3.2 L3.3,-2.78 2.05,-2.4" fill="${c.parasolRed}"/>` : ''}
    ${v === 2 ? `<path d="M1.3,-2.17 L0.9,-2.95 1.7,-2.76Z" fill="${c.sandcastleWall}"/><circle cx="1.3" cy="-3.02" r="0.43" fill="${c.cherryPetalPink}"/>` : ''}
  </g>`;
}

export function svgHammock(x: number, y: number, c: AssetColors, v: number): string {
  const dip = v === 1 ? -0.4 : -0.75;
  const shade = lerpColor(c.hammockFabric, c.trunk, 0.35);
  return `<g transform="translate(${x},${y})">
    <ellipse cx="0.25" cy="0.48" rx="3.3" ry="0.35" fill="${c.trunk}" opacity="0.14"/>
    <path d="M-4,0.45 L-3.65,-3.5 -3.15,-3.35 -3.48,0.6Z M3.35,0.55 L3.02,-3.2 3.48,-3.4 3.87,0.35Z" fill="${c.bareBranch}"/>
    <path d="M-3.85,0.4 L-3.5,-3.25 M3.47,0.3 L3.17,-3.12" stroke="${c.sandcastleWall}" stroke-width="0.12"/>
    <path d="M-3.4,-2.85 L-2.6,-1.9 M3.23,-2.62 L2.55,-1.65" stroke="${c.parasolStripe}" stroke-width="0.15"/>
    <path d="M-2.6,-2.2 Q0,${dip + 0.3} 2.55,-1.95 L2.55,-1.25 Q0,${dip + 1.5} -2.6,-1.48Z" fill="${c.hammockFabric}"/>
    <path d="M-2.6,-1.75 Q0,${dip + 1.05} 2.55,-1.55 L2.55,-1.25 Q0,${dip + 1.5} -2.6,-1.48Z" fill="${shade}"/>
    <path d="M-2.3,-1.9 Q0,${dip + 0.5} 2.3,-1.65" fill="none" stroke="${c.parasolStripe}" stroke-width="0.16"/>
    ${v === 1 ? `<path d="M-1.7,-1.42 l0.2,0.63 M-0.8,-1.08 l0.15,0.7 M0.2,-0.91 v0.7 M1.2,-1.1 l-0.15,0.6" stroke="${c.parasolStripe}" stroke-width="0.13"/>` : ''}
    ${v === 2 ? `<path d="M-1.85,-1.9 Q-1.45,-2.37 -0.85,-2.06 L-0.1,-1.62 Q-0.3,-1.1 -0.9,-1.21Z" fill="${c.beachTowelA}"/><path d="M-1.65,-1.88 L-0.88,-1.6" stroke="${c.parasolStripe}" stroke-width="0.14"/>` : ''}
  </g>`;
}

export function svgSunflower(x: number, y: number, c: AssetColors, v: number): string {
  const count = v === 2 ? 3 : v === 1 ? 2 : 1;
  const flowers = Array.from({ length: count }, (_, i) => {
    const ox = (i - (count - 1) / 2) * 2.15;
    const h = 3.4 + (i % 2) * 1.1;
    return `<g transform="translate(${ox},0)">
      <path d="M-0.14,0.6 Q0.25,-1.7 0,${-h} L0.25,${-h} Q0.55,-1.2 0.15,0.65Z" fill="${c.tulipStem}"/>
      <path d="M0,-1.1 Q-1.2,-1.05 -1.35,-2.2 Q-0.2,-2.15 0.1,-1.5 M0.2,-2 Q1.5,-2.9 1.4,-1.8 Q0.7,-1.45 0.2,-2Z" fill="${c.tulipStem}"/>
      <g transform="translate(0,${-h})">
        <path d="M0,-1.6 Q0.45,-1.25 0.45,-0.85 Q1.2,-1.45 1.35,-0.88 L0.95,-0.35 Q1.85,-0.2 1.45,0.35 L0.95,0.45 Q1.3,1.2 0.68,1.2 L0.3,0.9 Q0.05,1.7 -0.4,1.22 L-0.55,0.75 Q-1.4,1.1 -1.3,0.48 L-0.95,0.1 Q-1.7,-0.4 -1.2,-0.7 L-0.72,-0.58 Q-1,-1.5 -0.4,-1.2Z" fill="${c.sunflowerPetal}"/>
        <path d="M-1.2,-0.7 L-0.65,-0.58 -0.4,-1.2 0,-1.6 0.15,-0.7Z" fill="${lerpColor(c.sunflowerPetal, c.parasolStripe, 0.4)}"/>
        <ellipse rx="0.73" ry="0.78" fill="${c.sunflowerCenter}"/>
        <path d="M-0.46,-0.1 Q-0.42,-0.63 0,-0.58" fill="none" stroke="${lerpColor(c.sunflowerCenter, c.sunflowerPetal, 0.45)}" stroke-width="0.23"/>
      </g>
    </g>`;
  }).join('');
  return `<g transform="translate(${x},${y})">${flowers}</g>`;
}

export function svgWatermelon(x: number, y: number, c: AssetColors, v: number): string {
  const shade = lerpColor(c.watermelonRind, c.trunk, 0.35);
  if (v === 0)
    return `<g transform="translate(${x},${y})">
    <ellipse cx="0.2" cy="0.65" rx="1.9" ry="0.4" fill="${c.trunk}" opacity="0.16"/>
    <path d="M-1.8,0 Q-1.85,-1.23 -0.1,-1.4 Q1.7,-1.33 1.85,-0.25 Q2,0.8 0.3,1 Q-1.35,1 -1.8,0Z" fill="${c.watermelonRind}"/>
    <path d="M-1.65,0.2 Q0.5,1 1.75,-0.65 Q2.25,0.7 0.3,1 Q-1.1,1 -1.65,0.2Z" fill="${shade}"/>
    <path d="M-0.9,-1.17 Q-1.6,-0.3 -0.5,0.7 M0,-1.25 Q-0.5,-0.3 0.5,0.66 M0.8,-1.05 Q0.5,-0.3 1.2,0.35" fill="none" stroke="${c.autumnOlive}" stroke-width="0.19"/>
    <path d="M-1.28,-0.54 Q-0.95,-1 -0.5,-0.96" fill="none" stroke="${lerpColor(c.watermelonRind, c.parasolStripe, 0.45)}" stroke-width="0.19"/>
  </g>`;
  const form =
    v === 1
      ? 'M-1.9,-0.6 Q0,-1.35 1.9,-0.5 Q1.75,1.25 0,1.2 Q-1.7,1 -1.9,-0.6Z'
      : 'M-1.65,0.35 L0,-1.45 1.75,0.45 Q0,1.55 -1.65,0.35Z';
  return `<g transform="translate(${x},${y})">
    <path d="${form}" fill="${c.watermelonRind}"/>
    <path d="${v === 1 ? 'M-1.65,-0.58 Q0,-1.14 1.65,-0.45 Q1.15,0.7 0,0.72 Q-1.2,0.6 -1.65,-0.58Z' : 'M-1.4,0.27 L0,-1.26 1.48,0.34 Q0,1.17 -1.4,0.27Z'}" fill="${c.parasolStripe}"/>
    <path d="${v === 1 ? 'M-1.4,-0.55 Q0,-1.03 1.4,-0.42 Q1,0.43 0,0.5 Q-1,0.43 -1.4,-0.55Z' : 'M-1.15,0.18 L0,-1.09 1.24,0.26 Q0,0.92 -1.15,0.18Z'}" fill="${c.watermelonFlesh}"/>
    <path d="M-0.66,-0.18 q-0.21,0.12 0.02,0.23 q0.18,-0.04 -0.02,-0.23 M0.02,-0.57 q-0.21,0.15 0.02,0.24 q0.17,-0.07 -0.02,-0.24 M0.64,-0.06 q-0.2,0.1 0.02,0.22 q0.17,-0.07 -0.02,-0.22" fill="${c.watermelonSeed}"/>
  </g>`;
}

export function svgSprinkler(x: number, y: number, c: AssetColors, v: number): string {
  const spread = v === 1 ? 2.5 : 1.95;
  const high = v === 2 ? -3.65 : -3.05;
  return `<g transform="translate(${x},${y})">
    <ellipse cy="0.7" rx="1.25" ry="0.38" fill="${c.sprinklerMetal}"/>
    <path d="M-0.18,0.62 V-0.85 H0.2 V0.62Z" fill="${c.sprinklerMetal}"/>
    <path d="M-0.85,-0.82 L0.55,-1.13 0.95,-0.82 0.48,-0.55 -0.9,-0.58Z" fill="${c.sprinklerMetal}"/>
    <path d="M-0.85,-0.82 L0.55,-1.13 0.7,-1.02 -0.8,-0.68Z" fill="${c.poolEdge}"/>
    <path d="M-0.6,-0.9 Q-${spread - 0.2},${high} -${spread},-1 M0.65,-1 Q${spread - 0.2},${high - 0.2} ${spread},-0.8" fill="none" stroke="${c.poolWater}" stroke-width="0.22"/>
    <path d="M-${spread},-0.5 l-0.1,0.32 M${spread},-0.3 l0.1,0.3 M-${spread - 0.35},-1.65 l-0.1,0.22 M${spread - 0.2},-1.4 l0.1,0.2" stroke="${c.waterLight}" stroke-width="0.2" stroke-linecap="round"/>
    ${v === 2 ? `<path d="M0,-1 Q-0.8,-3.9 0.4,-3.5 Q1,-3.1 0.95,-2.4" fill="none" stroke="${c.poolWater}" stroke-width="0.2"/>` : ''}
  </g>`;
}
