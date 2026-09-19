import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function svgRock(x: number, y: number, c: AssetColors, v: number): string {
  let rock: string;
  switch (v) {
    case 1:
      rock =
        `<path d="M-2.4,-.45Q-2.55,-2.1 -.9,-2.6Q.8,-3 1.9,-1.8L2.4,-.45Q1.25,.55 -.3,.4Q-1.8,.4 -2.4,-.45Z" fill="${c.boulder}"/>` +
        `<path d="M-2.4,-.45Q-2.55,-2.1 -.9,-2.6Q.8,-3 1.9,-1.8L.55,-.75L-.8,-.35Z" fill="${c.rock}"/>` +
        `<path d="M-1.85,-1.25Q-1.5,-2.2 -.6,-2.25L.45,-1.95L-.55,-1.5Z" fill="${c.snowCap}" opacity=".28"/>`;
      break;
    case 2:
      rock =
        `<path d="M-2.8,-.4L-1.6,-1.3L1.55,-1.25L2.65,-.35L1.15,.5L-1.45,.45Z" fill="${c.boulder}"/>` +
        `<path d="M-2.8,-.4L-1.6,-1.3L1.55,-1.25L2.1,-.7L.4,-.05Z" fill="${c.rock}"/>` +
        `<path d="M-1.4,-1.1L-.95,-2.15L.9,-2.35L1.75,-1.6L1.35,-.8L-.45,-.6Z" fill="${c.boulder}"/>` +
        `<path d="M-1.4,-1.1L-.95,-2.15L.9,-2.35L1.3,-1.8L.2,-1.15Z" fill="${c.rock}"/>` +
        `<path d="M-.8,-2L-.35,-2.95L.65,-3.1L1.1,-2.45L.65,-1.95Z" fill="${c.rock}"/>` +
        `<path d="M-.8,-2L-.35,-2.95L.65,-3.1L.15,-2.35Z" fill="${c.snowCap}" opacity=".28"/>`;
      break;
    default:
      rock =
        `<path d="M-1.9,-.2L-1.6,-2.15L-.45,-3.05L1.2,-2.45L2,-.65L1,.35L-.8,.3Z" fill="${c.boulder}"/>` +
        `<path d="M-1.9,-.2L-1.6,-2.15L-.45,-3.05L.1,-1.5L-.8,.3Z" fill="${c.rock}"/>` +
        `<path d="M-1.6,-2.15L-.45,-3.05L1.2,-2.45L.1,-1.5Z" fill="${c.rock}"/>` +
        `<path d="M-1.6,-2.15L-.45,-3.05L.1,-2.4L-.45,-1.95Z" fill="${c.snowCap}" opacity=".3"/>`;
  }
  return `<g transform="translate(${x},${y})">${rock}</g>`;
}

export function svgBoulder(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-3,-.65L-2.6,-2.6L-1,-3.65L.85,-3.8L2.45,-2.4L3,-.55L1.35,.5L-1.15,.45Z" fill="${c.boulder}"/>` +
    `<path d="M-3,-.65L-2.6,-2.6L-1,-3.65L.85,-3.8L.2,-2L-1.2,-.7Z" fill="${c.rock}"/>` +
    `<path d="M.85,-3.8L2.45,-2.4L3,-.55L1.35,.5L.2,-2Z" fill="${c.shadow}" opacity=".2"/>` +
    `<path d="M-2.1,-2.5L-1,-3.35L.15,-3.45L-.3,-2.55Z" fill="${c.snowCap}" opacity=".3"/>` +
    `<path d="M-1.2,-.7L-.85,-1.65L-.2,-1.95M1.9,-1.5L2.05,-.5" stroke="${c.shadow}" stroke-width=".18" opacity=".4" fill="none"/>` +
    `</g>`
  );
}

