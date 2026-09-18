import type { AssetColors } from '../../palette.js';
import { lerpColor } from '../../../../utils/color.js';
import { farmMaterial } from './farm-art-material.js';

export function svgDonkey(x: number, y: number, c: AssetColors, v: number): string {
  const coat = farmMaterial(c.donkey, c);
  const walking = v === 1;
  const headX = walking ? -0.45 : 0;
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx=".35" cy=".4" rx="2.5" ry=".45" fill="${c.shadow}" opacity=".13"/>` +
    `<path d="${walking ? 'M-1.5,-1.8 -.4,-.45 -.7,.25h.6l.3,-.9 -.7,-1.5ZM1,-1.8 1.9,-.8 2.2,.25h.55l-.3,-1.25-.8,-1.2Z' : 'M-.95,-1.8h.45V.15h-.6ZM1.3,-1.8h.45L2,.15h-.55Z'}" fill="${coat.shade}"/>` +
    `<path d="M2.2,-2.9Q3.2,-2.7 2.85,-1.35L3.15,-.85 2.55,-.6 2.65,-1.4Q2.85,-2.3 2,-2.5Z" fill="${c.trunk}"/>` +
    `<path d="M-2,-2.6 -2,-4.25 -1.1,-4.55 -.65,-3.3Q.65,-3.65 1.95,-3.25 2.9,-2.95 2.6,-1.85L1.7,-1.2 -.2,-1.1Q-1.9,-1 -2,-2.6Z" fill="${coat.base}"/>` +
    `<path d="M-2,-2.6 -2,-4.25 -1.1,-4.55 -.65,-3.3Q.65,-3.65 1.95,-3.25 .95,-2.65 -.3,-2.75L-1.15,-2.45Z" fill="${coat.light}"/>` +
    `<path d="M-.3,-1.65Q1.7,-1.5 2.6,-2L1.7,-1.2 -.2,-1.1Z" fill="${coat.shade}"/>` +
    `<path d="M-.65,-3.3Q.6,-3.65 1.95,-3.25L1.8,-3.04 -.7,-3.05Z" fill="${c.trunk}"/>` +
    `<path d="${walking ? 'M-1.7,-1.8h.6L-2,.15h-.65ZM1.8,-1.85l.6,.2L1.3,.3H.6L1.8,-.95Z' : 'M-1.85,-1.6h.6L-1.45,.35h-.65ZM1.65,-1.6h.6L2.1,.35h-.65Z'}" fill="${coat.base}"/>` +
    `<g transform="translate(${headX} ${walking ? 0.15 : 0})">` +
    `<path d="M-2.15,-4.2Q-2.55,-4.9 -1.75,-5.15 -.85,-5.35 -.65,-4.6L-1.75,-3.9 -2.9,-3.95Z" fill="${coat.base}"/>` +
    `<path d="M-2.05,-4.95Q-2.8,-6.35 -2.3,-6.65 -1.7,-6.25 -1.6,-5.05ZM-1.5,-5.05Q-1.45,-6.6 -.95,-6.55 -.5,-6.15 -1,-4.9Z" fill="${coat.base}"/>` +
    `<path d="M-2,-5.2 -2.25,-6.2 -1.8,-5.3ZM-1.3,-5.25 -1.1,-6.2 -1.05,-5.25Z" fill="${c.goat}"/>` +
    `<path d="M-2.6,-4.55Q-3.4,-4.6 -3.2,-3.95 -2.8,-3.55 -2.1,-3.95L-2,-4.25Z" fill="${c.goat}"/>` +
    `<circle cx="-1.9" cy="-4.65" r=".14" fill="${c.trunk}"/>` +
    `<path d="M-3,-4.05h.2M-1.35,-4.9l.3,.4 .1,.7 .3,.3 -.25,-1.05 -.15,-.55Z" fill="${c.trunk}" stroke="${c.trunk}" stroke-width=".12"/></g>` +
    `<path d="${walking ? 'M-2.7,-.05h.75v.35h-.75ZM.55,.05h.8V.4h-.8Z' : 'M-2.15,.05h.75V.4h-.75ZM1.4,.05h.75V.4H1.4Z'}" fill="${c.trunk}"/></g>`
  );
}

export function svgGoat(x: number, y: number, c: AssetColors, v: number): string {
  const grazing = v === 1;
  const brown = v === 2;
  const coat = farmMaterial(brown ? lerpColor(c.goat, c.horse, 0.55) : c.goat, c);
  const head = grazing
    ? 'M-1.3,-2.55Q-2.3,-2.7 -2.5,-1.8L-3.05,-.9Q-2.75,-.35 -2.2,-.65L-1.6,-1.55Z'
    : 'M-1.8,-3.1 -1.6,-4.35Q-2,-4.8 -2.65,-4.25L-3.15,-3.55 -2.7,-3.05Z';
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx=".3" cy=".4" rx="2.35" ry=".4" fill="${c.shadow}" opacity=".13"/>` +
    `<path d="M-1.4,-1.55h.45L-.6,.2h-.6ZM.8,-1.55h.45L1.65,.2h-.6Z" fill="${coat.shade}"/>` +
    `<path d="M-1.95,-2.5Q-1.7,-3.4 -.15,-3.3L1.55,-3.05 2.3,-3.8 2.45,-3.2 2,-2.75Q2.7,-1.8 1.75,-1.2L.1,-.95 -1.2,-1.25 -2,-1.8Z" fill="${coat.base}"/>` +
    `<path d="M-1.95,-2.5Q-1.7,-3.4 -.15,-3.3L1.55,-3.05Q.7,-2.25 -.4,-2.6L-1.55,-2.1Z" fill="${coat.light}"/>` +
    `<path d="M.1,-1.5Q1.5,-1.6 2.25,-2.25L1.75,-1.2 .1,-.95Z" fill="${coat.shade}"/>` +
    `<path d="${brown ? 'M-1.85,-1.6 -2.05,-.5 -2.75,-.25 -2.6,.15 -1.5,-.15 -1.2,-1.45Z' : 'M-1.8,-1.5h.5L-1.55,.35h-.55Z'}M1.5,-1.55h.5L1.85,.4h-.55Z" fill="${coat.base}"/>` +
    (grazing ? '' : `<path d="M-2,-1.8 -2.3,-3.65 -1.6,-4.35 -1.1,-2.3Z" fill="${coat.base}"/>`) +
    `<path d="${head}" fill="${coat.base}"/>` +
    `<path d="${grazing ? 'M-2.4,-2.05Q-3.4,-2.4 -3.15,-3.35 -2.65,-2.9 -2.1,-2.45ZM-1.8,-2.3Q-1.5,-3.4 -1.9,-3.6L-1.5,-3.4Q-1.05,-2.55 -1.6,-1.95Z' : brown ? 'M-2.4,-4.25Q-3.05,-5.7 -1.4,-5.65 -2.25,-5.35 -2.05,-4.45ZM-1.85,-4.35Q-1.6,-5.65 -.55,-5.55 -1.35,-5.15 -1.5,-4.1Z' : 'M-2.4,-4.25Q-3,-5.25 -2.25,-5.65 -2.55,-5.05 -2.05,-4.45ZM-1.8,-4.45Q-1.4,-5.2 -1.8,-5.6 -1.05,-5.15 -1.4,-4.15Z'}" fill="${c.goatHorn}"/>` +
    `<path d="${grazing ? 'M-2.15,-1.8 -1.45,-2.4 -1.15,-2.1 -1.9,-1.5ZM-2.85,-.9 -2.75,.05 -2.3,-.75Z' : 'M-1.8,-3.85 -.8,-4.25 -.6,-3.85 -1.5,-3.5ZM-2.8,-3.2 -2.6,-2.25 -2.25,-3.1Z'}" fill="${coat.shade}"/>` +
    `<path d="${grazing ? 'M-2.65,-1.45h.25' : 'M-2.5,-3.75h.25'}" stroke="${c.trunk}" stroke-width=".16"/>` +
    `<path d="${brown ? 'M-2.7,-.1l.3,-.1 .1,.3-.3,.15Z' : 'M-2.15,.05h.65V.4h-.65Z'}M1.25,.1h.65v.35h-.65Z" fill="${c.goatHorn}"/></g>`
  );
}

