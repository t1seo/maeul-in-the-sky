import type { AssetColors } from '../../palette.js';

export function svgSnowPine(x: number, y: number, c: AssetColors, v: number): string {
  const snow = c.snowCap;
  const trunk = c.trunk;
  /* v8 ignore start */
  const icicle = c.icicleBlue || '#d0e8f8';
  /* v8 ignore stop */
  if (v === 1) {
    // Heavy snow with icicles
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/>` +
      `<polygon points="0,-8 -3,-2 3,-2" fill="${c.pine}" opacity="0.6"/>` +
      `<polygon points="0,-8 -3,-2 3,-2" fill="${snow}" opacity="0.55"/>` +
      `<polygon points="0,-6 -2.5,-1.5 2.5,-1.5" fill="${snow}" opacity="0.6"/>` +
      `<ellipse cx="0" cy="-8" rx="1.5" ry="0.5" fill="${snow}"/>` +
      `<line x1="-2" y1="-3" x2="-2" y2="-2" stroke="${icicle}" stroke-width="0.12"/>` +
      `<line x1="-1" y1="-4" x2="-1" y2="-3" stroke="${icicle}" stroke-width="0.1"/>` +
      `<line x1="1.5" y1="-3.5" x2="1.5" y2="-2.5" stroke="${icicle}" stroke-width="0.12"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Frosted blue with more detail
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/>` +
      `<polygon points="0,-7.5 -3.5,-1 3.5,-1" fill="${c.ice}" opacity="0.5"/>` +
      `<polygon points="0,-6 -2.5,-2 2.5,-2" fill="${c.pine}" opacity="0.4"/>` +
      `<polygon points="0,-7.5 -2.5,-2.5 2.5,-2.5" fill="${snow}" opacity="0.45"/>` +
      `<ellipse cx="0" cy="-7.5" rx="1.2" ry="0.4" fill="${snow}"/>` +
      `<ellipse cx="-2" cy="-2.5" rx="0.8" ry="0.25" fill="${snow}" opacity="0.5"/>` +
      `<ellipse cx="2" cy="-2.5" rx="0.8" ry="0.25" fill="${snow}" opacity="0.5"/>` +
      `</g>`
    );
  }
  // Light snow with subtle icicles
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/>` +
    `<polygon points="0,-7 -3,-1 3,-1" fill="${c.pine}"/>` +
    `<polygon points="0,-7 -1.5,-4 1.5,-4" fill="${snow}" opacity="0.45"/>` +
    `<ellipse cx="0.5" cy="-6" rx="1" ry="0.3" fill="${snow}" opacity="0.5"/>` +
    `<ellipse cx="-1.5" cy="-3" rx="0.7" ry="0.25" fill="${snow}" opacity="0.4"/>` +
    `<line x1="-2" y1="-2.5" x2="-2" y2="-1.8" stroke="${icicle}" stroke-width="0.08" opacity="0.7"/>` +
    `<line x1="2" y1="-2.5" x2="2" y2="-1.8" stroke="${icicle}" stroke-width="0.08" opacity="0.7"/>` +
    `</g>`
  );
}

