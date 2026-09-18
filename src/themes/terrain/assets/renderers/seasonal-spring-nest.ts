import { lerpColor } from '../../../../utils/color.js';
import type { AssetColors } from '../../palette.js';
import { youngShoot } from './spring-art-botany.js';

function nestEgg(x: number, y: number, color: string, c: AssetColors): string {
  return `<g transform="translate(${x},${y})"><path d="M-.38,.16C-.46,-.18 -.19,-.74 .04,-.72C.31,-.69 .57,-.12 .36,.19Q.03,.51 -.38,.16Z" fill="${color}"/><path d="M-.25,.07Q-.41,-.3 -.04,-.57Q-.2,-.19 -.06,.12Z" fill="${c.eggWhite}"/></g>`;
}

export function svgNest(x: number, y: number, c: AssetColors, v: number): string {
  const contents =
    v === 2
      ? nestEgg(-0.72, -0.55, c.eggBlue, c) +
        `<path d="M.05,-.11Q-.29,-.72 .16,-1.13Q-.18,-1.52 .18,-1.84L.03,-2.06 .48,-1.94Q1.22,-2.03 1.29,-1.35Q1.4,-.68 .85,-.22Z" fill="${c.winterBirdBrown}"/><path d="M.13,-.82Q.43,-1.01 .95,-.71L.78,-.14 .19,-.16Z" fill="${c.lambWool}"/><path d="M.96,-1.49L1.72,-1.63 1.26,-1.27 1.64,-.99 .97,-1.1Z" fill="${c.tulipYellow}"/><circle cx=".8" cy="-1.56" r=".11" fill="${c.shadow}"/>`
      : v === 1
        ? nestEgg(-0.85, -0.57, c.eggBlue, c) +
          nestEgg(0.03, -0.86, c.eggBlue, c) +
          nestEgg(0.84, -0.46, c.eggWhite, c)
        : nestEgg(-0.51, -0.67, c.eggBlue, c) + nestEgg(0.45, -0.51, c.eggWhite, c);
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-2.27,-.37Q-2.35,.68 -.92,.92Q.1,1.18 1.45,.67Q2.4,.26 2.17,-.45Q.13,-1.52 -2.27,-.37Z" fill="${lerpColor(c.nestBrown, c.shadow, 0.23)}"/>` +
    `<ellipse cx="0" cy="-.4" rx="2.24" ry=".68" fill="${c.nestBrown}"/>` +
    `<ellipse cx="0" cy="-.44" rx="1.65" ry=".44" fill="${lerpColor(c.nestBrown, c.shadow, 0.45)}"/>${contents}` +
    `<path d="M-2.25,-.39Q-.85,.47 .5,.14Q1.45,.05 2.21,-.44L1.95,.22Q.08,1.38 -1.88,.34Z" fill="${c.nestBrown}"/>` +
    `<path d="M-2.25,-.37Q-.9,.45 .31,.2M-1.62,.27L-.15,.7M-.76,.57L.63,.18M.3,.72L1.71,.13M-2.15,.18L-1.12,.59" fill="none" stroke="${lerpColor(c.nestBrown, c.eggWhite, 0.38)}" stroke-width=".17" stroke-linecap="round"/></g>`
  );
}

function woollyLamb(
  x: number,
  y: number,
  size: number,
  c: AssetColors,
  playing = false,
  mother = false,
): string {
  const wool = mother ? c.sheep : c.lambWool;
  const legs = playing
    ? 'M-1,.17L-1.36,1.03 -1.03,1.15 -.53,.35ZM.53,.26L.85,.99 1.17,.84 .9,.09Z'
    : 'M-.88,.23L-.85,1.11 -.49,1.11 -.45,.18ZM.65,.22L.59,1.12 .96,1.12 1.01,.02Z';
  const headY = playing ? -0.45 : 0;
  return (
    `<g transform="translate(${x},${y}) scale(${size})">` +
    `<path d="${legs}" fill="${c.winterBirdBrown}"/>` +
    `<path d="M1.14,-1.12Q2.13,-1.63 1.83,-.74L1.25,-.41Z" fill="${wool}"/>` +
    `<path d="M-1.39,-.52Q-1.72,-1.17 -1,-1.55Q-.81,-2.18 -.15,-1.84Q.4,-2.18 .91,-1.65Q1.62,-1.69 1.57,-.93Q2.02,-.37 1.42,.03Q1.4,.6 .68,.57Q.1,.9 -.37,.51Q-1.3,.61 -1.39,-.52Z" fill="${lerpColor(wool, c.winterBirdBrown, 0.23)}"/>` +
    `<path d="M-1.39,-.52Q-1.72,-1.17 -1,-1.55Q-.81,-2.18 -.15,-1.84Q.4,-2.18 .91,-1.65Q1.5,-1.66 1.51,-1.04Q.81,-.57 .43,-.91Q-.16,-.48 -.6,-.83Q-.96,-.46 -1.39,-.52Z" fill="${wool}"/>` +
    `<g transform="translate(0,${headY})"><path d="M-1.58,-1.19Q-2.35,-1.61 -2.25,-.98L-1.8,-.74Q-2.01,-.05 -1.32,.01Q-.74,-.05 -.99,-.96Q-.92,-1.37 -1.58,-1.19Z" fill="${c.winterBirdBrown}"/><path d="M-1.9,-1.1Q-1.71,-1.69 -1.16,-1.4L-.92,-1.04 -1.27,-.87Z" fill="${wool}"/><circle cx="-1.7" cy="-.69" r=".11" fill="${c.shadow}"/></g>` +
    `<path d="M-.89,-1.5Q-.61,-1.81 -.25,-1.6M.11,-1.51Q.45,-1.85 .78,-1.49" stroke="${lerpColor(wool, c.eggWhite, 0.75)}" stroke-width=".2" fill="none" stroke-linecap="round"/></g>`
  );
}

