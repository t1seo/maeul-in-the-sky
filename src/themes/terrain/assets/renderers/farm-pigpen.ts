import type { AssetColors } from '../../palette.js';

export function svgPigpen(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-2.5" y="-1" width="5" height="1" fill="${c.fence}" opacity="0.5"/>` +
    `<ellipse cx="0" cy="-1" rx="1.2" ry="0.8" fill="${c.pig}"/>` +
    `<circle cx="-1" cy="-1.3" r="0.4" fill="${c.pig}"/>` +
    `<ellipse cx="-1.3" cy="-1.2" rx="0.25" ry="0.15" fill="#eaa"/>` +
    `</g>`
  );
}

export function svgTrough(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-2" y="-1" width="4" height="0.8" fill="${c.trough}"/>` +
    `<line x1="-1.5" y1="-0.2" x2="-1.5" y2="0.5" stroke="${c.trunk}" stroke-width="0.3"/>` +
    `<line x1="1.5" y1="-0.2" x2="1.5" y2="0.5" stroke="${c.trunk}" stroke-width="0.3"/>` +
    `<rect x="-1.8" y="-0.8" width="3.6" height="0.5" fill="${c.tidePools}" opacity="0.4"/>` +
    `</g>`
  );
}

export function svgHaystack(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-2,0 2,0 1.5,-3 -1.5,-3" fill="${c.haystack}"/>` +
    `<polygon points="-1.5,-3 0,-4.5 1.5,-3" fill="${c.haystack}"/>` +
    `</g>`
  );
}

export function svgOrchard(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0" x2="0" y2="-3" stroke="${c.trunk}" stroke-width="0.6"/>` +
    `<circle cx="0" cy="-5" r="2.5" fill="${c.orchard}"/>` +
    `<circle cx="-1" cy="-4.5" r="0.35" fill="${c.orchardFruit}"/>` +
    `<circle cx="0.8" cy="-5.2" r="0.35" fill="${c.orchardFruit}"/>` +
    `<circle cx="0" cy="-3.8" r="0.3" fill="${c.orchardFruit}"/>` +
    `</g>`
  );
}

export function svgAppleTree(x: number, y: number, c: AssetColors, v: number): string {
  // Apple tree with red apples
  const leaf = c.orchard;
  /* v8 ignore start */
  const apple = c.appleRed || '#c41e3a';
  /* v8 ignore stop */
  const trunk = c.trunk;
  if (v === 1) {
    // Many apples
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/>` +
      `<circle cx="0" cy="-4.5" r="2.5" fill="${leaf}"/>` +
      `<circle cx="-1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.9"/>` +
      `<circle cx="1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.85"/>` +
      `<circle cx="-1" cy="-4" r="0.35" fill="${apple}"/>` +
      `<circle cx="0.5" cy="-5" r="0.35" fill="${apple}"/>` +
      `<circle cx="1.2" cy="-4" r="0.3" fill="${apple}"/>` +
      `<circle cx="-0.3" cy="-3.5" r="0.3" fill="${apple}"/>` +
      `<circle cx="0" cy="-5.5" r="0.3" fill="${apple}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // With fallen apples
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/>` +
      `<circle cx="0" cy="-4.5" r="2.3" fill="${leaf}"/>` +
      `<circle cx="-1.2" cy="-3.5" r="1.3" fill="${leaf}" opacity="0.9"/>` +
      `<circle cx="1.2" cy="-3.5" r="1.3" fill="${leaf}" opacity="0.85"/>` +
      `<circle cx="-0.5" cy="-4.5" r="0.3" fill="${apple}"/>` +
      `<circle cx="0.8" cy="-4" r="0.3" fill="${apple}"/>` +
      `<circle cx="-1.5" cy="0.3" r="0.25" fill="${apple}" opacity="0.8"/>` +
      `<circle cx="0.8" cy="0.5" r="0.25" fill="${apple}" opacity="0.75"/>` +
      `</g>`
    );
  }
  // Standard apple tree
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/>` +
    `<circle cx="0" cy="-4.5" r="2.5" fill="${leaf}"/>` +
    `<circle cx="-1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.9"/>` +
    `<circle cx="1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.85"/>` +
    `<circle cx="-1" cy="-4.2" r="0.35" fill="${apple}"/>` +
    `<circle cx="0.6" cy="-5" r="0.35" fill="${apple}"/>` +
    `<circle cx="0" cy="-3.8" r="0.3" fill="${apple}"/>` +
    `</g>`
  );
}

