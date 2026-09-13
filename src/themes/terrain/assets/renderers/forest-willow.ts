import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function svgWillow(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Short wide variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0" x2="0" y2="-3" stroke="${c.trunk}" stroke-width="0.9"/>` +
      `<circle cx="0" cy="-4" r="2.5" fill="${c.willow}"/>` +
      `<path d="M-2.5,-3 Q-4,-1 -4,0" stroke="${c.willow}" fill="none" stroke-width="0.6" opacity="0.7"/>` +
      `<path d="M2.5,-3 Q4,-1 4,0" stroke="${c.willow}" fill="none" stroke-width="0.6" opacity="0.7"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Gnarled trunk variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M0,0 Q-1,-2.5 0.5,-5" stroke="${c.trunk}" fill="none" stroke-width="1"/>` +
      `<circle cx="0.5" cy="-6" r="1.8" fill="${c.willow}"/>` +
      `<path d="M-1,-5 Q-2.5,-3 -3,-1" stroke="${c.willow}" fill="none" stroke-width="0.5" opacity="0.7"/>` +
      `<path d="M2,-5 Q2.5,-3 2,-1" stroke="${c.willow}" fill="none" stroke-width="0.5" opacity="0.7"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0" x2="0" y2="-5" stroke="${c.trunk}" stroke-width="0.8"/>` +
    `<circle cx="0" cy="-6" r="2" fill="${c.willow}"/>` +
    `<path d="M-2,-5 Q-3,-3 -3,-1" stroke="${c.willow}" fill="none" stroke-width="0.6" opacity="0.7"/>` +
    `<path d="M2,-5 Q3,-3 3,-1" stroke="${c.willow}" fill="none" stroke-width="0.6" opacity="0.7"/>` +
    `<path d="M-1,-5.5 Q-2,-3.5 -2.5,-2" stroke="${c.willow}" fill="none" stroke-width="0.4" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgPalm(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Curved trunk variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M0,0 Q-2,-4 -1,-8" stroke="${c.trunk}" fill="none" stroke-width="0.7"/>` +
      `<path d="M-1,-8 Q2,-9 3,-7" stroke="${c.palm}" fill="none" stroke-width="0.8"/>` +
      `<path d="M-1,-8 Q-3,-9 -4,-7" stroke="${c.palm}" fill="none" stroke-width="0.8"/>` +
      `<path d="M-1,-8 Q1,-10 2,-9" stroke="${c.palm}" fill="none" stroke-width="0.6"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Pair variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M-1.5,0 Q-2,-3 -1,-6" stroke="${c.trunk}" fill="none" stroke-width="0.6"/>` +
      `<path d="M-1,-6 Q1,-7 2,-5.5" stroke="${c.palm}" fill="none" stroke-width="0.7"/>` +
      `<path d="M-1,-6 Q-3,-7 -3.5,-5.5" stroke="${c.palm}" fill="none" stroke-width="0.7"/>` +
      `<path d="M1.5,0 Q1,-3 2,-7" stroke="${c.trunk}" fill="none" stroke-width="0.6"/>` +
      `<path d="M2,-7 Q4,-8 4.5,-6.5" stroke="${c.palm}" fill="none" stroke-width="0.7"/>` +
      `<path d="M2,-7 Q0,-8 -0.5,-6.5" stroke="${c.palm}" fill="none" stroke-width="0.7"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M0,0 Q-0.5,-4 0.5,-8" stroke="${c.trunk}" fill="none" stroke-width="0.7"/>` +
    `<path d="M0.5,-8 Q3,-9 4,-7" stroke="${c.palm}" fill="none" stroke-width="0.8"/>` +
    `<path d="M0.5,-8 Q-2,-9 -3,-7" stroke="${c.palm}" fill="none" stroke-width="0.8"/>` +
    `<path d="M0.5,-8 Q2,-10 3,-9" stroke="${c.palm}" fill="none" stroke-width="0.6"/>` +
    `<path d="M0.5,-8 Q-1,-10 -2,-9" stroke="${c.palm}" fill="none" stroke-width="0.6"/>` +
    `</g>`
  );
}

export function svgBird(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Perched variant — sitting on invisible branch
    return (
      `<g transform="translate(${x},${y})">` +
      `<circle cx="0" cy="-4" r="0.6" fill="${c.bird}"/>` +
      `<ellipse cx="0" cy="-3.5" rx="0.5" ry="0.8" fill="${c.bird}"/>` +
      `<polygon points="-0.6,-4 -1,-3.9 -0.6,-3.8" fill="${c.wheat}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Pair variant — two V-shapes
    return (
      `<g transform="translate(${x},${y})">` +
      `<g>` +
      `<path d="M-1.5,-4 Q0,-5.5 1.5,-4" stroke="${c.bird}" fill="none" stroke-width="0.5"/>` +
      `<path d="M0,-5.5 Q1.5,-7 3,-5.5" stroke="${c.bird}" fill="none" stroke-width="0.4" opacity="0.7"/>` +
      motionMarkup(
        `<animateTransform attributeName="transform" type="translate" values="0,0;4,-1;0,0" dur="12s" repeatCount="indefinite"/>`,
      ) +
      `</g>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<g>` +
    `<path d="M-1.5,-4 Q0,-5.5 1.5,-4" stroke="${c.bird}" fill="none" stroke-width="0.5"/>` +
    motionMarkup(
      `<animateTransform attributeName="transform" type="translate" values="0,0;4,-1;0,0" dur="12s" repeatCount="indefinite"/>`,
    ) +
    `</g>` +
    `</g>`
  );
}

export function svgOwl(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-2" rx="1.2" ry="1.5" fill="${c.owl}"/>` +
    `<circle cx="-0.4" cy="-2.5" r="0.5" fill="#fff"/>` +
    `<circle cx="0.4" cy="-2.5" r="0.5" fill="#fff"/>` +
    `<circle cx="-0.4" cy="-2.5" r="0.2" fill="#222"/>` +
    `<circle cx="0.4" cy="-2.5" r="0.2" fill="#222"/>` +
    `<polygon points="0,-2.1 -0.2,-1.8 0.2,-1.8" fill="${c.wheat}"/>` +
    `</g>`
  );
}

