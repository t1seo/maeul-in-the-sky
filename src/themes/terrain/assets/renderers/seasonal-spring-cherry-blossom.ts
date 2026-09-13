import type { AssetColors } from '../../palette.js';

export function svgCherryBlossom(x: number, y: number, c: AssetColors, v: number): string {
  const pink = v === 2 ? c.cherryPetalWhite : c.cherryPetalPink;
  const trunk = c.cherryTrunk;
  if (v === 1) {
    // Early bloom (sparse)
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/>` +
      `<line x1="0" y1="-1" x2="-2" y2="-3" stroke="${c.cherryBranch}" stroke-width="0.5"/>` +
      `<line x1="0" y1="-1.5" x2="2" y2="-3.5" stroke="${c.cherryBranch}" stroke-width="0.5"/>` +
      `<circle cx="-2" cy="-3.2" r="1" fill="${pink}" opacity="0.5"/>` +
      `<circle cx="2" cy="-3.7" r="0.8" fill="${pink}" opacity="0.4"/>` +
      `<circle cx="0" cy="-3" r="0.6" fill="${pink}" opacity="0.3"/>` +
      `</g>`
    );
  }
  // Full bloom pink (or white for v=2)
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/>` +
    `<line x1="0" y1="-1" x2="-2.5" y2="-3" stroke="${c.cherryBranch}" stroke-width="0.5"/>` +
    `<line x1="0" y1="-1.5" x2="2.5" y2="-3.5" stroke="${c.cherryBranch}" stroke-width="0.5"/>` +
    `<line x1="0" y1="-2" x2="0" y2="-4" stroke="${c.cherryBranch}" stroke-width="0.5"/>` +
    `<circle cx="-2" cy="-3.5" r="1.5" fill="${pink}" opacity="0.7"/>` +
    `<circle cx="2" cy="-4" r="1.3" fill="${pink}" opacity="0.65"/>` +
    `<circle cx="0" cy="-4.5" r="1.4" fill="${pink}" opacity="0.7"/>` +
    `<circle cx="-0.5" cy="-3" r="1" fill="${pink}" opacity="0.5"/>` +
    `<circle cx="1" cy="-3" r="0.8" fill="${pink}" opacity="0.45"/>` +
    `</g>`
  );
}

export function svgCherryBlossomSmall(x: number, y: number, c: AssetColors, v: number): string {
  const pink = c.cherryPetalPink;
  const trunk = c.cherryTrunk;
  if (v === 1) {
    // Bush-sized
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.3" y="-0.5" width="0.6" height="2" fill="${trunk}"/>` +
      `<circle cx="0" cy="-1.5" r="1.5" fill="${pink}" opacity="0.6"/>` +
      `<circle cx="-0.5" cy="-1" r="0.8" fill="${pink}" opacity="0.5"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Weeping style
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.3" y="-0.5" width="0.6" height="2" fill="${trunk}"/>` +
      `<circle cx="0" cy="-2" r="1.2" fill="${pink}" opacity="0.6"/>` +
      `<path d="M-1,-1.5 Q-2,0 -1.5,0.5" stroke="${c.cherryBranch}" fill="none" stroke-width="0.3"/>` +
      `<path d="M1,-1.5 Q2,0 1.5,0.5" stroke="${c.cherryBranch}" fill="none" stroke-width="0.3"/>` +
      `<circle cx="-1.5" cy="0" r="0.5" fill="${pink}" opacity="0.4"/>` +
      `<circle cx="1.5" cy="0" r="0.5" fill="${pink}" opacity="0.4"/>` +
      `</g>`
    );
  }
  // Sapling
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.3" y="-0.5" width="0.6" height="2" fill="${trunk}"/>` +
    `<circle cx="0" cy="-1.5" r="1" fill="${pink}" opacity="0.55"/>` +
    `</g>`
  );
}

