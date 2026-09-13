import type { AssetColors } from '../../palette.js';

export function svgWheat(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Ripe golden variant — denser, drooping heads
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="-1.5" y1="0" x2="-1.5" y2="-4" stroke="${c.wheat}" stroke-width="0.35"/>` +
      `<line x1="0" y1="0" x2="0" y2="-4.5" stroke="${c.wheat}" stroke-width="0.35"/>` +
      `<line x1="1.5" y1="0" x2="1.5" y2="-3.8" stroke="${c.wheat}" stroke-width="0.35"/>` +
      `<line x1="-0.7" y1="0" x2="-0.7" y2="-4.2" stroke="${c.wheat}" stroke-width="0.25" opacity="0.7"/>` +
      `<ellipse cx="-1.5" cy="-4.3" rx="0.4" ry="0.7" fill="${c.wheat}"/>` +
      `<ellipse cx="0" cy="-4.8" rx="0.4" ry="0.7" fill="${c.wheat}"/>` +
      `<ellipse cx="1.5" cy="-4.1" rx="0.4" ry="0.7" fill="${c.wheat}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Harvested stubble variant — short cut stalks
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="-2" y1="0" x2="-2" y2="-1.2" stroke="${c.wheat}" stroke-width="0.3" opacity="0.6"/>` +
      `<line x1="-0.5" y1="0" x2="-0.5" y2="-1" stroke="${c.wheat}" stroke-width="0.3" opacity="0.6"/>` +
      `<line x1="1" y1="0" x2="1" y2="-1.3" stroke="${c.wheat}" stroke-width="0.3" opacity="0.6"/>` +
      `<line x1="2.5" y1="0" x2="2.5" y2="-0.8" stroke="${c.wheat}" stroke-width="0.3" opacity="0.5"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="-1.5" y1="0" x2="-1.5" y2="-4" stroke="${c.wheat}" stroke-width="0.3"/>` +
    `<line x1="0" y1="0" x2="0" y2="-4.5" stroke="${c.wheat}" stroke-width="0.3"/>` +
    `<line x1="1.5" y1="0" x2="1.5" y2="-3.8" stroke="${c.wheat}" stroke-width="0.3"/>` +
    `<circle cx="-1.5" cy="-4.2" r="0.5" fill="${c.wheat}"/>` +
    `<circle cx="0" cy="-4.8" r="0.5" fill="${c.wheat}"/>` +
    `<circle cx="1.5" cy="-4" r="0.5" fill="${c.wheat}"/>` +
    `</g>`
  );
}

export function svgFence(x: number, y: number, c: AssetColors, v: number): string {
  const postCap = (px: number) =>
    `<polygon points="${px - 0.3},-3 ${px},-3.5 ${px + 0.3},-3" fill="${c.fence}"/>`;
  if (v === 1) {
    // L-corner variant with post caps
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="-3" y1="-1.5" x2="0" y2="-1.5" stroke="${c.fence}" stroke-width="0.5"/>` +
      `<line x1="-3" y1="-2.3" x2="0" y2="-2.3" stroke="${c.fence}" stroke-width="0.4"/>` +
      `<rect x="-3.2" y="-3" width="0.5" height="3" fill="${c.fence}"/>` +
      `<rect x="-0.25" y="-3" width="0.5" height="3" fill="${c.fence}"/>` +
      postCap(-3) +
      postCap(0) +
      `<line x1="0" y1="-1.5" x2="3" y2="-1.5" stroke="${c.fence}" stroke-width="0.5"/>` +
      `<line x1="0" y1="-2.3" x2="3" y2="-2.3" stroke="${c.fence}" stroke-width="0.4"/>` +
      `<rect x="2.75" y="-3" width="0.5" height="3" fill="${c.fence}"/>` +
      postCap(3) +
      `</g>`
    );
  }
  if (v === 2) {
    // Gate variant with decorative posts
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="-3" y1="-1.5" x2="-0.7" y2="-1.5" stroke="${c.fence}" stroke-width="0.5"/>` +
      `<line x1="0.7" y1="-1.5" x2="3" y2="-1.5" stroke="${c.fence}" stroke-width="0.5"/>` +
      `<line x1="-3" y1="-2.3" x2="-0.7" y2="-2.3" stroke="${c.fence}" stroke-width="0.4"/>` +
      `<line x1="0.7" y1="-2.3" x2="3" y2="-2.3" stroke="${c.fence}" stroke-width="0.4"/>` +
      `<rect x="-3.2" y="-3" width="0.5" height="3" fill="${c.fence}"/>` +
      `<rect x="-0.85" y="-3.5" width="0.4" height="3.5" fill="${c.fence}"/>` +
      `<rect x="0.55" y="-3.5" width="0.4" height="3.5" fill="${c.fence}"/>` +
      `<rect x="2.75" y="-3" width="0.5" height="3" fill="${c.fence}"/>` +
      postCap(-3) +
      `<circle cx="-0.65" cy="-3.7" r="0.25" fill="${c.fence}"/>` +
      `<circle cx="0.75" cy="-3.7" r="0.25" fill="${c.fence}"/>` +
      postCap(3) +
      `</g>`
    );
  }
  // Default: straight fence with posts and caps
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="-3" y1="-1.5" x2="3" y2="-1.5" stroke="${c.fence}" stroke-width="0.5"/>` +
    `<line x1="-3" y1="-2.3" x2="3" y2="-2.3" stroke="${c.fence}" stroke-width="0.4"/>` +
    `<rect x="-3.2" y="-3" width="0.5" height="3" fill="${c.fence}"/>` +
    `<rect x="-0.25" y="-3" width="0.5" height="3" fill="${c.fence}"/>` +
    `<rect x="2.75" y="-3" width="0.5" height="3" fill="${c.fence}"/>` +
    postCap(-3) +
    postCap(0) +
    postCap(3) +
    `</g>`
  );
}

