import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function svgReeds(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-1.3,.1Q-2,-1.4 -2.5,-2.7Q-.8,-2 -.4,0L.3,0Q.7,-2.5 2.5,-3.3Q1.7,-.9 1,.2Z" fill="${c.reeds}"/>` +
    `<path d="M-.6,.1Q-1.4,-2.6 -1.3,-5M.1,0Q.3,-2.6 .5,-5.7M.8,0Q1.1,-1.8 1.4,-4.2" fill="none" stroke="${c.reeds}" stroke-width=".4"/>` +
    `<path d="M-.6,0Q-1.3,-3.1 -.5,-3.7Q.1,-1.4 .1,0M.4,0Q.8,-2 1.6,-2.4Q1.1,-.7 .4,0" fill="${c.leafLight}"/>` +
    `<path d="M-1.65,-5.3Q-1.35,-5.8 -1.02,-5.3L-.95,-4Q-1.25,-3.5 -1.55,-4ZM.2,-6Q.55,-6.5 .85,-6L.78,-4.6Q.5,-4.2 .2,-4.6Z" fill="${c.trunk}"/>` +
    `<path d="M-1.48,-5.25L-1.42,-4.15M.38,-5.95L.38,-4.8" stroke="${c.wheat}" stroke-width=".18"/>` +
    `</g>`
  );
}

export function svgFountain(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-2.9,-.8L-2.8,.2Q0,1.8 2.8,.2L2.9,-.8Z" fill="${c.boulder}"/>` +
    `<path d="M-2.9,-.8Q-2.2,.7 .3,.7L.3,1Q-2.1,.9 -2.8,.2Z" fill="${c.fountain}"/>` +
    `<ellipse cy="-.8" rx="2.9" ry="1.15" fill="${c.fountain}"/>` +
    `<ellipse cy="-.8" rx="2.25" ry=".72" fill="${c.fountainWater}"/>` +
    `<path d="M-1.85,-.85Q-.8,-1.5 .9,-1.2" stroke="${c.waterLight}" stroke-width=".22" fill="none"/>` +
    `<path d="M-.65,-.6L-.4,-3.1H.4L.65,-.6Q0,-.2 -.65,-.6" fill="${c.fountain}"/>` +
    `<path d="M.1,-3.1H.4L.65,-.6L.1,-.45Z" fill="${c.boulder}"/>` +
    `<path d="M-1.1,-3.2Q0,-2.7 1.1,-3.2L.7,-2.55Q0,-2.2 -.7,-2.55Z" fill="${c.fountain}"/>` +
    `<ellipse cy="-3.2" rx="1.1" ry=".35" fill="${c.waterLight}"/>` +
    `<path d="M0,-4.1Q-1.3,-4.5 -1.7,-1.5M0,-4.1Q1.4,-4.2 1.7,-1.5" stroke="${c.fountainWater}" stroke-width=".35" fill="none"/>` +
    `<line x1="0" y1="-3.2" x2="0" y2="-4.8" stroke="${c.waterLight}" stroke-width=".45" stroke-linecap="round">` +
    motionMarkup(
      `<animate attributeName="y2" values="-4.8;-5.3;-4.8" dur="2s" repeatCount="indefinite"/>`,
    ) +
    `</line></g>`
  );
}

export function svgCanal(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-3.6,-.7L2.8,-1.65L3.6,-.65L-2.8,.45Z" fill="${c.canal}"/>` +
    `<path d="M-3.6,-.7L-2.8,.45V.8L-3.6,-.35ZM-2.8,.45L3.6,-.65V-.25L-2.8,.8Z" fill="${c.boulder}"/>` +
    `<path d="M-3.15,-.55L2.75,-1.38L3.15,-.78L-2.65,.18Z" fill="${c.fountainWater}"/>` +
    `<path d="M-2.55,-.45L.9,-.96M-.65,-.1L2.25,-.56" stroke="${c.waterLight}" stroke-width=".16" fill="none"/>` +
    `<path d="M-1.3,-1.04L-1.09,-.79M1.2,-1.41L1.42,-1.16M-.4,.04L-.4,.39M2,-.38L2,-.02" stroke="${c.rock}" stroke-width=".15"/>` +
    `</g>`
  );
}

export function svgWatermill(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-2.8,-3.7L.1,-3.1V.35L-2.8,-.3Z" fill="${c.wall}"/>` +
    `<path d="M.1,-3.1L2,-4V-.55L.1,.35Z" fill="${c.wallShade}"/>` +
    `<path d="M-3.2,-3.8L-1.2,-6.35L.45,-3.3Z" fill="${c.roofB}"/>` +
    `<path d="M-1.2,-6.35L.7,-6L2.5,-4.25L.45,-3.3Z" fill="${c.roofB}"/>` +
    `<path d="M-1.2,-6.35L.7,-6L2.5,-4.25L.45,-3.3Z" fill="${c.shadow}" opacity=".2"/>` +
    `<path d="M-3.2,-3.8L.45,-3.3L2.5,-4.25V-3.9L.45,-2.95L-3.2,-3.45Z" fill="${c.trunk}"/>` +
    `<path d="M-2.45,-3.05L-.45,-2.65M-2.5,-.3V-3.1M-.4,.16V-2.7" stroke="${c.trunk}" stroke-width=".25"/>` +
    `<path d="M-1.9,-.1V-1.6Q-1.35,-2.3 -.85,-1.4V.12Z" fill="${c.trunk}"/>` +
    `<path d="M-1.7,-2.7V-3.3L-1,-3.15V-2.55Z" fill="${c.lanternGlow}"/>` +
    `<path d="M1.7,.2Q3.5,1.3 5.7,.1" stroke="${c.fountainWater}" stroke-width=".5" fill="none"/>` +
    `<g><circle cx="3.5" cy="-1.7" r="2.15" fill="${c.trunk}"/>` +
    `<circle cx="3.5" cy="-1.7" r="1.65" fill="${c.dock}"/>` +
    `<path d="M3.5,-3.85V.45M1.35,-1.7H5.65M1.98,-3.22L5.02,-.18M1.98,-.18L5.02,-3.22" stroke="${c.trunk}" stroke-width=".35"/>` +
    `<path d="M2.92,-3.72H4.08M2.92,.32H4.08M1.49,-2.28V-1.12M5.51,-2.28V-1.12" stroke="${c.wheat}" stroke-width=".26"/>` +
    `<circle cx="3.5" cy="-1.7" r=".4" fill="${c.boulder}"/>` +
    motionMarkup(
      `<animateTransform attributeName="transform" type="rotate" from="0 3.5 -1.7" to="360 3.5 -1.7" dur="6s" repeatCount="indefinite"/>`,
    ) +
    `</g></g>`
  );
}