export function svgCherryPetals(x: number, y: number, c: AssetColors, v: number): string {
  const pink = c.cherryPetalPink;
  if (v === 1) {
    // Piled
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0" rx="2" ry="0.6" fill="${pink}" opacity="0.4"/>` +
      `<ellipse cx="0.5" cy="-0.2" rx="1" ry="0.3" fill="${pink}" opacity="0.5"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Swirling
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="-0.5" cy="-0.5" rx="0.3" ry="0.15" fill="${pink}" opacity="0.6" transform="rotate(-20,-0.5,-0.5)"/>` +
      `<ellipse cx="0.8" cy="-1" rx="0.3" ry="0.15" fill="${pink}" opacity="0.5" transform="rotate(30,0.8,-1)"/>` +
      `<ellipse cx="0" cy="-1.5" rx="0.25" ry="0.12" fill="${pink}" opacity="0.55" transform="rotate(-45,0,-1.5)"/>` +
      `<ellipse cx="-0.3" cy="0.2" rx="0.25" ry="0.12" fill="${pink}" opacity="0.4"/>` +
      `</g>`
    );
  }
  // Scattered
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="-1" cy="0" rx="0.3" ry="0.15" fill="${pink}" opacity="0.5"/>` +
    `<ellipse cx="0.5" cy="0.3" rx="0.25" ry="0.12" fill="${pink}" opacity="0.45"/>` +
    `<ellipse cx="1.2" cy="-0.2" rx="0.3" ry="0.15" fill="${pink}" opacity="0.4"/>` +
    `<ellipse cx="-0.3" cy="-0.3" rx="0.2" ry="0.1" fill="${pink}" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgTulip(x: number, y: number, c: AssetColors, v: number): string {
  const colors = [c.tulipRed, c.tulipYellow, c.tulipPurple];
  const color = colors[v] || c.tulipRed;
  const stem = c.tulipStem;
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0.5" x2="0" y2="-2" stroke="${stem}" stroke-width="0.4"/>` +
    `<path d="M-0.6,-2 Q0,-3.5 0.6,-2" fill="${color}"/>` +
    `<ellipse cx="0" cy="-2" rx="0.5" ry="0.2" fill="${color}" opacity="0.7"/>` +
    `<path d="M0.5,-0.5 Q1.5,-1 1.2,-0.2" fill="${stem}" opacity="0.6"/>` +
    `</g>`
  );
}

export function svgTulipField(x: number, y: number, c: AssetColors, v: number): string {
  const stem = c.tulipStem;
  if (v === 1) {
    // Single color row
    const col = c.tulipRed;
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="-1.5" y1="0.5" x2="-1.5" y2="-1.5" stroke="${stem}" stroke-width="0.3"/>` +
      `<path d="M-2,-1.5 Q-1.5,-2.8 -1,-1.5" fill="${col}"/>` +
      `<line x1="0" y1="0.5" x2="0" y2="-1.8" stroke="${stem}" stroke-width="0.3"/>` +
      `<path d="M-0.5,-1.8 Q0,-3 0.5,-1.8" fill="${col}"/>` +
      `<line x1="1.5" y1="0.5" x2="1.5" y2="-1.3" stroke="${stem}" stroke-width="0.3"/>` +
      `<path d="M1,-1.3 Q1.5,-2.5 2,-1.3" fill="${col}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // With greenery
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0.3" rx="2.5" ry="0.5" fill="${stem}" opacity="0.3"/>` +
      `<line x1="-1" y1="0.3" x2="-1" y2="-1.5" stroke="${stem}" stroke-width="0.3"/>` +
      `<path d="M-1.4,-1.5 Q-1,-2.5 -0.6,-1.5" fill="${c.tulipYellow}"/>` +
      `<line x1="0.8" y1="0.3" x2="0.8" y2="-1.8" stroke="${stem}" stroke-width="0.3"/>` +
      `<path d="M0.4,-1.8 Q0.8,-3 1.2,-1.8" fill="${c.tulipPurple}"/>` +
      `</g>`
    );
  }
  // Mixed colors
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="-1.5" y1="0.5" x2="-1.5" y2="-1.5" stroke="${stem}" stroke-width="0.3"/>` +
    `<path d="M-2,-1.5 Q-1.5,-2.8 -1,-1.5" fill="${c.tulipRed}"/>` +
    `<line x1="0" y1="0.5" x2="0" y2="-1.8" stroke="${stem}" stroke-width="0.3"/>` +
    `<path d="M-0.5,-1.8 Q0,-3 0.5,-1.8" fill="${c.tulipYellow}"/>` +
    `<line x1="1.5" y1="0.5" x2="1.5" y2="-1.3" stroke="${stem}" stroke-width="0.3"/>` +
    `<path d="M1,-1.3 Q1.5,-2.5 2,-1.3" fill="${c.tulipPurple}"/>` +
    `</g>`
  );
}

export function svgSprout(x: number, y: number, c: AssetColors, v: number): string {
  const green = c.sproutGreen;
  if (v === 1) {
    // Pair
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="-0.5" y1="0.5" x2="-0.5" y2="-0.5" stroke="${green}" stroke-width="0.3"/>` +
      `<path d="M-0.5,-0.5 Q-0.5,-1.2 0,-1" fill="${green}"/>` +
      `<line x1="0.5" y1="0.5" x2="0.5" y2="-0.3" stroke="${green}" stroke-width="0.3"/>` +
      `<path d="M0.5,-0.3 Q0.5,-1 1,-0.8" fill="${green}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // With tiny leaf
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0.5" x2="0" y2="-0.8" stroke="${green}" stroke-width="0.3"/>` +
      `<path d="M0,-0.8 Q0,-1.5 0.5,-1.2" fill="${green}"/>` +
      `<path d="M0,-0.3 Q0.5,-0.5 0.3,-0.1" fill="${green}" opacity="0.6"/>` +
      `</g>`
    );
  }
  // Single
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0.5" x2="0" y2="-0.5" stroke="${green}" stroke-width="0.3"/>` +
    `<path d="M0,-0.5 Q0,-1.3 0.5,-1" fill="${green}"/>` +
    `</g>`
  );
}
