import type { AssetColors } from '../../palette.js';

export function svgShrine(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.8" y="-3" width="1.6" height="3" fill="${c.shrine}"/>` +
    `<polygon points="-1.2,-3 0,-4.2 1.2,-3" fill="${c.shrine}"/>` +
    `<rect x="-0.3" y="-2.5" width="0.6" height="0.6" fill="${c.fountain}" rx="0.1"/>` +
    `</g>`
  );
}

export function svgWagon(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-3" y="-3" width="5" height="2.5" fill="${c.wagon}"/>` +
    `<path d="M-3,-3 Q-1.5,-5 2,-3" stroke="${c.wagon}" fill="${c.sail}" opacity="0.5" stroke-width="0.3"/>` +
    `<circle cx="-2" cy="0" r="0.8" fill="${c.trunk}" stroke="${c.fence}" stroke-width="0.2"/>` +
    `<circle cx="1.5" cy="0" r="0.8" fill="${c.trunk}" stroke="${c.fence}" stroke-width="0.2"/>` +
    `</g>`
  );
}