export function svgSquirrel(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.8" rx="0.8" ry="0.6" fill="${c.squirrel}"/>` +
    `<circle cx="-0.6" cy="-1.3" r="0.4" fill="${c.squirrel}"/>` +
    `<circle cx="-0.7" cy="-1.4" r="0.1" fill="#222"/>` +
    `<path d="M0.8,-0.8 Q1.5,-1.5 1.2,-2.2" stroke="${c.squirrel}" fill="none" stroke-width="0.5"/>` +
    `</g>`
  );
}

export function svgMoss(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="-1" cy="-0.2" rx="1.5" ry="0.5" fill="${c.moss}" opacity="0.7"/>` +
    `<ellipse cx="1" cy="-0.3" rx="1.2" ry="0.4" fill="${c.moss}" opacity="0.6"/>` +
    `<ellipse cx="0" cy="-0.1" rx="0.8" ry="0.3" fill="${c.moss}" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgFern(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M0,0 Q-2,-2 -3,-3.5" stroke="${c.fern}" fill="none" stroke-width="0.4"/>` +
    `<path d="M0,0 Q0,-2.5 0,-4" stroke="${c.fern}" fill="none" stroke-width="0.4"/>` +
    `<path d="M0,0 Q2,-2 3,-3.5" stroke="${c.fern}" fill="none" stroke-width="0.4"/>` +
    `<circle cx="-1" cy="-1.5" r="0.3" fill="${c.fern}" opacity="0.6"/>` +
    `<circle cx="1" cy="-1.5" r="0.3" fill="${c.fern}" opacity="0.6"/>` +
    `<circle cx="0" cy="-2.5" r="0.3" fill="${c.fern}" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgDeadTree(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0" x2="0" y2="-6" stroke="${c.deadTree}" stroke-width="0.8"/>` +
    `<line x1="0" y1="-4" x2="-2" y2="-5.5" stroke="${c.deadTree}" stroke-width="0.4"/>` +
    `<line x1="0" y1="-3" x2="1.5" y2="-4.5" stroke="${c.deadTree}" stroke-width="0.4"/>` +
    `<line x1="0" y1="-5" x2="-1" y2="-6.5" stroke="${c.deadTree}" stroke-width="0.3"/>` +
    `</g>`
  );
}

export function svgLog(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-3" y="-1" width="6" height="1" fill="${c.log}" rx="0.5"/>` +
    `<ellipse cx="-3" cy="-0.5" rx="0.5" ry="0.5" fill="${c.trunk}"/>` +
    `<ellipse cx="3" cy="-0.5" rx="0.5" ry="0.5" fill="${c.trunk}"/>` +
    `</g>`
  );
}

export function svgBerryBush(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-1.5" rx="2.2" ry="1.5" fill="${c.berryBush}"/>` +
    `<circle cx="-0.8" cy="-1.8" r="0.3" fill="${c.berry}"/>` +
    `<circle cx="0.5" cy="-2" r="0.3" fill="${c.berry}"/>` +
    `<circle cx="0" cy="-1.2" r="0.25" fill="${c.berry}"/>` +
    `<circle cx="1.2" cy="-1.5" r="0.25" fill="${c.berry}"/>` +
    `</g>`
  );
}

export function svgSpider(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="-2.5" y1="-4" x2="2.5" y2="-1" stroke="${c.spiderWeb}" fill="none" stroke-width="0.15"/>` +
    `<line x1="-2.5" y1="-1" x2="2.5" y2="-4" stroke="${c.spiderWeb}" fill="none" stroke-width="0.15"/>` +
    `<line x1="0" y1="-5" x2="0" y2="0" stroke="${c.spiderWeb}" fill="none" stroke-width="0.15"/>` +
    `<path d="M-1.5,-1.5 Q0,-2 1.5,-1.5" stroke="${c.spiderWeb}" fill="none" stroke-width="0.12"/>` +
    `<path d="M-1,-3 Q0,-3.5 1,-3" stroke="${c.spiderWeb}" fill="none" stroke-width="0.12"/>` +
    `<circle cx="0" cy="-2.5" r="0.4" fill="${c.bird}"/>` +
    `</g>`
  );
}