export function svgFlower(x: number, y: number, c: AssetColors, v: number): string {
  const leaves = `<path d="M-.15,0L-.2,-2.7H.15L.2,0ZM-.1,-.65Q-1.45,-.5 -1.6,-1.8Q-.45,-1.85 -.1,-.65M.15,-1.05Q.4,-2.1 1.5,-2.05Q1.15,-.9 .15,-1.05" fill="${c.pine}"/>`;
  let petals: string;
  switch (v) {
    case 1:
      petals =
        `<path d="M-.5,-3.4Q-1,-4.6 -.05,-4.45Q.55,-4.5 .6,-3.7Q1.6,-4.05 1.65,-3.3Q1.6,-2.85 .8,-2.85Q1.15,-1.9 .35,-2.1L-.2,-2.7Q-1,-1.95 -1.4,-2.55Q-1.65,-3.2 -.5,-3.4Z" fill="${c.flowerCenter}"/>` +
        `<ellipse cx=".05" cy="-3.25" rx=".5" ry=".42" fill="${c.flower}"/>`;
      break;
    case 2:
      petals =
        `<path d="M-.75,-.8L-.95,-3.1M.5,-1.1L.7,-3.45" stroke="${c.pine}" stroke-width=".3"/>` +
        `<path d="M-1.65,-3.3Q-1.8,-4.1 -1,-3.75Q-.25,-4.2 -.15,-3.3L-.4,-2.6Q-.95,-2.25 -1.5,-2.7ZM.05,-3.55Q-.05,-4.35 .65,-4.1Q1.45,-4.5 1.55,-3.65L1.3,-2.85Q.7,-2.55 .25,-2.95ZM-.55,-2.35Q-.7,-3.1 0,-2.85Q.7,-3.15 .9,-2.45L.55,-1.85Q0,-1.6 -.45,-1.9Z" fill="${c.wildflower}"/>` +
        `<path d="M-1.4,-3.35Q-.85,-3.05 -.4,-3.35M.3,-3.65Q.8,-3.35 1.3,-3.65M-.25,-2.4L.5,-2.4" stroke="${c.flowerAlt}" stroke-width=".22" fill="none"/>`;
      break;
    default:
      petals =
        `<path d="M-.5,-3.7Q-.35,-4.65 .45,-4.15L.65,-3.75Q1.65,-3.9 1.35,-3L.9,-2.85Q1.3,-1.95 .35,-2.1L-.05,-2.55Q-.8,-1.9 -1.1,-2.55L-1.05,-3Q-1.95,-3.7 -.95,-3.8Z" fill="${c.flower}"/>` +
        `<path d="M-.85,-3.6Q-.55,-3.9 -.45,-3.35M-.15,-3.9L.2,-3.55" stroke="${c.flowerAlt}" stroke-width=".32" stroke-linecap="round"/>` +
        `<ellipse cx=".05" cy="-3.2" rx=".4" ry=".32" fill="${c.flowerCenter}"/>`;
  }
  return `<g transform="translate(${x},${y})">${leaves}${petals}</g>`;
}