export function svgGardenTree(x: number, y: number, c: AssetColors, v: number): string {
  const trunk = `<path d="M-.45,.1L-.23,-3.1H.28L.45,.1Z" fill="${c.trunk}"/>`;
  let crown: string;
  switch (v) {
    case 1:
      crown =
        `<path d="M-.25,-7.2Q-.7,-6.2 -1,-5.25L-.72,-5.15Q-1.45,-3.95 -1.65,-2.55Q0,-1.65 1.7,-2.5Q1.25,-4.05 .83,-4.65L1,-4.8Q.45,-6.1 -.25,-7.2Z" fill="${c.gardenTree}"/>` +
        `<path d="M-.25,-7.2Q-.25,-5.5 .15,-4.1L.55,-2.15Q1.2,-2.22 1.7,-2.5Q1.25,-4.05 .83,-4.65L1,-4.8Z" fill="${c.bushDark}"/>` +
        `<path d="M-.45,-6.1L-1.24,-2.75Q-.65,-2.5 -.32,-2.55Q-.7,-4.2 -.45,-6.1Z" fill="${c.leafLight}"/>`;
      break;
    case 2:
      crown =
        `<path d="M-1.8,-2.8Q-2.6,-3.9 -1.6,-4.8Q-1.65,-6.15 -.4,-6Q.2,-6.6 1,-5.7Q2.15,-5.7 2.25,-4.55Q2.9,-3.2 1.45,-2.65Q.1,-2 -1.8,-2.8Z" fill="${c.gardenTree}"/>` +
        `<path d="M-1.9,-4Q-2.3,-5 -1.2,-5.35Q-1.1,-6.35 .05,-5.95Q.8,-6.3 1.1,-5.45Q2.1,-5.5 2,-4.45Q1,-3.85 .25,-4.25Q-.8,-3.55 -1.9,-4Z" fill="${c.flower}"/>` +
        `<path d="M-1.65,-4.7Q-1.4,-5.3 -.7,-5.25M.2,-5.55Q.65,-5.75 .9,-5.15M.5,-3.15L.75,-3.45" fill="none" stroke="${c.flowerAlt}" stroke-width=".45" stroke-linecap="round"/>`;
      break;
    default:
      crown =
        `<path d="M-1.7,-2.6Q-2.6,-3.6 -1.95,-4.6Q-2.05,-5.8 -.75,-5.85Q-.1,-6.65 .8,-5.8Q2.1,-5.85 2.2,-4.55Q2.75,-3.15 1.15,-2.5Q-.3,-2.05 -1.7,-2.6Z" fill="${c.gardenTree}"/>` +
        `<path d="M1,-5.35Q2.2,-5.3 2.2,-4.55Q2.75,-3.15 1.15,-2.5Q-.3,-2.05 -1.7,-2.6Q.65,-2.65 .9,-3.5Q1.6,-4.15 1,-5.35Z" fill="${c.bushDark}"/>` +
        `<path d="M-1.65,-4.1Q-2.1,-5.25 -.75,-5.3Q-.25,-6.05 .45,-5.3Q1,-4.5 .25,-4.1Q-.65,-4.7 -1.65,-4.1Z" fill="${c.leafLight}"/>`;
  }
  return `<g transform="translate(${x},${y})">${trunk}${crown}</g>`;
}

export function svgPondLily(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M.2,-.1L1.5,.55Q-.4,1.1 -1.85,.3Q-2.5,-.3 -1.05,-.75Q.9,-1.2 1.95,-.35L.2,-.1Z" fill="${c.pine}"/>` +
    `<path d="M-1.7,-.15Q-.65,-.8 .8,-.45L.15,-.1Q-.7,-.4 -1.7,-.15Z" fill="${c.leafLight}"/>` +
    `<path d="M.25,-.3Q-.9,-.5 -.85,-1.18Q-.15,-1.1 .1,-.85Q.08,-1.6 .5,-1.65Q.9,-1.2 .8,-.85Q1.2,-1.15 1.55,-.95Q1.4,-.22 .25,-.3Z" fill="${c.flower}"/>` +
    `<path d="M-.1,-.7Q.35,-1.15 .8,-.7L.4,-.4Z" fill="${c.flowerAlt}"/>` +
    `<ellipse cx=".4" cy="-.62" rx=".23" ry=".16" fill="${c.flowerCenter}"/>` +
    `</g>`
  );
}
