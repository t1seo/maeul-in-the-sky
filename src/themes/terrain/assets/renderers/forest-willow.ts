import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function svgWillow(x: number, y: number, c: AssetColors, v: number): string {
  const canopy =
    v === 1
      ? 'M-4.9,-.5 Q-5.1,-4 -3,-5.2 Q-2.9,-7.2 -.8,-6.6 Q1,-7.2 2.5,-5.6 Q5.1,-5.4 4.8,-.45 Q3.5,-1.1 3.5,-3.1 L2.8,-1.5 Q1.9,-3.2 2,-4.2 Q.3,-3.5 -.8,-4.2 L-1.8,-1.7 -2.5,-3.1 Q-2.6,-1.1 -3.2,-.6 L-3.5,-2Z'
      : v === 2
        ? 'M-3.5,-1 Q-4.1,-4.5 -2,-6.1 Q-1.8,-8.2 .4,-8 Q2.1,-8.5 3,-6.6 Q4.9,-4.7 3.8,-.6 L3.2,-2.1 2.8,-1 Q2,-3.5 2.3,-4.9 L1.25,-3.4 .7,-5 Q-.2,-4.9 -1.1,-5.4 L-1.8,-2.1 -2.3,-3.2Z'
        : 'M-3.8,-.8 Q-4.6,-4.9 -2.6,-6.2 Q-2.4,-8.5 -.4,-8.1 Q1,-8.9 2.1,-7.3 Q4.2,-7 4,-3.9 L3.7,-.8 2.9,-2.1 2.5,-1.2 Q1.5,-3 1.8,-5.1 Q.6,-4.1 -.8,-5 L-1.5,-2.1 -2.15,-3 Q-2.3,-1.6 -3,-.65 L-3.15,-2.2Z';
  const light =
    v === 1
      ? 'M-4.4,-2.1 Q-4.6,-4.7 -2.5,-5.3 Q-2.6,-7 -.8,-6.6 Q.8,-6.9 1.5,-5.7 Q-.4,-5.8 -1.5,-4.7 L-2.5,-2.3 -2.4,-4.6 Q-3.5,-4 -4.4,-2.1Z'
      : v === 2
        ? 'M-3.3,-2.2 Q-3.4,-5.3 -1.6,-6.2 Q-1.5,-8.4 .4,-8 Q1.8,-8.2 2.2,-6.8 Q.5,-7 -1,-5.8 L-2.4,-3 -2.2,-5.3Z'
        : 'M-3.5,-2.1 Q-3.8,-5.2 -2.15,-6.3 Q-2.2,-8.6 -.4,-8.1 Q.9,-8.6 1.5,-7.3 Q-.7,-7.5 -1.5,-5.8 L-2.45,-2.3 -2.25,-5 Q-3.15,-4.1 -3.5,-2.1Z';
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx=".3" cy=".15" rx="2.4" ry=".4" fill="${c.shadow}" opacity=".14"/>` +
    `<path d="${v === 2 ? 'M-1,.2 Q.2,-.7 -.65,-2.1 Q-1.15,-3.15 .3,-4.5 L-.8,-6.1 -.35,-6.2 .65,-5.2 1.3,-6.4 1.65,-6.1 1,-4.8 2.35,-5.7 2.6,-5.4 .9,-4.05 Q-.1,-3.2 .25,-2.2 Q1,-.8 .5,-.2 L1.15,.2 .05,0Z' : 'M-.8,.1 Q.1,-1.6 -.65,-3.4 L-2,-5.2 -1.55,-5.4 .1,-3.8 .7,-6 .95,-5.8 .55,-3.4 2,-5.1 2.3,-4.8 .65,-2.7 Q.5,-1 .85,.1Z'}" fill="${c.trunk}"/>` +
    `<path d="${v === 2 ? 'M-.8,.1 Q.2,-.7 -.65,-2.1 Q-1.15,-3.15 .3,-4.5 L.55,-4.4 Q-.65,-3.1 -.25,-2.2 Q.6,-.65 -.25,0Z' : 'M-.5,-.2 Q.35,-1.9 -.35,-3.4 L-.05,-3.5 Q.65,-1.8 .15,-.1Z'}" fill="${c.stump}"/>` +
    `<path d="${canopy}" fill="${c.willow}"/>` +
    `<path d="${v === 1 ? 'M2.5,-5.6 Q5.1,-5.4 4.8,-.45 L4,-1.1 Q4.5,-4 2.5,-5.6Z' : v === 2 ? 'M3,-6.6 Q4.9,-4.7 3.8,-.6 L3.2,-2.1 Q3.9,-4.9 3,-6.6Z' : 'M2.1,-7.3 Q4.2,-7 4,-3.9 L3.7,-.8 2.9,-2.1 Q3.6,-5.8 2.1,-7.3Z'}" fill="${c.bushDark}"/>` +
    `<path d="${light}" fill="${c.leafLight}"/></g>`
  );
}

function palm(c: AssetColors, curved: boolean): string {
  const crownX = curved ? -1.1 : 0.35;
  const trunk = curved
    ? 'M-.65,.1 Q-3.1,-4 -1.35,-8.2 L-.9,-8.2 Q-2.1,-4 .55,-.1Z'
    : 'M-.55,.1 Q-.8,-4 .1,-8.2 L.6,-8.2 Q-.05,-3 .55,0Z';
  return (
    `<path d="${trunk}" fill="${c.trunk}"/>` +
    `<path d="${curved ? 'M-.65,.1 Q-3.1,-4 -1.35,-8.2 L-1.15,-8.2 Q-2.65,-3.8 -.2,0Z' : 'M-.55,.1 Q-.8,-4 .1,-8.2 L.3,-8.2 Q-.35,-4 -.15,0Z'}" fill="${c.fence}"/>` +
    `<g transform="translate(${crownX},-8)">` +
    `<path d="M0,0 Q-2.4,-1.1 -4.7,1.1 L-3.5,.4 -3.5,1 -2.1,.15 -2.25,.7 -.9,.1 -.9,.5Z M0,0 Q2.1,-1.1 4.5,1.55 L3.35,.8 3.3,1.3 2.1,.4 2.1,.9 .8,.2Z" fill="${c.evergreenDark}"/>` +
    `<path d="M0,0 Q-2.6,-2.5 -4.6,-.85 L-3.3,-1 -3.5,-.45 -2.2,-.75 -2.3,-.2 -.9,-.35Z M0,0 Q1.8,-2.4 4,-1.4 L2.8,-.85 3.15,-.55 1.7,-.4 1.9,0Z M0,0 Q-1.6,-2.55 -.4,-2.55 L.25,-1.3 .6,-1.75 .7,-.7 1.2,-.8Z" fill="${c.palm}"/>` +
    `<path d="M0,0 Q-2.6,-2.5 -4.6,-.85 Q-2.5,-1.65 0,0Z M0,0 Q-1.6,-2.55 -.4,-2.55 L-.1,-1.6Z" fill="${c.evergreenLight}"/>` +
    `<path d="M-.7,.25a.38,.42 0 1 0 .76,0a.38,.42 0 1 0 -.76,0 M.05,.4a.32,.36 0 1 0 .64,0a.32,.36 0 1 0 -.64,0" fill="${c.beehive}"/></g>`
  );
}

export function svgPalm(x: number, y: number, c: AssetColors, v: number): string {
  const trees =
    v === 2
      ? `<g transform="translate(-1.6,0) scale(.7)">${palm(c, true)}</g><g transform="translate(1.6,0) scale(.8)">${palm(c, false)}</g>`
      : palm(c, v === 1);
  return `<g transform="translate(${x},${y})">${trees}</g>`;
}

function flyingBird(c: AssetColors): string {
  return (
    `<path d="M-.3,-4.4 Q-1.2,-6.2 -3.1,-6 L-2,-4.9 -2.3,-4.7 -.4,-3.85 -.15,-3.3 .45,-3.7 1,-3.6 .65,-4.15 Q2.1,-4.3 3,-5.6 Q1.4,-5.9 .15,-4.4Z" fill="${c.bird}"/>` +
    `<path d="M-2.8,-5.85 Q-1.5,-6 -.3,-4.4 L-.45,-4.05Z M.45,-4.3 Q1.3,-5.2 2.65,-5.5 L1.65,-4.75Z" fill="${c.owl}"/>` +
    `<path d="M.85,-3.95 1.3,-3.8 .85,-3.7Z" fill="${c.wheat}"/>`
  );
}

export function svgBird(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M-1.8,-2.1 1.6,-2.5 M.7,-2.4 1.1,-2.95" stroke="${c.trunk}" stroke-width=".25" stroke-linecap="round" fill="none"/>` +
      `<path d="M-.4,-2.6 -.4,-2.25 M.2,-2.7 .25,-2.35" stroke="${c.wheat}" stroke-width=".16"/>` +
      `<path d="M-.95,-4.35 Q-.95,-5.2 -.25,-5.1 Q.45,-5.05 .45,-4.3 Q1.3,-3.75 .6,-2.8 L1.4,-2.6 .8,-2.25 -.1,-2.75 Q-1.1,-2.9 -.95,-4.35Z" fill="${c.bird}"/>` +
      `<path d="M-.8,-4.3 Q-.1,-4.2 -.25,-3.1 Q-.95,-3 -.8,-4.3Z" fill="${c.owl}"/>` +
      `<path d="M-1,-4.6 -1.6,-4.35 -1,-4.15Z" fill="${c.wheat}"/>` +
      `<circle cx="-.62" cy="-4.62" r=".12" fill="${c.birchBark}"/></g>`
    );
  }
  const pair = v === 2 ? `<g transform="translate(1.1,-3) scale(.72)">${flyingBird(c)}</g>` : '';
  return (
    `<g transform="translate(${x},${y})"><g>${pair}${flyingBird(c)}` +
    motionMarkup(
      '<animateTransform attributeName="transform" type="translate" values="0,0;4,-1;0,0" dur="12s" repeatCount="indefinite"/>',
    ) +
    '</g></g>'
  );
}

