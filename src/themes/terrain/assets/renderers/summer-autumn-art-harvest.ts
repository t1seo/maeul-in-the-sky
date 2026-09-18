import type { AssetColors } from '../../palette.js';
import { lerpColor } from '../../../../utils/color.js';

export function autumnLeaf(
  x: number,
  y: number,
  angle: number,
  size: number,
  color: string,
  vein: string,
): string {
  return `<g transform="translate(${x},${y}) rotate(${angle}) scale(${size})">
    <path d="M-0.8,0 L-0.4,-0.3 -0.2,-0.65 0.08,-0.35 0.65,-0.55 0.48,-0.17 0.85,0 0.38,0.2 0.2,0.52 -0.12,0.22 -0.45,0.3Z" fill="${color}"/>
    <path d="M-0.8,0 L0.85,0 0.38,0.2 0.2,0.52 -0.12,0.22Z" fill="${lerpColor(color, vein, 0.3)}"/>
    <path d="M-1,0.03 L0.42,-0.03" stroke="${vein}" stroke-width="0.09"/>
  </g>`;
}

export function orchardFruit(
  x: number,
  y: number,
  radius: number,
  color: string,
  c: AssetColors,
): string {
  return `<g transform="translate(${x},${y}) scale(${radius})">
    <path d="M0,-0.66 C1,-1.35 1.35,-0.05 0.7,0.7 Q0.3,1.2 0,0.92 Q-0.6,1.15 -0.9,0.5 C-1.5,-0.6 -0.6,-1.15 0,-0.66Z" fill="${color}"/>
    <path d="M0.52,-0.72 C1.35,-0.4 1,0.7 0.4,0.88 L0,0.92 Q0.72,0.12 0.52,-0.72Z" fill="${lerpColor(color, c.trunk, 0.3)}"/>
    <path d="M-0.58,-0.25 Q-0.56,-0.63 -0.26,-0.55" fill="none" stroke="${lerpColor(color, c.parasolStripe, 0.6)}" stroke-width="0.22" stroke-linecap="round"/>
    <path d="M0,-0.64 L0.15,-1.12 M0.12,-0.85 Q0.7,-1.3 0.75,-0.95Z" fill="${c.pearGreen}" stroke="${c.trunk}" stroke-width="0.12"/>
  </g>`;
}

export function wovenBasket(contents: string, c: AssetColors, handle: boolean): string {
  const shade = lerpColor(c.nestBrown, c.trunk, 0.35);
  const light = lerpColor(c.nestBrown, c.haybale, 0.55);
  return `${handle ? `<path d="M-1.35,-0.7 Q-1.45,-2.9 0,-2.6 Q1.6,-2.35 1.35,-0.6" fill="none" stroke="${light}" stroke-width="0.23"/>` : ''}
    <ellipse cy="-0.9" rx="1.65" ry="0.57" fill="${shade}"/>
    ${contents}
    <path d="M-1.65,-0.95 Q0,-0.1 1.65,-0.95 L1.23,0.6 Q0,1.15 -1.23,0.6Z" fill="${c.nestBrown}"/>
    <path d="M0.72,-0.53 L1.65,-0.95 1.23,0.6 Q0.8,0.9 0.25,0.91Z" fill="${shade}"/>
    <path d="M-1.65,-0.95 Q0,-0.1 1.65,-0.95 M-1.43,-0.23 Q0,0.35 1.42,-0.24 M-1.28,0.35 Q0,0.85 1.25,0.34" fill="none" stroke="${light}" stroke-width="0.16"/>
    <path d="M-0.9,-0.56 L-0.74,0.65 M-0.15,-0.43 L-0.1,0.82 M0.56,-0.5 L0.42,0.76" stroke="${light}" stroke-width="0.12"/>`;
}
