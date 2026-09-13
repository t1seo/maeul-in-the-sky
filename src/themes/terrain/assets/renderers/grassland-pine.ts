import type { AssetColors } from '../../palette.js';

export function svgPine(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Short/bushy variant with layered foliage
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.2" rx="1" ry="0.3" fill="${c.shadow}" opacity="0.15"/>` +
      `<rect x="-0.4" y="-1.8" width="0.8" height="1.8" fill="${c.trunk}"/>` +
      `<polygon points="0,-5.5 -3.2,-1.5 3.2,-1.5" fill="${c.bushDark}"/>` +
      `<polygon points="0,-5.5 -2.8,-2 2.8,-2" fill="${c.pine}"/>` +
      `<polygon points="0,-7 -2.4,-3.5 2.4,-3.5" fill="${c.bushDark}" opacity="0.9"/>` +
      `<polygon points="0,-7 -2,-4 2,-4" fill="${c.pine}"/>` +
      `<polygon points="0,-8 -1.2,-5.5 1.2,-5.5" fill="${c.leafLight}" opacity="0.8"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Wind-bent variant with depth
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0.5" cy="-0.2" rx="1" ry="0.3" fill="${c.shadow}" opacity="0.15"/>` +
      `<path d="M0,0 Q0.4,-1.5 0.8,-3" stroke="${c.trunk}" fill="none" stroke-width="0.7"/>` +
      `<polygon points="1,-8.5 -1.8,-3 3.8,-3" fill="${c.bushDark}"/>` +
      `<polygon points="1,-8.5 -1.4,-3.5 3.4,-3.5" fill="${c.pine}"/>` +
      `<polygon points="1.2,-10 -0.8,-6 3.2,-6" fill="${c.bushDark}" opacity="0.9"/>` +
      `<polygon points="1.2,-10 -0.4,-6.5 2.8,-6.5" fill="${c.pine}"/>` +
      `<polygon points="1.2,-10.8 0,-7.5 2.4,-7.5" fill="${c.leafLight}" opacity="0.7"/>` +
      `</g>`
    );
  }
  // Default: tall pine with layered foliage and shadow
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.2" rx="0.8" ry="0.25" fill="${c.shadow}" opacity="0.15"/>` +
    `<rect x="-0.35" y="-2.5" width="0.7" height="2.5" fill="${c.trunk}"/>` +
    `<polygon points="0,-8.5 -2.8,-2 2.8,-2" fill="${c.bushDark}"/>` +
    `<polygon points="0,-8.5 -2.4,-2.5 2.4,-2.5" fill="${c.pine}"/>` +
    `<polygon points="0,-10.5 -2,-5.5 2,-5.5" fill="${c.bushDark}" opacity="0.9"/>` +
    `<polygon points="0,-10.5 -1.6,-6 1.6,-6" fill="${c.pine}"/>` +
    `<polygon points="0,-11.5 -0.9,-8 0.9,-8" fill="${c.leafLight}" opacity="0.7"/>` +
    `</g>`
  );
}