export function svgOwl(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-1.2,-.3 -.75,-.5 -.5,-.2 M.3,-.2 .55,-.5 .95,-.3" stroke="${c.wheat}" stroke-width=".25" stroke-linecap="round" fill="none"/>` +
    `<path d="M-1.4,-3.15 -1.6,-4.35 -.6,-3.8 Q0,-4.1 .7,-3.8 L1.5,-4.3 1.35,-3.1 Q2,-1.45 .75,-.5 Q0,.05 -.85,-.5 Q-1.8,-1.1 -1.4,-3.15Z" fill="${c.owl}"/>` +
    `<path d="M.75,-3.25 Q1.65,-2.4 1.1,-.85 Q.3,-1.7 .75,-3.25Z" fill="${c.trunk}"/>` +
    `<path d="M-1.15,-3.1 Q-.7,-3.65 0,-3.1 Q.6,-3.7 1.15,-3.1 Q1.1,-2.15 0,-2.25 Q-1.1,-2 -1.15,-3.1Z" fill="${c.mushroom}"/>` +
    `<path d="M-.7,-1.9 Q0,-2.3 .55,-1.9 L.3,-.75 -.35,-.75Z" fill="${c.fence}"/>` +
    `<path d="M-.82,-2.87a.2,.23 0 1 0 .4,0a.2,.23 0 1 0 -.4,0 M.38,-2.87a.2,.23 0 1 0 .4,0a.2,.23 0 1 0 -.4,0" fill="${c.bird}"/>` +
    `<path d="M-.2,-2.45 .2,-2.45 0,-2.05Z M-.38,-1.65 -.18,-1.4 .03,-1.65 .24,-1.4 .4,-1.65" fill="${c.wheat}"/></g>`
  );
}

