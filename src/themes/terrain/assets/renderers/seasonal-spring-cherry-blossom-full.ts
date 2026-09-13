import type { AssetColors } from '../../palette.js';

export function svgCherryBlossomFull(x: number, y: number, c: AssetColors, v: number): string {
  // Dense cherry blossom tree in full bloom
  const pink = c.blossomPink || c.cherryPetalPink;
  const white = c.blossomWhite || c.cherryPetalWhite;
  const trunk = c.cherryTrunk;
  if (v === 1) {
    // White/pink mix
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.6" y="-1" width="1.2" height="3.5" fill="${trunk}"/>` +
      `<circle cx="0" cy="-4.5" r="2.5" fill="${white}" opacity="0.7"/>` +
      `<circle cx="-1.8" cy="-3.5" r="1.8" fill="${pink}" opacity="0.65"/>` +
      `<circle cx="1.8" cy="-3.5" r="1.8" fill="${white}" opacity="0.6"/>` +
      `<circle cx="0" cy="-6" r="1.5" fill="${pink}" opacity="0.55"/>` +
      `<circle cx="-1" cy="-5" r="1" fill="${white}" opacity="0.5"/>` +
      `<circle cx="1" cy="-5" r="1" fill="${pink}" opacity="0.5"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // With falling petals
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.6" y="-1" width="1.2" height="3.5" fill="${trunk}"/>` +
      `<circle cx="0" cy="-4" r="2.3" fill="${pink}" opacity="0.7"/>` +
      `<circle cx="-1.5" cy="-3.2" r="1.6" fill="${pink}" opacity="0.65"/>` +
      `<circle cx="1.5" cy="-3.2" r="1.6" fill="${pink}" opacity="0.6"/>` +
      `<circle cx="0" cy="-5.5" r="1.3" fill="${pink}" opacity="0.55"/>` +
      `<ellipse cx="-2" cy="0.5" rx="0.3" ry="0.12" fill="${pink}" opacity="0.5"/>` +
      `<ellipse cx="1.5" cy="0.8" rx="0.25" ry="0.1" fill="${pink}" opacity="0.45"/>` +
      `<ellipse cx="0" cy="0.3" rx="0.2" ry="0.08" fill="${pink}" opacity="0.4"/>` +
      `</g>`
    );
  }
  // Classic full bloom
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.6" y="-1" width="1.2" height="3.5" fill="${trunk}"/>` +
    `<circle cx="0" cy="-4.5" r="2.8" fill="${pink}" opacity="0.7"/>` +
    `<circle cx="-2" cy="-3.5" r="2" fill="${pink}" opacity="0.65"/>` +
    `<circle cx="2" cy="-3.5" r="2" fill="${pink}" opacity="0.6"/>` +
    `<circle cx="0" cy="-6.5" r="1.5" fill="${pink}" opacity="0.55"/>` +
    `<circle cx="-1" cy="-5.5" r="1.2" fill="${pink}" opacity="0.5"/>` +
    `<circle cx="1" cy="-5.5" r="1.2" fill="${pink}" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgCherryBlossomBranch(x: number, y: number, c: AssetColors, v: number): string {
  // Small cherry blossom branch
  const pink = c.blossomPink || c.cherryPetalPink;
  const branch = c.cherryBranch;
  if (v === 1) {
    // Arching branch
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M0,0 Q-1.5,-2 -3,-2" stroke="${branch}" fill="none" stroke-width="0.4"/>` +
      `<circle cx="-2.5" cy="-2.2" r="0.8" fill="${pink}" opacity="0.6"/>` +
      `<circle cx="-3.2" cy="-1.8" r="0.6" fill="${pink}" opacity="0.5"/>` +
      `<circle cx="-1.8" cy="-2" r="0.5" fill="${pink}" opacity="0.55"/>` +
      `</g>`
    );
  }
  // Upward branch
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M0,0 Q0.5,-1.5 1,-3" stroke="${branch}" fill="none" stroke-width="0.35"/>` +
    `<circle cx="0.8" cy="-2.5" r="0.7" fill="${pink}" opacity="0.6"/>` +
    `<circle cx="1.2" cy="-3.2" r="0.5" fill="${pink}" opacity="0.55"/>` +
    `<circle cx="0.3" cy="-1.5" r="0.4" fill="${pink}" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgPeachBlossom(x: number, y: number, c: AssetColors, v: number): string {
  // Peach tree with lighter pink blossoms
  /* v8 ignore start */
  const pink = c.peachPink || '#ffd5cc';
  /* v8 ignore stop */
  const trunk = c.cherryTrunk;
  if (v === 1) {
    // Young tree
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.4" y="-1" width="0.8" height="3" fill="${trunk}"/>` +
      `<circle cx="0" cy="-3.5" r="2" fill="${pink}" opacity="0.65"/>` +
      `<circle cx="-1.2" cy="-2.8" r="1.2" fill="${pink}" opacity="0.55"/>` +
      `<circle cx="1.2" cy="-2.8" r="1.2" fill="${pink}" opacity="0.5"/>` +
      `<circle cx="0" cy="-4.8" r="0.8" fill="${pink}" opacity="0.5"/>` +
      `</g>`
    );
  }
  // Full peach tree
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.5" y="-1" width="1" height="3.5" fill="${trunk}"/>` +
    `<circle cx="0" cy="-4" r="2.5" fill="${pink}" opacity="0.65"/>` +
    `<circle cx="-1.5" cy="-3" r="1.5" fill="${pink}" opacity="0.55"/>` +
    `<circle cx="1.5" cy="-3" r="1.5" fill="${pink}" opacity="0.5"/>` +
    `<circle cx="0" cy="-5.5" r="1.2" fill="${pink}" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgFlowerBed(x: number, y: number, c: AssetColors, v: number): string {
  // Garden flower bed with mixed colorful flowers
  const soil = c.gardenSoil;
  const red = c.tulipRed;
  const yellow = c.tulipYellow;
  const purple = c.crocusPurple;
  if (v === 1) {
    // Rectangular bed
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-2" y="-0.3" width="4" height="0.8" rx="0.2" fill="${soil}"/>` +
      `<circle cx="-1.2" cy="-0.8" r="0.35" fill="${red}"/>` +
      `<circle cx="-0.4" cy="-0.9" r="0.3" fill="${yellow}"/>` +
      `<circle cx="0.4" cy="-0.7" r="0.35" fill="${purple}"/>` +
      `<circle cx="1.2" cy="-0.85" r="0.3" fill="${red}"/>` +
      `<line x1="-1.2" y1="-0.5" x2="-1.2" y2="-0.3" stroke="${c.sproutGreen}" stroke-width="0.12"/>` +
      `<line x1="0.4" y1="-0.4" x2="0.4" y2="-0.3" stroke="${c.sproutGreen}" stroke-width="0.12"/>` +
      `</g>`
    );
  }
  // Circular bed
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0" rx="1.8" ry="0.7" fill="${soil}"/>` +
    `<circle cx="-0.8" cy="-0.5" r="0.35" fill="${red}"/>` +
    `<circle cx="0" cy="-0.6" r="0.3" fill="${yellow}"/>` +
    `<circle cx="0.8" cy="-0.5" r="0.35" fill="${purple}"/>` +
    `<circle cx="-0.4" cy="-0.3" r="0.25" fill="${yellow}" opacity="0.9"/>` +
    `<circle cx="0.4" cy="-0.35" r="0.25" fill="${red}" opacity="0.9"/>` +
    `</g>`
  );
}

