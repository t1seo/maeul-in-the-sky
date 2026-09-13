import type { AssetColors } from '../../palette.js';

export function svgIgloo(x: number, y: number, c: AssetColors, v: number): string {
  const block = c.igloo;
  const ice = c.ice;
  if (v === 1) {
    // With entrance
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M-3.5,0.5 Q-3.5,-3 0,-3.5 Q3.5,-3 3.5,0.5 Z" fill="${block}"/>` +
      `<path d="M-1,0.5 Q-1,-0.5 0,-0.8 Q1,-0.5 1,0.5 Z" fill="${ice}" opacity="0.5"/>` +
      `<line x1="-2" y1="-1" x2="2" y2="-1" stroke="${ice}" stroke-width="0.2" opacity="0.4"/>` +
      `<line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="${ice}" stroke-width="0.2" opacity="0.4"/>` +
      `<path d="M2,0.5 Q2.5,0.3 3,0.5 Q3,-0.2 2.5,-0.3 Q2,-0.2 2,0.5 Z" fill="${block}" opacity="0.8"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Half-built
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M-3,0.5 Q-3,-1.5 0,-2 Q2,-1.5 2,0.5 Z" fill="${block}"/>` +
      `<rect x="2.5" y="-0.5" width="1" height="0.5" fill="${block}" opacity="0.7"/>` +
      `<rect x="2" y="0" width="1.2" height="0.5" fill="${block}" opacity="0.6"/>` +
      `<line x1="-1.5" y1="0" x2="1.5" y2="0" stroke="${ice}" stroke-width="0.2" opacity="0.3"/>` +
      `</g>`
    );
  }
  // Classic
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-3,0.5 Q-3,-3 0,-3.5 Q3,-3 3,0.5 Z" fill="${block}"/>` +
    `<line x1="-2" y1="-1" x2="2" y2="-1" stroke="${ice}" stroke-width="0.2" opacity="0.4"/>` +
    `<line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="${ice}" stroke-width="0.2" opacity="0.4"/>` +
    `<line x1="-1" y1="-2" x2="1" y2="-2" stroke="${ice}" stroke-width="0.2" opacity="0.3"/>` +
    `</g>`
  );
}

export function svgFrozenPond(x: number, y: number, c: AssetColors, v: number): string {
  const ice = c.ice;
  const crack = c.frozenWater;
  if (v === 1) {
    // With cracks
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0" rx="3" ry="1.2" fill="${ice}" opacity="0.7"/>` +
      `<line x1="-1" y1="-0.3" x2="1.5" y2="0.5" stroke="${crack}" stroke-width="0.3" opacity="0.5"/>` +
      `<line x1="0" y1="-0.5" x2="0.5" y2="0.8" stroke="${crack}" stroke-width="0.2" opacity="0.4"/>` +
      `<ellipse cx="0.5" cy="-0.2" rx="0.8" ry="0.3" fill="#fff" opacity="0.2"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Thin ice
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0" rx="2.5" ry="1" fill="${ice}" opacity="0.5"/>` +
      `<ellipse cx="0" cy="0" rx="1.5" ry="0.6" fill="${crack}" opacity="0.3"/>` +
      `<ellipse cx="0.3" cy="-0.1" rx="0.5" ry="0.2" fill="#fff" opacity="0.15"/>` +
      `</g>`
    );
  }
  // Solid
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0" rx="3" ry="1.2" fill="${ice}" opacity="0.7"/>` +
    `<ellipse cx="0.5" cy="-0.2" rx="1.2" ry="0.5" fill="#fff" opacity="0.15"/>` +
    `</g>`
  );
}

