import type { AssetColors } from '../../palette.js';

export function svgDonkey(x: number, y: number, c: AssetColors, v: number): string {
  // Donkey - smaller than horse, gray, distinctive long ears
  /* v8 ignore start */
  const body = c.donkey || '#808080';
  /* v8 ignore stop */
  const dark = '#505050';
  const muzzle = '#a0a0a0';
  if (v === 1) {
    // Walking
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.2" rx="2" ry="0.4" fill="${c.shadow}" opacity="0.15"/>` +
      // Body
      `<ellipse cx="0" cy="-2" rx="2.2" ry="1.2" fill="${body}"/>` +
      // Neck
      `<path d="M-1.5,-2.2 Q-2,-3.2 -1.6,-4" fill="${body}" stroke="${body}" stroke-width="0.9"/>` +
      // Head
      `<ellipse cx="-1.3" cy="-4.3" rx="0.85" ry="0.5" fill="${body}"/>` +
      // Muzzle (lighter)
      `<ellipse cx="-2" cy="-4.1" rx="0.4" ry="0.3" fill="${muzzle}"/>` +
      // Long ears (distinctive!)
      `<ellipse cx="-1.6" cy="-5.2" rx="0.2" ry="0.6" fill="${body}"/>` +
      `<ellipse cx="-1" cy="-5.1" rx="0.2" ry="0.55" fill="${body}"/>` +
      // Eye
      `<circle cx="-1.2" cy="-4.4" r="0.1" fill="#222"/>` +
      // Legs
      `<rect x="-1.2" y="-0.9" width="0.45" height="1.2" fill="${body}"/>` +
      `<rect x="-0.3" y="-0.9" width="0.45" height="1.1" fill="${body}"/>` +
      `<rect x="0.5" y="-0.9" width="0.45" height="1.1" fill="${body}"/>` +
      `<rect x="1.2" y="-0.9" width="0.45" height="1.2" fill="${body}"/>` +
      // Hooves
      `<rect x="-1.25" y="0.1" width="0.5" height="0.2" fill="${dark}"/>` +
      `<rect x="1.15" y="0.1" width="0.5" height="0.2" fill="${dark}"/>` +
      // Tail
      `<path d="M2.2,-2.2 Q2.8,-2 2.5,-1" stroke="${dark}" fill="none" stroke-width="0.35"/>` +
      `</g>`
    );
  }
  // Default: standing
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.2" rx="2" ry="0.4" fill="${c.shadow}" opacity="0.15"/>` +
    // Body
    `<ellipse cx="0" cy="-2" rx="2.2" ry="1.2" fill="${body}"/>` +
    // Dark stripe on back
    `<line x1="-1" y1="-2.8" x2="1.5" y2="-2.8" stroke="${dark}" stroke-width="0.3"/>` +
    // Neck
    `<path d="M-1.5,-2.2 Q-2,-3.2 -1.6,-4" fill="${body}" stroke="${body}" stroke-width="0.9"/>` +
    // Head
    `<ellipse cx="-1.3" cy="-4.3" rx="0.85" ry="0.5" fill="${body}"/>` +
    // Muzzle (lighter)
    `<ellipse cx="-2" cy="-4.1" rx="0.4" ry="0.3" fill="${muzzle}"/>` +
    // Long ears (key feature!)
    `<ellipse cx="-1.6" cy="-5.2" rx="0.2" ry="0.65" fill="${body}"/>` +
    `<ellipse cx="-1.6" cy="-5.2" rx="0.12" ry="0.5" fill="${muzzle}" opacity="0.5"/>` +
    `<ellipse cx="-1" cy="-5.1" rx="0.2" ry="0.6" fill="${body}"/>` +
    `<ellipse cx="-1" cy="-5.1" rx="0.12" ry="0.45" fill="${muzzle}" opacity="0.5"/>` +
    // Eye
    `<circle cx="-1.2" cy="-4.4" r="0.1" fill="#222"/>` +
    // Nostril
    `<circle cx="-2.1" cy="-4" r="0.06" fill="#333"/>` +
    // Four legs
    `<rect x="-1.2" y="-0.9" width="0.45" height="1.1" fill="${body}"/>` +
    `<rect x="-0.3" y="-0.9" width="0.45" height="1.1" fill="${body}"/>` +
    `<rect x="0.5" y="-0.9" width="0.45" height="1.1" fill="${body}"/>` +
    `<rect x="1.2" y="-0.9" width="0.45" height="1.1" fill="${body}"/>` +
    // Hooves
    `<rect x="-1.25" y="0" width="0.5" height="0.2" fill="${dark}"/>` +
    `<rect x="-0.35" y="0" width="0.5" height="0.2" fill="${dark}"/>` +
    `<rect x="0.45" y="0" width="0.5" height="0.2" fill="${dark}"/>` +
    `<rect x="1.15" y="0" width="0.5" height="0.2" fill="${dark}"/>` +
    // Tail with tuft
    `<path d="M2.2,-2.2 Q2.8,-2 2.5,-1" stroke="${dark}" fill="none" stroke-width="0.35"/>` +
    `<ellipse cx="2.5" cy="-0.9" rx="0.25" ry="0.2" fill="${dark}"/>` +
    `</g>`
  );
}

