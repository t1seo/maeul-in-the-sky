import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function svgWhale(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Diving variant — tail up, no spout
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.5" rx="3" ry="1.5" fill="${c.whale}" transform="rotate(-15)"/>` +
      `<ellipse cx="0" cy="0" rx="2" ry="0.8" fill="${c.whaleBelly}" opacity="0.5"/>` +
      `<path d="M2.5,-1.5 Q4,-3 5,-3.5 M2.5,-1.5 Q4,-2 5,-1" stroke="${c.whale}" fill="none" stroke-width="0.8"/>` +
      `<ellipse cx="5" cy="-3.5" rx="1" ry="0.4" fill="${c.whale}"/>` +
      `<ellipse cx="5" cy="-1" rx="1" ry="0.4" fill="${c.whale}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Baby whale variant — smaller, rounder
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.8" rx="2.2" ry="1.3" fill="${c.whale}"/>` +
      `<ellipse cx="0" cy="-0.3" rx="1.5" ry="0.6" fill="${c.whaleBelly}" opacity="0.5"/>` +
      `<path d="M2,-0.8 Q3,-0.8 3.5,-1.8 M2,-0.8 Q3,-0.8 3.5,0.2" stroke="${c.whale}" fill="none" stroke-width="0.7"/>` +
      `<ellipse cx="3.5" cy="-1.8" rx="0.8" ry="0.3" fill="${c.whale}"/>` +
      `<ellipse cx="3.5" cy="0.2" rx="0.8" ry="0.3" fill="${c.whale}"/>` +
      `<circle cx="-1.2" cy="-1" r="0.3" fill="#fff"/>` +
      `<circle cx="-1.2" cy="-1" r="0.15" fill="#222"/>` +
      `</g>`
    );
  }
  // Redesigned: rounder body, HORIZONTAL tail fluke, water spout
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-1.2" rx="3.5" ry="2" fill="${c.whale}"/>` +
    `<ellipse cx="0" cy="-0.5" rx="2.5" ry="1" fill="${c.whaleBelly}" opacity="0.5"/>` +
    // Horizontal tail fluke (key identifier)
    `<path d="M3,-1.2 Q4.5,-1.2 5,-2.5 M3,-1.2 Q4.5,-1.2 5,0" stroke="${c.whale}" fill="none" stroke-width="1"/>` +
    `<ellipse cx="5" cy="-2.5" rx="1.2" ry="0.4" fill="${c.whale}"/>` +
    `<ellipse cx="5" cy="0" rx="1.2" ry="0.4" fill="${c.whale}"/>` +
    // Eye
    `<circle cx="-2" cy="-1.5" r="0.4" fill="#fff"/>` +
    `<circle cx="-2" cy="-1.5" r="0.2" fill="#222"/>` +
    // Spout (3 diverging lines)
    `<line x1="-0.5" y1="-3.2" x2="-1.2" y2="-4.5" stroke="${c.waterLight}" stroke-width="0.3" opacity="0.6"/>` +
    `<line x1="-0.5" y1="-3.2" x2="-0.5" y2="-4.8" stroke="${c.waterLight}" stroke-width="0.3" opacity="0.6"/>` +
    `<line x1="-0.5" y1="-3.2" x2="0.2" y2="-4.5" stroke="${c.waterLight}" stroke-width="0.3" opacity="0.6"/>` +
    `</g>`
  );
}

