import type { AssetColors } from '../../palette.js';

export function svgBareBush(x: number, y: number, c: AssetColors, v: number): string {
  const branch = c.bareBranch;
  const frost = c.frostWhite;
  if (v === 1) {
    // Wide
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0.5" x2="-2" y2="-2" stroke="${branch}" stroke-width="0.4"/>` +
      `<line x1="0" y1="0.5" x2="2" y2="-1.5" stroke="${branch}" stroke-width="0.4"/>` +
      `<line x1="0" y1="0.5" x2="0" y2="-2.5" stroke="${branch}" stroke-width="0.5"/>` +
      `<line x1="-1" y1="-1.2" x2="-2.5" y2="-2" stroke="${branch}" stroke-width="0.3"/>` +
      `<line x1="1" y1="-0.8" x2="2.5" y2="-1.5" stroke="${branch}" stroke-width="0.3"/>` +
      `<circle cx="-2" cy="-2" r="0.3" fill="${frost}" opacity="0.4"/>` +
      `<circle cx="2" cy="-1.5" r="0.3" fill="${frost}" opacity="0.4"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // With berries
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0.5" x2="-1.5" y2="-2" stroke="${branch}" stroke-width="0.4"/>` +
      `<line x1="0" y1="0.5" x2="1.5" y2="-1.8" stroke="${branch}" stroke-width="0.4"/>` +
      `<line x1="0" y1="0.5" x2="0" y2="-2.5" stroke="${branch}" stroke-width="0.5"/>` +
      `<circle cx="-1" cy="-1.8" r="0.25" fill="${c.scarfRed}"/>` +
      `<circle cx="0.5" cy="-2" r="0.25" fill="${c.scarfRed}"/>` +
      `<circle cx="1" cy="-1.2" r="0.25" fill="${c.scarfRed}"/>` +
      `</g>`
    );
  }
  // Small
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0.5" x2="-1.5" y2="-1.5" stroke="${branch}" stroke-width="0.4"/>` +
    `<line x1="0" y1="0.5" x2="1.5" y2="-1.5" stroke="${branch}" stroke-width="0.4"/>` +
    `<line x1="0" y1="0.5" x2="0" y2="-2" stroke="${branch}" stroke-width="0.5"/>` +
    `<circle cx="0" cy="-2" r="0.3" fill="${frost}" opacity="0.3"/>` +
    `</g>`
  );
}

