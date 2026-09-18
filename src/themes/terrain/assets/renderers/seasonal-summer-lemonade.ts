import type { AssetColors } from '../../palette.js';
import { lerpColor } from '../../../../utils/color.js';

export function svgLemonade(x: number, y: number, c: AssetColors, v: number): string {
  const shade = lerpColor(c.lemonadeStand, c.trunk, 0.4);
  const top = lerpColor(c.lemonadeStand, c.parasolStripe, 0.45);
  const w = v === 1 ? 2.5 : 2.15;
  return `<g transform="translate(${x},${y})">
    <path d="M-${w},0.7 L0.9,1.35 2.8,0.6 0,-0.15Z" fill="${c.trunk}" opacity="0.16"/>
    <path d="M-${w},-0.9 L1.1,-0.35 1.1,0.9 -${w},0.35Z" fill="${c.lemonadeStand}"/>
    <path d="M1.1,-0.35 L2.6,-1.1 2.6,0.2 1.1,0.9Z" fill="${shade}"/>
    <path d="M-${w + 0.15},-1.1 L-0.7,-1.9 2.8,-1.3 1.15,-0.45Z" fill="${top}"/>
    <path d="M-${w + 0.15},-1.1 L1.15,-0.45 2.8,-1.3 2.8,-1.03 1.15,-0.18 -${w + 0.15},-0.82Z" fill="${shade}"/>
    <path d="M-1.55,-0.4 L0.45,-0.08 M-1.55,-0.05 L0.45,0.27" stroke="${top}" stroke-width="0.12"/>
    <path d="M-1.75,0.35 V0.85 M0.8,0.8 V1.2 M2.35,0.25 V0.65" stroke="${c.bareBranch}" stroke-width="0.28"/>
    <path d="M-1.4,-2.65 L-0.4,-2.48 -0.5,-1.38 Q-1,-1.15 -1.45,-1.55Z" fill="${c.poolEdge}"/>
    <path d="M-1.28,-2.23 L-0.54,-2.12 -0.6,-1.53 -1.32,-1.66Z" fill="${c.lemonYellow}"/>
    <path d="M-0.42,-2.3 Q0.15,-2.4 -0.02,-1.8 L-0.48,-1.64" fill="none" stroke="${c.poolEdge}" stroke-width="0.18"/>
    <path d="M0.4,-1.92 L1.05,-1.8 0.95,-1.1 0.45,-1.2Z" fill="${c.parasolStripe}"/>
    <path d="M0.55,-1.75 L0.94,-1.68 0.86,-1.27 0.55,-1.33Z" fill="${c.lemonYellow}"/>
    ${v === 1 ? `<path d="M1.55,-2.55 L2.45,-2.3 2.45,-1.55 1.55,-1.75Z" fill="${c.bareBranch}"/><ellipse cx="1.95" cy="-2.07" rx="0.3" ry="0.2" fill="${c.lemonYellow}"/>` : ''}
    ${v === 2 ? `<path d="M-2.8,-1.5 L-1.9,-1.2 -1.7,-0.5 -2.6,-0.8Z" fill="${c.beachTowelB}"/><path d="M1.5,-1.4 Q1.3,-2 1.8,-2.12 Q2.4,-1.95 2.2,-1.57Z" fill="${c.lemonYellow}"/>` : ''}
  </g>`;
}

