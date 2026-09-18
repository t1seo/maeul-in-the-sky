import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';
import { waterBoatHull, waterBoatRig } from './water-art-boats.js';

export function svgWhale(x: number, y: number, c: AssetColors, v: number): string {
  const forms = [
    {
      body: 'M-3.7,-1.3C-3.7,-3.9 .1,-4 2.1,-2.3Q3.2,-1.4 4.25,-1.75Q4.45,-3.2 6.8,-3Q6.45,-1.75 5.15,-1.2Q6.5,-.75 6.8,.45Q4.6,.75 4.2,-.7Q2.8,.25 1.1,.65C-1.8,1.15 -3.7,.5 -3.7,-1.3Z',
      belly: 'M-3.45,-.75Q-1.6,.45 .8,.1Q2.4,-.2 3.4,-.9Q2.5,.45 1.1,.65Q-1.85,1.1 -3.15,-.05Z',
      light: 'M-3.1,-1.95Q-2.8,-3.1 -.9,-3.05Q.9,-2.9 1.5,-2.2Q-1,-2.8 -3.1,-1.95Z',
      fin: 'M-.15,-.6Q.8,-.9 1.25,-.2Q1.4,1.15 2.2,1.45Q.4,1.8 -.15,-.6Z',
      eyeX: -2.65,
      eyeY: -1.15,
    },
    {
      body: 'M-3.25,-.45Q-2.8,-2.4 -.4,-2.3Q2,-2.2 3.1,-3.35Q2.8,-4.5 1.9,-4.65Q4,-5.6 4.3,-4.1Q5.7,-5.3 6.7,-4.3Q5.3,-3.2 4.05,-3.15Q3.5,-.9 1.15,.25Q-1.75,1.55 -3.25,-.45Z',
      belly:
        'M-3.1,-.35Q-1.6,.45 .5,-.05Q2.2,-.6 3.3,-1.85Q2.7,-.45 1.15,.25Q-1.75,1.55 -3.1,-.35Z',
      light: 'M-2.7,-1Q-1.7,-2.55 .3,-1.95L1.25,-1.7Q-.85,-1.85 -2.7,-1Z',
      fin: 'M-.5,-.5Q.25,-.95 .65,-.15L1.15,.9Q.1,1.25 -.5,-.5Z',
      eyeX: -2.3,
      eyeY: -0.4,
    },
    {
      body: 'M-2.7,-.85Q-2.7,-3 -.35,-2.75Q1.45,-2.6 2,-1.3L2.9,-1.1Q3.2,-2.15 4.8,-2.2Q4.6,-1.2 3.65,-.65Q4.75,-.2 4.8,.55Q3.1,.8 2.85,-.3L1.65,.25Q-1.2,1.25 -2.4,.1Z',
      belly: 'M-2.4,-.3Q-.75,.4 1.2,-.05L2,-.45Q1.8,.55 .15,.65Q-1.75,.9 -2.4,-.3Z',
      light: 'M-2.15,-1.5Q-1.75,-2.65 -.2,-2.2L.65,-1.7Q-1,-2.05 -2.15,-1.5Z',
      fin: 'M-.2,-.3Q.4,-.6 .7,-.1L1.25,.9Q.1,1.05 -.2,-.3Z',
      eyeX: -1.8,
      eyeY: -0.8,
    },
  ] as const;
  const form = forms[v] ?? forms[0];
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="${form.body}" fill="${c.whale}"/>` +
    `<path d="${form.belly}" fill="${c.whaleBelly}"/>` +
    `<path d="${form.light}" fill="${c.whaleBelly}" opacity=".5"/>` +
    `<path d="${form.fin}" fill="${c.whale}"/><path d="${form.fin}" fill="${c.shadow}" opacity=".25"/>` +
    `<circle cx="${form.eyeX}" cy="${form.eyeY}" r=".22" fill="${c.shadow}"/>` +
    (v !== 1 && v !== 2
      ? `<path d="M-1,-3.3Q-1.7,-4 -1.6,-4.9Q-2.65,-5.7 -2.8,-4.9M-1,-3.3Q-.45,-4.25 -.4,-5.15Q.4,-5.9 .7,-5" stroke="${c.waterLight}" stroke-width=".3" stroke-linecap="round" fill="none"/>`
      : '') +
    `</g>`
  );
}

function smallFish(c: AssetColors): string {
  return (
    `<path d="M-1.7,-.1Q-.75,-1.1 .7,-.45L1.1,-.1L2,-.9L1.8,-.1L2,.7L1,.2Q-.8,1 -1.7,-.1Z" fill="${c.fish}"/>` +
    `<path d="M-.9,-.25Q-.2,-.7 .55,-.3L.85,-.05Q-.1,-.3 -.9,-.25Z" fill="${c.whaleBelly}"/>` +
    `<circle cx="-1" cy="-.1" r=".13" fill="${c.shadow}"/>`
  );
}

export function svgFish(x: number, y: number, c: AssetColors, v: number): string {
  let fish: string;
  switch (v) {
    case 1:
      fish =
        `<g transform="translate(-1,.05) scale(.8)">${smallFish(c)}</g>` +
        `<g transform="translate(1.1,-1.65) scale(.68)">${smallFish(c)}</g>`;
      break;
    case 2:
      fish =
        `<path d="M-2.5,-.85Q-1.8,-2.05 -.3,-2L.35,-2.75L.95,-1.85L1.85,-1.25L3.35,-2.2L3.05,-1L3.35,.35L1.75,-.45Q.9,.15 -.4,.05L-1,.65L-1.15,-.1Q-2.05,-.15 -2.5,-.85Z" fill="${c.fish}"/>` +
        `<path d="M-.95,-1.85L-.55,-.05M.15,-1.9L.55,-.05M1.15,-1.6L1.45,-.35" stroke="${c.whaleBelly}" stroke-width=".34"/>` +
        `<path d="M-2,-.9Q-1.5,-1.75 -.6,-1.65" stroke="${c.sail}" stroke-width=".18" fill="none"/>` +
        `<circle cx="-1.75" cy="-.95" r=".21" fill="${c.shadow}"/>`;
      break;
    default:
      fish =
        `<path d="M-2.05,-.8Q-1.1,-1.8 -.1,-1.7L.5,-2.3L.95,-1.4L1.65,-1L2.95,-2.05L2.6,-.8L2.95,.45L1.55,-.45Q.35,.15 -.7,-.05L-.9,.4L-1.15,-.2Z" fill="${c.fish}"/>` +
        `<path d="M-1.4,-1.1Q-.55,-1.65 .45,-1.2L1.25,-.85Q-.3,-1.3 -1.4,-1.1Z" fill="${c.whaleBelly}"/>` +
        `<path d="M-1,-1.25Q-.55,-.85 -1,-.4" stroke="${c.boat}" stroke-width=".17" fill="none"/>` +
        `<circle cx="-1.4" cy="-.85" r=".17" fill="${c.shadow}"/>`;
  }
  return `<g transform="translate(${x},${y})">${fish}</g>`;
}

export function svgFishSchool(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<g transform="translate(-1.15,-.8) scale(.63)">${smallFish(c)}</g>` +
    `<g transform="translate(.65,-1.9) scale(.52)">${smallFish(c)}</g>` +
    `<g transform="translate(.95,.45) scale(.6)">${smallFish(c)}</g></g>`
  );
}

