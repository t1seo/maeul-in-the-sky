import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function svgRock(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Rounded boulder with highlight
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-1" rx="2" ry="1.3" fill="${c.rock}"/>` +
      `<ellipse cx="-0.4" cy="-1.4" rx="1" ry="0.5" fill="${c.boulder}" opacity="0.6"/>` +
      `<ellipse cx="-0.6" cy="-1.2" rx="0.3" ry="0.15" fill="${c.snowCap}" opacity="0.3"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Stacked rocks with shadow
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.2" rx="2.5" ry="0.8" fill="${c.shadow}" opacity="0.2"/>` +
      `<ellipse cx="0" cy="-0.5" rx="2.4" ry="0.7" fill="${c.rock}"/>` +
      `<ellipse cx="0.4" cy="-1.2" rx="1.6" ry="0.5" fill="${c.boulder}"/>` +
      `<ellipse cx="0.2" cy="-1.8" rx="0.8" ry="0.3" fill="${c.rock}"/>` +
      `<ellipse cx="-0.3" cy="-1.5" rx="0.2" ry="0.1" fill="${c.snowCap}" opacity="0.25"/>` +
      `</g>`
    );
  }
  // Default: angular rock with texture lines
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-1.5,0 -1.2,-1.8 -0.2,-2.5 0.8,-2.2 1.5,-1 1.2,0" fill="${c.rock}"/>` +
    `<polygon points="-0.8,-0.5 -0.5,-1.6 0.3,-1.8 0.8,-1 0.5,-0.3" fill="${c.boulder}" opacity="0.5"/>` +
    `<line x1="-0.5" y1="-1.2" x2="0.3" y2="-1.5" stroke="${c.shadow}" stroke-width="0.15" opacity="0.3"/>` +
    `</g>`
  );
}

export function svgBoulder(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-1.5" rx="2.5" ry="1.8" fill="${c.boulder}"/>` +
    `<ellipse cx="-0.5" cy="-2" rx="1.5" ry="1" fill="${c.rock}" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgFlower(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Yellow flower variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0" x2="0" y2="-2.5" stroke="${c.pine}" stroke-width="0.3"/>` +
      `<circle cx="0" cy="-3" r="1" fill="${c.flowerCenter}"/>` +
      `<circle cx="0" cy="-3" r="0.4" fill="${c.flower}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Purple cluster variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="-0.8" y1="0" x2="-0.8" y2="-2" stroke="${c.pine}" stroke-width="0.25"/>` +
      `<line x1="0.8" y1="0" x2="0.8" y2="-2.2" stroke="${c.pine}" stroke-width="0.25"/>` +
      `<circle cx="-0.8" cy="-2.5" r="0.7" fill="${c.wildflower}"/>` +
      `<circle cx="0.8" cy="-2.7" r="0.7" fill="${c.wildflower}"/>` +
      `<circle cx="0" cy="-2.3" r="0.5" fill="${c.wildflower}" opacity="0.8"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0" x2="0" y2="-2.5" stroke="${c.pine}" stroke-width="0.3"/>` +
    `<circle cx="0" cy="-3" r="1" fill="${c.flower}"/>` +
    `<circle cx="0" cy="-3" r="0.4" fill="${c.flowerCenter}"/>` +
    `</g>`
  );
}

export function svgBush(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Wide/flat multi-layer variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.6" rx="3.2" ry="1.2" fill="${c.bushDark}"/>` +
      `<ellipse cx="-0.8" cy="-1" rx="1.8" ry="0.9" fill="${c.bush}"/>` +
      `<ellipse cx="0.9" cy="-0.9" rx="1.6" ry="0.8" fill="${c.bush}"/>` +
      `<ellipse cx="0" cy="-1.2" rx="1.2" ry="0.6" fill="${c.leafLight}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Flowering variant with depth
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-1" rx="2.3" ry="1.6" fill="${c.bushDark}"/>` +
      `<ellipse cx="-0.5" cy="-1.5" rx="1.5" ry="1.1" fill="${c.bush}"/>` +
      `<ellipse cx="0.6" cy="-1.3" rx="1.3" ry="1" fill="${c.bush}"/>` +
      `<ellipse cx="0" cy="-1.8" rx="0.9" ry="0.6" fill="${c.leafLight}"/>` +
      `<circle cx="-0.9" cy="-2.1" r="0.35" fill="${c.flower}"/>` +
      `<circle cx="0.4" cy="-2.4" r="0.3" fill="${c.flowerAlt}"/>` +
      `<circle cx="0.9" cy="-1.8" r="0.28" fill="${c.flower}"/>` +
      `<circle cx="-0.3" cy="-2.6" r="0.25" fill="${c.flowerAlt}"/>` +
      `</g>`
    );
  }
  // Default: layered round bush
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-1" rx="2.2" ry="1.6" fill="${c.bushDark}"/>` +
    `<ellipse cx="-0.4" cy="-1.5" rx="1.4" ry="1" fill="${c.bush}"/>` +
    `<ellipse cx="0.5" cy="-1.3" rx="1.2" ry="0.9" fill="${c.bush}"/>` +
    `<ellipse cx="0" cy="-1.8" rx="0.8" ry="0.5" fill="${c.leafLight}"/>` +
    `</g>`
  );
}

