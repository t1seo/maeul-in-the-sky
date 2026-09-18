import { lerpColor } from '../../../../utils/color.js';
import type { AssetColors } from '../../palette.js';
import { blossomCluster, tulipFlower, youngShoot } from './spring-art-botany.js';

export function svgCherryBlossom(x: number, y: number, c: AssetColors, v: number): string {
  const pink = v === 2 ? c.cherryPetalWhite : c.cherryPetalPink;
  const shade = lerpColor(pink, c.cherryTrunk, 0.2);
  const trunk =
    `<path d="M-.75,1.95Q-.05,.55 -.45,-1.65L-2.7,-3.55 -2.35,-3.85 -.2,-2.4 .65,-4.5 1,-4.35 .43,-2.12 2.65,-3.38 2.9,-3.05 .5,-1.4 .67,1.5 1.05,2Z" fill="${c.cherryTrunk}"/>` +
    `<path d="M-.75,1.95Q-.05,.55 -.45,-1.65L-2.7,-3.55 -.08,-1.8 .15,1.65Z" fill="${c.cherryBranch}"/>`;
  const crown =
    v === 2
      ? 'M-3.9,-3.05Q-4.65,-4.2 -3.25,-4.9Q-3.3,-6.1 -1.78,-6.05Q-.72,-6.95 .2,-6.12Q1.63,-6.45 2,-5.1Q3.52,-5.25 3.8,-3.82Q4.18,-2.42 2.8,-2.13Q1.58,-1.2 .25,-2Q-.75,-1.25 -1.72,-2.05Q-3.45,-1.62 -3.9,-3.05Z'
      : 'M-4.05,-3.2Q-4.42,-4.65 -2.95,-4.95Q-2.76,-6.35 -1.26,-6.02Q-.04,-6.75 1.05,-5.8Q2.55,-5.94 2.72,-4.65Q4.12,-4.55 4.02,-3.2Q3.8,-1.78 2.38,-1.98Q1.42,-1.15 .25,-1.9Q-1.1,-1.26 -2.03,-2.06Q-3.7,-1.58 -4.05,-3.2Z';
  const blooms =
    v === 1
      ? blossomCluster(-2.5, -3.75, 1.15, pink, c) +
        blossomCluster(0.8, -4.85, 1.2, pink, c) +
        blossomCluster(2.65, -3.2, 0.95, pink, c)
      : `<path d="${crown}" fill="${shade}"/>` +
        `<path d="M-4.05,-3.2Q-4.42,-4.65 -2.95,-4.95Q-2.76,-6.35 -1.26,-6.02Q-.04,-6.75 1.05,-5.8Q2.55,-5.94 2.72,-4.65Q1.6,-4.78 1.35,-3.78Q.25,-4.3 -.28,-3.28Q-1.57,-4.08 -2.4,-3Q-3.12,-2.58 -4.05,-3.2Z" fill="${pink}"/>` +
        `<path d="M-3.48,-4.63Q-2.66,-4.65 -2.35,-5.53Q-1.5,-6.03 -.78,-5.52Q-.05,-6.2 .75,-5.63Q-.38,-5.37 -.7,-4.73Q-2,-5.05 -2.55,-4.07Z" fill="${lerpColor(pink, c.blossomWhite, 0.52)}"/>` +
        `<path d="M-2.1,-3.6l.18,-.28 .22,.26 -.18,.3ZM.4,-4.4l.22,-.26 .2,.28 -.2,.3ZM2.55,-3.5l.2,-.25 .2,.28 -.2,.28Z" fill="${c.blossomWhite}"/>`;
  return `<g transform="translate(${x},${y})"><ellipse cx=".4" cy="1.95" rx="1.7" ry=".36" fill="${c.shadow}" opacity=".16"/>${trunk}${blooms}</g>`;
}

export function svgCherryBlossomSmall(x: number, y: number, c: AssetColors, v: number): string {
  const pink = c.cherryPetalPink;
  let crown: string;
  if (v === 1) {
    crown =
      `<path d="M-2.23,-1.12Q-2.85,-2.15 -1.65,-2.65Q-1.05,-3.65 -.05,-2.95Q.85,-3.4 1.27,-2.52Q2.63,-2.42 2.18,-1.3Q1.53,-.32 .25,-.65Q-1.32,-.1 -2.23,-1.12Z" fill="${lerpColor(pink, c.cherryTrunk, 0.18)}"/>` +
      `<path d="M-2.23,-1.12Q-2.85,-2.15 -1.65,-2.65Q-1.05,-3.65 -.05,-2.95Q.85,-3.4 1.27,-2.52Q.15,-2.65 -.13,-1.82Q-1.3,-2.25 -1.52,-1.15Z" fill="${pink}"/>`;
  } else if (v === 2) {
    crown =
      `<path d="M-2.25,.1Q-2.7,-1.45 -1.92,-2.7Q-1.5,-3.75 -.45,-3.45Q.65,-4.15 1.53,-3.2Q2.62,-2.6 2.25,-.1L1.6,.45Q1.85,-1.55 1.05,-2.25Q.7,-1.1 .1,-1.2Q-.63,-1.3 -.65,-2.4Q-1.42,-1.53 -1.52,.65Z" fill="${lerpColor(pink, c.cherryTrunk, 0.18)}"/>` +
      `<path d="M-2.25,.1Q-2.7,-1.45 -1.92,-2.7Q-1.5,-3.75 -.45,-3.45Q.65,-4.15 1.53,-3.2Q.63,-3.25 .3,-2.53Q-.92,-3.04 -1.65,-.2Z" fill="${pink}"/>`;
  } else {
    crown = blossomCluster(-0.52, -2.35, 1.55, pink, c) + blossomCluster(0.9, -1.6, 0.83, pink, c);
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-.5,1.55Q-.08,.3 -.22,-1.3L-1.15,-2 -.85,-2.2 .14,-1.65 .65,-2.75 .9,-2.58 .25,-1.18 .4,1.5Z" fill="${c.cherryTrunk}"/>` +
    crown +
    `<path d="M-1.05,-2.87Q-.9,-3.2 -.58,-3.07L-.78,-2.71ZM-.45,-2.72l.15,-.21 .19,.15 -.14,.22Z" fill="${c.cherryPetalWhite}"/>` +
    `</g>`
  );
}