export function svgBoat(x: number, y: number, c: AssetColors, v: number): string {
  const rig =
    v === 2
      ? `<path d="M1.3,-1.3Q2.1,-3.15 3.5,-4L4.45,-1.4" fill="none" stroke="${c.trunk}" stroke-width=".21"/>` +
        `<path d="M3.5,-4L4.45,-1.4L4.1,-.8" fill="none" stroke="${c.waterLight}" stroke-width=".15"/>` +
        `<path d="M-1.65,-1.3V-2.1H-.7V-1.3" fill="${c.buoy}"/>`
      : waterBoatRig(c, v === 1 ? 6.4 : 5.7, v === 1);
  return `<g transform="translate(${x},${y})">${waterBoatHull(c)}${rig}</g>`;
}

function flyingGull(c: AssetColors): string {
  return (
    `<path d="M-.3,-2.8Q-1.2,-3.9 -2.8,-4.3L-2.1,-4.45Q-.7,-4.25 .05,-3.3Q.75,-4.75 2.7,-4.9L2.1,-4.4Q1.1,-4 .45,-2.95L.55,-2.4L-.15,-2.65Z" fill="${c.seagull}"/>` +
    `<path d="M-2.8,-4.3L-2.1,-4.45L-1.25,-4.03L-1.5,-3.83ZM2.7,-4.9L2.1,-4.4L1.35,-4.03L1.5,-4.6Z" fill="${c.heron}"/>` +
    `<path d="M-.3,-2.95L-.8,-2.82L-.3,-2.65Z" fill="${c.wheat}"/>`
  );
}