export function svgSquirrel(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M.45,-.6 Q2.4,-.35 2.65,-1.95 Q2.9,-3.6 1.65,-3.65 Q.5,-3.65 .8,-2.6 Q1.85,-3.2 1.8,-2.05 Q1.7,-1.5 .4,-1.45Z" fill="${c.squirrel}"/>` +
    `<path d="M.8,-2.6 Q.5,-3.65 1.65,-3.65 Q2.55,-3.5 2.65,-2.55 Q1.8,-3.2 1.25,-2.65Z" fill="${c.fence}"/>` +
    `<path d="M-1.05,-.35 Q-.6,-1.15 -.9,-1.75 L-1.6,-2.05 -1.05,-2.4 -1.05,-3 -.6,-2.65 Q.25,-2.6 .2,-1.85 Q1.1,-1.3 .85,-.4 L1.2,0 -.1,.15Z" fill="${c.squirrel}"/>` +
    `<path d="M-.85,-1.9 Q-.3,-2.1 -.2,-1.5 L.2,-.5 -.25,-.2 -.75,-.75Z" fill="${c.mushroom}"/>` +
    `<path d="M-.8,-1.3 -.15,-1.05 -.35,-.75 -.95,-.9Z" fill="${c.squirrel}"/>` +
    `<circle cx="-.08" cy="-1" r=".3" fill="${c.stump}"/>` +
    `<circle cx="-.96" cy="-2.25" r=".11" fill="${c.bird}"/></g>`
  );
}