export function svgDeciduous(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Oval tall variant with layered canopy
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.2" rx="0.8" ry="0.25" fill="${c.shadow}" opacity="0.15"/>` +
      `<rect x="-0.35" y="-4.5" width="0.7" height="4.5" fill="${c.trunk}"/>` +
      `<line x1="-0.3" y1="-3.5" x2="-1" y2="-4.5" stroke="${c.trunk}" stroke-width="0.3"/>` +
      `<line x1="0.3" y1="-4" x2="0.8" y2="-5" stroke="${c.trunk}" stroke-width="0.25"/>` +
      `<ellipse cx="0" cy="-7.5" rx="2.3" ry="3.8" fill="${c.bushDark}"/>` +
      `<ellipse cx="-0.3" cy="-7" rx="1.8" ry="3" fill="${c.leaf}"/>` +
      `<ellipse cx="0.5" cy="-7.8" rx="1.4" ry="2.5" fill="${c.bush}" opacity="0.8"/>` +
      `<ellipse cx="-0.2" cy="-8.5" rx="1" ry="1.5" fill="${c.leafLight}" opacity="0.6"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Multi-branch spread variant with depth
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.2" rx="1.5" ry="0.4" fill="${c.shadow}" opacity="0.15"/>` +
      `<rect x="-0.4" y="-3" width="0.8" height="3" fill="${c.trunk}"/>` +
      `<line x1="0" y1="-2.5" x2="-2" y2="-4" stroke="${c.trunk}" stroke-width="0.45"/>` +
      `<line x1="0" y1="-2.5" x2="2" y2="-4" stroke="${c.trunk}" stroke-width="0.45"/>` +
      `<circle cx="-2" cy="-5.5" r="2.3" fill="${c.bushDark}"/>` +
      `<circle cx="-2" cy="-5.5" r="2" fill="${c.leaf}"/>` +
      `<circle cx="-2.5" cy="-6" r="1.2" fill="${c.leafLight}" opacity="0.6"/>` +
      `<circle cx="2" cy="-5.5" r="2.3" fill="${c.bushDark}"/>` +
      `<circle cx="2" cy="-5.5" r="2" fill="${c.leaf}"/>` +
      `<circle cx="1.5" cy="-6" r="1.2" fill="${c.leafLight}" opacity="0.6"/>` +
      `<circle cx="0" cy="-6" r="2" fill="${c.bush}" opacity="0.8"/>` +
      `</g>`
    );
  }
  // Default: round canopy with layered depth
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.2" rx="1" ry="0.3" fill="${c.shadow}" opacity="0.15"/>` +
    `<rect x="-0.35" y="-3.5" width="0.7" height="3.5" fill="${c.trunk}"/>` +
    `<line x1="-0.2" y1="-3" x2="-1.2" y2="-4" stroke="${c.trunk}" stroke-width="0.3"/>` +
    `<line x1="0.2" y1="-2.8" x2="1" y2="-3.8" stroke="${c.trunk}" stroke-width="0.25"/>` +
    `<circle cx="0" cy="-6" r="3.2" fill="${c.bushDark}"/>` +
    `<circle cx="0" cy="-6" r="2.9" fill="${c.leaf}"/>` +
    `<circle cx="-1" cy="-5.5" r="2" fill="${c.bush}" opacity="0.75"/>` +
    `<circle cx="0.8" cy="-6.5" r="1.5" fill="${c.leafLight}" opacity="0.6"/>` +
    `</g>`
  );
}

export function svgMushroom(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Brown cluster variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-1.2" y="-1.5" width="0.6" height="1.5" fill="${c.mushroom}"/>` +
      `<ellipse cx="-0.9" cy="-1.7" rx="1" ry="0.7" fill="${c.trunk}"/>` +
      `<rect x="0.5" y="-1.8" width="0.5" height="1.8" fill="${c.mushroom}"/>` +
      `<ellipse cx="0.75" cy="-2" rx="0.8" ry="0.6" fill="${c.trunk}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Tall/thin variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.3" y="-3" width="0.6" height="3" fill="${c.mushroom}"/>` +
      `<ellipse cx="0" cy="-3.2" rx="1" ry="0.6" fill="${c.mushroomCap}"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.4" y="-2" width="0.8" height="2" fill="${c.mushroom}"/>` +
    `<ellipse cx="0" cy="-2.2" rx="1.5" ry="1" fill="${c.mushroomCap}"/>` +
    `<circle cx="-0.5" cy="-2.5" r="0.3" fill="${c.mushroom}" opacity="0.7"/>` +
    `</g>`
  );
}

