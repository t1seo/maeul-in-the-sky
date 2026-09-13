import type { AssetColors } from '../../palette.js';

export function svgSheep(x: number, y: number, c: AssetColors, v: number): string {
  // Fluffy sheep with clear wool body and dark face/legs
  if (v === 1) {
    // Grazing variant
    return (
      `<g transform="translate(${x},${y})">` +
      // Shadow
      `<ellipse cx="0" cy="-0.2" rx="2" ry="0.5" fill="${c.shadow}" opacity="0.15"/>` +
      // Wool body (fluffy cloud shape)
      `<ellipse cx="0" cy="-2" rx="2.2" ry="1.4" fill="${c.sheep}"/>` +
      `<circle cx="-1.3" cy="-2.3" r="1" fill="${c.sheep}"/>` +
      `<circle cx="1.3" cy="-2.3" r="1" fill="${c.sheep}"/>` +
      `<circle cx="0" cy="-2.8" r="0.9" fill="${c.sheep}"/>` +
      // Dark face (bent down grazing)
      `<ellipse cx="-1.8" cy="-1.2" rx="0.7" ry="0.5" fill="${c.sheepHead}"/>` +
      // Ears
      `<ellipse cx="-1.3" cy="-1.8" rx="0.25" ry="0.4" fill="${c.sheepHead}"/>` +
      // Legs (dark, sturdy)
      `<rect x="-1.1" y="-0.8" width="0.5" height="1" fill="${c.sheepHead}"/>` +
      `<rect x="0.6" y="-0.8" width="0.5" height="1" fill="${c.sheepHead}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Lying down
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-1" rx="2.5" ry="1" fill="${c.sheep}"/>` +
      `<circle cx="-1.5" cy="-1.3" r="0.8" fill="${c.sheep}"/>` +
      `<circle cx="1.2" cy="-1.2" r="0.7" fill="${c.sheep}"/>` +
      `<circle cx="-2.2" cy="-1.5" r="0.6" fill="${c.sheepHead}"/>` +
      `<circle cx="-2.4" cy="-1.6" r="0.1" fill="#222"/>` +
      `</g>`
    );
  }
  // Standing sheep - clear profile
  return (
    `<g transform="translate(${x},${y})">` +
    // Shadow
    `<ellipse cx="0" cy="-0.2" rx="1.8" ry="0.4" fill="${c.shadow}" opacity="0.15"/>` +
    // Wool body
    `<ellipse cx="0" cy="-2.2" rx="2" ry="1.3" fill="${c.sheep}"/>` +
    `<circle cx="-1.2" cy="-2.5" r="0.9" fill="${c.sheep}"/>` +
    `<circle cx="1" cy="-2.4" r="0.85" fill="${c.sheep}"/>` +
    `<circle cx="0" cy="-3" r="0.8" fill="${c.sheep}"/>` +
    // Dark head
    `<ellipse cx="-2" cy="-2.8" rx="0.7" ry="0.55" fill="${c.sheepHead}"/>` +
    // Eye
    `<circle cx="-2.1" cy="-2.9" r="0.12" fill="#222"/>` +
    // Ears
    `<ellipse cx="-1.5" cy="-3.3" rx="0.2" ry="0.35" fill="${c.sheepHead}" transform="rotate(-15 -1.5 -3.3)"/>` +
    // Four dark legs
    `<rect x="-1.2" y="-1" width="0.45" height="1.2" fill="${c.sheepHead}"/>` +
    `<rect x="-0.4" y="-1" width="0.45" height="1.2" fill="${c.sheepHead}"/>` +
    `<rect x="0.4" y="-1" width="0.45" height="1.2" fill="${c.sheepHead}"/>` +
    `<rect x="1" y="-1" width="0.45" height="1.2" fill="${c.sheepHead}"/>` +
    `</g>`
  );
}

