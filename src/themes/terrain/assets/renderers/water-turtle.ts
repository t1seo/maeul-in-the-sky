import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';
import { waterBoatHull, waterBoatRig } from './water-art-boats.js';

export function svgTurtle(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})"><g>` +
    `<path d="M-1.25,-1.7Q-2.1,-2.4 -1.65,-3.35Q-.5,-3.05 -.45,-1.9M1,-1.75Q1.5,-3 2.25,-2.55L1.75,-1.35M-1.4,-.3Q-2.25,.25 -1.6,1.35Q-.55,1 -.55,-.25M1.05,-.2Q1.85,1.25 2.7,.6L1.9,-.6" fill="${c.turtle}"/>` +
    `<path d="M1.7,-.8L2.95,-.3L2.05,-1.2M-1.8,-1.25Q-3.1,-2.1 -3.4,-1.3Q-3.8,-.5 -2.7,-.25L-1.65,-.55Z" fill="${c.turtle}"/>` +
    `<path d="M-2.05,-.65Q-2.6,-2.15 -.5,-2.65Q1.7,-2.95 2.2,-1.25Q2.75,.05 .95,.35Q-1.15,.8 -2.05,-.65Z" fill="${c.pine}"/>` +
    `<path d="M-2.05,-.8Q-2.25,-2.15 -.5,-2.65Q1.25,-2.85 1.9,-1.55Q2.15,-.3 .55,-.05Q-1.2,.25 -2.05,-.8Z" fill="${c.turtle}"/>` +
    `<path d="M-1.85,-1.15Q-1.65,-2.15 -.55,-2.35L.3,-2.25L.6,-1.45L-.25,-.8L-1.25,-.8Z" fill="${c.moss}"/>` +
    `<path d="M-1.15,-2.1L-.65,-1.35L.1,-1.1L.7,-1.7L.35,-2.4M-.65,-1.35L-1.05,-.25M.1,-1.1L.65,-.1M.7,-1.7L1.7,-1.6" stroke="${c.pine}" stroke-width=".2" fill="none"/>` +
    `<path d="M-1.6,-1.65Q-1.4,-2.1 -.95,-2.2" stroke="${c.leafLight}" stroke-width=".28" stroke-linecap="round" fill="none"/>` +
    `<circle cx="-3.05" cy="-1.17" r=".14" fill="${c.shadow}"/>` +
    motionMarkup(
      `<animateTransform attributeName="transform" type="translate" values="0,0;3,0;0,0" dur="8s" repeatCount="indefinite"/>`,
    ) +
    `</g></g>`
  );
}

export function svgBuoy(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-1.9,.05Q-1.1,.9 .9,.5L1.7,.25" stroke="${c.waterLight}" stroke-width=".22" fill="none" opacity=".6"/>` +
    `<path d="M-.45,-3.15Q0,-3.55 .45,-3.15L.9,-.7Q1.1,.15 .1,.35Q-1,.4 -.95,-.4Z" fill="${c.buoy}"/>` +
    `<path d="M-.66,-2L.67,-2.05L.8,-1.2Q0,-.85 -.8,-1.15Z" fill="${c.sail}"/>` +
    `<path d="M.2,-3.25L.45,-3.15L.9,-.7Q1.1,.15 .1,.35L.2,-1.1Z" fill="${c.shadow}" opacity=".2"/>` +
    `<path d="M-.25,-2.8L-.5,-.6" stroke="${c.sail}" stroke-width=".15" opacity=".65"/>` +
    `<path d="M0,-3.2V-4.3L.9,-3.95L0,-3.65" stroke="${c.buoy}" stroke-width=".22" fill="${c.buoy}"/>` +
    `</g>`
  );
}

export function svgSailboat(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    return (
      `<g transform="translate(${x},${y})">` +
      `<g transform="scale(.92,1)">${waterBoatHull(c)}</g>` +
      `<path d="M-.8,-1.1V-6.9" stroke="${c.trunk}" stroke-width=".25"/>` +
      `<path d="M-1.9,-6.1 1.6,-6.6 Q2.8,-4.6 2.3,-2.8 L-1.5,-2.3Z" fill="${c.sail}"/>` +
      `<path d="M.6,-6.45 1.6,-6.6 Q2.8,-4.6 2.3,-2.8 L1.4,-2.7 Q1.6,-4.8 .6,-6.45Z" fill="${c.whaleBelly}" opacity=".45"/>` +
      `<path d="M-1.9,-6.1 1.6,-6.6 M-1.5,-2.3 2.3,-2.8" stroke="${c.trunk}" stroke-width=".18"/>` +
      `<path d="M-.8,-6.9 .5,-6.6 -.8,-6.2Z" fill="${c.flag}"/></g>`
    );
  }
  if (v === 2) {
    return (
      `<g transform="translate(${x},${y})">` +
      `<g transform="scale(1.05,.85)">${waterBoatHull(c)}</g>` +
      `<path d="M.6,-1.1 .3,-5.9 M-2.8,-2.2 2.9,-6.8" stroke="${c.trunk}" stroke-width=".24"/>` +
      `<path d="M-2.8,-2.2 2.9,-6.8 Q2.5,-4.1 1.4,-1.8Z" fill="${c.sail}"/>` +
      `<path d="M2.9,-6.8 Q2.5,-4.1 1.4,-1.8 L.45,-1.9 Q1.9,-3.7 2.9,-6.8Z" fill="${c.whaleBelly}" opacity=".4"/>` +
      `<path d="M-2.8,-2.2 1.4,-1.8" stroke="${c.trunk}" stroke-width=".18"/></g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<g transform="scale(1.1,1)">${waterBoatHull(c)}</g>` +
    waterBoatRig(c, 7.5, true) +
    `<path d="M-.2,-7.5L1,-7.15L-.2,-6.85Z" fill="${c.flag}"/>` +
    `</g>`
  );
}

