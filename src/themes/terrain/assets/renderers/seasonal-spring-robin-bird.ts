import type { AssetColors } from '../../palette.js';

export function svgRobinBird(x: number, y: number, c: AssetColors, v: number): string {
  // Spring robin with red breast
  /* v8 ignore start */
  const brown = c.owl || '#8a7050';
  /* v8 ignore stop */
  const red = c.tulipRed;
  const beak = c.tulipYellow;
  if (v === 1) {
    // Singing (beak open)
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0" rx="0.8" ry="0.5" fill="${brown}"/>` +
      `<ellipse cx="0.2" cy="-0.1" rx="0.4" ry="0.35" fill="${red}"/>` +
      `<circle cx="0.7" cy="-0.3" r="0.35" fill="${brown}"/>` +
      `<polygon points="1,-0.3 1.3,-0.1 1,-0.15" fill="${beak}"/>` +
      `<polygon points="1,-0.3 1.3,-0.4 1,-0.35" fill="${beak}"/>` +
      `<circle cx="0.8" cy="-0.35" r="0.08" fill="#000"/>` +
      `<line x1="-0.6" y1="0.4" x2="-0.6" y2="0.7" stroke="${brown}" stroke-width="0.1"/>` +
      `</g>`
    );
  }
  // Standing
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0" rx="0.8" ry="0.5" fill="${brown}"/>` +
    `<ellipse cx="0.2" cy="-0.1" rx="0.4" ry="0.35" fill="${red}"/>` +
    `<circle cx="0.7" cy="-0.3" r="0.35" fill="${brown}"/>` +
    `<polygon points="1,-0.3 1.4,-0.25 1,-0.2" fill="${beak}"/>` +
    `<circle cx="0.8" cy="-0.35" r="0.08" fill="#000"/>` +
    `<line x1="-0.5" y1="0.4" x2="-0.5" y2="0.7" stroke="${brown}" stroke-width="0.08"/>` +
    `<line x1="0" y1="0.45" x2="0" y2="0.7" stroke="${brown}" stroke-width="0.08"/>` +
    `</g>`
  );
}

export function svgButterflyGarden(x: number, y: number, c: AssetColors, v: number): string {
  // Multiple butterflies
  const wing1 = c.butterfly;
  const wing2 = c.butterflyWing;
  const wing3 = c.tulipPurple;
  if (v === 1) {
    // Three butterflies
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="-1" cy="-1" rx="0.5" ry="0.25" fill="${wing1}" opacity="0.7"/>` +
      `<ellipse cx="-1.5" cy="-1.2" rx="0.4" ry="0.2" fill="${wing2}" opacity="0.6"/>` +
      `<ellipse cx="0.5" cy="-0.5" rx="0.4" ry="0.2" fill="${wing3}" opacity="0.65"/>` +
      `<ellipse cx="0.1" cy="-0.6" rx="0.3" ry="0.15" fill="${wing2}" opacity="0.55"/>` +
      `<ellipse cx="1" cy="-1.5" rx="0.35" ry="0.18" fill="${wing1}" opacity="0.6"/>` +
      `<ellipse cx="0.7" cy="-1.6" rx="0.25" ry="0.12" fill="${wing3}" opacity="0.5"/>` +
      `</g>`
    );
  }
  // Two butterflies
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="-0.5" cy="-0.8" rx="0.5" ry="0.25" fill="${wing1}" opacity="0.7"/>` +
    `<ellipse cx="-1" cy="-1" rx="0.4" ry="0.2" fill="${wing2}" opacity="0.6"/>` +
    `<ellipse cx="0.8" cy="-1.2" rx="0.45" ry="0.22" fill="${wing3}" opacity="0.65"/>` +
    `<ellipse cx="0.4" cy="-1.3" rx="0.35" ry="0.17" fill="${wing1}" opacity="0.55"/>` +
    `</g>`
  );
}

export function svgUmbrella(x: number, y: number, c: AssetColors, v: number): string {
  // Colorful umbrella
  const colors = [c.parasolRed, c.parasolBlue, c.parasolYellow];
  const color = colors[v] || c.parasolRed;
  const handle = c.trunk;
  if (v === 2) {
    // Open umbrella on ground
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M-2,0 Q0,-2 2,0" fill="${color}" opacity="0.8"/>` +
      `<line x1="0" y1="0" x2="0" y2="0.8" stroke="${handle}" stroke-width="0.2"/>` +
      `<path d="M0,0.8 Q0.3,1 0.2,1.3" stroke="${handle}" fill="none" stroke-width="0.15"/>` +
      `</g>`
    );
  }
  // Closed umbrella leaning
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="-0.3" y1="1" x2="0.5" y2="-2.5" stroke="${handle}" stroke-width="0.2"/>` +
    `<polygon points="0.4,-2.5 0.7,-2 0.6,-2.5 0.3,-2.5" fill="${color}"/>` +
    `<path d="M0.4,-2.5 L0.5,-1 L0.2,-1 Z" fill="${color}" opacity="0.8"/>` +
    `<path d="M-0.3,1 Q-0.5,1.2 -0.3,1.4" stroke="${handle}" fill="none" stroke-width="0.12"/>` +
    `</g>`
  );
}
