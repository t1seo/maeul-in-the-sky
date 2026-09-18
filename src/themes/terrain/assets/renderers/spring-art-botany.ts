import { lerpColor } from '../../../../utils/color.js';
import type { AssetColors } from '../../palette.js';

export function blossomCluster(
  x: number,
  y: number,
  size: number,
  color: string,
  c: AssetColors,
): string {
  return (
    `<g transform="translate(${x},${y}) scale(${size})">` +
    `<path d="M-1,.2Q-1.3,-.55 -.6,-.7Q-.55,-1.3 .15,-1Q.8,-1.1 .9,-.4Q1.4,.15 .6,.65Q.05,1 -.45,.65Q-1,.8 -1,.2Z" fill="${lerpColor(color, c.cherryTrunk, 0.17)}"/>` +
    `<path d="M-1,.05Q-1.25,-.5 -.6,-.7Q-.55,-1.3 .15,-1Q.7,-1.05 .8,-.45Q.1,-.65 .05,-.15Q-.55,-.4 -.55,.25Z" fill="${color}"/>` +
    `<path d="M-.7,-.55Q-.8,-.8 -.5,-.82Q-.3,-1.15 .05,-.85L-.04,-.52Q-.45,-.7 -.7,-.55Z" fill="${lerpColor(color, c.blossomWhite, 0.6)}"/>` +
    `</g>`
  );
}

export function tulipFlower(
  x: number,
  y: number,
  size: number,
  color: string,
  c: AssetColors,
  shape = 0,
): string {
  const cups = [
    'M-.82,-2.45Q-.85,-1.45 0,-1.5Q.85,-1.5 .72,-2.6L.3,-2.35 0,-2.82 -.3,-2.38Z',
    'M-.95,-2.2Q-.75,-1.28 .1,-1.55Q.8,-1.6 .85,-2.38L.28,-2.13 .05,-2.67 -.27,-2.22Z',
    'M-.58,-2.3Q-.6,-1.4 .1,-1.5Q.85,-1.55 .7,-2.8L.23,-2.53 -.1,-2.95 -.3,-2.48Z',
  ] as const;
  return (
    `<g transform="translate(${x},${y}) scale(${size})">` +
    `<path d="M-.15,.7L-.12,-1.65H.14L.12,-.15Q.5,-.9 1.12,-.9Q.8,-.08 .12,.15L.12,.7Z" fill="${c.tulipStem}"/>` +
    `<path d="M-.1,.35Q-1.03,-.1 -1.03,-1.22Q-.35,-.95 -.1,.35Z" fill="${c.sproutGreen}"/>` +
    `<path d="${cups[shape] ?? cups[0]}" fill="${color}"/>` +
    `<path d="M.12,-1.5Q.85,-1.5 .72,-2.4L.42,-2.28Q.5,-1.75 .12,-1.5Z" fill="${lerpColor(color, c.cherryTrunk, 0.23)}"/>` +
    `<path d="M-.58,-2.35Q-.55,-1.8 -.15,-1.73Q-.4,-2.08 -.3,-2.39Z" fill="${lerpColor(color, c.eggWhite, 0.38)}"/>` +
    `</g>`
  );
}

export function youngShoot(
  x: number,
  y: number,
  size: number,
  c: AssetColors,
  extraLeaf = false,
): string {
  return (
    `<g transform="translate(${x},${y}) scale(${size})">` +
    `<path d="M-.12,.55Q.05,-.25 -.08,-.9L.12,-.98Q.35,-.2 .12,.55Z" fill="${c.tulipStem}"/>` +
    `<path d="M.02,-.6Q-1.03,-.37 -1.16,-1.35Q-.32,-1.52 .02,-.6ZM.06,-.78Q.25,-1.65 1.18,-1.38Q1.02,-.45 .06,-.78Z" fill="${c.sproutGreen}"/>` +
    `<path d="M-1.02,-1.24Q-.48,-1.38 -.02,-.67Q-.65,-.93 -1.02,-1.24ZM.13,-.87Q.38,-1.51 .97,-1.31Z" fill="${lerpColor(c.sproutGreen, c.eggWhite, 0.32)}"/>` +
    (extraLeaf
      ? `<path d="M.18,-.05Q.72,-.65 1.06,-.15Q.8,.3 .18,-.05Z" fill="${c.tulipStem}"/>`
      : '') +
    `</g>`
  );
}