export function svgWinterBird(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Robin
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-1" rx="1.2" ry="0.8" fill="${c.winterBirdBrown}"/>` +
      `<circle cx="-0.8" cy="-1.5" r="0.5" fill="${c.winterBirdBrown}"/>` +
      `<circle cx="-1" cy="-1.6" r="0.12" fill="#fff"/>` +
      `<circle cx="-1" cy="-1.6" r="0.06" fill="#222"/>` +
      `<polygon points="-1.3,-1.5 -1.8,-1.4 -1.3,-1.3" fill="${c.snowmanCarrot}"/>` +
      `<ellipse cx="0.3" cy="-0.8" rx="0.6" ry="0.4" fill="${c.scarfRed}" opacity="0.7"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Sparrow
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-1" rx="1" ry="0.7" fill="${c.winterBirdBrown}" opacity="0.8"/>` +
      `<circle cx="-0.6" cy="-1.4" r="0.45" fill="${c.winterBirdBrown}" opacity="0.9"/>` +
      `<circle cx="-0.8" cy="-1.5" r="0.1" fill="#222"/>` +
      `<polygon points="-1,-1.4 -1.5,-1.3 -1,-1.2" fill="${c.snowmanCarrot}" opacity="0.8"/>` +
      `</g>`
    );
  }
  // Cardinal red
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-1" rx="1.2" ry="0.8" fill="${c.winterBirdRed}"/>` +
    `<circle cx="-0.8" cy="-1.5" r="0.55" fill="${c.winterBirdRed}"/>` +
    `<polygon points="-0.6,-2 -0.5,-2.5 -0.3,-2" fill="${c.winterBirdRed}"/>` +
    `<circle cx="-1" cy="-1.6" r="0.12" fill="#fff"/>` +
    `<circle cx="-1" cy="-1.6" r="0.06" fill="#222"/>` +
    `<polygon points="-1.3,-1.5 -1.8,-1.4 -1.3,-1.3" fill="${c.snowmanCarrot}"/>` +
    `<circle cx="-0.5" cy="-1.3" r="0.25" fill="#222" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgFirewood(x: number, y: number, c: AssetColors, v: number): string {
  const log = c.firewoodLog;
  const snow = c.snowCap;
  if (v === 1) {
    // Large stack
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="-0.8" cy="0" rx="0.6" ry="0.35" fill="${log}"/>` +
      `<ellipse cx="0.8" cy="0" rx="0.6" ry="0.35" fill="${log}"/>` +
      `<ellipse cx="0" cy="0" rx="0.6" ry="0.35" fill="${log}"/>` +
      `<ellipse cx="-0.4" cy="-0.6" rx="0.6" ry="0.35" fill="${log}"/>` +
      `<ellipse cx="0.4" cy="-0.6" rx="0.6" ry="0.35" fill="${log}"/>` +
      `<ellipse cx="0" cy="-1.2" rx="0.6" ry="0.35" fill="${log}"/>` +
      `<ellipse cx="0" cy="-1.5" rx="1.5" ry="0.3" fill="${snow}" opacity="0.5"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // In shelter
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="-2" y1="0.5" x2="-2" y2="-2" stroke="${c.bareBranch}" stroke-width="0.4"/>` +
      `<line x1="2" y1="0.5" x2="2" y2="-2" stroke="${c.bareBranch}" stroke-width="0.4"/>` +
      `<line x1="-2.2" y1="-2" x2="2.2" y2="-2" stroke="${c.bareBranch}" stroke-width="0.5"/>` +
      `<ellipse cx="-0.5" cy="0" rx="0.5" ry="0.3" fill="${log}"/>` +
      `<ellipse cx="0.5" cy="0" rx="0.5" ry="0.3" fill="${log}"/>` +
      `<ellipse cx="0" cy="-0.5" rx="0.5" ry="0.3" fill="${log}"/>` +
      `</g>`
    );
  }
  // Small pile
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="-0.5" cy="0" rx="0.5" ry="0.3" fill="${log}"/>` +
    `<ellipse cx="0.5" cy="0" rx="0.5" ry="0.3" fill="${log}"/>` +
    `<ellipse cx="0" cy="-0.5" rx="0.5" ry="0.3" fill="${log}"/>` +
    `<ellipse cx="0" cy="-0.8" rx="1" ry="0.2" fill="${snow}" opacity="0.4"/>` +
    `</g>`
  );
}

export function svgHouseWinter(x: number, y: number, c: AssetColors, v: number): string {
  // House with snow on roof and warm window glow
  const snow = c.snowCap;
  const warmGlow = '#ffa040';
  if (v === 1) {
    // With icicles
    return (
      `<g transform="translate(${x},${y})">` +
      `<polygon points="-2.5,0 0,1.2 2.5,0 2.5,-3 0,-1.8 -2.5,-3" fill="${c.wall}"/>` +
      `<polygon points="-2.5,0 0,1.2 0,-1.8 -2.5,-3" fill="${c.wallShade}"/>` +
      `<polygon points="0,-6 -3.2,-2.8 0,-1.5 3.2,-2.8" fill="${c.roofA}"/>` +
      `<polygon points="0,-6.3 -3.4,-2.6 -3.2,-2.8 0,-6" fill="${snow}" opacity="0.9"/>` +
      `<polygon points="0,-6.3 3.4,-2.6 3.2,-2.8 0,-6" fill="${snow}" opacity="0.85"/>` +
      `<rect x="1" y="-6.5" width="1" height="2" fill="${c.chimney}"/>` +
      `<ellipse cx="1.5" cy="-6.8" rx="0.6" ry="0.25" fill="${snow}"/>` +
      /* v8 ignore start */
      `<line x1="-2.8" y1="-2.5" x2="-2.8" y2="-1.8" stroke="${c.icicleBlue || '#d0e8f8'}" stroke-width="0.15"/>` +
      `<line x1="-2.2" y1="-2.3" x2="-2.2" y2="-1.5" stroke="${c.icicleBlue || '#d0e8f8'}" stroke-width="0.12"/>` +
      `<line x1="2.5" y1="-2.4" x2="2.5" y2="-1.6" stroke="${c.icicleBlue || '#d0e8f8'}" stroke-width="0.15"/>` +
      /* v8 ignore stop */
      `<rect x="-1" y="-1.5" width="0.6" height="0.6" fill="${warmGlow}" opacity="0.6"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Heavy snow
    return (
      `<g transform="translate(${x},${y})">` +
      `<polygon points="-2.5,0 0,1.2 2.5,0 2.5,-3 0,-1.8 -2.5,-3" fill="${c.wall}"/>` +
      `<polygon points="-2.5,0 0,1.2 0,-1.8 -2.5,-3" fill="${c.wallShade}"/>` +
      `<polygon points="0,-6 -3.2,-2.8 0,-1.5 3.2,-2.8" fill="${c.roofA}"/>` +
      `<polygon points="0,-6.5 -3.5,-2.5 -3.2,-2.8 0,-6" fill="${snow}"/>` +
      `<polygon points="0,-6.5 3.5,-2.5 3.2,-2.8 0,-6" fill="${snow}" opacity="0.95"/>` +
      `<ellipse cx="-2" cy="-2.6" rx="0.8" ry="0.3" fill="${snow}"/>` +
      `<ellipse cx="2" cy="-2.6" rx="0.8" ry="0.3" fill="${snow}"/>` +
      `<rect x="1" y="-6.5" width="1" height="2" fill="${c.chimney}"/>` +
      `<ellipse cx="1.5" cy="-6.8" rx="0.8" ry="0.35" fill="${snow}"/>` +
      `</g>`
    );
  }
  // Default: light snow
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-2.5,0 0,1.2 2.5,0 2.5,-3 0,-1.8 -2.5,-3" fill="${c.wall}"/>` +
    `<polygon points="-2.5,0 0,1.2 0,-1.8 -2.5,-3" fill="${c.wallShade}"/>` +
    `<polygon points="0,-6 -3.2,-2.8 0,-1.5 3.2,-2.8" fill="${c.roofA}"/>` +
    `<polygon points="0,-6.2 -3.3,-2.7 -3.2,-2.8 0,-6" fill="${snow}" opacity="0.85"/>` +
    `<polygon points="0,-6.2 3.3,-2.7 3.2,-2.8 0,-6" fill="${snow}" opacity="0.8"/>` +
    `<rect x="1" y="-6.5" width="1" height="2" fill="${c.chimney}"/>` +
    `<ellipse cx="1.5" cy="-6.7" rx="0.5" ry="0.2" fill="${snow}"/>` +
    `<rect x="-0.8" y="-1.3" width="0.5" height="0.5" fill="${warmGlow}" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgHouseBWinter(x: number, y: number, c: AssetColors, v: number): string {
  return svgHouseWinter(x, y, c, v);
}

export function svgBarnWinter(x: number, y: number, c: AssetColors, v: number): string {
  // Barn with snow on roof
  const snow = c.snowCap;
  if (v === 1) {
    // Large barn with heavy snow
    return (
      `<g transform="translate(${x},${y})">` +
      `<polygon points="-4,0 0,2 4,0 4,-4.5 0,-2.5 -4,-4.5" fill="${c.roofA}" opacity="0.9"/>` +
      `<polygon points="-4,0 0,2 0,-2.5 -4,-4.5" fill="${c.wallShade}"/>` +
      `<polygon points="0,-7.5 -4.5,-4 0,-2.2 4.5,-4" fill="${c.roofA}"/>` +
      `<polygon points="0,-7.8 -4.7,-3.8 -4.5,-4 0,-7.5" fill="${snow}"/>` +
      `<polygon points="0,-7.8 4.7,-3.8 4.5,-4 0,-7.5" fill="${snow}" opacity="0.95"/>` +
      `<ellipse cx="-3.5" cy="-4" rx="1" ry="0.35" fill="${snow}"/>` +
      `<ellipse cx="3.5" cy="-4" rx="1" ry="0.35" fill="${snow}"/>` +
      `<rect x="-0.5" y="-1.5" width="1" height="1.5" fill="${c.trunk}" opacity="0.5"/>` +
      `</g>`
    );
  }
  // Default barn with snow
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-3,0 0,1.5 3,0 3,-3.5 0,-2 -3,-3.5" fill="${c.roofA}" opacity="0.8"/>` +
    `<polygon points="-3,0 0,1.5 0,-2 -3,-3.5" fill="${c.wallShade}"/>` +
    `<polygon points="0,-6 -3.5,-3.2 0,-1.8 3.5,-3.2" fill="${c.roofA}"/>` +
    `<polygon points="0,-6.3 -3.7,-3 -3.5,-3.2 0,-6" fill="${snow}"/>` +
    `<polygon points="0,-6.3 3.7,-3 3.5,-3.2 0,-6" fill="${snow}" opacity="0.9"/>` +
    `<ellipse cx="0" cy="-6" rx="0.5" ry="0.2" fill="${snow}"/>` +
    `</g>`
  );
}