export function svgRicePaddy(x: number, y: number, c: AssetColors, _v: number): string {
  const bank = farmMaterial(c.ricePaddy, c);
  const rows = [
    [-0.8, -2.2],
    [0.55, -1.65],
    [1.9, -1.1],
    [-2.2, -1.55],
    [-0.85, -0.95],
    [0.5, -0.35],
    [-3.55, -0.85],
    [-2.15, -0.25],
    [-0.8, 0.35],
  ];
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-5,-.45 0,-2.75 5,-.45 0,1.9Z" fill="${bank.light}"/>` +
    `<path d="M-5,-.45 0,1.9v.5l-5,-2.3Z" fill="${bank.base}"/>` +
    `<path d="M0,1.9 5,-.45V.1L0,2.4Z" fill="${bank.shade}"/>` +
    `<path d="M-4,-.45 0,-2.3 4,-.45 0,1.4Z" fill="${c.ricePaddyWater}"/>` +
    `<path d="M-3.75,-.4 0,-2.12 1,-1.65 -2.8,.1ZM-.4,.8 2.4,-.5 3.4,-.05 .5,1.15Z" fill="${c.waterLight}" opacity=".35"/>` +
    `<path d="${rows.map(([px, py]) => `M${px},${py}q-.65,-.5 -.65,-1.35l.6,.65 .2,-1.35 .2,1.25 .55,-.55q0,.75-.5,1.4Z`).join('')}" fill="${c.reeds}"/>` +
    `<path d="${rows.map(([px, py]) => `M${px},${py}l.15,-1.75 .2,1.25Z`).join('')}" fill="${bank.light}"/></g>`
  );
}

