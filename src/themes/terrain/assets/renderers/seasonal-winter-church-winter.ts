import type { AssetColors } from '../../palette.js';

export function svgChurchWinter(x: number, y: number, c: AssetColors, v: number): string {
  // Church with snow on roof and steeple
  const snow = c.snowCap;
  if (v === 1) {
    // Bell tower with snow
    return (
      `<g transform="translate(${x},${y})">` +
      `<polygon points="-2,0 0,1 2,0 2,-5 0,-4 -2,-5" fill="${c.church}"/>` +
      `<polygon points="-2,0 0,1 0,-4 -2,-5" fill="${c.wallShade}"/>` +
      `<rect x="-1" y="-8.5" width="2" height="3.5" fill="${c.church}"/>` +
      `<polygon points="-1.3,-8.5 0,-10.5 1.3,-8.5" fill="${c.roofA}"/>` +
      `<polygon points="-1.4,-8.3 0,-10.8 0,-10.5 -1.3,-8.5" fill="${snow}"/>` +
      `<polygon points="1.4,-8.3 0,-10.8 0,-10.5 1.3,-8.5" fill="${snow}" opacity="0.9"/>` +
      `<ellipse cx="0" cy="-8.5" rx="1.2" ry="0.3" fill="${snow}"/>` +
      `<circle cx="0" cy="-7" r="0.4" fill="${c.blacksmith}" opacity="0.5"/>` +
      `</g>`
    );
  }
  // Default church with snow
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-2,0 0,1 2,0 2,-5 0,-4 -2,-5" fill="${c.church}"/>` +
    `<polygon points="-2,0 0,1 0,-4 -2,-5" fill="${c.wallShade}"/>` +
    `<polygon points="0,-10 -2.5,-5 0,-3.8 2.5,-5" fill="${c.roofA}"/>` +
    `<polygon points="0,-10.4 -2.7,-4.8 -2.5,-5 0,-10" fill="${snow}"/>` +
    `<polygon points="0,-10.4 2.7,-4.8 2.5,-5 0,-10" fill="${snow}" opacity="0.9"/>` +
    `<ellipse cx="0" cy="-5" rx="2" ry="0.4" fill="${snow}"/>` +
    `<line x1="0" y1="-12" x2="0" y2="-10" stroke="${c.wall}" stroke-width="0.5"/>` +
    `<line x1="-1" y1="-11" x2="1" y2="-11" stroke="${c.wall}" stroke-width="0.5"/>` +
    `</g>`
  );
}

export function svgChristmasTree(x: number, y: number, c: AssetColors, v: number): string {
  // Decorated Christmas tree with star and ornaments
  /* v8 ignore start */
  const tree = c.christmasGreen || '#228b22';
  const star = c.christmasGold || '#ffd700';
  const red = c.christmasRed || '#c41e3a';
  const blue = c.icicleBlue || '#d0e8f8';
  const gold = c.christmasGold || '#ffd700';
  /* v8 ignore stop */
  if (v === 1) {
    // With presents underneath
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.3" y="-1" width="0.6" height="2" fill="${c.trunk}"/>` +
      `<polygon points="0,-7 -2.5,-1 2.5,-1" fill="${tree}"/>` +
      `<polygon points="0,-5.5 -2,-1.5 2,-1.5" fill="${tree}" opacity="0.9"/>` +
      `<polygon points="0,-4 -1.5,-2 1.5,-2" fill="${tree}" opacity="0.85"/>` +
      `<polygon points="-0.3,-7.5 0,-8 0.3,-7.5 0.1,-7.5 0.1,-7 -0.1,-7 -0.1,-7.5" fill="${star}"/>` +
      `<circle cx="-1" cy="-3" r="0.25" fill="${red}"/>` +
      `<circle cx="0.8" cy="-2.5" r="0.2" fill="${blue}"/>` +
      `<circle cx="-0.5" cy="-4.5" r="0.2" fill="${gold}"/>` +
      `<circle cx="0.5" cy="-5" r="0.25" fill="${red}"/>` +
      `<rect x="-1.5" y="0.5" width="0.8" height="0.6" fill="${red}"/>` +
      `<rect x="0.5" y="0.3" width="0.7" height="0.5" fill="${blue}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // With string lights
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.3" y="-1" width="0.6" height="2" fill="${c.trunk}"/>` +
      `<polygon points="0,-7 -2.5,-1 2.5,-1" fill="${tree}"/>` +
      `<polygon points="0,-5.5 -2,-1.5 2,-1.5" fill="${tree}" opacity="0.9"/>` +
      `<polygon points="-0.3,-7.5 0,-8 0.3,-7.5 0.1,-7.5 0.1,-7 -0.1,-7 -0.1,-7.5" fill="${star}"/>` +
      `<circle cx="-1.5" cy="-2" r="0.15" fill="${red}"/>` +
      `<circle cx="-0.5" cy="-2.5" r="0.15" fill="${gold}"/>` +
      `<circle cx="0.5" cy="-2" r="0.15" fill="${blue}"/>` +
      `<circle cx="1.5" cy="-2.5" r="0.15" fill="${red}"/>` +
      `<circle cx="-1" cy="-4" r="0.15" fill="${blue}"/>` +
      `<circle cx="0" cy="-3.5" r="0.15" fill="${gold}"/>` +
      `<circle cx="1" cy="-4" r="0.15" fill="${red}"/>` +
      `<circle cx="-0.5" cy="-5.5" r="0.15" fill="${gold}"/>` +
      `<circle cx="0.5" cy="-5" r="0.15" fill="${blue}"/>` +
      `</g>`
    );
  }
  // Classic decorated tree
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.3" y="-1" width="0.6" height="2" fill="${c.trunk}"/>` +
    `<polygon points="0,-7 -2.5,-1 2.5,-1" fill="${tree}"/>` +
    `<polygon points="0,-5.5 -2,-1.5 2,-1.5" fill="${tree}" opacity="0.9"/>` +
    `<polygon points="0,-4 -1.5,-2 1.5,-2" fill="${tree}" opacity="0.85"/>` +
    `<polygon points="-0.3,-7.5 0,-8.2 0.3,-7.5 0.1,-7.5 0.1,-7 -0.1,-7 -0.1,-7.5" fill="${star}"/>` +
    `<circle cx="-1.2" cy="-2.5" r="0.3" fill="${red}"/>` +
    `<circle cx="1" cy="-3" r="0.25" fill="${gold}"/>` +
    `<circle cx="-0.3" cy="-4" r="0.25" fill="${blue}"/>` +
    `<circle cx="0.7" cy="-5" r="0.2" fill="${red}"/>` +
    `<circle cx="-0.5" cy="-5.8" r="0.2" fill="${gold}"/>` +
    `</g>`
  );
}

