import { lerpColor } from '../../../../utils/color.js';
import type { AssetColors } from '../../palette.js';
import { blossomCluster, youngShoot } from './spring-art-botany.js';

export function svgCherryBlossomFull(x: number, y: number, c: AssetColors, v: number): string {
  const pink = c.blossomPink;
  const main = v === 1 ? c.blossomWhite : pink;
  const crowns = [
    'M-4.28,-3.8Q-4.8,-5.38 -3.25,-5.93Q-3.36,-7.47 -1.75,-7.43Q-.72,-8.85 .65,-7.78Q2.15,-8.25 2.8,-6.6Q4.6,-6.48 4.2,-4.93Q5,-3.3 3.35,-2.67Q2.28,-1.7 1.12,-2.62Q-.2,-1.52 -1.35,-2.48Q-3.43,-1.91 -4.28,-3.8Z',
    'M-4.3,-3.68Q-4.78,-5.2 -3.14,-5.78Q-2.87,-7.82 -1.15,-7.26Q.23,-8.45 1.25,-7.15Q2.75,-7.41 3.05,-5.73Q4.58,-5.51 4.05,-3.85Q4.33,-2.56 2.86,-2.46Q1.37,-1.53 .56,-2.51Q-.98,-1.42 -2.01,-2.73Q-3.7,-2.12 -4.3,-3.68Z',
    'M-4.12,-3.56Q-4.52,-5.1 -3,-5.5Q-2.8,-7.26 -1.35,-6.91Q-.22,-7.94 1.05,-6.8Q2.73,-6.96 2.95,-5.55Q4.6,-5.46 4.05,-3.78Q4.35,-2.37 2.78,-2.42Q1.72,-1.55 .77,-2.48Q-.63,-1.66 -1.69,-2.56Q-3.3,-2.09 -4.12,-3.56Z',
  ] as const;
  const crown = crowns[v] ?? crowns[0];
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx=".45" cy="2.46" rx="2.15" ry=".43" fill="${c.shadow}" opacity=".16"/>` +
    `<path d="M-1.02,2.5Q.07,.71 -.49,-1.89L-2.71,-4.07 -2.34,-4.49 -.07,-2.91 .5,-5.16 .91,-5.02 .53,-2.88 2.57,-4.06 2.94,-3.63 .7,-1.72 .78,2.01 1.31,2.5Z" fill="${c.cherryTrunk}"/>` +
    `<path d="M-1.02,2.5Q.07,.71 -.49,-1.89L-2.71,-4.07 -.03,-2.28 .23,2.15Z" fill="${c.cherryBranch}"/>` +
    `<path d="${crown}" fill="${lerpColor(main, c.cherryTrunk, 0.23)}"/>` +
    `<path d="M-4.08,-3.93Q-4.58,-5.31 -3.05,-5.8Q-3.13,-7.32 -1.57,-7.15Q-.55,-8.46 .59,-7.45Q2.01,-7.87 2.52,-6.29Q3.73,-6.21 3.65,-5.16Q2.52,-5.55 1.98,-4.21Q.53,-4.9 -.21,-3.8Q-1.53,-4.64 -2.51,-3.45Q-3.5,-3.05 -4.08,-3.93Z" fill="${main}"/>` +
    `<path d="M-2.91,-5.76Q-3.01,-7.03 -1.53,-6.9Q-.51,-8.12 .46,-7.2Q.88,-7.39 1.24,-7.17Q.48,-6.88 .24,-6.22Q-1.17,-6.66 -1.87,-5.55Z" fill="${lerpColor(main, c.blossomWhite, 0.7)}"/>` +
    (v === 1
      ? `<path d="M-3.98,-4.39Q-3.46,-5.32 -2.47,-4.8Q-1.53,-4.98 -1.28,-3.94Q-.65,-3.35 -.99,-2.77Q-2.94,-2.14 -3.98,-4.39ZM1.28,-5.85Q1.38,-6.92 2.43,-6.51Q2.9,-5.71 2.38,-5.13Z" fill="${pink}"/>`
      : '') +
    `<path d="M-2.8,-5.1l.19,-.3 .23,.27 -.2,.28ZM-1,-6.2l.2,-.31 .25,.26 -.2,.32ZM.6,-4.9l.21,-.28 .22,.24 -.21,.3ZM2.58,-4.1l.2,-.28 .24,.24 -.23,.28Z" fill="${c.blossomWhite}"/>` +
    (v === 2
      ? `<path d="M-3.6,-.45q-.4,-.5 .25,-.58l.23,.14q.3,.3 -.48,.44ZM2.4,.4q-.6,-.18 -.16,-.55l.3,.03q.44,.3 -.14,.52ZM-1.2,2.7q-.6,-.34 .08,-.56l.27,.13q.21,.31 -.35,.43Z" fill="${pink}"/>`
      : '') +
    `</g>`
  );
}

export function svgCherryBlossomBranch(x: number, y: number, c: AssetColors, v: number): string {
  const arch = v === 1;
  const branch = arch
    ? 'M-.23,.2Q-1.23,-1.68 -3.51,-1.7L-3.8,-2.02Q-1.53,-2.3 -.3,-.68L-1.05,-2.52 -.79,-2.57 .2,.03Z'
    : 'M-.2,.2Q.25,-1.67 1.05,-3.5L1.3,-3.41 .68,-1.63 1.76,-2.15 1.85,-1.92 .48,-1.16 .16,.24Z';
  const blooms = arch
    ? blossomCluster(-3.2, -2.05, 0.85, c.blossomPink, c) +
      blossomCluster(-1.86, -1.54, 0.68, c.blossomPink, c) +
      blossomCluster(-0.95, -2.53, 0.5, c.blossomWhite, c)
    : blossomCluster(1.02, -3.04, 0.78, c.blossomPink, c) +
      blossomCluster(0.3, -1.55, 0.68, c.blossomPink, c) +
      blossomCluster(1.73, -2.13, 0.48, c.blossomWhite, c);
  return `<g transform="translate(${x},${y})"><path d="${branch}" fill="${c.cherryBranch}"/>${blooms}</g>`;
}

export function svgPeachBlossom(x: number, y: number, c: AssetColors, v: number): string {
  const young = v === 1;
  const crown = young
    ? 'M-2.37,-2.74Q-2.73,-4 -1.48,-4.47Q-1.24,-5.89 -.12,-5.46Q.88,-6.17 1.63,-4.97Q2.85,-4.55 2.29,-3.43Q2.65,-2.17 1.4,-2.15Q.21,-1.36 -.69,-2.22Q-1.91,-1.81 -2.37,-2.74Z'
    : 'M-3.4,-3.11Q-3.94,-4.72 -2.4,-5.28Q-2.54,-6.8 -.96,-6.66Q.14,-7.46 1.08,-6.4Q2.75,-6.58 2.96,-4.92Q3.98,-3.82 2.87,-2.82Q2.12,-1.66 .71,-2.4Q-.39,-1.51 -1.58,-2.35Q-2.92,-1.99 -3.4,-3.11Z';
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-.78,2.3Q-.09,.55 -.43,-1.79L-2.35,-3.51 -2.07,-3.76 -.1,-2.54 .61,-4.31 .94,-4.08 .42,-2.19 2.37,-3.46 2.57,-3.11 .5,-1.61 .65,2.3Z" fill="${c.cherryTrunk}"/>` +
    `<path d="M-.78,2.3Q-.09,.55 -.43,-1.79L-2.35,-3.51 .07,-1.93 .18,2.16Z" fill="${c.cherryBranch}"/>` +
    `<path d="${crown}" fill="${lerpColor(c.peachPink, c.cherryTrunk, 0.21)}"/>` +
    `<path d="${crown}" fill="${c.peachPink}" transform="translate(-.16,-.45) scale(.88,.89)"/>` +
    `<path d="${young ? 'M-1.56,-4.09Q-1.8,-4.96 -.67,-5.08Q-.05,-5.74 .73,-5.15Q-.49,-4.96 -.53,-4.16Z' : 'M-2.73,-4.96Q-2.29,-5.69 -1.75,-5.6Q-1.75,-6.5 -.8,-6.26Q.1,-6.94 .75,-6.12Q-.53,-6.2 -.87,-5.18Z'}" fill="${c.blossomWhite}"/>` +
    `<path d="M-2.3,-2.77Q-2.7,-3.75 -1.56,-3.33ZM1.18,-2.5Q1.63,-3.51 2.55,-3.54Q2.26,-2.55 1.18,-2.5Z" fill="${c.sproutGreen}"/>` +
    `<path d="M-.9,-3.47l.23,-.24 .22,.23 -.21,.28ZM.45,-4.38l.2,-.28 .2,.28 -.21,.25Z" fill="${c.cherryPetalPink}"/></g>`
  );
}

