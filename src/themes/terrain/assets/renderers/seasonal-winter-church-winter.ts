import type { AssetColors } from '../../palette.js';

export function svgChurchWinter(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M-3.15,.1 -.55,1.35 2.8,-.15 2.8,-3.7 -.55,-2.2 -3.15,-3.5Z" fill="${c.church}"/>` +
      `<path d="M-.55,1.35 2.8,-.15 2.8,-3.7 -.55,-2.2Z" fill="${c.wallShade}"/>` +
      `<path d="M-3.5,-3.5 -1.7,-6.5 1.5,-5.3 -.2,-2.15Z" fill="${c.roofA}"/>` +
      `<path d="M-3.5,-3.7 -1.7,-6.7 1.5,-5.5 -.3,-2.55 Q-1.35,-2.8 -2.15,-3.35Z" fill="${c.snowCap}"/>` +
      `<path d="M-.05,.9 -.05,-8.05 1.25,-7.45 1.25,.35Z" fill="${c.church}"/>` +
      `<path d="M1.25,.35 2.5,-.3 2.5,-8.1 1.25,-7.45Z" fill="${c.wallShade}"/>` +
      `<path d="M-.45,-8.05 1.15,-11.35 2.9,-8.2 1.25,-7.4Z" fill="${c.ice}"/>` +
      `<path d="M-.45,-8.05 1.15,-11.5 1.25,-7.6Z" fill="${c.snowCap}"/>` +
      `<path d="M.2,-6 Q.2,-7.65 .98,-7.2 L.98,-5.65Z M1.55,-5.8 1.55,-7 Q2.2,-7.8 2.2,-6.55 L2.2,-6.1Z" fill="${c.firewoodLog}"/>` +
      `<path d="M.43,-6.9 .73,-6.75 .92,-6.03 .26,-6.32Z" fill="${c.christmasGold}"/>` +
      `<path d="M-2.3,.45 -2.3,-1.5 Q-2.3,-2.45 -1.3,-1.85 L-1.3,.95Z" fill="${c.firewoodLog}"/>` +
      `<path d="M.3,-2.45 .3,-3.85 .9,-3.55 .9,-2.15Z" fill="${c.lanternGlow}"/>` +
      `<path d="M-.2,-4.9 1.25,-4.2 2.65,-4.9 2.65,-4.55 1.25,-3.85 -.2,-4.55Z" fill="${c.snowCap}"/>` +
      `<path d="M-2.55,.5 -1.1,1.2 -1.65,1.6 -3.1,.9Z" fill="${c.snowCap}"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-2.8,.1 -.1,1.4 2.95,-.15 2.95,-4.4 -.1,-2.8 -2.8,-4.1Z" fill="${c.church}"/>` +
    `<path d="M-.1,1.4 2.95,-.15 2.95,-4.4 -.1,-2.8Z" fill="${c.wallShade}"/>` +
    `<path d="M-2.8,-4.1 -1.6,-7.65 -.1,-2.8Z" fill="${c.church}"/>` +
    `<path d="M-3.2,-4.25 -1.6,-8.1 1.55,-9.5 3.3,-4.35 -.05,-2.7Z" fill="${c.roofA}"/>` +
    `<path d="M-3.25,-4.3 -1.6,-8.35 1.55,-9.7 1.35,-8.9 -1.3,-7.6 -2.7,-4.3Z" fill="${c.snowCap}"/>` +
    `<path d="M-1.6,-8.35 1.55,-9.7 3.3,-4.5 .1,-2.95Z" fill="${c.ice}"/>` +
    `<path d="M-1.6,-8.35 1.55,-9.7 2,-8.5 -.95,-7.25Z" fill="${c.snowCap}"/>` +
    `<path d="M1.45,-9.3 1.45,-12.2 M.55,-11.3 2.35,-11.3" stroke="${c.bareBranch}" stroke-width=".38" stroke-linecap="round"/>` +
    `<path d="M.45,-11.52 2.35,-11.52" stroke="${c.snowCap}" stroke-width=".19" stroke-linecap="round"/>` +
    `<path d="M-2.25,.35 -2.25,-1.75 Q-2.2,-3.05 -1,-2.25 L-1,.95Z" fill="${c.firewoodLog}"/>` +
    `<path d="M-2,-1.4 -2,-1.9 Q-1.8,-2.55 -1.25,-2 L-1.25,-1.05Z M.65,-.4 .65,-2 Q.8,-2.8 1.4,-2.55 L1.4,-.8Z M1.95,-1.05 1.95,-2.7 Q2.1,-3.35 2.65,-3.15 L2.65,-1.4Z" fill="${c.lanternGlow}"/>` +
    `<path d="M-1.9,-4.3 -1.9,-5.25 Q-1.6,-5.95 -1.15,-4.9 L-1.15,-3.9Z" fill="${c.lanternGlow}"/>` +
    `<path d="M-2.5,.4 -1,1.1 -1.6,1.65 -3.1,.9Z" fill="${c.snowCap}"/>` +
    `</g>`
  );
}