export function svgCow(x: number, y: number, c: AssetColors, v: number): string {
  // Large cow with distinct body, spots, head with horns, and 4 legs
  if (v === 1) {
    // Right-facing grazing
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.2" rx="2.5" ry="0.5" fill="${c.shadow}" opacity="0.15"/>` +
      // Body
      `<ellipse cx="0" cy="-2.2" rx="2.8" ry="1.6" fill="${c.cow}"/>` +
      // Spots
      `<ellipse cx="-0.5" cy="-2.5" rx="0.9" ry="0.7" fill="${c.cowSpot}"/>` +
      `<ellipse cx="1" cy="-1.8" rx="0.7" ry="0.5" fill="${c.cowSpot}"/>` +
      // Head (facing right, down)
      `<ellipse cx="2.5" cy="-1.5" rx="0.9" ry="0.7" fill="${c.cow}"/>` +
      `<ellipse cx="3" cy="-1.3" rx="0.5" ry="0.4" fill="${c.cowSpot}" opacity="0.6"/>` +
      // Horns
      `<line x1="2.2" y1="-2.1" x2="1.8" y2="-2.8" stroke="${c.fence}" stroke-width="0.3"/>` +
      `<line x1="2.8" y1="-2.1" x2="3.2" y2="-2.7" stroke="${c.fence}" stroke-width="0.3"/>` +
      // Eye
      `<circle cx="2.8" cy="-1.6" r="0.12" fill="#222"/>` +
      // Legs
      `<rect x="-1.5" y="-0.8" width="0.5" height="1" fill="${c.cow}"/>` +
      `<rect x="-0.5" y="-0.8" width="0.5" height="1" fill="${c.cow}"/>` +
      `<rect x="0.5" y="-0.8" width="0.5" height="1" fill="${c.cow}"/>` +
      `<rect x="1.3" y="-0.8" width="0.5" height="1" fill="${c.cow}"/>` +
      // Tail
      `<path d="M-2.8,-2.5 Q-3.5,-2 -3.2,-1" stroke="${c.cowSpot}" fill="none" stroke-width="0.25"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Side profile
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.2" rx="2.5" ry="0.5" fill="${c.shadow}" opacity="0.15"/>` +
      // Body
      `<ellipse cx="0" cy="-2.2" rx="2.8" ry="1.6" fill="${c.cow}"/>` +
      // Large spot
      `<ellipse cx="0.3" cy="-2.3" rx="1.2" ry="0.9" fill="${c.cowSpot}"/>` +
      // Head
      `<ellipse cx="-2.5" cy="-2.8" rx="0.9" ry="0.7" fill="${c.cow}"/>` +
      // Muzzle
      `<ellipse cx="-3.2" cy="-2.6" rx="0.5" ry="0.4" fill="${c.cowSpot}" opacity="0.5"/>` +
      // Horns
      `<line x1="-2.8" y1="-3.4" x2="-3.2" y2="-4" stroke="${c.fence}" stroke-width="0.3"/>` +
      `<line x1="-2.2" y1="-3.4" x2="-1.8" y2="-4" stroke="${c.fence}" stroke-width="0.3"/>` +
      // Eye
      `<circle cx="-2.3" cy="-3" r="0.12" fill="#222"/>` +
      // Legs
      `<rect x="-1.3" y="-0.8" width="0.5" height="1" fill="${c.cow}"/>` +
      `<rect x="-0.3" y="-0.8" width="0.5" height="1" fill="${c.cow}"/>` +
      `<rect x="0.7" y="-0.8" width="0.5" height="1" fill="${c.cow}"/>` +
      `<rect x="1.5" y="-0.8" width="0.5" height="1" fill="${c.cow}"/>` +
      `</g>`
    );
  }
  // Default: classic left-facing cow
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.2" rx="2.5" ry="0.5" fill="${c.shadow}" opacity="0.15"/>` +
    // Body
    `<ellipse cx="0" cy="-2.2" rx="2.8" ry="1.6" fill="${c.cow}"/>` +
    // Spots
    `<ellipse cx="0.8" cy="-2.5" rx="1" ry="0.7" fill="${c.cowSpot}"/>` +
    `<ellipse cx="-0.8" cy="-1.7" rx="0.6" ry="0.5" fill="${c.cowSpot}"/>` +
    // Head
    `<ellipse cx="-2.5" cy="-2.8" rx="0.9" ry="0.7" fill="${c.cow}"/>` +
    `<ellipse cx="-3" cy="-2.6" rx="0.45" ry="0.35" fill="${c.cowSpot}" opacity="0.5"/>` +
    // Horns
    `<line x1="-2.8" y1="-3.4" x2="-3.3" y2="-4" stroke="${c.fence}" stroke-width="0.3"/>` +
    `<line x1="-2.2" y1="-3.4" x2="-1.7" y2="-4" stroke="${c.fence}" stroke-width="0.3"/>` +
    // Ear
    `<ellipse cx="-2" cy="-3.3" rx="0.25" ry="0.4" fill="${c.cow}"/>` +
    // Eye
    `<circle cx="-2.4" cy="-3" r="0.12" fill="#222"/>` +
    // Udder hint
    `<ellipse cx="0.5" cy="-0.9" rx="0.6" ry="0.3" fill="${c.cowSpot}" opacity="0.4"/>` +
    // Four legs
    `<rect x="-1.5" y="-0.8" width="0.55" height="1" fill="${c.cow}"/>` +
    `<rect x="-0.5" y="-0.8" width="0.55" height="1" fill="${c.cow}"/>` +
    `<rect x="0.5" y="-0.8" width="0.55" height="1" fill="${c.cow}"/>` +
    `<rect x="1.4" y="-0.8" width="0.55" height="1" fill="${c.cow}"/>` +
    // Tail
    `<path d="M2.8,-2.5 Q3.5,-2 3.2,-1" stroke="${c.cowSpot}" fill="none" stroke-width="0.3"/>` +
    `<ellipse cx="3.2" cy="-0.9" rx="0.3" ry="0.2" fill="${c.cowSpot}"/>` +
    `</g>`
  );
}