export function svgWateringCan(x: number, y: number, c: AssetColors, _v: number): string {
  // Garden watering can
  /* v8 ignore start */
  const metal = c.sledRunner || '#607080';
  /* v8 ignore stop */
  const accent = c.sproutGreen;
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0" rx="1" ry="0.5" fill="${metal}"/>` +
    `<rect x="-0.8" y="-1.2" width="1.6" height="1.2" rx="0.2" fill="${metal}"/>` +
    `<path d="M0.6,-0.8 Q1.2,-1.2 1.8,-1" stroke="${metal}" fill="none" stroke-width="0.2"/>` +
    `<line x1="1.8" y1="-1" x2="2.5" y2="-0.5" stroke="${metal}" stroke-width="0.25"/>` +
    `<ellipse cx="2.5" cy="-0.4" rx="0.25" ry="0.15" fill="${metal}"/>` +
    `<path d="M-0.5,-1.2 Q-0.5,-2 0,-2 Q0.5,-2 0.5,-1.2" stroke="${accent}" fill="none" stroke-width="0.15"/>` +
    `</g>`
  );
}

export function svgSeedling(x: number, y: number, c: AssetColors, v: number): string {
  // Small seedling sprouting
  const green = c.sproutGreen;
  const soil = c.gardenSoil;
  if (v === 1) {
    // Two leaves
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0.2" rx="0.6" ry="0.2" fill="${soil}"/>` +
      `<line x1="0" y1="0" x2="0" y2="-1" stroke="${green}" stroke-width="0.12"/>` +
      `<ellipse cx="-0.4" cy="-1.2" rx="0.35" ry="0.2" fill="${green}" transform="rotate(-30,-0.4,-1.2)"/>` +
      `<ellipse cx="0.4" cy="-1.2" rx="0.35" ry="0.2" fill="${green}" transform="rotate(30,0.4,-1.2)"/>` +
      `</g>`
    );
  }
  // Single leaf
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.2" rx="0.5" ry="0.15" fill="${soil}"/>` +
    `<line x1="0" y1="0" x2="0" y2="-0.8" stroke="${green}" stroke-width="0.1"/>` +
    `<ellipse cx="0" cy="-1" rx="0.25" ry="0.4" fill="${green}"/>` +
    `</g>`
  );
}
