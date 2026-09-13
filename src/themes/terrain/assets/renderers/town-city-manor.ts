import type { AssetColors } from '../../palette.js';

export function svgManor(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-3.5,0 0,1.8 3.5,0 3.5,-4.5 0,-2.7 -3.5,-4.5" fill="${c.manor}"/>` +
    `<polygon points="-3.5,0 0,1.8 0,-2.7 -3.5,-4.5" fill="${c.wallShade}"/>` +
    `<polygon points="0,-7.5 -4,-4.2 0,-2.5 4,-4.2" fill="${c.roofA}"/>` +
    `<rect x="1.5" y="-7.5" width="1" height="1.5" fill="${c.chimney}"/>` +
    `<rect x="-3.5" y="-0.5" width="1" height="0.5" fill="${c.manorGarden}"/>` +
    `</g>`
  );
}
