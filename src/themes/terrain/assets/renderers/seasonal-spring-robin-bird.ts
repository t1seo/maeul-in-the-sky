import { lerpColor } from '../../../../utils/color.js';
import type { AssetColors } from '../../palette.js';

export function svgRobinBird(x: number, y: number, c: AssetColors, v: number): string {
  const singing = v === 1;
  const brown = c.owl;
  const body = singing
    ? 'M-.9,.05Q-1.08,-.92 -.22,-1.1Q-.24,-1.88 .47,-1.84Q1.27,-1.87 1.24,-1.01Q1.51,-.22 .82,.33Q.06,.81 -.9,.05Z'
    : 'M-.92,.06Q-1.29,-.87 -.37,-1.03Q.13,-1.29 .53,-.96Q1.04,-1.67 1.49,-1.08Q1.83,-.45 1.2,-.01Q.91,.65 .08,.59Q-.57,.55 -.92,.06Z';
  const eyeX = singing ? 0.91 : 1.24;
  const eyeY = singing ? -1.42 : -0.98;
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-.83,.19L-1.86,-.68 -1.65,-1.02 -.39,-.45Z" fill="${lerpColor(brown, c.shadow, 0.25)}"/>` +
    `<path d="M-.46,.4L-.54,.91 -.9,1.01 -.38,1.09 -.22,.52M.37,.47L.38,.94 .07,1.05 .68,1.06 .64,.96 .59,.36Z" fill="${c.cherryTrunk}"/>` +
    `<path d="${body}" fill="${brown}"/>` +
    `<path d="${singing ? 'M.39,-1.31Q1.15,-1.34 1.14,-.79Q1.44,-.17 .75,.29Q.01,.36 -.06,-.23Q-.14,-.89 .39,-1.31Z' : 'M.75,-.94Q1.42,-.81 1.38,-.33Q1.1,.41 .36,.42Q-.01,.33 .08,-.16Q.2,-.69 .75,-.94Z'}" fill="${c.tulipRed}"/>` +
    `<path d="M-.36,-.55Q.09,-.37 .35,.14Q-.27,.49 -.79,.04Q-.98,-.49 -.36,-.55Z" fill="${lerpColor(brown, c.shadow, 0.27)}"/>` +
    `<path d="M-.76,-.55Q-.45,-.99 -.04,-.8L.23,-.39Q-.34,-.54 -.52,-.07Z" fill="${lerpColor(brown, c.eggWhite, 0.27)}"/>` +
    (singing
      ? `<path d="M1.15,-1.49L1.87,-1.67 1.3,-1.19ZM1.26,-1.05L1.88,-.89 1.17,-.83Z" fill="${c.tulipYellow}"/>`
      : `<path d="M1.51,-.92L2.17,-.68 1.5,-.6Z" fill="${c.tulipYellow}"/>`) +
    `<circle cx="${eyeX}" cy="${eyeY}" r=".16" fill="${c.eggWhite}"/><circle cx="${eyeX + 0.03}" cy="${eyeY + 0.02}" r=".105" fill="${c.shadow}"/></g>`
  );
}

function gardenButterfly(
  x: number,
  y: number,
  size: number,
  front: string,
  back: string,
  c: AssetColors,
): string {
  return (
    `<g transform="translate(${x},${y}) scale(${size})">` +
    `<path d="M-.12,.09Q-1.39,.31 -1.26,-.53Q-1.16,-1.22 -.47,-.62L-.02,-.18Q-.74,-.1 -.86,.43Q-.23,.84 .17,.25Z" fill="${back}"/>` +
    `<path d="M-.08,-.08Q.07,-1.17 .86,-1.19Q1.39,-.6 .48,.09Q1.06,.2 .79,.73Q.12,.95 -.08,.22Z" fill="${front}"/>` +
    `<path d="M.14,-.3Q.39,-.96 .78,-.98Q1.04,-.55 .43,-.14ZM-.96,-.49Q-.96,-.83 -.68,-.6L-.3,-.24Z" fill="${lerpColor(front, c.eggWhite, 0.5)}"/>` +
    `<path d="M-.22,.44L-.01,-.6 .16,-.64 .08,.47ZM-.05,-.56L-.22,-.86 -.16,-.91 .05,-.62 .35,-.82 .39,-.74 .12,-.51Z" fill="${c.cherryTrunk}"/></g>`
  );
}