export function svgGoat(x: number, y: number, c: AssetColors, v: number): string {
  // Goat - white/gray/brown, curved horns, beard
  /* v8 ignore start */
  const body = c.goat || '#e8e0d0';
  const horn = c.goatHorn || '#b0a090';
  /* v8 ignore stop */
  const dark = '#8a7a60';
  if (v === 1) {
    // Grazing (head down)
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.2" rx="1.5" ry="0.35" fill="${c.shadow}" opacity="0.15"/>` +
      // Body
      `<ellipse cx="0" cy="-1.8" rx="2" ry="1.1" fill="${body}"/>` +
      // Head (down)
      `<ellipse cx="-2" cy="-1.2" rx="0.65" ry="0.5" fill="${body}"/>` +
      // Curved horns
      `<path d="M-2.3,-1.5 Q-2.8,-2.2 -2.5,-2.8" stroke="${horn}" fill="none" stroke-width="0.25"/>` +
      `<path d="M-1.8,-1.5 Q-1.3,-2.2 -1.6,-2.6" stroke="${horn}" fill="none" stroke-width="0.25"/>` +
      // Beard
      `<path d="M-2.4,-1 Q-2.6,-0.5 -2.4,-0.2" stroke="${dark}" fill="none" stroke-width="0.2"/>` +
      // Eye
      `<circle cx="-1.9" cy="-1.3" r="0.08" fill="#222"/>` +
      // Legs
      `<rect x="-0.8" y="-0.8" width="0.4" height="1" fill="${body}"/>` +
      `<rect x="0.5" y="-0.8" width="0.4" height="1" fill="${body}"/>` +
      // Short tail
      `<ellipse cx="2" cy="-2" rx="0.3" ry="0.2" fill="${body}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Brown variant
    const brownBody = '#c0a880';
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.2" rx="1.5" ry="0.35" fill="${c.shadow}" opacity="0.15"/>` +
      // Body
      `<ellipse cx="0" cy="-1.8" rx="2" ry="1.1" fill="${brownBody}"/>` +
      // Neck
      `<path d="M-1.5,-2 Q-1.8,-2.8 -1.5,-3.2" fill="${brownBody}" stroke="${brownBody}" stroke-width="0.6"/>` +
      // Head
      `<ellipse cx="-1.3" cy="-3.5" rx="0.6" ry="0.45" fill="${brownBody}"/>` +
      // Curved horns
      `<path d="M-1.6,-3.8 Q-2,-4.5 -1.7,-5" stroke="${horn}" fill="none" stroke-width="0.25"/>` +
      `<path d="M-1.1,-3.8 Q-0.7,-4.5 -1,-4.9" stroke="${horn}" fill="none" stroke-width="0.25"/>` +
      // Ears
      `<ellipse cx="-0.85" cy="-3.6" rx="0.3" ry="0.15" fill="${brownBody}" transform="rotate(20 -0.85 -3.6)"/>` +
      // Beard
      `<path d="M-1.6,-3.3 Q-1.8,-2.8 -1.6,-2.4" stroke="${dark}" fill="none" stroke-width="0.2"/>` +
      // Eye
      `<circle cx="-1.15" cy="-3.55" r="0.08" fill="#222"/>` +
      // Legs
      `<rect x="-1" y="-0.8" width="0.4" height="1" fill="${brownBody}"/>` +
      `<rect x="-0.2" y="-0.8" width="0.4" height="1" fill="${brownBody}"/>` +
      `<rect x="0.5" y="-0.8" width="0.4" height="1" fill="${brownBody}"/>` +
      `<rect x="1.1" y="-0.8" width="0.4" height="1" fill="${brownBody}"/>` +
      `</g>`
    );
  }
  // Default: standing white goat
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.2" rx="1.5" ry="0.35" fill="${c.shadow}" opacity="0.15"/>` +
    // Body
    `<ellipse cx="0" cy="-1.8" rx="2" ry="1.1" fill="${body}"/>` +
    // Neck
    `<path d="M-1.5,-2 Q-1.8,-2.8 -1.5,-3.2" fill="${body}" stroke="${body}" stroke-width="0.6"/>` +
    // Head
    `<ellipse cx="-1.3" cy="-3.5" rx="0.6" ry="0.45" fill="${body}"/>` +
    // Curved horns (key feature!)
    `<path d="M-1.6,-3.8 Q-2,-4.5 -1.7,-5" stroke="${horn}" fill="none" stroke-width="0.25"/>` +
    `<path d="M-1.1,-3.8 Q-0.7,-4.5 -1,-4.9" stroke="${horn}" fill="none" stroke-width="0.25"/>` +
    // Ears (horizontal)
    `<ellipse cx="-0.85" cy="-3.6" rx="0.3" ry="0.15" fill="${body}" transform="rotate(20 -0.85 -3.6)"/>` +
    // Beard (distinctive!)
    `<path d="M-1.6,-3.3 Q-1.9,-2.8 -1.7,-2.3" stroke="${dark}" fill="none" stroke-width="0.2"/>` +
    `<path d="M-1.5,-3.2 Q-1.7,-2.7 -1.5,-2.2" stroke="${dark}" fill="none" stroke-width="0.15"/>` +
    // Eye (horizontal pupil)
    `<ellipse cx="-1.15" cy="-3.55" rx="0.1" ry="0.06" fill="#222"/>` +
    // Muzzle
    `<ellipse cx="-1.7" cy="-3.35" rx="0.25" ry="0.18" fill="${horn}" opacity="0.5"/>` +
    // Four legs
    `<rect x="-1" y="-0.8" width="0.4" height="1" fill="${body}"/>` +
    `<rect x="-0.2" y="-0.8" width="0.4" height="1" fill="${body}"/>` +
    `<rect x="0.5" y="-0.8" width="0.4" height="1" fill="${body}"/>` +
    `<rect x="1.1" y="-0.8" width="0.4" height="1" fill="${body}"/>` +
    // Hooves
    `<rect x="-1.05" y="0" width="0.45" height="0.2" fill="${dark}"/>` +
    `<rect x="-0.25" y="0" width="0.45" height="0.2" fill="${dark}"/>` +
    `<rect x="0.45" y="0" width="0.45" height="0.2" fill="${dark}"/>` +
    `<rect x="1.05" y="0" width="0.45" height="0.2" fill="${dark}"/>` +
    // Short upright tail
    `<path d="M2,-2 Q2.3,-2.3 2.2,-2.6" stroke="${body}" fill="none" stroke-width="0.25"/>` +
    `</g>`
  );
}