export function svgDriftwood(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-3,-0.3 Q-1,-1 1,-0.5 Q2.5,-0.2 3.5,0" stroke="${c.driftwood}" fill="none" stroke-width="0.8" stroke-linecap="round"/>` +
    `<path d="M1,-0.5 Q1.5,-1.5 2,-1.8" stroke="${c.driftwood}" fill="none" stroke-width="0.5"/>` +
    `</g>`
  );
}

export function svgSandcastle(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-2" y="-2" width="4" height="2" fill="${c.sandcastle}"/>` +
    `<rect x="-1" y="-3.5" width="2" height="1.8" fill="${c.sandcastle}"/>` +
    `<rect x="-0.3" y="-4.5" width="0.6" height="1.2" fill="${c.sandcastle}"/>` +
    `<line x1="0" y1="-4.5" x2="0.8" y2="-4.5" stroke="${c.buoy}" stroke-width="0.2"/>` +
    `</g>`
  );
}

export function svgTidePools(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="-1" cy="-0.3" rx="1.5" ry="0.6" fill="${c.tidePools}" opacity="0.5"/>` +
    `<ellipse cx="1.2" cy="-0.5" rx="1" ry="0.4" fill="${c.tidePools}" opacity="0.4"/>` +
    `<circle cx="-1.5" cy="-0.5" r="0.25" fill="${c.rock}"/>` +
    `<circle cx="0.8" cy="-0.3" r="0.2" fill="${c.rock}"/>` +
    `</g>`
  );
}

export function svgHeron(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0" x2="0" y2="-3" stroke="${c.heron}" stroke-width="0.3"/>` +
    `<line x1="0.5" y1="0" x2="0.5" y2="-3" stroke="${c.heron}" stroke-width="0.3"/>` +
    `<ellipse cx="0.3" cy="-4" rx="1" ry="1.5" fill="${c.heron}"/>` +
    `<circle cx="-0.2" cy="-5.5" r="0.6" fill="${c.heron}"/>` +
    `<line x1="-0.8" y1="-5.4" x2="-1.8" y2="-5.2" stroke="${c.wheat}" stroke-width="0.3"/>` +
    `</g>`
  );
}

export function svgShellfish(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="-1" cy="-0.3" rx="0.8" ry="0.5" fill="${c.shellfish}"/>` +
    `<ellipse cx="0.5" cy="-0.2" rx="0.6" ry="0.4" fill="${c.shellfish}" opacity="0.8"/>` +
    `<ellipse cx="1.5" cy="-0.5" rx="0.7" ry="0.45" fill="${c.shellfish}" opacity="0.7"/>` +
    `</g>`
  );
}

export function svgCattail(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})" ${motionMarkup('class="sway-gentle"')}>` +
    `<line x1="-0.5" y1="0" x2="-0.7" y2="-4.5" stroke="${c.cattail}" stroke-width="0.3"/>` +
    `<line x1="0.5" y1="0" x2="0.3" y2="-5" stroke="${c.cattail}" stroke-width="0.3"/>` +
    `<ellipse cx="-0.7" cy="-5" rx="0.3" ry="0.9" fill="${c.trunk}"/>` +
    `<ellipse cx="0.3" cy="-5.5" rx="0.3" ry="0.9" fill="${c.trunk}"/>` +
    `</g>`
  );
}

export function svgFrog(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.5" rx="1" ry="0.7" fill="${c.frog}"/>` +
    `<circle cx="-0.5" cy="-1.1" r="0.3" fill="${c.frog}"/>` +
    `<circle cx="0.5" cy="-1.1" r="0.3" fill="${c.frog}"/>` +
    `<circle cx="-0.5" cy="-1.2" r="0.12" fill="#222"/>` +
    `<circle cx="0.5" cy="-1.2" r="0.12" fill="#222"/>` +
    `</g>`
  );
}

export function svgLily(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.2" rx="1.8" ry="0.7" fill="${c.pine}" opacity="0.6"/>` +
    `<path d="M0,-0.4 Q-0.3,-1.2 0,-1 Q0.3,-1.2 0,-0.4" fill="${c.lily}" opacity="0.9"/>` +
    `<circle cx="0" cy="-0.7" r="0.2" fill="${c.flowerCenter}"/>` +
    `</g>`
  );
}