export function svgIcicle(x: number, y: number, c: AssetColors, v: number): string {
  const ice = c.icicle;
  if (v === 1) {
    // Cluster
    return (
      `<g transform="translate(${x},${y})">` +
      `<polygon points="-1.5,-1 -1.2,-1 -1,-3" fill="${ice}" opacity="0.7"/>` +
      `<polygon points="-0.3,-1 0,-1 0.2,-3.5" fill="${ice}" opacity="0.8"/>` +
      `<polygon points="0.8,-1 1.1,-1 1.2,-2.5" fill="${ice}" opacity="0.7"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Thick
    return (
      `<g transform="translate(${x},${y})">` +
      `<polygon points="-0.5,-1 0.5,-1 0.2,-3.5 -0.2,-3.5" fill="${ice}" opacity="0.8"/>` +
      `<ellipse cx="0" cy="-1" rx="0.6" ry="0.2" fill="${ice}" opacity="0.5"/>` +
      `</g>`
    );
  }
  // Single
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-0.2,-1 0.2,-1 0,-3" fill="${ice}" opacity="0.8"/>` +
    `</g>`
  );
}

export function svgSled(x: number, y: number, c: AssetColors, v: number): string {
  const wood = c.sledWood;
  const runner = c.sledRunner;
  if (v === 1) {
    // With gifts
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-2.5" y="-1" width="5" height="0.5" rx="0.2" fill="${wood}"/>` +
      `<path d="M-2.5,-0.5 Q-3,-0.5 -3,0 L-2.5,0.2" fill="none" stroke="${runner}" stroke-width="0.4"/>` +
      `<path d="M2.5,-0.5 Q3,-0.5 3,0 L2.5,0.2" fill="none" stroke="${runner}" stroke-width="0.4"/>` +
      `<rect x="-1.5" y="-2.2" width="1.5" height="1.2" fill="${c.scarfRed}" rx="0.2"/>` +
      /* v8 ignore start */
      `<rect x="0.3" y="-1.8" width="1" height="0.8" fill="${c.sproutGreen || '#4a8828'}" rx="0.2"/>` +
      /* v8 ignore stop */
      `</g>`
    );
  }
  if (v === 2) {
    // With runner marks
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-2.5" y="-1" width="5" height="0.5" rx="0.2" fill="${wood}"/>` +
      `<path d="M-2.5,-0.5 Q-3,-0.5 -3,0 L-2.5,0.2" fill="none" stroke="${runner}" stroke-width="0.4"/>` +
      `<path d="M2.5,-0.5 Q3,-0.5 3,0 L2.5,0.2" fill="none" stroke="${runner}" stroke-width="0.4"/>` +
      `<line x1="-3" y1="0.3" x2="3" y2="0.3" stroke="${runner}" stroke-width="0.15" opacity="0.3"/>` +
      `<line x1="-3" y1="0.5" x2="3" y2="0.5" stroke="${runner}" stroke-width="0.15" opacity="0.2"/>` +
      `</g>`
    );
  }
  // Empty
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-2.5" y="-1" width="5" height="0.5" rx="0.2" fill="${wood}"/>` +
    `<path d="M-2.5,-0.5 Q-3,-0.5 -3,0 L-2.5,0.2" fill="none" stroke="${runner}" stroke-width="0.4"/>` +
    `<path d="M2.5,-0.5 Q3,-0.5 3,0 L2.5,0.2" fill="none" stroke="${runner}" stroke-width="0.4"/>` +
    `<line x1="-2" y1="-1" x2="-2" y2="-0.5" stroke="${wood}" stroke-width="0.3"/>` +
    `<line x1="2" y1="-1" x2="2" y2="-0.5" stroke="${wood}" stroke-width="0.3"/>` +
    `</g>`
  );
}

export function svgSnowCoveredRock(x: number, y: number, c: AssetColors, v: number): string {
  const rock = c.rock;
  const snow = c.snowCap;
  if (v === 1) {
    // Large
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0" rx="2.5" ry="1.2" fill="${rock}"/>` +
      `<ellipse cx="0" cy="-0.8" rx="2" ry="0.6" fill="${snow}" opacity="0.7"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Boulder
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0" rx="3" ry="1.5" fill="${c.boulder}"/>` +
      `<ellipse cx="-0.5" cy="-0.5" rx="2" ry="1" fill="${rock}"/>` +
      `<ellipse cx="-0.3" cy="-1" rx="2" ry="0.7" fill="${snow}" opacity="0.6"/>` +
      `</g>`
    );
  }
  // Small
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0" rx="1.5" ry="0.8" fill="${rock}"/>` +
    `<ellipse cx="0" cy="-0.5" rx="1.2" ry="0.4" fill="${snow}" opacity="0.6"/>` +
    `</g>`
  );
}
