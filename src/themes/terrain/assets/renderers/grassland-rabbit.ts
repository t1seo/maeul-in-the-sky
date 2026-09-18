import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

function rabbit(c: AssetColors, hopping: boolean): string {
  const body = hopping
    ? 'M-1.15,-1.25 Q-1.9,-1.6 -1.6,-2.15 Q-1.4,-2.5 -.8,-2.2 Q.8,-2.45 1.3,-1.5 L2,.1 1.55,.25 .6,-.9 Q-.2,-.5 -.8,-1 L-1.7,-.3 -1.95,-.55Z'
    : 'M-1.2,-.35 Q-1.55,-.65 -1.3,-1.35 Q-1.95,-1.5 -1.65,-2.05 Q-1.35,-2.45 -.85,-2 Q-.2,-2.25 .65,-1.9 Q1.55,-1.5 1.35,-.55 L1.55,-.15 Q.2,.25 -.45,-.15Z';
  return (
    `<path d="M-1.6,-1.8 Q-2.2,-3.35 -1.65,-3.45 Q-1.35,-3.55 -1.15,-2.1 M-1.15,-1.85 Q-1.05,-3.45 -.65,-3.3 Q-.35,-3.2 -.7,-1.95Z" fill="${c.rabbit}"/>` +
    `<path d="M-1.58,-2.25 -1.72,-3.1 -1.43,-2.65 M-.96,-2.25 -.73,-3.02 -.75,-2.48Z" fill="${c.flower}" opacity=".5"/>` +
    `<path d="${body}" fill="${c.rabbit}"/>` +
    `<path d="M-.25,-1.95 Q.75,-2.15 1.15,-1.35 Q.4,-1.55 -.15,-1.25Z" fill="${c.mushroom}"/>` +
    `<path d="M.6,-1.25 Q1.3,-.55 .5,-.3 L-.2,-.25 Q-.45,-.8 .1,-1Z" fill="${c.shadow}" opacity=".16"/>` +
    `<circle cx="1.4" cy="-1" r=".36" fill="${c.mushroom}"/>` +
    `<path d="M-1.6,-1.8a.12,.12 0 1 0 .24,0a.12,.12 0 1 0 -.24,0 M-1.8,-1.62l.2,.08 -.18,.1Z" fill="${c.bird}"/>`
  );
}

export function svgRabbit(x: number, y: number, c: AssetColors, v: number): string {
  const bodies =
    v === 2
      ? `<g transform="translate(2,-.1) scale(.8)">${rabbit(c, false)}</g><g transform="translate(-.65,0) scale(.85)">${rabbit(c, false)}</g>`
      : rabbit(c, v === 1);
  return `<g transform="translate(${x},${y})">${bodies}</g>`;
}

