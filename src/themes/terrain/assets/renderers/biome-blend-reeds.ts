import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function svgReeds(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="-1" y1="0" x2="-1.3" y2="-4" stroke="${c.reeds}" stroke-width="0.4"/>` +
    `<line x1="0" y1="0" x2="0.2" y2="-4.5" stroke="${c.reeds}" stroke-width="0.4"/>` +
    `<line x1="1" y1="0" x2="0.8" y2="-3.8" stroke="${c.reeds}" stroke-width="0.4"/>` +
    `<ellipse cx="-1.3" cy="-4.3" rx="0.3" ry="0.8" fill="${c.trunk}"/>` +
    `<ellipse cx="0.2" cy="-4.8" rx="0.3" ry="0.8" fill="${c.trunk}"/>` +
    `</g>`
  );
}

export function svgFountain(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.5" rx="2.5" ry="1" fill="${c.fountain}" stroke="${c.boulder}" stroke-width="0.3"/>` +
    `<ellipse cx="0" cy="-0.3" rx="2" ry="0.7" fill="${c.fountainWater}" opacity="0.6"/>` +
    `<rect x="-0.4" y="-3" width="0.8" height="2.5" fill="${c.fountain}"/>` +
    `<line x1="0" y1="-3" x2="0" y2="-4.5" stroke="${c.fountainWater}" stroke-width="0.4" opacity="0.7">` +
    motionMarkup(
      `<animate attributeName="y2" values="-4.5;-5.2;-4.5" dur="2s" repeatCount="indefinite"/>`,
    ) +
    `</line>` +
    `<circle cx="-0.5" cy="-3.5" r="0.3" fill="${c.fountainWater}" opacity="0.4"/>` +
    `<circle cx="0.5" cy="-3.8" r="0.3" fill="${c.fountainWater}" opacity="0.4"/>` +
    `</g>`
  );
}

export function svgCanal(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-3" y="-1" width="6" height="1" fill="${c.canal}"/>` +
    `<rect x="-2.5" y="-0.7" width="5" height="0.5" fill="${c.fountainWater}" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgWatermill(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-2" y="-4" width="4" height="4" fill="${c.wall}"/>` +
    `<polygon points="-2.5,-4 0,-6 2.5,-4" fill="${c.roofB}"/>` +
    `<g>` +
    `<circle cx="3" cy="-2" r="2" fill="none" stroke="${c.trunk}" stroke-width="0.5"/>` +
    `<line x1="3" y1="-4" x2="3" y2="0" stroke="${c.trunk}" stroke-width="0.3"/>` +
    `<line x1="1" y1="-2" x2="5" y2="-2" stroke="${c.trunk}" stroke-width="0.3"/>` +
    motionMarkup(
      `<animateTransform attributeName="transform" type="rotate" from="0 3 -2" to="360 3 -2" dur="6s" repeatCount="indefinite"/>`,
    ) +
    `</g>` +
    `</g>`
  );
}

export function svgGardenTree(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Cone topiary variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0" x2="0" y2="-2.5" stroke="${c.trunk}" stroke-width="0.5"/>` +
      `<polygon points="0,-7 -1.5,-2.5 1.5,-2.5" fill="${c.gardenTree}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Flowering pink variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0" x2="0" y2="-2.5" stroke="${c.trunk}" stroke-width="0.5"/>` +
      `<circle cx="0" cy="-4" r="2" fill="${c.gardenTree}"/>` +
      `<circle cx="-0.8" cy="-4.5" r="0.4" fill="${c.flower}" opacity="0.8"/>` +
      `<circle cx="0.5" cy="-3.5" r="0.35" fill="${c.flower}" opacity="0.7"/>` +
      `<circle cx="0.8" cy="-4.8" r="0.3" fill="${c.flower}" opacity="0.6"/>` +
      `<circle cx="-0.3" cy="-3.2" r="0.3" fill="${c.flower}" opacity="0.7"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0" x2="0" y2="-2.5" stroke="${c.trunk}" stroke-width="0.5"/>` +
    `<circle cx="0" cy="-4" r="2" fill="${c.gardenTree}"/>` +
    `<circle cx="-0.8" cy="-3.5" r="1.2" fill="${c.leaf}" opacity="0.6"/>` +
    `</g>`
  );
}

export function svgPondLily(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.3" rx="1.5" ry="0.6" fill="${c.pine}" opacity="0.7"/>` +
    `<circle cx="0.3" cy="-0.5" r="0.4" fill="${c.flower}"/>` +
    `</g>`
  );
}