export function svgBush(x: number, y: number, c: AssetColors, v: number): string {
  let crown: string;
  switch (v) {
    case 1:
      crown =
        `<path d="M-3.5,-.25Q-4,-1.2 -2.65,-1.65Q-2.1,-2.6 -.9,-1.9Q-.1,-2.55 .65,-1.95Q2.2,-2.4 2.75,-1.45Q4,-1.3 3.65,-.25Q1.15,.85 -2.3,.4Z" fill="${c.bushDark}"/>` +
        `<path d="M-3.2,-.65Q-3.45,-1.3 -2.35,-1.4Q-1.95,-2.3 -.8,-1.6Q.05,-2.3 .65,-1.6Q2,-2.2 2.7,-1.1Q1.3,-.35 .1,-.65Q-1.5,.1 -3.2,-.65Z" fill="${c.bush}"/>` +
        `<path d="M-2.55,-1.2Q-2,-2.05 -1,-1.55Q-.3,-2.05 .3,-1.45Q-1,-.95 -2.55,-1.2Z" fill="${c.leafLight}"/>`;
      break;
    default:
      crown =
        `<path d="M-2.25,-.25Q-2.95,-1.1 -2.2,-1.85Q-2.2,-3.05 -.9,-2.85Q-.1,-3.65 .85,-2.85Q2.2,-3 2.25,-1.7Q3,-.4 1.4,.25Q-.4,.75 -2.25,-.25Z" fill="${c.bushDark}"/>` +
        `<path d="M-2.25,-1.15Q-2.45,-2.3 -1.25,-2.3Q-.9,-3.4 .05,-2.85Q.85,-3.15 1.4,-2.3Q2.1,-2.05 1.65,-1.3Q.65,-.65 -.15,-1.05Q-1.3,-.4 -2.25,-1.15Z" fill="${c.bush}"/>` +
        `<path d="M-1.8,-1.85Q-1.5,-2.45 -.9,-2.3Q-.65,-3.05 .05,-2.65Q.65,-2.85 .95,-2.2Q-.35,-1.55 -1.8,-1.85Z" fill="${c.leafLight}"/>`;
      if (v === 2)
        crown += `<path d="M-2.2,-1.9l-.3,-.3 .3,-.25 .1,-.4 .4,.2 .35,-.05 .05,.4 .2,.3 -.4,.2ZM.7,-3l-.2,-.4 .4,-.15 .25,-.3 .3,.3 .4,.1 -.2,.4 .05,.4 -.5,-.1ZM.6,-.7l-.2,-.35 .3,-.25 .2,-.3 .35,.2 .4,.1 -.15,.4 -.3,.25Z" fill="${c.flower}"/>`;
  }
  return `<g transform="translate(${x},${y})">${crown}</g>`;
}

export function svgDriftwood(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-3.6,-.65Q-1.35,-1.6 .55,-.85L1.25,-1.9L2.1,-2.35L1.7,-1.45L1.2,-.65L3.6,-.35L4,.15L2.6,.4L.55,.1Q-1.25,-.45 -3.35,.25Z" fill="${c.driftwood}"/>` +
    `<path d="M-3.6,-.65Q-1.3,-1.6 .55,-.85L1.25,-1.9L2.1,-2.35L1.35,-1.4L.7,-.35Q-1.6,-1 -3.45,-.1Z" fill="${c.wheat}" opacity=".45"/>` +
    `<path d="M-2.7,-.3Q-1.1,-.8 .65,-.25L2.7,.08M-.8,-.85L.05,-.65" fill="none" stroke="${c.trunk}" stroke-width=".2"/>` +
    `<path d="M-3.6,-.65Q-4.1,-.55 -3.9,.05Q-3.45,.65 -3.35,.25Z" fill="${c.trunk}"/>` +
    `</g>`
  );
}

export function svgSandcastle(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-2.55,-.3L-2.2,-2.7H-1.55V-2.2H-.9V-2.7H-.3V-2.2H.35V-2.7H1L1.1,.25Z" fill="${c.sandcastle}"/>` +
    `<path d="M1,-2.7L2.2,-3L2.65,-.3L1.1,.25Z" fill="${c.sandcastle}"/>` +
    `<path d="M1,-2.7L2.2,-3L2.65,-.3L1.1,.25Z" fill="${c.trunk}" opacity=".22"/>` +
    `<path d="M-1.15,-2.3L-.9,-4.3H-.4V-3.95H.1V-4.3H.6V-3.95H1V-4.3H1.4L1.55,-2.55Z" fill="${c.sandcastle}"/>` +
    `<path d="M-1.15,-2.3L-.9,-4.3H-.45L-.6,-2.35ZM-2.25,-2H-1.95L-2.08,-.55H-2.45Z" fill="${c.sail}" opacity=".4"/>` +
    `<path d="M-.95,.05V-.85Q-.6,-1.55 -.25,-.85V.12Z" fill="${c.trunk}" opacity=".55"/>` +
    `<path d="M.25,-4.1V-5.45" stroke="${c.trunk}" stroke-width=".18"/>` +
    `<path d="M.3,-5.45L1.7,-5.13L.3,-4.8Z" fill="${c.buoy}"/>` +
    `</g>`
  );
}