export function svgLighthouse(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-2,-.4L-1.25,-1L1.35,-.95L2,-.2L.75,.55L-1.1,.4Z" fill="${c.rock}"/>` +
    `<path d="M-1.55,-.65L-1,-7.6L.95,-7.6L1.6,-.65Q.15,.25 -1.55,-.65Z" fill="${c.lighthouse}"/>` +
    `<path d="M.15,-7.6H.95L1.6,-.65Q.85,-.1 .2,-.2Z" fill="${c.heron}"/>` +
    `<path d="M-1.35,-3.15L-1.2,-4.85Q0,-4.3 1.2,-4.85L1.38,-3.15Q0,-2.55 -1.35,-3.15Z" fill="${c.buoy}"/>` +
    `<path d="M-.75,-.4V-1.5Q-.45,-2.1 -.1,-1.55V-.22Z" fill="${c.trunk}"/>` +
    `<path d="M-.6,-5.7V-6.55L-.1,-6.4V-5.55Z" fill="${c.whale}"/>` +
    `<path d="M-1.8,-7.8L0,-8.35L1.8,-7.8V-7.4Q0,-6.8 -1.8,-7.4Z" fill="${c.rock}"/>` +
    `<path d="M-1,-7.85V-9.3L0,-9.65L1,-9.3V-7.85Z" fill="${c.lanternGlow}"/>` +
    `<path d="M-1,-9.3V-7.85M0,-9.55V-7.7M1,-9.3V-7.85" stroke="${c.trunk}" stroke-width=".18"/>` +
    `<path d="M-1.5,-9.25L-.15,-10.8L1.5,-9.25L0,-8.95Z" fill="${c.buoy}"/>` +
    `<path d="M-.15,-10.8L1.5,-9.25L0,-8.95Z" fill="${c.shadow}" opacity=".22"/>` +
    `</g>`
  );
}

export function svgCrab(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-1.05,-.9L-2.15,-.6L-2.65,.15M-1,-.5L-1.8,.05L-1.75,.65M-.6,-.2L-1.05,.55L-.8,.9M1.05,-.9L2.15,-.6L2.65,.15M1,-.5L1.8,.05L1.75,.65M.6,-.2L1.05,.55L.8,.9" stroke="${c.crab}" stroke-width=".28" stroke-linecap="round" fill="none"/>` +
    `<path d="M-1.15,-1L-2.1,-1.5Q-3.45,-1.3 -3.2,-2.45L-2.7,-2.85L-2.65,-2.1L-2.2,-2.2L-2.2,-2.8Q-1.4,-2.6 -1.7,-1.8L-.85,-1.35M1.15,-1L2.1,-1.5Q3.45,-1.3 3.2,-2.45L2.7,-2.85L2.65,-2.1L2.2,-2.2L2.2,-2.8Q1.4,-2.6 1.7,-1.8L.85,-1.35Z" fill="${c.crab}"/>` +
    `<path d="M-1.5,-.75Q-1.65,-1.85 -.25,-1.95Q1.35,-2.1 1.55,-.85Q1.45,.05 0,.15Q-1.3,.1 -1.5,-.75Z" fill="${c.crab}"/>` +
    `<path d="M-1.15,-1Q-1.1,-1.65 -.15,-1.6Q.7,-1.65 1,-1.1Q-.25,-1.4 -1.15,-1Z" fill="${c.shellfish}" opacity=".6"/>` +
    `<path d="M-1.25,-.45Q0,.2 1.3,-.45Q.7,.15 0,.15Q-.85,.15 -1.25,-.45Z" fill="${c.shadow}" opacity=".23"/>` +
    `<path d="M-.55,-1.65L-.65,-2.3M.55,-1.65L.65,-2.3" stroke="${c.crab}" stroke-width=".3"/>` +
    `<path d="M-.65,-2.35v.15M.65,-2.35v.15" stroke="${c.shadow}" stroke-width=".28" stroke-linecap="round"/>` +
    `</g>`
  );
}