export function svgStump(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // With mushrooms variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-1.5" rx="1.5" ry="0.8" fill="${c.stump}"/>` +
      `<rect x="-1.5" y="-1.5" width="3" height="1.5" fill="${c.trunk}"/>` +
      `<ellipse cx="0" cy="-1.5" rx="1.5" ry="0.6" fill="${c.stump}" opacity="0.7"/>` +
      `<circle cx="1.2" cy="-1.2" r="0.4" fill="${c.mushroom}"/>` +
      `<circle cx="1.5" cy="-0.8" r="0.3" fill="${c.mushroom}" opacity="0.8"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Mossy variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-1.5" rx="1.5" ry="0.8" fill="${c.stump}"/>` +
      `<rect x="-1.5" y="-1.5" width="3" height="1.5" fill="${c.trunk}"/>` +
      `<ellipse cx="0" cy="-1.5" rx="1.5" ry="0.6" fill="${c.moss}" opacity="0.6"/>` +
      `<ellipse cx="-0.5" cy="-1" rx="0.8" ry="0.3" fill="${c.moss}" opacity="0.4"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-1.5" rx="1.5" ry="0.8" fill="${c.stump}"/>` +
    `<rect x="-1.5" y="-1.5" width="3" height="1.5" fill="${c.trunk}"/>` +
    `<ellipse cx="0" cy="-1.5" rx="1.5" ry="0.6" fill="${c.stump}" opacity="0.7"/>` +
    `</g>`
  );
}

export function svgDeer(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Grazing variant — head down
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-2" rx="2.2" ry="1.2" fill="${c.deer}"/>` +
      `<circle cx="-2.2" cy="-1.8" r="0.6" fill="${c.deer}"/>` +
      `<line x1="-2.5" y1="-2.4" x2="-2.8" y2="-3.2" stroke="${c.trunk}" stroke-width="0.25"/>` +
      `<line x1="-1.9" y1="-2.4" x2="-1.5" y2="-3.2" stroke="${c.trunk}" stroke-width="0.25"/>` +
      `<line x1="-1" y1="-0.8" x2="-1" y2="0" stroke="${c.deer}" stroke-width="0.4"/>` +
      `<line x1="1" y1="-0.8" x2="1" y2="0" stroke="${c.deer}" stroke-width="0.4"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Walking variant — legs spread
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-2" rx="2.2" ry="1.2" fill="${c.deer}"/>` +
      `<circle cx="-2" cy="-3" r="0.7" fill="${c.deer}"/>` +
      `<line x1="-2.3" y1="-3.7" x2="-3" y2="-4.8" stroke="${c.trunk}" stroke-width="0.3"/>` +
      `<line x1="-1.7" y1="-3.7" x2="-1" y2="-4.8" stroke="${c.trunk}" stroke-width="0.3"/>` +
      `<line x1="-1.2" y1="-0.8" x2="-1.8" y2="0.3" stroke="${c.deer}" stroke-width="0.4"/>` +
      `<line x1="0.8" y1="-0.8" x2="1.5" y2="0.3" stroke="${c.deer}" stroke-width="0.4"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-2" rx="2.2" ry="1.2" fill="${c.deer}"/>` +
    `<circle cx="-2" cy="-3" r="0.7" fill="${c.deer}"/>` +
    // Antlers (key identifier)
    `<line x1="-2.3" y1="-3.7" x2="-3" y2="-5" stroke="${c.trunk}" stroke-width="0.3"/>` +
    `<line x1="-3" y1="-5" x2="-3.5" y2="-5.3" stroke="${c.trunk}" stroke-width="0.25"/>` +
    `<line x1="-1.7" y1="-3.7" x2="-1" y2="-5" stroke="${c.trunk}" stroke-width="0.3"/>` +
    `<line x1="-1" y1="-5" x2="-0.5" y2="-5.3" stroke="${c.trunk}" stroke-width="0.25"/>` +
    // Legs
    `<line x1="-1" y1="-0.8" x2="-1" y2="0" stroke="${c.deer}" stroke-width="0.4"/>` +
    `<line x1="1" y1="-0.8" x2="1" y2="0" stroke="${c.deer}" stroke-width="0.4"/>` +
    `</g>`
  );
}