export function svgTidePools(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-3.1,-.5L-2.4,-1.25L-.6,-1.35L.6,-.55L.15,.5L-1.7,.8L-2.85,.3ZM.25,-.9L1.2,-1.55L2.6,-1.25L3.15,-.45L2.3,.2L.8,.05Z" fill="${c.rock}"/>` +
    `<path d="M-2.7,-.45Q-1.7,-1.25 -.25,-.75Q.7,-.15 -.9,.35Q-2.6,.55 -2.7,-.45ZM.75,-.85Q2,-1.45 2.7,-.65Q2.75,-.05 1.5,-.2Z" fill="${c.tidePools}"/>` +
    `<path d="M-2.4,-.35Q-1.5,-.85 -.7,-.6M1.2,-.8L2,-.85" stroke="${c.waterLight}" stroke-width=".23" fill="none"/>` +
    `<path d="M-3.1,-.5L-2.85,.3L-1.7,.8L-1.7,.5ZM.8,.05L2.3,.2L3.15,-.45L2.7,-.35L2.2,-.05Z" fill="${c.boulder}"/>` +
    `</g>`
  );
}

export function svgHeron(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M.1,-2.4L-.15,-.15L-.85,.1M.85,-2.3L1.15,-1.15L.6,-.05L1.3,.1" fill="none" stroke="${c.wheat}" stroke-width=".24"/>` +
    `<path d="M-.2,-2.4Q-1.3,-3.6 -.1,-4.6Q.55,-5.2 -.35,-5.55Q-1.5,-6.1 -.7,-6.9Q.2,-7.5 .75,-6.6Q.9,-6 .2,-5.8Q1.45,-5.1 .95,-4.25Q1.8,-3.55 1.15,-2.6L1.65,-2.1Z" fill="${c.heron}"/>` +
    `<path d="M-.65,-6.7Q-.3,-7.05 .1,-6.7Q.45,-6.1 -.2,-5.95Q-.75,-5.65 .05,-5.2Q.75,-4.75 .3,-4.25L-.15,-4.4Q.4,-5 -.35,-5.55Q-1.5,-6.1 -.65,-6.7Z" fill="${c.seagull}"/>` +
    `<path d="M.15,-4.1Q1.3,-4.2 1.15,-2.6Q-.1,-2.7 -.4,-3.2Z" fill="${c.shadow}" opacity=".3"/>` +
    `<path d="M-.8,-6.45L-2.45,-6.05L-.65,-6.1Z" fill="${c.wheat}"/>` +
    `<circle cx="-.4" cy="-6.55" r=".13" fill="${c.shadow}"/>` +
    `</g>`
  );
}

export function svgShellfish(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-.8,.45L-2.2,-.3Q-2.45,-.8 -1.95,-.95Q-1.9,-1.4 -1.4,-1.2Q-1,-1.65 -.7,-1.2Q-.15,-1.4 -.1,-.95Q.55,-.65 .15,-.2ZM1.45,.45L.35,-.25Q.15,-.8 .65,-.9Q.85,-1.4 1.3,-1.1Q1.9,-1.5 2,-.95Q2.65,-.85 2.5,-.3Z" fill="${c.shellfish}"/>` +
    `<path d="M-.8,.45L-2.2,-.3L-2.25,-.65L-.8,.12L.25,-.45L.15,-.2ZM1.45,.45L.35,-.25L.3,-.6L1.45,.12L2.5,-.55L2.5,-.3Z" fill="${c.trunk}" opacity=".32"/>` +
    `<path d="M-.8,.1L-1.7,-.9M-.8,.1L-1.15,-1.15M-.8,.1L-.55,-1.05M1.45,.1L.75,-.8M1.45,.1L1.25,-1M1.45,.1L1.9,-.95" stroke="${c.sail}" stroke-width=".18" fill="none"/>` +
    `</g>`
  );
}

