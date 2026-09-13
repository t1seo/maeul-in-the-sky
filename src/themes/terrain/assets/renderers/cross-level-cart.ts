import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function svgCart(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-2" y="-2" width="3.5" height="2" fill="${c.cart}"/>` +
    `<circle cx="-1.5" cy="0" r="0.8" fill="${c.trunk}" stroke="${c.fence}" stroke-width="0.2"/>` +
    `<circle cx="1" cy="0" r="0.8" fill="${c.trunk}" stroke="${c.fence}" stroke-width="0.2"/>` +
    `<line x1="2" y1="-1" x2="3.5" y2="-0.5" stroke="${c.trunk}" stroke-width="0.4"/>` +
    `</g>`
  );
}

export function svgBarrel(x: number, y: number, c: AssetColors, _v: number): string {
  // Barrel with metal bands and wood texture
  return (
    `<g transform="translate(${x},${y})">` +
    // Base shadow
    `<ellipse cx="0" cy="-0.1" rx="1.4" ry="0.6" fill="${c.shadow}" opacity="0.2"/>` +
    // Bottom rim
    `<ellipse cx="0" cy="-0.3" rx="1.3" ry="0.55" fill="${c.barrel}"/>` +
    // Main body
    `<rect x="-1.3" y="-2.6" width="2.6" height="2.3" fill="${c.barrel}" rx="0.2"/>` +
    // Wood grain lines
    `<line x1="-0.6" y1="-2.5" x2="-0.6" y2="-0.4" stroke="${c.trunk}" stroke-width="0.1" opacity="0.3"/>` +
    `<line x1="0.2" y1="-2.5" x2="0.2" y2="-0.4" stroke="${c.trunk}" stroke-width="0.1" opacity="0.3"/>` +
    `<line x1="0.9" y1="-2.5" x2="0.9" y2="-0.4" stroke="${c.trunk}" stroke-width="0.1" opacity="0.25"/>` +
    // Metal bands
    `<ellipse cx="0" cy="-0.6" rx="1.35" ry="0.25" fill="none" stroke="${c.shadow}" stroke-width="0.25"/>` +
    `<ellipse cx="0" cy="-1.5" rx="1.35" ry="0.25" fill="none" stroke="${c.shadow}" stroke-width="0.25"/>` +
    `<ellipse cx="0" cy="-2.4" rx="1.35" ry="0.25" fill="none" stroke="${c.shadow}" stroke-width="0.25"/>` +
    // Top rim
    `<ellipse cx="0" cy="-2.6" rx="1.3" ry="0.55" fill="${c.cart}"/>` +
    `<ellipse cx="0" cy="-2.6" rx="0.9" ry="0.35" fill="${c.barrel}" opacity="0.7"/>` +
    `</g>`
  );
}

export function svgTorch(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Ground stake variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0.5" x2="0" y2="-3" stroke="${c.torch}" stroke-width="0.4"/>` +
      `<ellipse cx="0" cy="-3.5" rx="0.6" ry="0.8" fill="${c.torchFlame}" opacity="0.8"/>` +
      `<ellipse cx="0" cy="-3.7" rx="0.3" ry="0.5" fill="#ffdd44" opacity="0.9"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Streetlamp variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0" x2="0" y2="-5" stroke="${c.torch}" stroke-width="0.4"/>` +
      `<path d="M0,-5 Q1,-5.5 1,-5" stroke="${c.torch}" fill="none" stroke-width="0.3"/>` +
      `<rect x="0.5" y="-6" width="1" height="0.8" fill="${c.lantern}"/>` +
      `<rect x="0.65" y="-5.8" width="0.7" height="0.4" fill="${c.lanternGlow}" opacity="0.8"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0" x2="0" y2="-4" stroke="${c.torch}" stroke-width="0.5"/>` +
    `<ellipse cx="0" cy="-4.5" rx="0.8" ry="1" fill="${c.torchFlame}" opacity="0.8"/>` +
    `<ellipse cx="0" cy="-4.8" rx="0.4" ry="0.6" fill="#ffdd44" opacity="0.9"/>` +
    `</g>`
  );
}

export function svgFlag(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Blue pennant variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0" x2="0" y2="-8" stroke="${c.trunk}" stroke-width="0.4"/>` +
      `<polygon points="0,-8 2.5,-6.5 0,-5" fill="#4477bb"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Banner variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0" x2="0" y2="-8" stroke="${c.trunk}" stroke-width="0.4"/>` +
      `<line x1="0" y1="-8" x2="2.5" y2="-8" stroke="${c.trunk}" stroke-width="0.3"/>` +
      `<rect x="0" y="-8" width="2.5" height="3" fill="${c.flag}" opacity="0.9"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0" x2="0" y2="-8" stroke="${c.trunk}" stroke-width="0.4"/>` +
    `<polygon points="0,-8 3.5,-7 0,-5.5" fill="${c.flag}"/>` +
    `</g>`
  );
}

