import type { AssetColors } from '../../palette.js';

export function svgChicken(x: number, y: number, c: AssetColors, v: number): string {
  // Recognizable chicken with red comb, round body, and yellow beak/legs
  if (v === 1) {
    // Pecking (head down)
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.1" rx="1" ry="0.25" fill="${c.shadow}" opacity="0.1"/>` +
      // Body
      `<ellipse cx="0" cy="-1.3" rx="1.3" ry="1" fill="${c.chicken}"/>` +
      // Tail feathers
      `<path d="M1.2,-1.5 Q2,-2 1.8,-2.8 Q1.5,-2.5 1.3,-1.8" fill="${c.chicken}"/>` +
      // Wing
      `<ellipse cx="0.2" cy="-1.4" rx="0.7" ry="0.5" fill="${c.trunk}" opacity="0.3"/>` +
      // Head (down, pecking)
      `<circle cx="-1.2" cy="-0.8" r="0.55" fill="${c.chicken}"/>` +
      // Red comb
      `<path d="M-1.2,-1.3 Q-1,-1.7 -0.9,-1.3 Q-0.7,-1.6 -0.6,-1.2" fill="${c.flag}"/>` +
      // Eye
      `<circle cx="-1.1" cy="-0.85" r="0.1" fill="#222"/>` +
      // Beak
      `<polygon points="-1.5,-0.7 -1.9,-0.6 -1.5,-0.5" fill="${c.wheat}"/>` +
      // Wattle
      `<ellipse cx="-1.3" cy="-0.5" rx="0.12" ry="0.2" fill="${c.flag}"/>` +
      // Legs
      `<line x1="-0.3" y1="-0.3" x2="-0.4" y2="0.3" stroke="${c.wheat}" stroke-width="0.2"/>` +
      `<line x1="0.4" y1="-0.3" x2="0.5" y2="0.3" stroke="${c.wheat}" stroke-width="0.2"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // With chicks
    return (
      `<g transform="translate(${x},${y})">` +
      // Mother hen
      `<ellipse cx="0" cy="-1.5" rx="1.4" ry="1.1" fill="${c.chicken}"/>` +
      `<path d="M1.3,-1.8 Q2,-2.5 1.8,-3.2" fill="${c.chicken}"/>` +
      `<circle cx="-1.2" cy="-2.2" r="0.6" fill="${c.chicken}"/>` +
      `<path d="M-1.2,-2.8 Q-1,-3.2 -0.85,-2.8 Q-0.7,-3.1 -0.6,-2.7" fill="${c.flag}"/>` +
      `<circle cx="-1" cy="-2.25" r="0.1" fill="#222"/>` +
      `<polygon points="-1.7,-2.1 -2.1,-2 -1.7,-1.9" fill="${c.wheat}"/>` +
      // Chicks (small yellow balls)
      `<circle cx="2.2" cy="-0.5" r="0.4" fill="${c.wheat}"/>` +
      `<circle cx="2.4" cy="-0.55" r="0.08" fill="#222"/>` +
      `<polygon points="2.5,-0.5 2.7,-0.45 2.5,-0.4" fill="${c.flag}" opacity="0.8"/>` +
      `<circle cx="3" cy="-0.6" r="0.35" fill="${c.wheat}"/>` +
      `<circle cx="3.15" cy="-0.65" r="0.07" fill="#222"/>` +
      `</g>`
    );
  }
  // Default: standing chicken
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.1" rx="1" ry="0.25" fill="${c.shadow}" opacity="0.1"/>` +
    // Body
    `<ellipse cx="0" cy="-1.5" rx="1.3" ry="1.1" fill="${c.chicken}"/>` +
    // Tail feathers (upward curve)
    `<path d="M1.2,-1.8 Q1.8,-2.5 1.6,-3.3 Q1.3,-2.8 1.1,-2" fill="${c.chicken}"/>` +
    // Wing detail
    `<ellipse cx="0.3" cy="-1.6" rx="0.6" ry="0.45" fill="${c.trunk}" opacity="0.25"/>` +
    // Head
    `<circle cx="-1" cy="-2.4" r="0.65" fill="${c.chicken}"/>` +
    // Red comb (distinctive)
    `<path d="M-1,-3.1 Q-0.8,-3.5 -0.7,-3 Q-0.5,-3.4 -0.4,-2.9 Q-0.2,-3.2 -0.1,-2.8" fill="${c.flag}"/>` +
    // Eye
    `<circle cx="-0.85" cy="-2.45" r="0.12" fill="#222"/>` +
    // Beak (yellow triangle)
    `<polygon points="-1.6,-2.3 -2,-2.2 -1.6,-2.1" fill="${c.wheat}"/>` +
    // Wattle (red)
    `<ellipse cx="-1.15" cy="-2" rx="0.15" ry="0.25" fill="${c.flag}"/>` +
    // Legs (yellow)
    `<line x1="-0.4" y1="-0.4" x2="-0.5" y2="0.3" stroke="${c.wheat}" stroke-width="0.25"/>` +
    `<line x1="0.4" y1="-0.4" x2="0.5" y2="0.3" stroke="${c.wheat}" stroke-width="0.25"/>` +
    // Feet
    `<path d="M-0.7,0.3 L-0.5,0.3 L-0.3,0.3" stroke="${c.wheat}" stroke-width="0.15" fill="none"/>` +
    `<path d="M0.3,0.3 L0.5,0.3 L0.7,0.3" stroke="${c.wheat}" stroke-width="0.15" fill="none"/>` +
    `</g>`
  );
}