export function svgFox(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M-2,-.8 Q-2.6,-2.5 -.4,-2.6 Q1.7,-2.9 2.35,-1.35 Q2.8,-.1 .5,.15 Q-1.3,.3 -2,-.8Z" fill="${c.fox}"/>` +
      `<path d="M-.6,-2.4 Q.7,-3 1.8,-1.75 Q.6,-2.2 -.6,-1.6Z" fill="${c.butterflyWing}" opacity=".55"/>` +
      `<path d="M-1.9,-1 -2.45,-2.4 -1.6,-1.95 -.65,-2.35 -.8,-1.4 -1.3,-.6Z" fill="${c.fox}"/>` +
      `<path d="M-2,-1.1 -1.6,-1.45 -.8,-1.15 -1.3,-.6Z" fill="${c.mushroom}"/>` +
      `<path d="M2.2,-1.5 Q3.1,.4 -.6,.25 Q-1.8,.1 -1.85,-.55 Q-.9,-1.15 .1,-.55 Q1.45,-.05 2.2,-1.5Z" fill="${c.fox}"/>` +
      `<path d="M-1.85,-.55 Q-.9,-1.15 .1,-.55 L.6,-.2 -.1,.25 Q-1.8,.1 -1.85,-.55Z" fill="${c.mushroom}"/>` +
      `<path d="M-1.9,-1.55q.25,.22 .5,0" stroke="${c.bird}" stroke-width=".16" fill="none"/></g>`
    );
  }
  const feet =
    v === 2
      ? 'M-1.3,-1.4 -1.9,.3 -1.45,.3 -.75,-.9 M.75,-1.4 1.8,.2 2.15,.1 1.2,-1.6Z'
      : 'M-1.3,-1.3 -1.25,.1 -.8,.1 -.65,-1.3 M.9,-1.4 1.15,.1 1.6,.1 1.5,-1.5Z';
  const tail =
    v === 2
      ? 'M1.15,-1.7 Q2.8,-1.3 3.45,-3.3 Q4.7,-2.4 3.5,-1.2 Q2.5,-.2 1.4,-.7Z'
      : 'M1.25,-1.5 Q2.8,-.9 3.9,-2.8 Q4.8,-1.2 3.4,-.55 Q2.4,.1 1.3,-.65Z';
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="${feet}" fill="${c.trunk}"/>` +
    `<path d="${tail}" fill="${c.fox}"/>` +
    `<path d="${v === 2 ? 'M3,-2.35 3.45,-3.3 Q4.7,-2.4 3.5,-1.2 L3.15,-1.55Z' : 'M3,-1.75 3.9,-2.8 Q4.8,-1.2 3.4,-.55 L3.15,-1.05Z'}" fill="${c.mushroom}"/>` +
    `<path d="M-1.55,-1.5 Q-1.8,-2.85 -.2,-2.8 Q1.3,-3 1.8,-1.75 Q1.6,-.65 .4,-.65 L-1,-.85Z" fill="${c.fox}"/>` +
    `<path d="M-1.5,-2.3 Q-.3,-3.05 1,-2.45 L.15,-2.1 -1.1,-1.95Z" fill="${c.butterflyWing}" opacity=".55"/>` +
    `<path d="M-2.8,-2.3 -2.6,-3.95 -1.8,-3.25 -1.1,-3.8 -1.25,-2.65 -1.8,-1.55 -2.4,-1.9 -3.25,-2.05Z" fill="${c.fox}"/>` +
    `<path d="M-3.25,-2.05 -2.3,-2.3 -1.8,-1.55 -1.4,-1.05 -2.15,-1.3Z" fill="${c.mushroom}"/>` +
    `<path d="M-2.57,-3.62 -2.15,-3.25 -2.52,-3.05Z M-3.25,-2.05l.3,-.1 -.1,.25Z" fill="${c.trunk}"/>` +
    `<circle cx="-2.45" cy="-2.65" r=".13" fill="${c.bird}"/></g>`
  );
}

export function svgButterfly(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})"><g>` +
    `<path d="M-.05,-3.3 C-3.6,-6.8 -3.4,-2.3 -1.3,-2.9 C-2.6,-.5 -.2,-.9 0,-2.8Z" fill="${c.butterfly}"/>` +
    `<path d="M.05,-3.3 C3.1,-6 3.25,-2.2 1.2,-2.9 C2.4,-.7 .3,-.7 0,-2.8Z" fill="${c.butterflyWing}"/>` +
    `<path d="M-.35,-3.25 Q-2.35,-5.6 -2.25,-3.65 Q-1.6,-3.1 -.35,-3.25Z M.4,-2.7 Q1.4,-2.15 .85,-1.65Z" fill="${c.mushroom}" opacity=".6"/>` +
    `<path d="M0,-2.1 0,-3.95 M-.02,-3.8 -.5,-4.4 M.02,-3.8 .5,-4.4" stroke="${c.bird}" stroke-width=".2" stroke-linecap="round" fill="none"/>` +
    motionMarkup(
      '<animateTransform attributeName="transform" type="translate" values="0,0;2,-1;-1,0.5;0,0" dur="6s" repeatCount="indefinite"/>',
    ) +
    '</g></g>'
  );
}