export function svgSeagull(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1)
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M-1.6,-.85Q-2.1,-1.6 -1.35,-2Q-.5,-2.35 -.4,-1.25Q1.1,-1.65 1.5,-.55L2.15,-.35L1.3,.1Q-.8,.5 -1.6,-.85Z" fill="${c.seagull}"/>` +
      `<path d="M-.65,-.9Q.6,-1.3 1.5,-.55L.65,-.1Q-.45,-.1 -.65,-.9Z" fill="${c.heron}"/>` +
      `<path d="M-1.85,-1.55L-2.5,-1.25L-1.65,-1.2Z" fill="${c.wheat}"/>` +
      `<circle cx="-1.45" cy="-1.6" r=".12" fill="${c.shadow}"/></g>`
    );
  const birds =
    v === 2
      ? `<g transform="translate(-.8,.1) scale(.7)">${flyingGull(c)}</g><g transform="translate(2,-2.3) scale(.55)">${flyingGull(c)}</g>`
      : flyingGull(c);
  return (
    `<g transform="translate(${x},${y})"><g>${birds}` +
    motionMarkup(
      `<animateMotion path="M0,0 C2,-1 3,0 2,1 C1,2 -1,1 -2,0 C-3,-1 -1,-2 0,0" dur="10s" repeatCount="indefinite"/>`,
    ) +
    `</g></g>`
  );
}

export function svgDock(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-2.7,-.1V2L-2.2,2.25V.05M2,-.2V1.8L2.5,1.65V-.35" fill="${c.trunk}"/>` +
    `<path d="M-3.5,-.5L1.9,-1.45L3.5,-.65L-1.9,.5Z" fill="${c.dock}"/>` +
    `<path d="M-3.5,-.5L-1.9,.5V.95L-3.5,-.05ZM-1.9,.5L3.5,-.65V-.2L-1.9,.95Z" fill="${c.trunk}"/>` +
    `<path d="M-2.3,-.7L-.7,.25M-.95,-.96L.65,0M.4,-1.2L2,-.28" stroke="${c.trunk}" stroke-width=".18"/>` +
    `<path d="M-3.2,-.51L1.85,-1.38" stroke="${c.wheat}" stroke-width=".2"/>` +
    `<path d="M-2.75,.2V-1.05L-2.25,-.95V.3ZM2.1,-.25V-1.5L2.6,-1.4V-.15Z" fill="${c.dock}"/>` +
    `</g>`
  );
}