export function svgFish(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Pair variant — two fish
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="-1" cy="-0.5" rx="1.3" ry="0.5" fill="${c.fish}"/>` +
      `<polygon points="0.3,-0.5 1,-1.3 1,0.3" fill="${c.fish}"/>` +
      `<ellipse cx="1" cy="-1.5" rx="1.1" ry="0.4" fill="${c.fish}" opacity="0.8"/>` +
      `<polygon points="2.1,-1.5 2.6,-2.1 2.6,-0.9" fill="${c.fish}" opacity="0.8"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Striped large variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-1" rx="2.2" ry="0.9" fill="${c.fish}"/>` +
      `<polygon points="2.2,-1 3.2,-2.2 3.2,0.2" fill="${c.fish}"/>` +
      `<line x1="-0.5" y1="-0.3" x2="-0.5" y2="-1.7" stroke="${c.whaleBelly}" stroke-width="0.3" opacity="0.4"/>` +
      `<line x1="0.5" y1="-0.3" x2="0.5" y2="-1.7" stroke="${c.whaleBelly}" stroke-width="0.3" opacity="0.4"/>` +
      `<circle cx="-1.3" cy="-1.1" r="0.3" fill="#fff"/>` +
      `</g>`
    );
  }
  // Redesigned: slender body, VERTICAL tail fin
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.8" rx="1.8" ry="0.7" fill="${c.fish}"/>` +
    // Vertical tail fin (key differentiator from whale)
    `<polygon points="1.8,-0.8 2.8,-2 2.8,0.4" fill="${c.fish}"/>` +
    `<circle cx="-1" cy="-0.9" r="0.25" fill="#fff"/>` +
    `</g>`
  );
}

export function svgFishSchool(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="-1" cy="-0.5" rx="1" ry="0.4" fill="${c.fish}" opacity="0.8"/>` +
    `<ellipse cx="1" cy="-1.2" rx="0.8" ry="0.35" fill="${c.fish}" opacity="0.7"/>` +
    `<ellipse cx="0.5" cy="0" rx="0.9" ry="0.4" fill="${c.fish}" opacity="0.6"/>` +
    `</g>`
  );
}

export function svgBoat(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Sailboat variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<polygon points="-3,0 -2,-1.5 3,-1.5 3.5,0" fill="${c.boat}"/>` +
      `<line x1="0" y1="-1.5" x2="0" y2="-6" stroke="${c.trunk}" stroke-width="0.4"/>` +
      `<polygon points="0,-5.5 0,-2 2.5,-2.5" fill="${c.sail}" opacity="0.9"/>` +
      `<polygon points="0,-5 0,-2.5 -2,-3" fill="${c.sail}" opacity="0.7"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Fishing boat variant (no sail, fishing rod)
    return (
      `<g transform="translate(${x},${y})">` +
      `<polygon points="-2.5,0 -1.5,-1 2.5,-1 3,0" fill="${c.boat}"/>` +
      `<line x1="2" y1="-1" x2="3.5" y2="-3" stroke="${c.trunk}" stroke-width="0.3"/>` +
      `<line x1="3.5" y1="-3" x2="4" y2="-1.5" stroke="${c.waterLight}" stroke-width="0.2" opacity="0.6"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-3,0 -2,-1.5 3,-1.5 3.5,0" fill="${c.boat}"/>` +
    `<line x1="0" y1="-1.5" x2="0" y2="-6" stroke="${c.trunk}" stroke-width="0.4"/>` +
    `<polygon points="0,-5.5 0,-2 2.5,-2.5" fill="${c.sail}" opacity="0.9"/>` +
    `</g>`
  );
}