export function svgHorse(x: number, y: number, c: AssetColors, v: number): string {
  // Elegant horse with distinct neck, mane, and four legs
  if (v === 1) {
    // Galloping variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.2" rx="2.5" ry="0.5" fill="${c.shadow}" opacity="0.15"/>` +
      // Body
      `<ellipse cx="0" cy="-2.5" rx="2.5" ry="1.4" fill="${c.horse}"/>` +
      // Neck (arched)
      `<path d="M-2,-2.5 Q-2.5,-3.5 -2.2,-4.5 Q-2,-5 -1.5,-5.5" fill="${c.horse}" stroke="${c.horse}" stroke-width="1.2"/>` +
      // Head
      `<ellipse cx="-1.2" cy="-5.8" rx="0.9" ry="0.5" fill="${c.horse}"/>` +
      // Mane
      `<path d="M-2,-3.5 Q-2.5,-4 -2.3,-4.5 Q-2,-5 -1.5,-5.3" stroke="${c.trunk}" fill="none" stroke-width="0.5"/>` +
      // Ear
      `<polygon points="-1.4,-6.3 -1.2,-6.8 -1,-6.3" fill="${c.horse}"/>` +
      // Eye
      `<circle cx="-1" cy="-5.8" r="0.12" fill="#222"/>` +
      // Front legs (extended)
      `<rect x="-1.5" y="-1.3" width="0.5" height="1.8" fill="${c.horse}" transform="rotate(-20 -1.5 -1.3)"/>` +
      `<rect x="-0.5" y="-1.3" width="0.5" height="1.5" fill="${c.horse}" transform="rotate(15 -0.5 -1.3)"/>` +
      // Back legs
      `<rect x="1" y="-1.3" width="0.5" height="1.5" fill="${c.horse}"/>` +
      `<rect x="1.8" y="-1.3" width="0.5" height="1.8" fill="${c.horse}" transform="rotate(-10 1.8 -1.3)"/>` +
      // Tail
      `<path d="M2.5,-2.8 Q3.5,-2.5 3.8,-1.5 Q4,-0.5 3.5,0" stroke="${c.trunk}" fill="none" stroke-width="0.5"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Rearing
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0.5" cy="-0.2" rx="1.5" ry="0.4" fill="${c.shadow}" opacity="0.15"/>` +
      // Body (tilted)
      `<ellipse cx="0" cy="-3" rx="2.2" ry="1.3" fill="${c.horse}" transform="rotate(-25 0 -3)"/>` +
      // Neck
      `<path d="M-1.5,-3.5 Q-2,-5 -1.5,-6" fill="${c.horse}" stroke="${c.horse}" stroke-width="1.1"/>` +
      // Head
      `<ellipse cx="-1.2" cy="-6.5" rx="0.85" ry="0.5" fill="${c.horse}"/>` +
      // Mane
      `<path d="M-1.8,-4.5 Q-2.3,-5 -2,-5.8" stroke="${c.trunk}" fill="none" stroke-width="0.5"/>` +
      // Ear
      `<polygon points="-1.4,-7 -1.2,-7.5 -1,-7" fill="${c.horse}"/>` +
      // Front legs (raised)
      `<rect x="-1.2" y="-2.5" width="0.45" height="1.8" fill="${c.horse}" transform="rotate(-60 -1.2 -2.5)"/>` +
      `<rect x="-0.3" y="-2.5" width="0.45" height="1.6" fill="${c.horse}" transform="rotate(-45 -0.3 -2.5)"/>` +
      // Back legs
      `<rect x="0.8" y="-1.5" width="0.5" height="1.7" fill="${c.horse}"/>` +
      `<rect x="1.5" y="-1.5" width="0.5" height="1.7" fill="${c.horse}"/>` +
      `</g>`
    );
  }
  // Default: standing horse profile
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.2" rx="2.2" ry="0.5" fill="${c.shadow}" opacity="0.15"/>` +
    // Body
    `<ellipse cx="0" cy="-2.5" rx="2.5" ry="1.4" fill="${c.horse}"/>` +
    // Neck
    `<path d="M-2,-2.8 Q-2.3,-4 -2,-5" fill="${c.horse}" stroke="${c.horse}" stroke-width="1.2"/>` +
    // Head
    `<ellipse cx="-1.6" cy="-5.5" rx="1" ry="0.55" fill="${c.horse}"/>` +
    // Muzzle
    `<ellipse cx="-2.4" cy="-5.3" rx="0.4" ry="0.3" fill="${c.horse}"/>` +
    // Mane
    `<path d="M-1.8,-3.5 Q-2.5,-4 -2.2,-4.8 Q-2,-5.3 -1.5,-5.5" stroke="${c.trunk}" fill="none" stroke-width="0.6"/>` +
    // Ears
    `<polygon points="-1.8,-6 -1.6,-6.5 -1.4,-6" fill="${c.horse}"/>` +
    `<polygon points="-1.3,-6 -1.1,-6.4 -0.9,-6" fill="${c.horse}"/>` +
    // Eye
    `<circle cx="-1.4" cy="-5.5" r="0.12" fill="#222"/>` +
    // Nostril
    `<circle cx="-2.5" cy="-5.2" r="0.08" fill="#333"/>` +
    // Four legs
    `<rect x="-1.4" y="-1.2" width="0.5" height="1.4" fill="${c.horse}"/>` +
    `<rect x="-0.5" y="-1.2" width="0.5" height="1.4" fill="${c.horse}"/>` +
    `<rect x="0.6" y="-1.2" width="0.5" height="1.4" fill="${c.horse}"/>` +
    `<rect x="1.5" y="-1.2" width="0.5" height="1.4" fill="${c.horse}"/>` +
    // Hooves
    `<rect x="-1.45" y="0" width="0.55" height="0.25" fill="${c.trunk}"/>` +
    `<rect x="-0.55" y="0" width="0.55" height="0.25" fill="${c.trunk}"/>` +
    `<rect x="0.55" y="0" width="0.55" height="0.25" fill="${c.trunk}"/>` +
    `<rect x="1.45" y="0" width="0.55" height="0.25" fill="${c.trunk}"/>` +
    // Tail
    `<path d="M2.5,-2.8 Q3.2,-2.5 3,-1.5 Q2.8,-0.5 3.2,0" stroke="${c.trunk}" fill="none" stroke-width="0.6"/>` +
    `</g>`
  );
}