export function svgWaves(x: number, y: number, c: AssetColors, _v: number): string {
  const crest =
    'M-3.5,-.05Q-2.25,-2.3 -.65,-1.5Q.2,-1.05 -.5,-.5Q1.45,.55 3.55,-.55Q1.4,1.4 -.65,.4Q-2.1,-.6 -3.5,-.05Z';
  const next =
    'M-3.5,.1Q-2.25,-2 -.65,-1.3Q.2,-.85 -.5,-.3Q1.45,.7 3.55,-.35Q1.4,1.55 -.65,.55Q-2.1,-.4 -3.5,.1Z';
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="${crest}" fill="${c.waterLight}" opacity=".7">` +
    motionMarkup(
      `<animate attributeName="d" values="${crest};${next};${crest}" dur="4s" repeatCount="indefinite"/>`,
    ) +
    `</path><path d="M-3.15,-.3Q-2.25,-1.8 -.9,-1.4M.35,.15Q1.7,.6 2.8,-.1" stroke="${c.sail}" stroke-width=".22" stroke-linecap="round" fill="none" opacity=".65"/>` +
    `</g>`
  );
}

export function svgKelp(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-.3,.35Q-.4,-1.6 -1.4,-3Q-1.9,-4.05 -.65,-5Q.3,-5.8 -.8,-7.9Q1.2,-6.95 .6,-5.2Q-.7,-3.95 -.1,-2.95Q.9,-1 .45,.35Z" fill="${c.fern}"/>` +
    `<path d="M.75,.25Q1.85,-1.25 1,-2.65Q.4,-3.6 1.6,-4.65Q2.4,-5.3 1.7,-6.6Q3.05,-5.5 2.4,-4.4Q1.45,-3.35 1.85,-2.65Q2.85,-.65 1.35,.3Z" fill="${c.fern}"/>` +
    `<path d="M-.3,-.1Q0,-2.15 -1,-3.25Q-1.35,-4.25 -.2,-5.2M1.2,-.1Q2,-1.35 1.4,-2.75Q.95,-3.55 1.95,-4.5" stroke="${c.moss}" stroke-width=".3" fill="none"/>` +
    `<path d="M-.65,.45Q.4,-.15 1.6,.45L1.8,.75L-.9,.75Z" fill="${c.fern}"/>` +
    `</g>`
  );
}

export function svgCoral(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-.55,.4L-.75,-.9Q-2.75,-1.65 -2.65,-2.7L-3.1,-3.2Q-3.6,-3.95 -2.95,-4Q-2.55,-3.95 -2.4,-3.15L-1.65,-2.7L-1.85,-4.2Q-1.7,-4.8 -1.25,-4.25L-1.05,-2.3L-.35,-1.85L-.4,-4.1L-.95,-4.9Q-.85,-5.55 -.4,-5.2L.15,-4.4L.6,-5Q1.15,-5.15 1.1,-4.5L.4,-3.65L.5,-2.1L1.4,-2.65L1.5,-4Q1.85,-4.65 2.15,-4L2.05,-3.25L2.75,-3.85Q3.4,-3.9 3.15,-3.2L2.15,-2.4Q1.75,-1.25 .6,-.85L.8,.4Z" fill="${c.coral}"/>` +
    `<path d="M-.45,.1L-.4,-1.1L-1.8,-2.05M-.1,-2.1L-.1,-3.8M1,-1.75L1.75,-2.5L2.8,-3.35" stroke="${c.flowerAlt}" stroke-width=".25" stroke-linecap="round" fill="none" opacity=".6"/>` +
    `<path d="M-.75,.4L-.6,-.1L.5,-.15L1,.4Z" fill="${c.coral}"/>` +
    `</g>`
  );
}

export function svgJellyfish(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})"><g>` +
    `<path d="M-1.45,-1.4Q-2,-.55 -1.3,.15Q-.95,.7 -1.6,.65M-.45,-1.3Q.15,-.65 -.35,.1L-.05,.75M.55,-1.3Q.1,-.45 .7,.15L.55,.65M1.45,-1.45Q2.15,-.55 1.35,.5" stroke="${c.jellyfish}" stroke-width=".28" stroke-linecap="round" fill="none" opacity=".8"/>` +
    `<path d="M-2.2,-1.6Q-2.05,-3.85 -.1,-3.9Q1.95,-3.95 2.2,-1.6Q1.65,-.95 1,-1.4Q.4,-.8 -.1,-1.3Q-.9,-.8 -1.3,-1.4Q-1.9,-1.1 -2.2,-1.6Z" fill="${c.jellyfish}" opacity=".85"/>` +
    `<path d="M-1.65,-2.15Q-1.35,-3.5 -.2,-3.45Q.45,-3.5 .8,-3Q-.95,-3.35 -1.65,-2.15Z" fill="${c.sail}" opacity=".6"/>` +
    `<path d="M-2,-1.65Q0,-2.25 2,-1.65" stroke="${c.jellyfish}" stroke-width=".35" fill="none"/>` +
    motionMarkup(
      `<animateTransform attributeName="transform" type="translate" values="0,0;0,-.7;0,0" dur="3s" repeatCount="indefinite"/>`,
    ) +
    `</g></g>`
  );
}