export function svgBeehive(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-.15,-5.7 -.15,-7.2 -1.5,-7.4 M-.15,-6.9 1.45,-7.3" stroke="${c.trunk}" stroke-width=".4" stroke-linecap="round" fill="none"/>` +
    `<path d="M-.3,-5.9 C-1.2,-5.7 -1.3,-4.8 -1.7,-3.9 Q-2.1,-2.8 -1.4,-1.6 Q0,-.45 1.5,-1.6 Q2.2,-2.8 1.55,-4.25 Q1.1,-5.8 -.3,-5.9Z" fill="${c.beehive}"/>` +
    `<path d="M.45,-5.55 Q2.15,-3.6 1.5,-1.6 Q.7,-.85 -.2,-1.05 Q1,-2.6 .45,-5.55Z" fill="${c.trunk}" opacity=".25"/>` +
    `<path d="M-.45,-5.55 Q-1.55,-4.4 -1.25,-2.55 L-.75,-2.2 Q-.9,-4 -.05,-5.6Z" fill="${c.wheat}"/>` +
    `<path d="M-1,-4.75 Q0,-4.3 1.1,-4.7 M-1.6,-3.85 Q0,-3.3 1.65,-3.75 M-1.7,-2.8 Q0,-2.3 1.8,-2.7 M-1.25,-1.8 Q0,-1.4 1.3,-1.8" stroke="${c.trunk}" stroke-width=".16" opacity=".5" fill="none"/>` +
    `<ellipse cx=".25" cy="-2" rx=".42" ry=".3" fill="${c.trunk}"/></g>`
  );
}

export function svgWildflowerPatch(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-2,.2 Q-1.5,-.8 -.8,-.2 Q0,-1.15 .8,-.4 Q1.8,-1 2.2,0Z" fill="${c.bushDark}"/>` +
    `<path d="M-1.45,0 -1.7,-2.1 M.1,0 -.1,-2.8 M1.2,0 1.55,-1.85" stroke="${c.pine}" stroke-width=".22" fill="none"/>` +
    `<path d="M-1.5,-.6 Q-2.6,-1.35 -2.3,-1.65 Q-1.4,-1.35 -1.5,-.6 M.1,-.8 Q.5,-1.85 1,-1.8 Q1.05,-1 .1,-.8" fill="${c.leafLight}"/>` +
    `<path d="M-1.7,-2.1 C-3,-2.15 -2.55,-3 -1.95,-2.8 C-1.9,-3.65 -.8,-3.2 -1.15,-2.7 C-.4,-2.2 -1,-1.6 -1.7,-2.1Z" fill="${c.flower}"/>` +
    `<path d="M-.1,-2.65 C-1.1,-2.8 -.8,-3.6 -.2,-3.3 C.15,-4 .9,-3.4 .5,-3 C1.2,-2.35 .4,-1.95 -.1,-2.65Z" fill="${c.wildflower}"/>` +
    `<path d="M1.4,-1.85 C.55,-2.2 1.1,-2.8 1.55,-2.4 C2,-3 2.6,-2.4 2.15,-2 C2.75,-1.4 1.9,-1 1.4,-1.85Z" fill="${c.butterflyWing}"/>` +
    `<path d="M-1.85,-2.45a.23,.2 0 1 0 .46,0a.23,.2 0 1 0 -.46,0 M-.16,-2.95a.23,.2 0 1 0 .46,0a.23,.2 0 1 0 -.46,0 M1.48,-2.05a.2,.18 0 1 0 .4,0a.2,.18 0 1 0 -.4,0" fill="${c.flowerCenter}"/></g>`
  );
}

export function svgTallGrass(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})" ${motionMarkup('class="sway-gentle"')}>` +
    `<path d="M-.8,.1 Q-1.6,-2.6 -2.5,-3 Q-.7,-2.6 -.2,-.4 Q.1,-3.2 1.5,-4.2 Q.5,-2 .65,0Z" fill="${c.bushDark}"/>` +
    `<path d="M-.85,.1 Q-1.6,-3 -.9,-4.5 Q-.85,-2 -.1,-.5 Q-.2,-3.7 .4,-4.6 Q.4,-1.8 .7,-.5 Q1.25,-2.4 2.5,-2.85 Q1.1,-1 .85,.15Z" fill="${c.tallGrass}"/>` +
    `<path d="M-.8,0 Q-1.05,-2.3 -.9,-4.5 Q-.7,-1.9 -.25,-.2Z M.15,-.3 Q.05,-2.7 .4,-4.6 L.5,-1.3Z" fill="${c.leafLight}"/></g>`
  );
}