export function svgMoss(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-3,-.1 Q-3.4,-1.1 -1.9,-1 Q-1.2,-1.8 -.2,-1 Q1,-1.7 1.8,-.95 Q3.3,-1 3,.05 Q2,.85 .7,.4 Q-.6,1 -1.5,.35 Q-2.8,.6 -3,-.1Z" fill="${c.bushDark}"/>` +
    `<path d="M-3,-.1 Q-3.4,-1.1 -1.9,-1 Q-1.2,-1.8 -.2,-1 Q1,-1.7 1.8,-.95 Q2.6,-.65 2.4,-.1 Q1.4,.35 .6,-.1 Q-.4,.55 -1.35,-.1 Q-2.5,.4 -3,-.1Z" fill="${c.moss}"/>` +
    `<path d="M-2.7,-.55 Q-2.2,-1.05 -1.7,-.75 Q-1.3,-1.45 -.5,-.95 L-1.3,-.45Z M.05,-.65 Q.75,-1.3 1.5,-.85 L.75,-.5Z" fill="${c.leafLight}"/></g>`
  );
}

export function svgFern(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M0,.3 Q-1.4,-2.6 -4,-3.5 L-3.4,-2.35 -2.85,-2.55 -2.7,-1.7 -2.15,-2 -1.9,-.95 -1.4,-1.15 -.95,-.15Z M.1,.3 Q1.6,-2.5 4,-3.2 L3.4,-2.1 2.85,-2.4 2.6,-1.45 2.1,-1.7 1.8,-.7 1.3,-.9 .9,.05Z" fill="${c.fern}"/>` +
    `<path d="M-.15,.2 Q-1,-2.2 -.4,-4.6 L.15,-3.85 -.1,-3.3 .65,-3.35 .1,-2.5 .65,-2.55 .1,-1.5 .65,-1.55 .35,-.4Z" fill="${c.leafLight}"/>` +
    `<path d="M-.3,.1 Q-2.1,-3.3 -4,-3.5 Q-2.25,-2.55 -.3,.1 M.25,.1 Q2,-2.6 4,-3.2 Q2,-2 .25,.1Z" fill="${c.bushDark}"/></g>`
  );
}

export function svgDeadTree(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-1,.2 -.45,-.6 -.55,-3.5 -2.3,-4.8 -2.9,-6 -2.5,-6.1 -2,-5.1 -.55,-4.4 -.35,-5.6 -1.25,-6.6 -1.2,-7.25 -.85,-6.8 -.15,-6.15 .15,-7.5 .55,-7.2 .3,-4.1 1.5,-4.9 1.9,-6 2.2,-5.9 1.9,-4.7 .25,-3.25 .55,-.55 1.15,.25 .2,0Z" fill="${c.deadTree}"/>` +
    `<path d="M-.55,-3.5 -.45,-.6 -1,.2 -.2,-.1 -.15,-3.7 -.15,-6.15 .15,-7.5 -.35,-5.6 -.55,-4.4 -2,-5.1Z" fill="${c.fence}"/>` +
    `<path d="M.1,-2.7 .08,-1.3 M-.1,-4.5 .15,-4.9" stroke="${c.trunk}" stroke-width=".18" fill="none"/></g>`
  );
}