export function svgFlowerBed(x: number, y: number, c: AssetColors, v: number): string {
  const rectangular = v === 1;
  const soil = rectangular
    ? `<path d="M-2.53,-.12L.13,-.92 2.55,-.1 2.55,.52 -.14,1.21 -2.53,.47Z" fill="${c.birdhouseWood}"/><path d="M-2.23,-.16L.13,-.73 2.23,-.1 -.13,.63Z" fill="${c.gardenSoil}"/><path d="M-.13,.63L2.55,-.1V.52L-.14,1.21Z" fill="${lerpColor(c.birdhouseWood, c.shadow, 0.25)}"/>`
    : `<path d="M-2.35,.02C-2.35,-1.08 2.35,-1.08 2.35,.02V.45C2.08,1.39 -2.06,1.39 -2.35,.45Z" fill="${c.birdhouseWood}"/><ellipse cx="0" cy="-.05" rx="2.18" ry=".76" fill="${c.gardenSoil}"/><path d="M-2.24,-.08Q-2.08,.78 .2,.74" fill="none" stroke="${lerpColor(c.birdhouseWood, c.eggWhite, 0.3)}" stroke-width=".2"/>`;
  const flowers = rectangular
    ? blossomCluster(-1.53, -0.94, 0.51, c.tulipRed, c) +
      blossomCluster(-0.32, -1.25, 0.46, c.tulipYellow, c) +
      blossomCluster(0.89, -0.98, 0.49, c.crocusPurple, c) +
      blossomCluster(1.67, -0.59, 0.42, c.tulipRed, c)
    : blossomCluster(-1.18, -0.72, 0.58, c.tulipRed, c) +
      blossomCluster(-0.19, -1.1, 0.56, c.tulipYellow, c) +
      blossomCluster(1.08, -0.63, 0.61, c.crocusPurple, c) +
      blossomCluster(0.13, -0.14, 0.44, c.tulipRed, c);
  return `<g transform="translate(${x},${y})">${soil}<path d="M-1.69,.13Q-1.9,-.79 -1.24,-1.34L-.8,.12 -.38,-1.56 .1,.25 .91,-1.34 1.43,.35 1.75,-.67 1.96,-.06Z" fill="${c.tulipStem}"/>${flowers}</g>`;
}