export function svgOliveTree(x: number, y: number, c: AssetColors, v: number): string {
  // Mediterranean olive tree with silver-green foliage
  /* v8 ignore start */
  const leaf = c.oliveGreen || '#808060';
  const fruit = c.oliveFruit || '#4a4a30';
  /* v8 ignore stop */
  const trunk = c.trunk;
  if (v === 1) {
    // Gnarled old tree
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M-0.3,2 Q-0.8,0 -0.5,-1 Q-0.2,-2 0,-2" stroke="${trunk}" fill="none" stroke-width="0.8"/>` +
      `<path d="M0.3,2 Q0.8,0 0.5,-1 Q0.2,-2 0,-2" stroke="${trunk}" fill="none" stroke-width="0.8"/>` +
      `<ellipse cx="0" cy="-4" rx="2.5" ry="1.8" fill="${leaf}" opacity="0.7"/>` +
      `<ellipse cx="-1.5" cy="-3.5" rx="1.2" ry="0.9" fill="${leaf}" opacity="0.6"/>` +
      `<ellipse cx="1.5" cy="-3.5" rx="1.2" ry="0.9" fill="${leaf}" opacity="0.55"/>` +
      `<circle cx="-0.8" cy="-3.8" r="0.2" fill="${fruit}"/>` +
      `<circle cx="0.5" cy="-4.2" r="0.2" fill="${fruit}"/>` +
      `<circle cx="1" cy="-3.5" r="0.18" fill="${fruit}"/>` +
      `</g>`
    );
  }
  // Standard olive tree
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.4" y="-1" width="0.8" height="3" fill="${trunk}"/>` +
    `<ellipse cx="0" cy="-3.5" rx="2.2" ry="1.6" fill="${leaf}" opacity="0.7"/>` +
    `<ellipse cx="-1.2" cy="-3" rx="1" ry="0.8" fill="${leaf}" opacity="0.6"/>` +
    `<ellipse cx="1.2" cy="-3" rx="1" ry="0.8" fill="${leaf}" opacity="0.55"/>` +
    `<circle cx="-0.5" cy="-3.5" r="0.18" fill="${fruit}"/>` +
    `<circle cx="0.6" cy="-3.8" r="0.18" fill="${fruit}"/>` +
    `</g>`
  );
}

export function svgLemonTree(x: number, y: number, c: AssetColors, v: number): string {
  // Lemon tree with bright yellow lemons
  const leaf = c.palm; // bright green
  /* v8 ignore start */
  const lemon = c.lemonYellow || '#fff44f';
  /* v8 ignore stop */
  const trunk = c.trunk;
  if (v === 1) {
    // Heavy with lemons
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.4" y="-1" width="0.8" height="2.5" fill="${trunk}"/>` +
      `<circle cx="0" cy="-3.5" r="2" fill="${leaf}"/>` +
      `<circle cx="-1" cy="-2.8" r="1.2" fill="${leaf}" opacity="0.9"/>` +
      `<circle cx="1" cy="-2.8" r="1.2" fill="${leaf}" opacity="0.85"/>` +
      `<ellipse cx="-0.8" cy="-3.5" rx="0.35" ry="0.25" fill="${lemon}"/>` +
      `<ellipse cx="0.5" cy="-4" rx="0.35" ry="0.25" fill="${lemon}"/>` +
      `<ellipse cx="0.8" cy="-3" rx="0.3" ry="0.22" fill="${lemon}"/>` +
      `<ellipse cx="-0.2" cy="-2.8" rx="0.3" ry="0.22" fill="${lemon}"/>` +
      `</g>`
    );
  }
  // Standard lemon tree
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.4" y="-1" width="0.8" height="2.5" fill="${trunk}"/>` +
    `<circle cx="0" cy="-3.5" r="2" fill="${leaf}"/>` +
    `<circle cx="-1" cy="-2.8" r="1.2" fill="${leaf}" opacity="0.9"/>` +
    `<circle cx="1" cy="-2.8" r="1.2" fill="${leaf}" opacity="0.85"/>` +
    `<ellipse cx="-0.5" cy="-3.5" rx="0.3" ry="0.22" fill="${lemon}"/>` +
    `<ellipse cx="0.6" cy="-3.8" rx="0.3" ry="0.22" fill="${lemon}"/>` +
    `</g>`
  );
}

export function svgOrangeTree(x: number, y: number, c: AssetColors, v: number): string {
  // Orange tree with orange fruits
  const leaf = c.orchard; // dark green
  /* v8 ignore start */
  const orange = c.orangeFruit || '#ff8c00';
  /* v8 ignore stop */
  const trunk = c.trunk;
  if (v === 1) {
    // Many oranges
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/>` +
      `<circle cx="0" cy="-4.2" r="2.3" fill="${leaf}"/>` +
      `<circle cx="-1.3" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.9"/>` +
      `<circle cx="1.3" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.85"/>` +
      `<circle cx="-0.8" cy="-4" r="0.4" fill="${orange}"/>` +
      `<circle cx="0.5" cy="-4.5" r="0.35" fill="${orange}"/>` +
      `<circle cx="1" cy="-3.5" r="0.35" fill="${orange}"/>` +
      `<circle cx="-0.2" cy="-3.2" r="0.3" fill="${orange}"/>` +
      `</g>`
    );
  }
  // Standard orange tree
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/>` +
    `<circle cx="0" cy="-4.2" r="2.3" fill="${leaf}"/>` +
    `<circle cx="-1.3" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.9"/>` +
    `<circle cx="1.3" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.85"/>` +
    `<circle cx="-0.6" cy="-4" r="0.4" fill="${orange}"/>` +
    `<circle cx="0.7" cy="-4.3" r="0.35" fill="${orange}"/>` +
    `</g>`
  );
}