export function svgSeagull(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Sitting variant — perched on water
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-1" rx="1.2" ry="0.7" fill="${c.seagull}"/>` +
      `<circle cx="-0.8" cy="-1.5" r="0.4" fill="${c.seagull}"/>` +
      `<polygon points="-1.2,-1.4 -1.7,-1.3 -1.2,-1.2" fill="${c.wheat}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Pair variant — two flying
    return (
      `<g transform="translate(${x},${y})">` +
      `<g>` +
      `<path d="M-1.5,-3 Q-0.5,-4.5 0.5,-3" stroke="${c.seagull}" fill="none" stroke-width="0.5"/>` +
      `<path d="M1,-4.5 Q2,-5.5 3,-4.5" stroke="${c.seagull}" fill="none" stroke-width="0.4" opacity="0.7"/>` +
      motionMarkup(
        `<animateMotion path="M0,0 C2,-1 3,0 2,1 C1,2 -1,1 -2,0 C-3,-1 -1,-2 0,0" dur="10s" repeatCount="indefinite"/>`,
      ) +
      `</g>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<g>` +
    `<path d="M-2,-3 Q-1,-4.5 0,-3 Q1,-4.5 2,-3" stroke="${c.seagull}" fill="none" stroke-width="0.6"/>` +
    `<circle cx="0" cy="-3" r="0.4" fill="${c.seagull}"/>` +
    motionMarkup(
      `<animateMotion path="M0,0 C2,-1 3,0 2,1 C1,2 -1,1 -2,0 C-3,-1 -1,-2 0,0" dur="10s" repeatCount="indefinite"/>`,
    ) +
    `</g>` +
    `</g>`
  );
}

export function svgDock(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-3" y="-0.5" width="6" height="1" fill="${c.dock}" rx="0.2"/>` +
    `<line x1="-2" y1="0.5" x2="-2" y2="1.5" stroke="${c.dock}" stroke-width="0.5"/>` +
    `<line x1="2" y1="0.5" x2="2" y2="1.5" stroke="${c.dock}" stroke-width="0.5"/>` +
    `</g>`
  );
}

export function svgWaves(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-3,-0.5 Q-1.5,-1.5 0,-0.5 Q1.5,0.5 3,-0.5" stroke="${c.waterLight}" fill="none" stroke-width="0.4" opacity="0.5">` +
    motionMarkup(
      `<animate attributeName="d" values="M-3,-0.5 Q-1.5,-1.5 0,-0.5 Q1.5,0.5 3,-0.5;M-3,-0.3 Q-1.5,-1.2 0,-0.8 Q1.5,0.2 3,-0.3;M-3,-0.5 Q-1.5,-1.5 0,-0.5 Q1.5,0.5 3,-0.5" dur="4s" repeatCount="indefinite"/>`,
    ) +
    `</path>` +
    `</g>`
  );
}

export function svgKelp(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M0,0 Q-1,-2 0,-4 Q1,-6 0,-7" stroke="${c.fern}" fill="none" stroke-width="0.6" opacity="0.7"/>` +
    `<path d="M1,0 Q2,-1.5 1,-3.5 Q0,-5 1,-6" stroke="${c.fern}" fill="none" stroke-width="0.5" opacity="0.6"/>` +
    `</g>`
  );
}

export function svgCoral(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M0,0 Q-1,-2 -2,-3 M0,0 Q0,-2.5 -0.5,-4 M0,0 Q1,-2 2,-3" stroke="${c.coral}" fill="none" stroke-width="0.8"/>` +
    `<circle cx="-2" cy="-3" r="0.5" fill="${c.coral}"/>` +
    `<circle cx="-0.5" cy="-4" r="0.5" fill="${c.coral}"/>` +
    `<circle cx="2" cy="-3" r="0.5" fill="${c.coral}"/>` +
    `</g>`
  );
}

export function svgJellyfish(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-2" rx="2" ry="1.5" fill="${c.jellyfish}" opacity="0.7">` +
    motionMarkup(
      `<animate attributeName="cy" values="-2;-3;-2" dur="3s" repeatCount="indefinite"/>`,
    ) +
    `</ellipse>` +
    `<path d="M-1.5,-0.5 Q-1.2,-1.5 -0.8,0" stroke="${c.jellyfish}" fill="none" stroke-width="0.3" opacity="0.5"/>` +
    `<path d="M-0.3,-0.5 Q0,-1.5 0.3,0" stroke="${c.jellyfish}" fill="none" stroke-width="0.3" opacity="0.5"/>` +
    `<path d="M0.8,-0.5 Q1.2,-1.5 1.5,0" stroke="${c.jellyfish}" fill="none" stroke-width="0.3" opacity="0.5"/>` +
    `</g>`
  );
}
