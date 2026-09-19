import type { AssetColors } from '../../palette.js';
import { naturePool } from './nature-water-shapes.js';

const MARSHES = [
  [
    [-5, -0.5, 0.7, -0.5],
    [-2.5, -1, 1.1, 0],
    [0.5, -1.5, 0.85, 0.5],
    [4.4, 0.3, 0.6, 0.2],
  ],
  [
    [-4.6, 0.3, 0.9, 0.8],
    [-1.8, 0.2, 0.72, 1.5],
    [3.8, -2, 1.2, 0.8],
  ],
  [
    [-4.2, -0.4, 0.9, -1],
    [-0.6, -1.4, 1.35, 0],
    [3.3, -0.1, 1.05, 0.8],
  ],
] as const;

export function svgReedMarsh(x: number, y: number, c: AssetColors, v: number): string {
  const marsh = MARSHES[v] ?? MARSHES[0];
  const clumps = marsh
    .map(
      ([dx, dy, size, lean]) =>
        `<g transform="translate(${dx},${dy}) scale(${size})">` +
        `<path d="M-.7,.2 Q-2,-3.5 -2,-5.1 Q-.5,-3.1 -.3,-.3 Q-.4,-5.5 .8,-6.2 Q.3,-2.8 .4,.1 Q1.4,-3.8 2.4,-4.5 Q1.9,-1 .9,.25Z" fill="${c.reeds}"/>` +
        `<path d="M-.25,.2 Q${lean - 0.25},-4 ${lean},-7.3 M.6,0 Q${lean + 1},-3.3 ${lean + 1.2},-5.8" fill="none" stroke="${c.cattail}" stroke-width=".2"/>` +
        `<path d="M${lean},-6.1v-1.6 M${lean + 1.2},-4.9v-1.25" stroke="${c.trunk}" stroke-width=".58" stroke-linecap="round"/>` +
        `<path d="M-.6,0 Q-1.5,-3.2 -2,-5.1 Q-.6,-3.4 -.2,-.8Z M.45,0 Q1.4,-3.8 2.4,-4.5 Q1.3,-2.2 1,.1Z" fill="${c.leafLight}"/></g>`,
    )
    .join('');
  return (
    `<g transform="translate(${x},${y})">${naturePool(c, v)}${clumps}` +
    `<path d="M-2.8,1 Q-2.1,.1 -.7,.6 L-.1,1.2 -1.5,1.5Z M4,.9 4.7,.25 5.8,.6 5.5,1.1Z" fill="${c.moss}"/></g>`
  );
}
