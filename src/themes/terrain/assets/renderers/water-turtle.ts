import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function svgTurtle(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<g>` +
    `<ellipse cx="0" cy="-1" rx="2" ry="1.2" fill="${c.turtle}"/>` +
    `<ellipse cx="0" cy="-1.3" rx="1.5" ry="0.8" fill="${c.moss}" opacity="0.5"/>` +
    `<circle cx="-2" cy="-1.2" r="0.5" fill="${c.turtle}"/>` +
    `<circle cx="-2.3" cy="-1.3" r="0.12" fill="#222"/>` +
    motionMarkup(
      `<animateTransform attributeName="transform" type="translate" values="0,0;3,0;0,0" dur="8s" repeatCount="indefinite"/>`,
    ) +
    `</g>` +
    `</g>`
  );
}

export function svgBuoy(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.3" rx="1.2" ry="0.5" fill="${c.waterLight}" opacity="0.3"/>` +
    `<rect x="-0.6" y="-2.5" width="1.2" height="2.2" fill="${c.buoy}" rx="0.3"/>` +
    `<rect x="-0.6" y="-1.8" width="1.2" height="0.5" fill="#fff"/>` +
    `<line x1="0" y1="-2.5" x2="0" y2="-3.5" stroke="${c.buoy}" stroke-width="0.3"/>` +
    `</g>`
  );
}

export function svgSailboat(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-3.5,0 -2.5,-1.5 3.5,-1.5 4,0" fill="${c.boat}"/>` +
    `<line x1="0" y1="-1.5" x2="0" y2="-7" stroke="${c.trunk}" stroke-width="0.4"/>` +
    `<polygon points="0,-6.5 0,-2 3,-2.5" fill="${c.sail}" opacity="0.9"/>` +
    `<polygon points="0,-6 0,-2.5 -2,-3" fill="${c.sail}" opacity="0.7"/>` +
    `</g>`
  );
}

export function svgLighthouse(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-1.5,0 1.5,0 1,-8 -1,-8" fill="${c.lighthouse}"/>` +
    `<rect x="-1.5" y="-1" width="3" height="1" fill="${c.rock}"/>` +
    `<rect x="-0.8" y="-9" width="1.6" height="1.2" fill="${c.lighthouse}" stroke="${c.rock}" stroke-width="0.2"/>` +
    `<polygon points="-1,-9 0,-10.5 1,-9" fill="${c.buoy}"/>` +
    `<circle cx="0" cy="-8.4" r="0.4" fill="${c.lanternGlow}" opacity="0.8"/>` +
    `</g>`
  );
}

export function svgCrab(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.8" rx="1.5" ry="1" fill="${c.crab}"/>` +
    `<path d="M-1.5,-0.8 L-2.5,-1.8 L-2.8,-1.2" stroke="${c.crab}" fill="none" stroke-width="0.4"/>` +
    `<path d="M1.5,-0.8 L2.5,-1.8 L2.8,-1.2" stroke="${c.crab}" fill="none" stroke-width="0.4"/>` +
    `<circle cx="-0.5" cy="-1.2" r="0.15" fill="#222"/>` +
    `<circle cx="0.5" cy="-1.2" r="0.15" fill="#222"/>` +
    `</g>`
  );
}
