import type { AssetColors } from '../../palette.js';

export function svgAppleBasket(x: number, y: number, c: AssetColors, v: number): string {
  // Basket full of apples
  /* v8 ignore start */
  const basket = c.nestBrown || '#7a5530';
  const apple = c.appleRed || '#c41e3a';
  const green = c.pearGreen || '#d1e231';
  /* v8 ignore stop */
  if (v === 1) {
    // Overflowing basket
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M-1.2,0 Q-1.5,-1 0,-1 Q1.5,-1 1.2,0 L1,0.3 L-1,0.3 Z" fill="${basket}"/>` +
      `<circle cx="-0.5" cy="-0.8" r="0.4" fill="${apple}"/>` +
      `<circle cx="0.3" cy="-0.9" r="0.35" fill="${apple}"/>` +
      `<circle cx="0" cy="-0.5" r="0.4" fill="${green}"/>` +
      `<circle cx="-0.2" cy="-1.3" r="0.35" fill="${apple}"/>` +
      `<circle cx="0.5" cy="-0.4" r="0.3" fill="${apple}" opacity="0.9"/>` +
      `<path d="M-0.5,0.3 Q0,-0.2 0.5,0.3" stroke="${basket}" fill="none" stroke-width="0.1"/>` +
      `</g>`
    );
  }
  // Default basket
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-1,0 Q-1.3,-0.8 0,-0.8 Q1.3,-0.8 1,0 L0.8,0.2 L-0.8,0.2 Z" fill="${basket}"/>` +
    `<circle cx="-0.3" cy="-0.5" r="0.35" fill="${apple}"/>` +
    `<circle cx="0.3" cy="-0.6" r="0.3" fill="${apple}"/>` +
    `<circle cx="0" cy="-0.3" r="0.3" fill="${green}"/>` +
    `<path d="M-0.4,0.2 Q0,-0.1 0.4,0.2" stroke="${basket}" fill="none" stroke-width="0.08"/>` +
    `</g>`
  );
}

export function svgRake(x: number, y: number, c: AssetColors, v: number): string {
  // Garden rake with leaves
  const handle = c.trunk;
  /* v8 ignore start */
  const metal = c.sledRunner || '#607080';
  const leaf = c.fallenLeafOrange || '#d08030';
  /* v8 ignore stop */
  if (v === 1) {
    // Rake with pile of leaves
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="-1" y1="1" x2="1.5" y2="-3" stroke="${handle}" stroke-width="0.3"/>` +
      `<rect x="0.8" y="-3.2" width="1.5" height="0.3" fill="${metal}"/>` +
      `<line x1="0.9" y1="-3" x2="0.9" y2="-2.2" stroke="${metal}" stroke-width="0.12"/>` +
      `<line x1="1.3" y1="-3" x2="1.3" y2="-2.2" stroke="${metal}" stroke-width="0.12"/>` +
      `<line x1="1.7" y1="-3" x2="1.7" y2="-2.2" stroke="${metal}" stroke-width="0.12"/>` +
      `<line x1="2.1" y1="-3" x2="2.1" y2="-2.2" stroke="${metal}" stroke-width="0.12"/>` +
      `<ellipse cx="-1.5" cy="0.8" rx="1.2" ry="0.5" fill="${leaf}" opacity="0.6"/>` +
      /* v8 ignore start */
      `<ellipse cx="-1.2" cy="0.5" rx="0.8" ry="0.3" fill="${c.fallenLeafRed || '#c04030'}" opacity="0.5"/>` +
      /* v8 ignore stop */
      `</g>`
    );
  }
  // Simple rake
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0.5" x2="0" y2="-2.5" stroke="${handle}" stroke-width="0.25"/>` +
    `<rect x="-0.8" y="-2.7" width="1.6" height="0.25" fill="${metal}"/>` +
    `<line x1="-0.6" y1="-2.5" x2="-0.6" y2="-1.8" stroke="${metal}" stroke-width="0.1"/>` +
    `<line x1="-0.2" y1="-2.5" x2="-0.2" y2="-1.8" stroke="${metal}" stroke-width="0.1"/>` +
    `<line x1="0.2" y1="-2.5" x2="0.2" y2="-1.8" stroke="${metal}" stroke-width="0.1"/>` +
    `<line x1="0.6" y1="-2.5" x2="0.6" y2="-1.8" stroke="${metal}" stroke-width="0.1"/>` +
    `</g>`
  );
}