export function svgScarecrow(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // With crow variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0" x2="0" y2="-6" stroke="${c.scarecrow}" stroke-width="0.5"/>` +
      `<line x1="-2.5" y1="-4" x2="2.5" y2="-4" stroke="${c.scarecrow}" stroke-width="0.4"/>` +
      `<circle cx="0" cy="-7" r="1" fill="${c.scarecrowHat}"/>` +
      `<rect x="-1.5" y="-8.2" width="3" height="0.8" fill="${c.scarecrowHat}" rx="0.2"/>` +
      `<path d="M2,-4.5 Q2.5,-5.5 3,-4.5" stroke="${c.bird}" fill="${c.bird}" stroke-width="0.3"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Tattered variant — tilted, ragged
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0" x2="0.3" y2="-5.5" stroke="${c.scarecrow}" stroke-width="0.5"/>` +
      `<line x1="-2" y1="-3.5" x2="2.5" y2="-4.2" stroke="${c.scarecrow}" stroke-width="0.4"/>` +
      `<circle cx="0.3" cy="-6.5" r="0.9" fill="${c.scarecrowHat}"/>` +
      `<rect x="-1" y="-7.6" width="2.8" height="0.7" fill="${c.scarecrowHat}" rx="0.2" transform="rotate(-8 0.3 -7)"/>` +
      `<path d="M-2,-3.5 L-2.5,-2.5" stroke="${c.scarecrow}" stroke-width="0.3" opacity="0.5"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0" x2="0" y2="-6" stroke="${c.scarecrow}" stroke-width="0.5"/>` +
    `<line x1="-2.5" y1="-4" x2="2.5" y2="-4" stroke="${c.scarecrow}" stroke-width="0.4"/>` +
    `<circle cx="0" cy="-7" r="1" fill="${c.scarecrowHat}"/>` +
    `<rect x="-1.5" y="-8.2" width="3" height="0.8" fill="${c.scarecrowHat}" rx="0.2"/>` +
    `</g>`
  );
}

export function svgBarn(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Large red barn variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<polygon points="-4,0 0,2 4,0 4,-4.5 0,-2.5 -4,-4.5" fill="${c.roofA}" opacity="0.9"/>` +
      `<polygon points="-4,0 0,2 0,-2.5 -4,-4.5" fill="${c.wallShade}"/>` +
      `<polygon points="0,-7.5 -4.5,-4 0,-2.2 4.5,-4" fill="${c.roofA}"/>` +
      `<rect x="-0.5" y="-1.5" width="1" height="1.5" fill="${c.trunk}" opacity="0.5"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Small shed variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-2" y="-2.5" width="4" height="2.5" fill="${c.wallShade}"/>` +
      `<polygon points="-2.5,-2.5 0,-4 2.5,-2.5" fill="${c.roofB}"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-3,0 0,1.5 3,0 3,-3.5 0,-2 -3,-3.5" fill="${c.roofA}" opacity="0.8"/>` +
    `<polygon points="-3,0 0,1.5 0,-2 -3,-3.5" fill="${c.wallShade}"/>` +
    `<polygon points="0,-6 -3.5,-3.2 0,-1.8 3.5,-3.2" fill="${c.roofA}"/>` +
    `</g>`
  );
}