export function svgLamb(x: number, y: number, c: AssetColors, v: number): string {
  const family =
    v === 2
      ? woollyLamb(1.81, -0.44, 1.27, c, false, true) + woollyLamb(-1.56, 0.47, 0.77, c)
      : woollyLamb(0, 0, v === 1 ? 1.06 : 0.96, c, v === 1);
  return `<g transform="translate(${x},${y})">${family}</g>`;
}

export function svgCrocus(x: number, y: number, c: AssetColors, v: number): string {
  const colors = [c.crocusPurple, c.crocusYellow, c.cherryPetalWhite] as const;
  const color = colors[v] ?? c.crocusPurple;
  const petals =
    v === 1
      ? 'M-.9,-1.09L-1.05,-1.72 -.44,-1.43 -.16,-2.17 .25,-1.5 .97,-1.91 .75,-.93Q.15,-.25 -.9,-1.09Z'
      : v === 2
        ? 'M-.62,-1.02Q-1.02,-1.72 -.47,-2.17L-.08,-1.64 .21,-2.46Q.91,-1.94 .75,-1.18Q.32,-.36 -.62,-1.02Z'
        : 'M-.9,-1.09Q-1.07,-1.68 -.69,-2.09L-.24,-1.63 .02,-2.3 .45,-1.66 .9,-2.05Q1.06,-1.2 .47,-.84Q-.14,-.53 -.9,-1.09Z';
  return `<g transform="translate(${x},${y})"><path d="M-.22,.66Q-1.23,.09 -1.24,-1.23L-.05,.31 -.23,-.97 .16,-1.03 .22,.27 1.34,-1.36Q1.19,.01 .44,.66Z" fill="${c.tulipStem}"/><path d="M-.18,.38Q-.99,-.36 -1.04,-.95L-.24,.1ZM.34,.42L1.15,-.94Q.87,.1 .34,.42Z" fill="${c.sproutGreen}"/><path d="${petals}" fill="${color}"/><path d="M-.63,-1.84Q-.79,-1.02 -.18,-.89L.03,-1.27 -.26,-1.62Z" fill="${lerpColor(color, c.eggWhite, 0.43)}"/><path d="M.15,-1.15L.08,-1.74 .26,-1.77 .38,-1.15Z" fill="${c.crocusYellow}"/></g>`;
}

export function svgRainPuddle(x: number, y: number, c: AssetColors, v: number): string {
  const edge =
    v === 1
      ? 'M-2.52,-.1Q-2.42,-.78 -1.24,-.77Q-.63,-1.18 .23,-.71Q1.56,-.91 2.22,-.28Q2.68,.1 1.67,.66Q.62,1.04 -.26,.67Q-1.9,.84 -2.52,-.1Z'
      : 'M-2.12,.08Q-2.24,-.51 -1.17,-.61Q-.56,-1.05 .24,-.55Q1.17,-.79 1.84,-.24Q2.44,.18 1.32,.68Q.56,.93 -.23,.54Q-1.6,.89 -2.12,.08Z';
  return (
    `<g transform="translate(${x},${y})">` +
    (v === 2
      ? `<path d="M-2.58,.09Q-2.7,-.77 -1.26,-.85Q-.16,-1.2 .67,-.75Q2.03,-.99 2.56,.09Q2.3,1.12 .46,.97Q-1.87,1.35 -2.58,.09Z" fill="${c.gardenSoil}"/>`
      : '') +
    `<path d="${edge}" fill="${lerpColor(c.poolWater, c.shadow, 0.2)}"/>` +
    `<path d="${edge}" transform="translate(-.12,-.13) scale(.9,.73)" fill="${c.poolWater}"/>` +
    `<path d="M-1.58,-.25Q-1.05,-.68 -.43,-.45L.21,-.36Q-.78,-.03 -1.58,-.25Z" fill="${c.waterLight}"/>` +
    (v === 1
      ? `<path d="M.25,.16Q.66,-.17 1.34,.03M.06,.35Q.77,.76 1.78,.2" fill="none" stroke="${c.waterLight}" stroke-width=".13" stroke-linecap="round"/>`
      : '') +
    `</g>`
  );
}