export function svgCherryPetals(x: number, y: number, c: AssetColors, v: number): string {
  const petals =
    v === 1
      ? 'M-2.28,.18Q-2,-.38 -1.38,-.32Q-.45,-1.2 .35,-.52Q1.45,-.6 2.2,.12Q1.03,.91 -.15,.55Q-1.37,.89 -2.28,.18Z'
      : v === 2
        ? 'M-1.8,.35Q-2.15,-.28 -1.45,-.3L-1.15,-.42Q-.78,.08 -1.8,.35ZM-.3,-.75Q-.95,-1.1 -.52,-1.55L-.2,-1.4 .13,-1.56Q.63,-.95 -.3,-.75ZM1,-1.8Q.6,-2.25 1.23,-2.52L1.39,-2.36 1.65,-2.4Q1.97,-1.94 1,-1.8Z'
        : 'M-1.6,.35Q-2.4,-.25 -1.72,-.43L-1.44,-.3 -1.2,-.48Q-.7,.08 -1.6,.35ZM.22,.64Q-.45,.32 .12,-.02L.4,.09 .62,-.04Q1.06,.45 .22,.64ZM1.36,-.32Q.66,-.7 1.27,-1L1.47,-.86 1.7,-.96Q2.17,-.51 1.36,-.32Z';
  return (
    `<g transform="translate(${x},${y})"><path d="${petals}" fill="${c.cherryPetalPink}"/>` +
    (v === 1
      ? `<path d="M-1.65,-.09Q-.9,-.35 -.47,-.11L-.05,-.55 .53,-.3 .32,.15 1.35,-.14 1.66,.11Q.5,.6 -.65,.26Z" fill="${c.cherryPetalWhite}"/>`
      : `<path d="${petals}" fill="none" stroke="${c.cherryPetalWhite}" stroke-width=".1"/>`) +
    `</g>`
  );
}

export function svgTulip(x: number, y: number, c: AssetColors, v: number): string {
  const colors = [c.tulipRed, c.tulipYellow, c.tulipPurple] as const;
  return `<g transform="translate(${x},${y})">${tulipFlower(0, 0, 1.15, colors[v] ?? c.tulipRed, c, v)}</g>`;
}

export function svgTulipField(x: number, y: number, c: AssetColors, v: number): string {
  const flowers =
    v === 1
      ? tulipFlower(-2.2, -0.15, 0.82, c.tulipRed, c) +
        tulipFlower(-0.65, 0.4, 0.98, c.tulipRed, c, 1) +
        tulipFlower(1.05, 0.4, 0.96, c.tulipRed, c) +
        tulipFlower(2.45, -0.25, 0.78, c.tulipRed, c, 2)
      : v === 2
        ? `<path d="M-2.8,.45Q-3.25,-.8 -1.55,-1.25L-.25,.55Q.9,-1.6 2.72,-1.03Q1.95,.77 -.25,.95Z" fill="${c.tulipStem}"/>` +
          tulipFlower(-1.05, 0.1, 1.12, c.tulipYellow, c, 1) +
          tulipFlower(1.04, 0.45, 1.18, c.tulipPurple, c, 2)
        : tulipFlower(-1.75, 0.1, 0.95, c.tulipRed, c) +
          tulipFlower(0.05, -0.15, 1.13, c.tulipYellow, c, 1) +
          tulipFlower(1.65, 0.5, 0.97, c.tulipPurple, c, 2);
  return `<g transform="translate(${x},${y})"><ellipse cx=".15" cy=".9" rx="2.9" ry=".45" fill="${c.shadow}" opacity=".15"/>${flowers}</g>`;
}

export function svgSprout(x: number, y: number, c: AssetColors, v: number): string {
  const shoots =
    v === 1
      ? youngShoot(-0.75, 0.2, 0.75, c) + youngShoot(0.7, -0.05, 0.82, c)
      : youngShoot(0, 0, v === 2 ? 1.1 : 0.95, c, v === 2);
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy=".48" rx="1.13" ry=".25" fill="${c.gardenSoil}"/>${shoots}</g>`;
}