export function svgLog(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-3.1,-1.25 2.9,-1.55 Q4,-.7 3.15,.35 L-2.9,.6Z" fill="${c.log}"/>` +
    `<path d="M-3.1,-1.25 2.9,-1.55 3.35,-1.1 -2.65,-.7Z" fill="${c.fence}"/>` +
    `<path d="M-2.75,.15 3.5,-.1 3.15,.35 -2.9,.6Z" fill="${c.trunk}"/>` +
    `<ellipse cx="-3" cy="-.32" rx=".75" ry=".94" fill="${c.stump}"/>` +
    `<ellipse cx="-3.07" cy="-.38" rx=".53" ry=".68" fill="${c.fence}"/>` +
    `<path d="M-3.13,-.8 Q-2.65,-.7 -2.85,-.05 Q-3.4,.35 -3.38,-.5 M-1.6,-.65 .15,-.85 M.8,-.6 2.5,-.75" stroke="${c.trunk}" stroke-width=".16" fill="none"/>` +
    `<path d="M.55,-1.35 .4,-1.9 .8,-1.95 1.05,-1.35Z" fill="${c.log}"/></g>`
  );
}

export function svgBerryBush(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-2.5,-.15 Q-3.7,-1.4 -2.45,-2.25 Q-2.3,-3.5 -.9,-3.1 Q.1,-4 1,-3 Q2.7,-3.35 2.75,-1.95 Q3.55,-.85 2.4,-.1 Q1.25,.4 .3,0 Q-1,.65 -2.5,-.15Z" fill="${c.bushDark}"/>` +
    `<path d="M-2.5,-.5 Q-3.7,-1.4 -2.45,-2.25 Q-2.3,-3.5 -.9,-3.1 Q.1,-4 1,-3 Q2.3,-3.2 2.3,-2 Q1.25,-1.2 .25,-1.65 Q-.5,-.25 -1.4,-.75Z" fill="${c.berryBush}"/>` +
    `<path d="M-2.4,-2 Q-2.65,-3 -1.4,-2.9 L-1,-2.35Z M-.5,-2.8 Q.15,-3.8 .8,-2.8 L.1,-2.35Z" fill="${c.leafLight}"/>` +
    `<path d="M-1.65,-1.8a.33,.3 0 1 0 .66,0a.33,.3 0 1 0 -.66,0 M-1.15,-1.4a.3,.3 0 1 0 .6,0a.3,.3 0 1 0 -.6,0 M.45,-2.2a.35,.32 0 1 0 .7,0a.35,.32 0 1 0 -.7,0 M1,-1.75a.32,.3 0 1 0 .64,0a.32,.3 0 1 0 -.64,0" fill="${c.berry}"/></g>`
  );
}

export function svgSpider(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-3,-4.7 3,-.5 M-3,-.5 3,-4.7 M0,-5.3 0,.1 M-3.2,-2.5 3.2,-2.5 M-2,-3.95 Q0,-3.2 2,-3.95 Q1.7,-2.5 2,-1.15 Q0,-1.7 -2,-1.15 Q-1.7,-2.5 -2,-3.95 M-1,-3.2 Q0,-2.85 1,-3.2 Q.65,-2.5 1,-1.85 Q0,-2.1 -1,-1.85 Q-.65,-2.5 -1,-3.2" stroke="${c.spiderWeb}" stroke-width=".15" fill="none"/>` +
    `<path d="M-.3,-2.2 -1,-2.7 -1.35,-2.4 M-.35,-2 -.95,-2.15 -1.4,-1.85 M-.3,-1.8 -.9,-1.6 -1.05,-1.15 M-.2,-1.65 -.5,-1.25 -.45,-.85 M.3,-2.2 1,-2.7 1.35,-2.4 M.35,-2 .95,-2.15 1.4,-1.85 M.3,-1.8 .9,-1.6 1.05,-1.15 M.2,-1.65 .5,-1.25 .45,-.85" stroke="${c.bird}" stroke-width=".16" fill="none"/>` +
    `<ellipse cx="0" cy="-2.35" rx=".43" ry=".55" fill="${c.bird}"/>` +
    `<circle cx="0" cy="-1.75" r=".28" fill="${c.bird}"/>` +
    `<path d="M-.18,-2.65 Q-.35,-2.3 -.1,-2.05" stroke="${c.owl}" stroke-width=".16" fill="none"/></g>`
  );
}