export function svgSnowDeciduous(x: number, y: number, c: AssetColors, v: number): string {
  const branch = c.bareBranch;
  const snow = c.snowCap;
  if (v === 1) {
    // Thin/tall
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="2" x2="0" y2="-5" stroke="${branch}" stroke-width="0.8"/>` +
      `<line x1="0" y1="-2" x2="-2" y2="-4" stroke="${branch}" stroke-width="0.4"/>` +
      `<line x1="0" y1="-3" x2="1.5" y2="-5" stroke="${branch}" stroke-width="0.4"/>` +
      `<line x1="0" y1="-1" x2="2" y2="-2.5" stroke="${branch}" stroke-width="0.4"/>` +
      `<ellipse cx="-1.5" cy="-4.2" rx="1" ry="0.4" fill="${snow}" opacity="0.6"/>` +
      `<ellipse cx="1.2" cy="-5.2" rx="0.8" ry="0.3" fill="${snow}" opacity="0.5"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Wide/old
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.6" y="-1" width="1.2" height="3.5" fill="${branch}"/>` +
      `<line x1="0" y1="-1" x2="-3" y2="-3.5" stroke="${branch}" stroke-width="0.6"/>` +
      `<line x1="0" y1="-1.5" x2="2.5" y2="-4" stroke="${branch}" stroke-width="0.6"/>` +
      `<line x1="0" y1="0" x2="-2.5" y2="-1.5" stroke="${branch}" stroke-width="0.5"/>` +
      `<line x1="0" y1="0" x2="3" y2="-2" stroke="${branch}" stroke-width="0.5"/>` +
      `<ellipse cx="-2.5" cy="-3.7" rx="1.2" ry="0.5" fill="${snow}" opacity="0.55"/>` +
      `<ellipse cx="2" cy="-4.2" rx="1" ry="0.4" fill="${snow}" opacity="0.5"/>` +
      `<ellipse cx="0" cy="-2" rx="1.5" ry="0.4" fill="${snow}" opacity="0.4"/>` +
      `</g>`
    );
  }
  // Single tree
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="2" x2="0" y2="-4" stroke="${branch}" stroke-width="0.7"/>` +
    `<line x1="0" y1="-1.5" x2="-2.5" y2="-3.5" stroke="${branch}" stroke-width="0.4"/>` +
    `<line x1="0" y1="-2.5" x2="2" y2="-4.5" stroke="${branch}" stroke-width="0.4"/>` +
    `<line x1="0" y1="-0.5" x2="2" y2="-2" stroke="${branch}" stroke-width="0.4"/>` +
    `<ellipse cx="-2" cy="-3.7" rx="1" ry="0.35" fill="${snow}" opacity="0.5"/>` +
    `<ellipse cx="1.8" cy="-4.7" rx="0.8" ry="0.3" fill="${snow}" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgSnowman(x: number, y: number, c: AssetColors, v: number): string {
  const body = c.snowCap;
  const coal = c.snowmanCoal;
  const carrot = c.snowmanCarrot;
  const scarf = c.scarfRed;
  if (v === 1) {
    // With broom
    return (
      `<g transform="translate(${x},${y})">` +
      `<circle cx="0" cy="0" r="2.2" fill="${body}"/>` +
      `<circle cx="0" cy="-2.8" r="1.6" fill="${body}"/>` +
      `<circle cx="0" cy="-4.8" r="1.1" fill="${body}"/>` +
      `<circle cx="-0.4" cy="-5" r="0.2" fill="${coal}"/>` +
      `<circle cx="0.4" cy="-5" r="0.2" fill="${coal}"/>` +
      `<polygon points="0,-4.8 1.2,-4.6 0,-4.5" fill="${carrot}"/>` +
      `<rect x="-1" y="-3.6" width="2" height="0.4" rx="0.2" fill="${scarf}"/>` +
      `<line x1="2" y1="-3" x2="3.5" y2="-6" stroke="${c.bareBranch}" stroke-width="0.4"/>` +
      `<line x1="3.2" y1="-5.5" x2="3.8" y2="-6.5" stroke="${c.bareBranch}" stroke-width="0.3"/>` +
      `<line x1="3.2" y1="-5.5" x2="3.8" y2="-5.2" stroke="${c.bareBranch}" stroke-width="0.3"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Melting
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0.5" rx="2.8" ry="1.5" fill="${body}"/>` +
      `<circle cx="0" cy="-1.5" r="1.8" fill="${body}"/>` +
      `<circle cx="0" cy="-3.2" r="1" fill="${body}"/>` +
      `<circle cx="-0.3" cy="-3.4" r="0.15" fill="${coal}"/>` +
      `<circle cx="0.3" cy="-3.4" r="0.15" fill="${coal}"/>` +
      `<polygon points="0,-3.2 1,-3 0,-2.9" fill="${carrot}"/>` +
      `<ellipse cx="0" cy="1.5" rx="3" ry="0.5" fill="${c.ice}" opacity="0.3"/>` +
      `</g>`
    );
  }
  // Classic
  return (
    `<g transform="translate(${x},${y})">` +
    `<circle cx="0" cy="0" r="2" fill="${body}"/>` +
    `<circle cx="0" cy="-2.5" r="1.5" fill="${body}"/>` +
    `<circle cx="0" cy="-4.3" r="1" fill="${body}"/>` +
    `<circle cx="-0.35" cy="-4.5" r="0.18" fill="${coal}"/>` +
    `<circle cx="0.35" cy="-4.5" r="0.18" fill="${coal}"/>` +
    `<polygon points="0,-4.3 1.2,-4.1 0,-4" fill="${carrot}"/>` +
    `<circle cx="0" cy="-2.2" r="0.15" fill="${coal}"/>` +
    `<circle cx="0" cy="-2.7" r="0.15" fill="${coal}"/>` +
    `<rect x="-1" y="-3.2" width="2" height="0.35" rx="0.15" fill="${scarf}"/>` +
    `<rect x="-1.2" y="-5.5" width="2.4" height="0.5" fill="${coal}"/>` +
    `<rect x="-0.8" y="-6" width="1.6" height="0.6" fill="${coal}"/>` +
    `</g>`
  );
}

export function svgSnowdrift(x: number, y: number, c: AssetColors, v: number): string {
  const snow = c.snowCap;
  if (v === 1) {
    // Large
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0" rx="3.5" ry="1.2" fill="${snow}"/>` +
      `<ellipse cx="-1" cy="-0.5" rx="2" ry="0.8" fill="${c.frostWhite}" opacity="0.6"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Wind-shaped
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M-3,0 Q-1,-1.5 2,-0.5 Q3,0 3.5,0.3" fill="${snow}" stroke="none"/>` +
      `<ellipse cx="0" cy="0.2" rx="3" ry="0.6" fill="${snow}" opacity="0.8"/>` +
      `</g>`
    );
  }
  // Small
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0" rx="2" ry="0.8" fill="${snow}"/>` +
    `<ellipse cx="0.3" cy="-0.3" rx="1.2" ry="0.5" fill="${c.frostWhite}" opacity="0.5"/>` +
    `</g>`
  );
}