export function svgSilo(x: number, y: number, c: AssetColors, _v: number): string {
  const metal = farmMaterial(c.silo, c);
  const roof = farmMaterial(c.roofA, c);
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx=".4" cy=".4" rx="2.05" ry=".5" fill="${c.shadow}" opacity=".14"/>` +
    `<path d="M-1.65,-7.25Q0,-8 1.65,-7.25V-.15Q0,.8 -1.65,-.15Z" fill="${metal.base}"/>` +
    `<path d="M.6,-7.7 1.65,-7.25V-.15Q.9,.35 .6,.25Z" fill="${metal.shade}"/>` +
    `<path d="M-1.4,-7.2Q-.9,-7.45 -.55,-7.45v7.6l-.85,-.2Z" fill="${metal.light}"/>` +
    `<path d="M-1.65,-5.65Q0,-4.9 1.65,-5.65M-1.65,-3.75Q0,-3 1.65,-3.75M-1.65,-1.85Q0,-1.1 1.65,-1.85" stroke="${metal.shade}" stroke-width=".2" fill="none"/>` +
    `<path d="M-1.9,-7.2 0,-9.2 1.9,-7.2Q0,-6.15 -1.9,-7.2Z" fill="${roof.base}"/>` +
    `<path d="M-1.9,-7.2 0,-9.2 -.45,-6.7Q-1.2,-6.75 -1.9,-7.2Z" fill="${roof.light}"/>` +
    `<path d="M0,-9.2 1.9,-7.2Q1.2,-6.8 .7,-6.75Z" fill="${roof.shade}"/>` +
    `<path d="M-.5,.2v-1.2Q-.5,-1.7 0,-1.7t.5,.5V.2Z" fill="${c.trunk}"/>` +
    `<path d="M.9,-6.65v5.7m.4,-5.85v5.7M.9,-5.7h.4M.9,-4.7h.4M.9,-3.7h.4M.9,-2.7h.4M.9,-1.7h.4" stroke="${metal.light}" stroke-width=".13" fill="none"/></g>`
  );
}