export function svgChristmasTree(x: number, y: number, c: AssetColors, v: number): string {
  const crown =
    v === 1
      ? 'M-.25,-8.25 -1.5,-5.95 -.8,-5.85 -2.55,-3.45 -1.75,-3.4 -3.25,-1.1 Q-1.75,-.35 -.2,-.65 Q1.5,0 3.15,-1.05 L1.8,-3.35 2.45,-3.35 1,-5.75 1.6,-5.8Z'
      : v === 2
        ? 'M.2,-8.2 -1.2,-6 -.65,-5.9 -2.15,-4.1 -1.45,-4 -3,-1.2 Q-1.6,-.4 -.1,-.75 Q1.4,-.1 3.25,-1.05 L1.9,-3.6 2.55,-3.65 .9,-5.95 1.5,-6Z'
        : 'M-.15,-8.3 Q-.7,-6.8 -1.6,-5.85 L-.85,-5.8 -2.55,-3.6 -1.65,-3.65 -3.3,-1.1 Q-1.55,-.3 -.1,-.7 Q1.4,0 3.15,-1.15 L1.65,-3.45 2.45,-3.5 .9,-5.8 1.6,-5.8Z';
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx=".3" cy="1" rx="2.2" ry=".5" fill="${c.shadow}" opacity=".16"/>` +
    `<path d="M-.4,1.2 -.3,-1.5 .35,-1.5 .5,1.2Z" fill="${c.trunk}"/>` +
    `<path d="${crown}" fill="${c.christmasGreen}"/>` +
    `<path d="M.25,-7.55 1.6,-5.8 .95,-5.75 2.45,-3.5 1.7,-3.45 3.1,-1.15 Q1.5,-.1 -.1,-.7 L.35,-2.2 -.25,-3.55 .45,-5Z" fill="${c.bushDark}"/>` +
    `<path d="M-.15,-9.65 .2,-9 .9,-8.9 .4,-8.35 .5,-7.65 -.15,-8 -.8,-7.65 -.65,-8.35 -1.2,-8.85 -.45,-9Z" fill="${c.christmasGold}"/>` +
    `<path d="M-1.5,-5.8 Q-.3,-4.7 1.55,-4.75 M-2.45,-3.5 Q-.5,-2.4 2.4,-2.45" fill="none" stroke="${c.christmasGold}" stroke-width=".16"/>` +
    `<path d="M-1.55,-2.15a.34,.34 0 1,0 .68,0a.34,.34 0 1,0-.68,0 M.35,-5.65a.3,.3 0 1,0 .6,0a.3,.3 0 1,0-.6,0 M.6,-1.7a.31,.31 0 1,0 .62,0a.31,.31 0 1,0-.62,0" fill="${c.christmasRed}"/>` +
    `<path d="M-.8,-4a.27,.27 0 1,0 .54,0a.27,.27 0 1,0-.54,0 M1.15,-3.3a.25,.25 0 1,0 .5,0a.25,.25 0 1,0-.5,0" fill="${c.icicleBlue}"/>` +
    (v === 1
      ? `<path d="M-2.7,.25 -1.75,-.25 -.75,.2 -1.7,.7Z M.65,.65 1.65,.1 2.8,.6 1.75,1.15Z" fill="${c.christmasGold}"/><path d="M-2.7,.25 -1.7,.7 -.75,.2 -.75,1.2 -1.7,1.65 -2.7,1.2Z" fill="${c.christmasRed}"/><path d="M.65,.65 1.75,1.15 2.8,.6 2.8,1.45 1.75,2 .65,1.5Z" fill="${c.icicleBlue}"/><path d="M-2.25,.45 -1.95,.58 -1.95,1.5 -2.25,1.35Z M1.2,.9 1.5,1.05 1.5,1.8 1.2,1.65Z" fill="${c.snowCap}"/>`
      : '') +
    (v === 2
      ? `<path d="M-.9,-5.5a.23,.23 0 1,0 .46,0a.23,.23 0 1,0-.46,0 M.8,-4.95a.23,.23 0 1,0 .46,0a.23,.23 0 1,0-.46,0 M-1.85,-3.25a.23,.23 0 1,0 .46,0a.23,.23 0 1,0-.46,0 M-.35,-2.85a.23,.23 0 1,0 .46,0a.23,.23 0 1,0-.46,0 M1.45,-2.6a.23,.23 0 1,0 .46,0a.23,.23 0 1,0-.46,0" fill="${c.lanternGlow}"/>`
      : '') +
    `</g>`
  );
}

function lanternHead(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-.9,-.1 -.6,1.55 .1,1.85 .85,1.45 1.05,-.3Z" fill="${c.lantern}"/>` +
    `<path d="M-.63,.08 -.4,1.33 .03,1.48 .03,.23Z" fill="${c.lanternGlow}"/>` +
    `<path d="M.23,.22 .76,-.02 .61,1.27 .23,1.46Z" fill="${c.christmasGold}"/>` +
    `<path d="M-1.15,-.18 -.15,-1.05 1.2,-.3 .13,.27Z" fill="${c.snowCap}"/>` +
    `<path d="M.13,.27 1.2,-.3 1.2,-.05 .13,.52 -1.15,.08 -1.15,-.18Z" fill="${c.ice}"/>` +
    `</g>`
  );
}