export function svgWateringCan(x: number, y: number, c: AssetColors, _v: number): string {
  const metal = c.sledRunner;
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-.79,-1.8C-1.92,-2.45 -1.83,.08 -.68,-.2" fill="none" stroke="${lerpColor(metal, c.shadow, 0.25)}" stroke-width=".3"/>` +
    `<path d="M.75,-.13L1.5,-.52 2.99,-1.81 2.66,-2.05 .85,-1.01Z" fill="${metal}"/>` +
    `<path d="M.95,-.81L2.76,-2.05 2.89,-1.89 1.14,-.47Z" fill="${lerpColor(metal, c.eggWhite, 0.42)}"/>` +
    `<path d="M-.88,-1.72Q-.1,-2.17 .94,-1.7L1.09,.05Q.82,.89 -.8,.54Z" fill="${metal}"/>` +
    `<path d="M.35,-1.83L.94,-1.7 1.09,.05Q.86,.58 .38,.6Z" fill="${lerpColor(metal, c.shadow, 0.24)}"/>` +
    `<path d="M-.72,-1.5L-.49,-1.61 -.4,.27 -.69,.19Z" fill="${lerpColor(metal, c.eggWhite, 0.5)}"/>` +
    `<ellipse cx=".02" cy="-1.74" rx=".91" ry=".34" fill="${lerpColor(metal, c.eggWhite, 0.32)}"/>` +
    `<ellipse cx=".01" cy="-1.76" rx=".46" ry=".17" fill="${lerpColor(metal, c.shadow, 0.46)}"/>` +
    `<path d="M-.49,-1.78Q-.76,-3.06 .13,-3.06Q.85,-3.04 .72,-1.69" fill="none" stroke="${c.sproutGreen}" stroke-width=".25"/>` +
    `<path d="M2.64,-2.21L3.08,-2.24 3.39,-1.7 3.09,-1.39 2.78,-1.85Z" fill="${metal}"/>` +
    `<path d="M3.03,-2.06l.16,.2m-.29,.02 .14,.2" stroke="${c.eggWhite}" stroke-width=".12"/></g>`
  );
}

export function svgSeedling(x: number, y: number, c: AssetColors, v: number): string {
  const shoot =
    v === 1
      ? youngShoot(0, -0.15, 1.2, c)
      : `<path d="M-.16,.24Q.28,-.44 .05,-1.22L.24,-1.33Q.59,-.45 .14,.3Z" fill="${c.tulipStem}"/>` +
        `<path d="M.13,-.82Q-.94,-1.31 -.2,-2.24Q.91,-2.22 .76,-1.34Q.61,-.92 .13,-.82Z" fill="${c.sproutGreen}"/>` +
        `<path d="M-.2,-2.1Q-.57,-1.46 .13,-.95L.1,-1.57Z" fill="${lerpColor(c.sproutGreen, c.eggWhite, 0.4)}"/>`;
  return `<g transform="translate(${x},${y})"><path d="M-1.16,.35Q-1.13,-.15 -.56,-.08L-.24,-.34 .12,-.14 .59,-.25Q1.14,-.07 1.14,.39Q.02,.93 -1.16,.35Z" fill="${c.gardenSoil}"/>${shoot}<path d="M-.63,.24Q-.67,-.29 -.19,-.37L-.06,.19ZM.14,.2L.4,-.28Q.91,-.08 .68,.38Z" fill="${c.birdhouseWood}"/></g>`;
}