export function svgCattail(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})"><g ${motionMarkup('class="sway-gentle"')}>` +
    `<path d="M-.85,.1Q-1.7,-1.75 -1.8,-3.4Q-.55,-2.6 -.2,.05M.4,.1Q.75,-2.75 1.8,-3.8Q1.7,-1.4 1,.2Z" fill="${c.cattail}"/>` +
    `<path d="M-.45,.1L-.75,-6.1M.45,0L.65,-6.8" stroke="${c.cattail}" stroke-width=".34"/>` +
    `<path d="M-.1,.1Q-.85,-2.6 -.45,-4.2Q.3,-2.55 .4,.1Z" fill="${c.leafLight}"/>` +
    `<path d="M-1.1,-6.1Q-.8,-6.55 -.42,-6.1L-.36,-4.55Q-.65,-4.15 -.99,-4.55ZM.3,-6.8Q.6,-7.25 1,-6.8L.9,-5.15Q.5,-4.8 .25,-5.2Z" fill="${c.trunk}"/>` +
    `<path d="M-.94,-6L-.85,-4.85M.48,-6.7L.42,-5.55" stroke="${c.wheat}" stroke-width=".18"/>` +
    `</g></g>`
  );
}

export function svgFrog(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-.65,-.95Q-1.65,-1.3 -1.8,-.45L-1.3,.1L-1.8,.5L-.65,.4L-.35,-.05M.65,-.95Q1.65,-1.3 1.8,-.45L1.3,.1L1.8,.5L.65,.4L.35,-.05" fill="${c.pine}"/>` +
    `<path d="M-1,-.4Q-1.2,-1 -.85,-1.45Q-1.3,-2.1 -.65,-2.15Q-.25,-2.25 0,-1.75Q.3,-2.25 .7,-2.15Q1.3,-2 .9,-1.45Q1.4,-.15 .45,.05L-.45,.05Z" fill="${c.frog}"/>` +
    `<path d="M-.8,-1.4Q0,-1.85 .85,-1.3L.45,-.65L-.45,-.65Z" fill="${c.leafLight}"/>` +
    `<path d="M-.6,-.45L-.6,.35L-.95,.5M.6,-.45L.6,.35L.95,.5" stroke="${c.frog}" stroke-width=".28" fill="none"/>` +
    `<path d="M-.65,-1.85v.25M.65,-1.85v.25M-.3,-.95Q0,-.75 .3,-.95" stroke="${c.shadow}" stroke-width=".18" stroke-linecap="round" fill="none"/>` +
    `</g>`
  );
}

export function svgLily(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M.15,.1L1.35,.75Q-.9,1.15 -2,.3Q-2.55,-.65 -.7,-.95Q1.2,-1.15 2.1,-.25Z" fill="${c.pine}"/>` +
    `<path d="M-1.95,-.15Q-1.2,-.85 .1,-.75L.05,-.45Q-1,-.5 -1.95,-.15Z" fill="${c.leafLight}"/>` +
    `<path d="M0,-.25Q-1,-.85 -1,-1.65Q-.3,-1.5 0,-1.05Q-.4,-2 .15,-2.45Q.8,-2 .55,-1.1Q1,-1.8 1.65,-1.7Q1.5,-.55 .65,-.25Z" fill="${c.lily}"/>` +
    `<path d="M0,-.25Q-.45,-1.3 .15,-2.45Q.3,-1.3 .65,-.25Z" fill="${c.sail}" opacity=".6"/>` +
    `<ellipse cx=".35" cy="-.55" rx=".28" ry=".18" fill="${c.flowerCenter}"/>` +
    `</g>`
  );
}