export function svgWinterLantern(x: number, y: number, c: AssetColors, v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-.55,.65 -.4,-.15 .4,-.15 .6,.65Z" fill="${c.lantern}"/>` +
    `<path d="M-.2,.2 -.2,-5.6 .18,-5.6 .25,.2Z" fill="${c.lantern}"/>` +
    `<path d="M-.13,-4.75 -.13,-.2" stroke="${c.ice}" stroke-width=".1"/>` +
    (v === 1
      ? `<path d="M-2.1,-4.25 Q-2.4,-5.2 -.15,-4.55 Q1.9,-5.3 2.15,-4.4" fill="none" stroke="${c.lantern}" stroke-width=".35"/>${lanternHead(-2, -6.4, c)}${lanternHead(2, -6.4, c)}`
      : lanternHead(0, -6.7, c)) +
    `<path d="M-1,.65 Q-.7,.2 -.35,.45 L.15,.8 Q-.55,1.05 -1,.65Z" fill="${c.snowCap}"/>` +
    `</g>`
  );
}

export function svgFrozenFountain(x: number, y: number, c: AssetColors, v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-3.25,-.5 Q0,-2.2 3.25,-.5 L3.05,.75 Q.2,2.1 -2.95,.75Z" fill="${c.fountain}"/>` +
    `<path d="M.3,-.95 3.25,-.5 3.05,.75 Q1.75,1.4 .3,1.35Z" fill="${c.rock}"/>` +
    `<ellipse cx="0" cy="-.55" rx="3.25" ry="1.05" fill="${c.snowCap}"/>` +
    `<ellipse cx="0" cy="-.55" rx="2.55" ry=".68" fill="${c.frozenWater}"/>` +
    `<path d="M-2.4,-.45 Q-.8,-1.25 1.6,-.9 L2.2,-.4 .8,-.05 -1.4,-.05Z" fill="${c.ice}"/>` +
    `<path d="M-.55,-.25 -.4,-2.8 .4,-2.8 .7,-.2Z" fill="${c.fountain}"/>` +
    `<path d="M.05,-2.8 .4,-2.8 .7,-.2 .15,.02Z" fill="${c.rock}"/>` +
    `<path d="M-1.4,-3.05 Q0,-2.25 1.4,-3.05 L.9,-2.3 Q.1,-1.85 -.9,-2.3Z" fill="${c.fountain}"/>` +
    `<ellipse cx="0" cy="-3.05" rx="1.5" ry=".5" fill="${c.snowCap}"/>` +
    `<ellipse cx="0" cy="-3.1" rx="1.05" ry=".25" fill="${c.ice}"/>` +
    (v === 1
      ? `<path d="M-.8,-3.1 -.7,-4.25 -.2,-3.85 .15,-5.25 .65,-4.3 .55,-3.05 1.15,-3.55 1.25,-2.3 .75,-1.1 .45,-2.7 .1,-2.35 -.25,-1 -.6,-2.8 -1.1,-1.65 -1.3,-3Z" fill="${c.icicle}"/><path d="M.15,-5.25 .65,-4.3 .55,-3.05 .1,-2.35 .25,-3.6Z M.75,-2.85 1.25,-2.3 .75,-1.1Z" fill="${c.frozenWater}"/><path d="M-2.7,-.45 -2.25,-.3 -2.45,.9Z M1.95,-.2 2.4,-.45 2.1,.9Z" fill="${c.icicleBlue}"/>`
      : `<path d="M-1.35,-3 -.8,-2.85 -1.05,-1.55Z M.75,-2.9 1.15,-3 .85,-2Z M-.3,-3.05 -.2,-4 .15,-4.25 .4,-3.1Z" fill="${c.icicle}"/><path d="M.15,-4.25 .4,-3.1 .02,-3.08Z" fill="${c.frozenWater}"/>`) +
    `</g>`
  );
}