export function svgCobblePath(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Lined variant — neat row
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="-2" cy="-0.3" rx="0.8" ry="0.35" fill="${c.cobble}" opacity="0.6"/>` +
      `<ellipse cx="-0.5" cy="-0.3" rx="0.7" ry="0.3" fill="${c.cobble}" opacity="0.55"/>` +
      `<ellipse cx="1" cy="-0.3" rx="0.8" ry="0.35" fill="${c.cobble}" opacity="0.5"/>` +
      `<ellipse cx="2.5" cy="-0.3" rx="0.7" ry="0.3" fill="${c.cobble}" opacity="0.5"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Crossroads variant — X pattern
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.3" rx="0.8" ry="0.35" fill="${c.cobble}" opacity="0.6"/>` +
      `<ellipse cx="-1.5" cy="-0.8" rx="0.7" ry="0.3" fill="${c.cobble}" opacity="0.5"/>` +
      `<ellipse cx="1.5" cy="-0.8" rx="0.7" ry="0.3" fill="${c.cobble}" opacity="0.5"/>` +
      `<ellipse cx="-1.5" cy="0.2" rx="0.7" ry="0.3" fill="${c.cobble}" opacity="0.5"/>` +
      `<ellipse cx="1.5" cy="0.2" rx="0.7" ry="0.3" fill="${c.cobble}" opacity="0.5"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="-1" cy="-0.3" rx="1" ry="0.4" fill="${c.cobble}" opacity="0.6"/>` +
    `<ellipse cx="1" cy="0" rx="0.8" ry="0.35" fill="${c.cobble}" opacity="0.5"/>` +
    `<ellipse cx="0" cy="-0.8" rx="0.7" ry="0.3" fill="${c.cobble}" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgSmoke(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<circle cx="0" cy="-5" r="1" fill="${c.smoke}">` +
    motionMarkup(
      `<animate attributeName="cy" values="-5;-8;-5" dur="4s" repeatCount="indefinite"/>`,
    ) +
    motionMarkup(
      `<animate attributeName="opacity" values="0.5;0.1;0.5" dur="4s" repeatCount="indefinite"/>`,
    ) +
    `</circle>` +
    `<circle cx="0.5" cy="-6" r="0.7" fill="${c.smoke}">` +
    motionMarkup(
      `<animate attributeName="cy" values="-6;-9;-6" dur="3.5s" repeatCount="indefinite"/>`,
    ) +
    motionMarkup(
      `<animate attributeName="opacity" values="0.4;0.08;0.4" dur="3.5s" repeatCount="indefinite"/>`,
    ) +
    `</circle>` +
    `</g>`
  );
}

export function svgSignpost(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0" x2="0" y2="-5" stroke="${c.signpost}" stroke-width="0.5"/>` +
    `<rect x="0" y="-5" width="2.5" height="0.8" fill="${c.signpost}" rx="0.1"/>` +
    `<rect x="-2.5" y="-4" width="2.5" height="0.8" fill="${c.signpost}" rx="0.1"/>` +
    `</g>`
  );
}

export function svgLantern(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0" x2="0" y2="-4" stroke="${c.lantern}" stroke-width="0.4"/>` +
    `<rect x="-0.5" y="-5" width="1" height="1" fill="${c.lantern}"/>` +
    `<rect x="-0.3" y="-4.8" width="0.6" height="0.6" fill="${c.lanternGlow}" opacity="0.8"/>` +
    `<circle cx="0" cy="-4.5" r="1" fill="${c.lanternGlow}" opacity="0.15"/>` +
    `</g>`
  );
}

export function svgWoodpile(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-2" y="-1.5" width="4" height="1.5" fill="${c.woodpile}"/>` +
    `<rect x="-1.8" y="-2.5" width="3.6" height="1" fill="${c.woodpile}"/>` +
    `<ellipse cx="-2" cy="-0.75" rx="0.4" ry="0.75" fill="${c.trunk}"/>` +
    `<ellipse cx="2" cy="-0.75" rx="0.4" ry="0.75" fill="${c.trunk}"/>` +
    `</g>`
  );
}

export function svgPuddle(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.2" rx="2" ry="0.7" fill="${c.puddle}" opacity="0.4"/>` +
    `<ellipse cx="0.3" cy="-0.3" rx="1.2" ry="0.4" fill="${c.puddle}" opacity="0.25"/>` +
    `</g>`
  );
}

export function svgCampfire(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.2" rx="1.5" ry="0.5" fill="${c.rock}" opacity="0.5"/>` +
    `<line x1="-1" y1="-0.3" x2="0" y2="-0.8" stroke="${c.campfire}" stroke-width="0.4"/>` +
    `<line x1="1" y1="-0.3" x2="0" y2="-0.8" stroke="${c.campfire}" stroke-width="0.4"/>` +
    `<ellipse cx="0" cy="-1.8" rx="0.8" ry="1.2" fill="${c.campfireFlame}" opacity="0.8">` +
    motionMarkup(
      `<animate attributeName="opacity" values="0.8;0.5;0.8" dur="1.5s" repeatCount="indefinite"/>`,
    ) +
    `</ellipse>` +
    `<ellipse cx="0" cy="-2" rx="0.4" ry="0.7" fill="${c.lanternGlow}" opacity="0.9"/>` +
    `</g>`
  );
}