function birch(c: AssetColors, leaning: boolean): string {
  const lean = leaning ? -0.7 : 0;
  return (
    `<path d="M-.5,.1 Q${lean - 0.5},-3 -.25,-7.5 L.4,-7.5 Q${lean + 0.2},-3 .45,.05Z" fill="${c.birchBark}"/>` +
    `<path d="M.1,-7.3 Q${lean + 0.15},-3 .45,.05 L.1,.05 Q${lean - 0.1},-3 -.12,-7.3Z" fill="${c.shadow}" opacity=".2"/>` +
    `<path d="M-.25,-2.1 .25,-2.2 M${lean - 0.15},-3.7 ${lean + 0.27},-3.8 M-.25,-5.6 .3,-5.7 M-.1,-6.7 -1,-7.4 M.25,-6.5 1.05,-7.2" stroke="${c.trunk}" stroke-width=".2" fill="none"/>` +
    `<path d="M-1.8,-6.4 C-3,-7.2 -2.8,-8.9 -1.6,-9.2 C-1.9,-10.8 -.2,-11.4 .8,-10.8 C2,-10.7 2.5,-9.4 1.95,-8.6 C3,-7.3 1.6,-5.7 .5,-6.1 Q-.9,-5.4 -1.8,-6.4Z" fill="${c.bushDark}"/>` +
    `<path d="M-1.8,-6.4 C-3,-7.2 -2.8,-8.9 -1.6,-9.2 C-1.9,-10.8 -.2,-11.4 .8,-10.8 Q2,-10.2 .9,-9.2 Q1.6,-7.6 .1,-7.1 Q-.8,-6.1 -1.8,-6.4Z" fill="${c.leaf}"/>` +
    `<path d="M-2.1,-8.1 Q-2.9,-9 -1.45,-9.5 Q-1.45,-10.7 -.2,-10.65 Q.5,-10.3 -.2,-9.8 Q-1.4,-9.7 -1.25,-8.8Z" fill="${c.leafLight}"/>`
  );
}

export function svgBirch(x: number, y: number, c: AssetColors, v: number): string {
  const trees =
    v === 1
      ? `<g transform="translate(-2.2,-.2) scale(.68)">${birch(c, true)}</g><g transform="translate(2.1,0) scale(.62)">${birch(c, false)}</g><g transform="scale(.95)">${birch(c, false)}</g>`
      : v === 2
        ? `<g transform="rotate(-7)">${birch(c, true)}</g>`
        : birch(c, false);
  return `<g transform="translate(${x},${y})">${trees}</g>`;
}

export function svgHaybale(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-1.4,-2.25 Q.1,-2.65 1.65,-1.95 Q2.75,-1.6 2.1,.1 L-.6,.6Z" fill="${c.haybale}"/>` +
    `<path d="M-.5,.15 2.3,-.65 2.1,.1 -.6,.6Z" fill="${c.trunk}" opacity=".23"/>` +
    `<path d="M-1.4,-2.25 Q.1,-2.65 1.65,-1.95 L1.35,-1.5 -.5,-1.65Z" fill="${c.wheat}"/>` +
    `<ellipse cx="-1.25" cy="-1" rx="1.2" ry="1.45" fill="${c.haybale}"/>` +
    `<path d="M-.65,-.7 Q-1.85,.5 -2.1,-1 Q-2.1,-2.4 -1.1,-2 Q-.2,-1.6 -.75,-.65 Q-1.45,-.15 -1.55,-1 Q-1.55,-1.5 -1.15,-1.3" stroke="${c.trunk}" stroke-width=".18" opacity=".6" fill="none"/>` +
    `<path d="M.5,-2.35 Q1.35,-1.35 .8,.25" stroke="${c.trunk}" stroke-width=".3" opacity=".5" fill="none"/></g>`
  );
}
