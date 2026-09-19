import type { AssetColors } from '../../palette.js';

const BAMBOO = [
  [
    [-3.8, -0.6, 10, -0.7],
    [-1.6, 0, 15.7, 0.3],
    [1, 0.6, 13.5, -0.5],
    [3.5, 0, 11.7, 0.8],
  ],
  [
    [-3.7, 0.1, 9.5, 2.5],
    [-0.7, 0.5, 12.5, 2.2],
    [2.5, -0.1, 10.5, -0.1],
  ],
  [
    [-3.9, 0, 12.8, -0.7],
    [-1.6, 0.5, 8.2, 0.4],
    [1.1, 0, 15.4, 1],
    [3.7, 0.6, 9.3, 0.4],
    [5, -0.4, 6.5, 0.4],
  ],
] as const;

export function svgBambooThicket(x: number, y: number, c: AssetColors, v: number): string {
  const canes = BAMBOO[v] ?? BAMBOO[0];
  const stalks = canes
    .map(([dx, dy, height, bend]) => {
      const nodes = [0.23, 0.47, 0.71]
        .map((part) => {
          const nx = bend * part;
          return `M${nx - 0.32},${-height * part}h.64`;
        })
        .join(' ');
      return (
        `<g transform="translate(${dx},${dy})">` +
        `<path d="M-.35,0 Q${bend * 0.4 - 0.35},${-height * 0.5} ${bend - 0.24},${-height} L${bend + 0.2},${-height} Q${bend * 0.4 + 0.3},${-height * 0.5} .3,0Z" fill="${c.pine}"/>` +
        `<path d="M-.21,0 Q${bend * 0.4 - 0.2},${-height * 0.5} ${bend - 0.12},${-height}" fill="none" stroke="${c.evergreenLight}" stroke-width=".16"/>` +
        `<path d="${nodes}" stroke="${c.evergreenDark}" stroke-width=".22"/>` +
        `<g transform="translate(${bend * 0.8},${-height * 0.77}) scale(.8)">` +
        `<path d="M0,0 Q-1.6,-2.8 -3.3,-2.5 Q-2.2,-.5 0,0Z M-.2,.1 Q-2.6,-1 -3.6,.3 Q-1.8,1 -.2,.1Z M0,0 Q1.9,-2.2 3.1,-1.7 Q2.5,-.2 0,0Z M.2,.1 Q2,-.2 2.8,1.2 Q1.3,1 .2,.1Z" fill="${c.evergreenDark}"/>` +
        `<path d="M0,-.2 Q-1.6,-2.8 -3.3,-2.5 L-1.5,-1Z M.15,-.2 Q1.9,-2.2 3.1,-1.7 L1.9,-1Z" fill="${c.evergreenLight}"/></g></g>`
      );
    })
    .join('');
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx=".2" cy=".45" rx="6.6" ry="1.05" fill="${c.shadow}" opacity=".13"/>${stalks}` +
    `<path d="M-3,.6 -2.1,-.15 -.7,.1 .1,.8 -1.5,1Z M2.4,.65 3.2,-.25 4.2,.15 4.6,.8 3.4,1Z" fill="${c.rock}"/>` +
    `<path d="M-3,.6 -2.1,-.15 -.7,.1 -1.6,.6Z M2.4,.65 3.2,-.25 4.2,.15 3.4,.55Z" fill="${c.boulder}"/></g>`
  );
}