export function svgButterflyGarden(x: number, y: number, c: AssetColors, v: number): string {
  const butterflies =
    v === 1
      ? gardenButterfly(-1.32, -1.08, 0.78, c.butterfly, c.butterflyWing, c) +
        gardenButterfly(0.19, 0.06, 0.72, c.tulipPurple, c.butterflyWing, c) +
        gardenButterfly(1.35, -1.6, 0.63, c.butterflyWing, c.tulipPurple, c)
      : gardenButterfly(-0.91, -0.65, 0.97, c.butterfly, c.butterflyWing, c) +
        gardenButterfly(1.19, -1.36, 0.85, c.tulipPurple, c.butterfly, c);
  return `<g transform="translate(${x},${y})">${butterflies}</g>`;
}

export function svgUmbrella(x: number, y: number, c: AssetColors, v: number): string {
  const colors = [c.parasolRed, c.parasolBlue, c.parasolYellow] as const;
  const color = colors[v] ?? c.parasolRed;
  if (v === 2) {
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M-.13,-2.68L.13,-2.68 .13,1.56Q.13,2.1 .55,1.96Q.81,1.84 .7,1.51L.96,1.43Q1.2,2.27 .48,2.32Q-.13,2.36 -.13,1.56Z" fill="${c.trunk}"/>` +
      `<path d="M-2.56,-.41Q-2.35,-2.24 -.08,-2.65Q2.03,-2.25 2.59,-.41Q1.9,-.94 1.36,-.37Q.66,-.82 0,-.15Q-.67,-.74 -1.38,-.29Q-1.93,-.78 -2.56,-.41Z" fill="${color}"/>` +
      `<path d="M-.08,-2.65Q-1.2,-2.04 -1.38,-.29Q-1.93,-.78 -2.56,-.41Q-2.35,-2.24 -.08,-2.65Z" fill="${lerpColor(color, c.eggWhite, 0.43)}"/>` +
      `<path d="M-.08,-2.65Q1.2,-2.08 1.36,-.37Q1.9,-.94 2.59,-.41Q2.03,-2.25 -.08,-2.65Z" fill="${lerpColor(color, c.cherryTrunk, 0.22)}"/>` +
      `<path d="M-.08,-2.65Q-.19,-1.5 0,-.15M-.08,-2.65Q-1.2,-2.04 -1.38,-.29" stroke="${lerpColor(color, c.eggWhite, 0.65)}" stroke-width=".11" fill="none"/>` +
      `<path d="M-.12,-2.63L-.11,-2.91 .08,-2.91 .11,-2.61Z" fill="${c.trunk}"/></g>`
    );
  }
  const canopy =
    v === 1
      ? 'M.52,-2.9Q1.16,-1.61 .13,.19L-.52,-.02Q-.66,-1.62 .52,-2.9Z'
      : 'M.52,-2.9Q1.07,-1.67 .14,.22L-.45,.05Q-.45,-1.34 .52,-2.9Z';
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M.48,-3.28L.7,-3.23 -.25,1.2Q-.38,1.67 -.74,1.6Q-1.16,1.48 -.87,1.06L-.67,1.2Q-.78,1.43 -.59,1.41L-.5,1.14Z" fill="${c.trunk}"/>` +
    `<path d="${canopy}" fill="${color}"/>` +
    `<path d="M.52,-2.9Q.65,-1.43 .14,.22L-.05,.14 .1,-1.64Z" fill="${lerpColor(color, c.cherryTrunk, 0.25)}"/>` +
    `<path d="M.39,-2.6Q-.21,-1.48 -.21,-.16L-.43,-.18Q-.39,-1.49 .39,-2.6Z" fill="${lerpColor(color, c.eggWhite, 0.38)}"/>` +
    `<path d="M-.37,-.84L.54,-.64 .47,-.39 -.43,-.59Z" fill="${lerpColor(color, c.eggWhite, 0.63)}"/></g>`
  );
}
