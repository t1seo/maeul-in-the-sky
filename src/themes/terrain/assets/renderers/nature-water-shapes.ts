import type { AssetColors } from '../../palette.js';

export const NATURE_POOLS = [
  'M-6.9,-.1 Q-7.6,-1.8 -4.2,-2.6 Q-2.3,-3.2 -.3,-2.5 Q1,-1.4 3.4,-1.8 Q6.8,-2 7,-.3 Q6.9,1.4 3.2,1.7 Q.1,1.2 -2.8,1.6 Q-5.8,1.5 -6.9,-.1Z',
  'M-6.8,.8 Q-7.7,-.6 -5.2,-1.6 Q-3.4,-2.5 -.9,-2 Q1.5,-1.6 2.1,-3 Q3,-4 5.3,-3.2 Q7.8,-2.4 6.7,-.7 Q5.2,.9 2.5,.1 Q1.3,-.2 .1,.9 Q-2.8,3 -6.8,.8Z',
  'M-6.7,-1 Q-5.7,-3.2 -2.6,-2.8 Q-.5,-3.9 2.1,-2.6 Q6.7,-2.7 7,-.5 Q6.4,.7 4.5,.9 Q2.9,2.5 -.1,1.7 Q-2.1,2.3 -4.2,1 Q-7.9,.9 -6.7,-1Z',
] as const;

export function naturePool(c: AssetColors, v: number): string {
  return (
    `<path d="${NATURE_POOLS[v] ?? NATURE_POOLS[0]}" fill="${c.water}"/>` +
    `<path d="M-5.5,.2 Q-3.8,.8 -2.5,.4 M.9,.8 Q2.8,1.3 4.6,.5 M2.7,-1.9 Q4,-1.4 5.4,-1.7" fill="none" stroke="${c.waterLight}" stroke-width=".24" stroke-linecap="round"/>`
  );
}

export function lotusLeaf(c: AssetColors, x: number, y: number, size: number): string {
  return (
    `<g transform="translate(${x},${y}) scale(${size})">` +
    `<path d="M0,0 1.7,-.9 C.8,-1.6 -2.7,-1.1 -2.5,.1 C-2.2,1.3 1.5,1.4 2.1,.2Z" fill="${c.leaf}"/>` +
    `<path d="M0,0 -1.8,-.65 M0,0 -2,.4 M0,0 .3,.8" fill="none" stroke="${c.leafLight}" stroke-width=".13"/></g>`
  );
}

export function lotusBloom(c: AssetColors, x: number, y: number, size: number): string {
  return (
    `<g transform="translate(${x},${y}) scale(${size})">` +
    `<path d="M0,0 Q.55,-1.5 .1,-2.1" stroke="${c.reeds}" stroke-width=".2" fill="none"/>` +
    `<path d="M0,-1 Q-2.5,-1.2 -2,-2.8 L-.8,-2.1 Q-1,-3.5 .1,-4 Q1,-3.4 1,-2.3 L2.3,-3 Q2.6,-1.4 0,-1Z" fill="${c.flower}"/>` +
    `<path d="M0,-1 Q-1.6,-1.6 -1.2,-2.7 L0,-1.9 Q.3,-3.3 1,-3 Q1.1,-1.8 0,-1Z" fill="${c.cherryPetalWhite}"/>` +
    `<path d="M-.4,-1.3 0,-1.8 .5,-1.3Z" fill="${c.flowerCenter}"/></g>`
  );
}