export function svgBirdhouse(x: number, y: number, c: AssetColors, v: number): string {
  const wood = v === 1 ? c.parasolBlue : c.birdhouseWood;
  const roof = v === 1 ? c.tulipRed : c.cherryTrunk;
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-.32,.85L-.35,-2.43 .08,-2.57 .33,-2.41 .3,.88Z" fill="${c.birdhouseWood}"/>` +
    `<path d="M.08,-2.57L.33,-2.41 .3,.88 .08,.92Z" fill="${c.cherryTrunk}"/>` +
    `<path d="M-1.53,-3.93L-.26,-5.03 1.17,-3.8 1.17,-2.19 -.26,-1.62 -1.53,-2.2Z" fill="${wood}"/>` +
    `<path d="M-.26,-3.35L1.17,-3.8 1.17,-2.19 -.26,-1.62Z" fill="${lerpColor(wood, c.shadow, 0.28)}"/>` +
    `<path d="M-1.89,-3.88L-.31,-5.42 1.8,-4.46 .16,-3.03Z" fill="${roof}"/>` +
    `<path d="M-.31,-5.42L-1.89,-3.88 -.2,-3.36 1.25,-4.62Z" fill="${lerpColor(roof, c.eggWhite, 0.3)}"/>` +
    `<path d="M-1.89,-3.88L-.2,-3.36 .16,-3.03 .16,-2.83 -1.89,-3.66Z" fill="${lerpColor(roof, c.shadow, 0.22)}"/>` +
    `<ellipse cx="-.8" cy="-2.92" rx=".36" ry=".43" fill="${lerpColor(c.cherryTrunk, c.shadow, 0.65)}"/>` +
    `<path d="M-.89,-2.27L-.27,-2.07 -.28,-1.86 -.91,-2.04Z" fill="${c.cherryBranch}"/>` +
    (v === 2
      ? `<path d="M1.05,-3.91L.79,-4.44 1.25,-4.23Q1.73,-4.84 2.05,-4.49Q2.48,-4.16 1.93,-3.76Q1.43,-3.47 1.05,-3.91Z" fill="${c.winterBirdBrown}"/><path d="M2.02,-4.31L2.6,-4.15 2.03,-4.01Z" fill="${c.tulipYellow}"/><circle cx="1.92" cy="-4.34" r=".08" fill="${c.shadow}"/>`
      : '') +
    `</g>`
  );
}

export function svgGardenBed(x: number, y: number, c: AssetColors, v: number): string {
  const fence =
    v === 2
      ? `<path d="M-2.9,-1.64L-2.59,-1.8 -2.37,-1.67 -2.37,-.1 -2.9,.05ZM2.2,-1.93L2.47,-2.09 2.75,-1.92 2.75,-.35 2.2,-.23Z" fill="${c.fence}"/><path d="M-2.82,-1.37L2.57,-1.68 2.57,-1.34 -2.82,-1.02Z" fill="${lerpColor(c.fence, c.eggWhite, 0.24)}"/>`
      : '';
  const plants =
    v === 1
      ? youngShoot(-1.75, -0.5, 0.59, c) +
        youngShoot(-0.15, -0.08, 0.68, c) +
        youngShoot(1.55, 0.2, 0.61, c)
      : v === 2
        ? youngShoot(-0.87, -0.38, 0.69, c) + youngShoot(1.11, 0.13, 0.64, c)
        : '';
  return (
    `<g transform="translate(${x},${y})">${fence}` +
    `<path d="M-3.28,-.23L-.83,-1.09 3.27,-.07 3.27,.55 .81,1.49 -3.28,.42Z" fill="${c.birdhouseWood}"/>` +
    `<path d="M-2.91,-.22L-.8,-.84 2.86,-.04 .8,.96Z" fill="${c.gardenSoil}"/>` +
    `<path d="M.81,1.49L3.27,.55V-.07L.81,.92Z" fill="${lerpColor(c.birdhouseWood, c.shadow, 0.26)}"/>` +
    `<path d="M-2.4,-.28L.95,.59M-1.68,-.49L1.61,.32M-.94,-.69L2.27,.05" stroke="${lerpColor(c.gardenSoil, c.eggWhite, 0.25)}" stroke-width=".15"/>${plants}</g>`
  );
}