export function svgWinterLantern(x: number, y: number, c: AssetColors, v: number): string {
  // Lamppost with warm glow and snow cap
  const post = c.lantern;
  const glow = c.lanternGlow;
  const snow = c.snowCap;
  if (v === 1) {
    // Double lantern
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0" x2="0" y2="-5" stroke="${post}" stroke-width="0.4"/>` +
      `<line x1="0" y1="-4.5" x2="-1.5" y2="-4.5" stroke="${post}" stroke-width="0.25"/>` +
      `<line x1="0" y1="-4.5" x2="1.5" y2="-4.5" stroke="${post}" stroke-width="0.25"/>` +
      `<rect x="-2" y="-5.5" width="1" height="1" fill="${glow}" opacity="0.8"/>` +
      `<rect x="1" y="-5.5" width="1" height="1" fill="${glow}" opacity="0.8"/>` +
      `<ellipse cx="-1.5" cy="-5.7" rx="0.6" ry="0.2" fill="${snow}"/>` +
      `<ellipse cx="1.5" cy="-5.7" rx="0.6" ry="0.2" fill="${snow}"/>` +
      `<circle cx="-1.5" cy="-5" r="0.8" fill="${glow}" opacity="0.3"/>` +
      `<circle cx="1.5" cy="-5" r="0.8" fill="${glow}" opacity="0.3"/>` +
      `</g>`
    );
  }
  // Single lantern
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0" x2="0" y2="-5" stroke="${post}" stroke-width="0.35"/>` +
    `<rect x="-0.5" y="-6" width="1" height="1.2" fill="${glow}" opacity="0.8"/>` +
    `<ellipse cx="0" cy="-6.2" rx="0.6" ry="0.25" fill="${snow}"/>` +
    `<circle cx="0" cy="-5.4" r="1" fill="${glow}" opacity="0.25"/>` +
    `<ellipse cx="0" cy="0" rx="0.8" ry="0.3" fill="${snow}" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgFrozenFountain(x: number, y: number, c: AssetColors, v: number): string {
  // Fountain with ice formations instead of water
  const stone = c.fountain;
  const ice = c.ice;
  /* v8 ignore start */
  const icicle = c.icicleBlue || '#d0e8f8';
  /* v8 ignore stop */
  if (v === 1) {
    // Heavily frozen
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0" rx="2.5" ry="1" fill="${stone}"/>` +
      `<ellipse cx="0" cy="-0.3" rx="2" ry="0.7" fill="${ice}" opacity="0.7"/>` +
      `<rect x="-0.4" y="-3" width="0.8" height="3" fill="${stone}"/>` +
      `<ellipse cx="0" cy="-3" rx="1" ry="0.4" fill="${stone}"/>` +
      `<polygon points="0,-5 -0.3,-3 0.3,-3" fill="${ice}"/>` +
      `<polygon points="-0.5,-4 -0.2,-3 -0.8,-3" fill="${icicle}"/>` +
      `<polygon points="0.5,-4.5 0.2,-3 0.8,-3" fill="${icicle}"/>` +
      `<polygon points="-1.5,-1 -1.5,-0.3 -1.3,-0.3" fill="${icicle}" opacity="0.8"/>` +
      `<polygon points="1.5,-1.2 1.5,-0.3 1.3,-0.3" fill="${icicle}" opacity="0.8"/>` +
      `</g>`
    );
  }
  // Light ice
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0" rx="2.5" ry="1" fill="${stone}"/>` +
    `<ellipse cx="0" cy="-0.3" rx="2" ry="0.7" fill="${ice}" opacity="0.6"/>` +
    `<rect x="-0.4" y="-3" width="0.8" height="3" fill="${stone}"/>` +
    `<ellipse cx="0" cy="-3" rx="1" ry="0.4" fill="${stone}"/>` +
    `<polygon points="-0.4,-3.8 -0.1,-3 -0.7,-3" fill="${icicle}" opacity="0.7"/>` +
    `<polygon points="0.4,-4 0.1,-3 0.7,-3" fill="${icicle}" opacity="0.7"/>` +
    `</g>`
  );
}