export function svgRicePaddy(x: number, y: number, c: AssetColors, _v: number): string {
  // Isometric parallelogram terrace with water fill and rice plant stubs
  return (
    `<g transform="translate(${x},${y})">` +
    // Terrace edge (outer parallelogram)
    `<polygon points="-4,-1 0,-3 4,-1 0,1" fill="${c.ricePaddy}" stroke="${c.ricePaddy}" stroke-width="0.3"/>` +
    // Inner water fill
    `<polygon points="-3,-0.8 0,-2.4 3,-0.8 0,0.6" fill="${c.ricePaddyWater}" opacity="0.6"/>` +
    // Reflection lines
    `<line x1="-1.5" y1="-0.6" x2="1.5" y2="-1.8" stroke="#fff" stroke-width="0.2" opacity="0.25"/>` +
    `<line x1="-1" y1="0" x2="2" y2="-1.2" stroke="#fff" stroke-width="0.2" opacity="0.2"/>` +
    `<line x1="-2" y1="-0.3" x2="1" y2="-1.5" stroke="#fff" stroke-width="0.2" opacity="0.15"/>` +
    // Rice plant stubs along edges
    `<line x1="-2.5" y1="-0.5" x2="-2.5" y2="-2" stroke="${c.reeds}" stroke-width="0.3"/>` +
    `<line x1="-0.8" y1="-1.8" x2="-0.8" y2="-3.3" stroke="${c.reeds}" stroke-width="0.3"/>` +
    `<line x1="1" y1="-1.5" x2="1" y2="-3" stroke="${c.reeds}" stroke-width="0.3"/>` +
    `<line x1="2.5" y1="-0.5" x2="2.5" y2="-2" stroke="${c.reeds}" stroke-width="0.3"/>` +
    `</g>`
  );
}

export function svgSilo(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-1.2" y="-7" width="2.4" height="7" fill="${c.silo}"/>` +
    `<ellipse cx="0" cy="-7" rx="1.2" ry="0.5" fill="${c.silo}" opacity="0.8"/>` +
    `<polygon points="-1.2,-7 0,-8.5 1.2,-7" fill="${c.roofA}"/>` +
    `</g>`
  );
}