export function svgFirefliesAsset(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 2) {
    return `<g transform="translate(${x},${y})">
      <ellipse cx="0.2" cy="0.28" rx="1.1" ry="0.3" fill="${c.trunk}" opacity="0.16"/>
      <path d="M-0.65,-2.6 V-2.2 Q-1,-2 -0.95,-1.65 V-0.2 Q0,0.5 0.95,-0.2 V-1.65 Q1,-2 0.65,-2.2 V-2.6Z" fill="${c.poolWater}" opacity="0.3"/>
      <path d="M-0.65,-2.25 Q-1,-1.9 -0.82,-0.4 M-0.5,-0.1 Q0,0.12 0.5,-0.1" fill="none" stroke="${c.poolEdge}" stroke-width="0.16"/>
      <path d="M-0.75,-2.6 Q0,-2.9 0.75,-2.6 V-2.28 Q0,-2.05 -0.75,-2.28Z" fill="${c.acornCap}"/>
      <ellipse cx="0" cy="-2.62" rx="0.72" ry="0.18" fill="${c.nestBrown}"/>
      <path d="M-0.4,-2.3 Q-1.4,-3 0,-3.5 Q1.4,-3 0.4,-2.3" fill="none" stroke="${c.trunk}" stroke-width="0.12"/>
      <path d="M-0.45,-1.8 l0.2,-0.15 0.22,0.17 -0.2,0.25Z M0.25,-0.95 l0.18,-0.15 0.2,0.16 -0.2,0.22Z" fill="${c.lanternGlow}"/>
      <path d="M-0.38,-1.68 l-0.25,-0.35 M-0.13,-1.67 l0.28,-0.25 M0.3,-0.9 l-0.2,-0.28" stroke="${c.parasolStripe}" stroke-width="0.14"/>
    </g>`;
  }
  const bugs =
    v === 1
      ? [
          [-4.4, -2.7],
          [-2.8, -3.7],
          [-1.2, -1.7],
          [0.1, -3.3],
          [1.8, -2.5],
          [3.2, -4],
        ]
      : [
          [-2.3, -1.7],
          [-0.4, -3],
          [1.65, -2.1],
        ];
  const insects = bugs
    .map(
      ([bx, by], i) => `<g transform="translate(${bx},${by}) rotate(${i % 2 ? -20 : 20})">
    <ellipse cy="0.04" rx="0.48" ry="0.4" fill="${c.lanternGlow}" opacity="0.16"/>
    <path d="M0,-0.05 Q-0.8,-0.65 -0.48,-0.15 L0,0.06 Q0.8,-0.5 0.48,-0.45Z" fill="${c.parasolStripe}"/>
    <path d="M-0.13,-0.24 Q0,-0.48 0.13,-0.24 L0.17,0.08 -0.13,0.13Z" fill="${c.trunk}"/>
    <ellipse cy="0.16" rx="0.2" ry="0.24" fill="${c.lanternGlow}"/>
  </g>`,
    )
    .join('');
  return `<g transform="translate(${x},${y})">${insects}</g>`;
}

export function svgSwimmingPool(x: number, y: number, c: AssetColors, v: number): string {
  const shade = lerpColor(c.poolEdge, c.poolWater, 0.45);
  const floor = lerpColor(c.poolWater, c.waterLight, 0.3);
  const w = v === 0 ? 3.15 : 3.55;
  return `<g transform="translate(${x},${y})">
    <path d="M-${w},-0.6 Q-4,0.2 -2.5,0.85 L0.8,2 Q1.4,2.2 2,1.9 L3.55,1.05 V0.3 L0.8,0.9Z" fill="${shade}"/>
    <path d="M-${w},-0.8 L-1.5,-1.8 Q-1.1,-2 0,-1.65 L3.25,-0.65 Q4,-0.3 3.4,0.2 L1.65,1.2 Q1.2,1.45 0.6,1.22 L-2.9,0.15 Q-${w + 0.2},-0.1 -${w},-0.8Z" fill="${c.poolEdge}"/>
    <path d="M-2.8,-0.6 L-1.3,-1.38 2.95,-0.1 1.35,0.82Z" fill="${c.poolWater}"/>
    <path d="M-2.8,-0.6 L-1.3,-1.38 -1.3,-0.92 2.25,0.26 1.35,0.82Z" fill="${floor}"/>
    <path d="M-1.9,-0.45 L-0.5,-0.02 M0.2,0.2 L1.1,0.47" stroke="${c.waterLight}" stroke-width="0.18" stroke-linecap="round"/>
    ${v === 1 ? `<ellipse cx="0.5" cy="-0.3" rx="0.92" ry="0.46" fill="${c.parasolYellow}"/><ellipse cx="0.5" cy="-0.38" rx="0.43" ry="0.2" fill="${c.poolWater}"/><path d="M-0.26,-0.5 Q0.1,-0.88 0.65,-0.68" fill="none" stroke="${c.parasolStripe}" stroke-width="0.16"/>` : ''}
    ${v === 2 ? `<path d="M1.7,-0.45 V-1.45 Q1.7,-1.95 2.05,-1.75 L2.25,-1.6 V-0.7 M2.4,-0.9 V-1.9 Q2.4,-2.4 2.75,-2.2 L2.95,-2 V-1.1 M1.7,-0.85 L2.4,-1.3 M1.7,-1.15 L2.4,-1.6" fill="none" stroke="${c.sprinklerMetal}" stroke-width="0.2"/>` : ''}
  </g>`;
}
