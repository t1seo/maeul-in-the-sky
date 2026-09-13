import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function svgTent(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="0,-6 -3.5,0 3.5,0" fill="${c.tent}"/>` +
    `<polygon points="0,-6 -1.5,0 1.5,0" fill="${c.tentStripe}" opacity="0.6"/>` +
    `<line x1="0" y1="-6" x2="0" y2="-7" stroke="${c.trunk}" stroke-width="0.3"/>` +
    `</g>`
  );
}

export function svgHut(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Round hut variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-1.5" rx="2" ry="1.5" fill="${c.hut}"/>` +
      `<polygon points="-2.2,-1.5 0,-5 2.2,-1.5" fill="${c.roofB}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // With porch variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-2" y="-3" width="4" height="3" fill="${c.hut}"/>` +
      `<polygon points="-2.5,-3 0,-5.5 2.5,-3" fill="${c.roofB}"/>` +
      `<rect x="2.5" y="-1.5" width="2" height="1.5" fill="${c.hut}" opacity="0.6"/>` +
      `<line x1="2.5" y1="-1.5" x2="4.5" y2="-1.5" stroke="${c.roofB}" stroke-width="0.3"/>` +
      `<line x1="4.5" y1="-1.5" x2="4.5" y2="0" stroke="${c.trunk}" stroke-width="0.3"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-2" y="-3" width="4" height="3" fill="${c.hut}"/>` +
    `<polygon points="-2.5,-3 0,-5.5 2.5,-3" fill="${c.roofB}"/>` +
    `</g>`
  );
}

export function svgHouse(
  x: number,
  y: number,
  c: AssetColors,
  v: number,
  roofColor?: string,
): string {
  // v=1: blue roof, v=2: green roof+garden
  const roofOptions = [roofColor || c.roofA, '#4477aa', '#448844'];
  const roof = roofOptions[v] || roofOptions[0];
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-2.5,0 0,1.2 2.5,0 2.5,-3 0,-1.8 -2.5,-3" fill="${c.wall}"/>` +
    `<polygon points="-2.5,0 0,1.2 0,-1.8 -2.5,-3" fill="${c.wallShade}"/>` +
    `<polygon points="0,-6 -3.2,-2.8 0,-1.5 3.2,-2.8" fill="${roof}"/>` +
    `<rect x="1" y="-6.5" width="1" height="2" fill="${c.chimney}"/>` +
    `</g>`
  );
}

export function svgHouseB(x: number, y: number, c: AssetColors, v: number): string {
  return svgHouse(x, y, c, v, c.roofB);
}

export function svgChurch(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Bell tower variant — wider tower with bell
    return (
      `<g transform="translate(${x},${y})">` +
      `<polygon points="-2,0 0,1 2,0 2,-5 0,-4 -2,-5" fill="${c.church}"/>` +
      `<polygon points="-2,0 0,1 0,-4 -2,-5" fill="${c.wallShade}"/>` +
      `<rect x="-1" y="-8.5" width="2" height="3.5" fill="${c.church}"/>` +
      `<polygon points="-1.3,-8.5 0,-10.5 1.3,-8.5" fill="${c.roofA}"/>` +
      `<circle cx="0" cy="-7" r="0.4" fill="${c.blacksmith}" opacity="0.5"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Small chapel variant — compact, no tower
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-1.5" y="-3" width="3" height="3" fill="${c.church}"/>` +
      `<polygon points="-2,-3 0,-5 2,-3" fill="${c.roofA}"/>` +
      `<line x1="0" y1="-5.5" x2="0" y2="-5" stroke="${c.wall}" stroke-width="0.4"/>` +
      `<line x1="-0.5" y1="-5.2" x2="0.5" y2="-5.2" stroke="${c.wall}" stroke-width="0.4"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-2,0 0,1 2,0 2,-5 0,-4 -2,-5" fill="${c.church}"/>` +
    `<polygon points="-2,0 0,1 0,-4 -2,-5" fill="${c.wallShade}"/>` +
    `<polygon points="0,-10 -2.5,-5 0,-3.8 2.5,-5" fill="${c.roofA}"/>` +
    `<line x1="0" y1="-12" x2="0" y2="-10" stroke="${c.wall}" stroke-width="0.5"/>` +
    `<line x1="-1" y1="-11" x2="1" y2="-11" stroke="${c.wall}" stroke-width="0.5"/>` +
    `</g>`
  );
}

export function svgWindmill(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-1.5,0 1.5,0 1,-7 -1,-7" fill="${c.windmill}"/>` +
    // Animated blades via SMIL
    `<g>` +
    `<line x1="0" y1="-11" x2="0" y2="-3" stroke="${c.windBlade}" stroke-width="0.5"/>` +
    `<line x1="-4" y1="-7" x2="4" y2="-7" stroke="${c.windBlade}" stroke-width="0.5"/>` +
    motionMarkup(
      `<animateTransform attributeName="transform" type="rotate" from="0 0 -7" to="360 0 -7" dur="8s" repeatCount="indefinite"/>`,
    ) +
    `</g>` +
    `<circle cx="0" cy="-7" r="0.7" fill="${c.roofA}"/>` +
    `</g>`
  );
}

export function svgWell(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    // Stone base with multiple stones visible
    `<ellipse cx="0" cy="-0.3" rx="2.3" ry="1.2" fill="${c.rock}"/>` +
    `<ellipse cx="0" cy="-0.6" rx="2.1" ry="1" fill="${c.well}" stroke="${c.boulder}" stroke-width="0.3"/>` +
    // Stone texture on rim
    `<ellipse cx="-1.2" cy="-0.5" rx="0.5" ry="0.25" fill="${c.boulder}" opacity="0.6"/>` +
    `<ellipse cx="0.8" cy="-0.4" rx="0.6" ry="0.3" fill="${c.boulder}" opacity="0.5"/>` +
    `<ellipse cx="-0.2" cy="-0.7" rx="0.4" ry="0.2" fill="${c.rock}" opacity="0.4"/>` +
    // Inner dark hole
    `<ellipse cx="0" cy="-0.6" rx="1.4" ry="0.6" fill="${c.shadow}" opacity="0.8"/>` +
    // Support posts
    `<rect x="-1.7" y="-4.2" width="0.4" height="3.7" fill="${c.trunk}"/>` +
    `<rect x="1.3" y="-4.2" width="0.4" height="3.7" fill="${c.trunk}"/>` +
    // Crossbeam
    `<rect x="-1.8" y="-4.4" width="3.6" height="0.35" fill="${c.trunk}"/>` +
    // Roof
    `<polygon points="0,-5.8 -2.5,-4.2 2.5,-4.2" fill="${c.roofB}"/>` +
    `<line x1="0" y1="-5.8" x2="-2.5" y2="-4.2" stroke="${c.shadow}" stroke-width="0.15" opacity="0.3"/>` +
    // Rope spool
    `<ellipse cx="0" cy="-4" rx="0.5" ry="0.2" fill="${c.fence}"/>` +
    `<rect x="-0.5" y="-4.2" width="1" height="0.4" fill="${c.fence}"/>` +
    // Rope
    `<path d="M0,-4 Q0.3,-3 0,-2 Q-0.2,-1.5 0,-1" stroke="${c.fence}" stroke-width="0.15" fill="none"/>` +
    // Bucket
    `<path d="M-0.35,-1.3 L-0.3,-0.6 L0.3,-0.6 L0.35,-1.3 Z" fill="${c.barrel}"/>` +
    `<ellipse cx="0" cy="-1.3" rx="0.35" ry="0.12" fill="${c.cart}"/>` +
    `</g>`
  );
}

export function svgTavern(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-2.5,0 0,1.2 2.5,0 2.5,-3.5 0,-2.3 -2.5,-3.5" fill="${c.tavern}"/>` +
    `<polygon points="-2.5,0 0,1.2 0,-2.3 -2.5,-3.5" fill="${c.wallShade}"/>` +
    `<polygon points="0,-6 -3,-3.3 0,-2 3,-3.3" fill="${c.roofB}"/>` +
    `<rect x="3" y="-5" width="1.5" height="1.2" fill="${c.tavernSign}" rx="0.2"/>` +
    `<circle cx="3.75" cy="-4.4" r="0.3" fill="${c.wheat}"/>` +
    `</g>`
  );
}

export function svgBakery(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-2.5" y="-3.5" width="5" height="3.5" fill="${c.bakery}"/>` +
    `<polygon points="-3,-3.5 0,-5.5 3,-3.5" fill="${c.roofA}"/>` +
    `<rect x="1.5" y="-6.5" width="0.8" height="1.5" fill="${c.chimney}"/>` +
    `<circle cx="1.9" cy="-7.5" r="0.6" fill="${c.smoke}">` +
    motionMarkup(
      `<animate attributeName="cy" values="-7.5;-9.5;-7.5" dur="3s" repeatCount="indefinite"/>`,
    ) +
    motionMarkup(
      `<animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite"/>`,
    ) +
    `</circle>` +
    `</g>`
  );
}

export function svgStable(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-3" y="-3" width="6" height="3" fill="${c.stable}"/>` +
    `<polygon points="-3.5,-3 0,-5 3.5,-3" fill="${c.roofB}"/>` +
    `<rect x="-1" y="-2" width="2" height="2" fill="${c.trunk}" opacity="0.6"/>` +
    `</g>`
  );
}

export function svgGarden(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-3" y="-0.3" width="6" height="0.3" fill="${c.gardenFence}" opacity="0.5"/>` +
    `<line x1="-3" y1="-0.3" x2="-3" y2="-1.5" stroke="${c.gardenFence}" stroke-width="0.3"/>` +
    `<line x1="3" y1="-0.3" x2="3" y2="-1.5" stroke="${c.gardenFence}" stroke-width="0.3"/>` +
    `<line x1="-3" y1="-1" x2="3" y2="-1" stroke="${c.gardenFence}" stroke-width="0.2"/>` +
    `<circle cx="-1.5" cy="-0.8" r="0.4" fill="${c.flower}"/>` +
    `<circle cx="0" cy="-0.6" r="0.35" fill="${c.wildflower}"/>` +
    `<circle cx="1.5" cy="-0.7" r="0.4" fill="${c.butterflyWing}"/>` +
    `</g>`
  );
}

export function svgLaundry(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})" ${motionMarkup('class="sway-slow"')}>` +
    `<line x1="-3" y1="0" x2="-3" y2="-4" stroke="${c.trunk}" stroke-width="0.4"/>` +
    `<line x1="3" y1="0" x2="3" y2="-4" stroke="${c.trunk}" stroke-width="0.4"/>` +
    `<line x1="-3" y1="-3.5" x2="3" y2="-3.5" stroke="${c.trunk}" stroke-width="0.2"/>` +
    `<rect x="-2" y="-3.5" width="1.5" height="2" fill="${c.laundry}" rx="0.1"/>` +
    `<rect x="0" y="-3.5" width="1.2" height="1.8" fill="${c.sail}" rx="0.1"/>` +
    `</g>`
  );
}

export function svgDoghouse(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-1.5" y="-2" width="3" height="2" fill="${c.doghouse}"/>` +
    `<polygon points="-1.8,-2 0,-3.2 1.8,-2" fill="${c.roofA}"/>` +
    `<ellipse cx="0" cy="-0.5" rx="0.5" ry="0.6" fill="${c.trunk}" opacity="0.6"/>` +
    `<ellipse cx="2.5" cy="-0.5" rx="0.7" ry="0.5" fill="${c.deer}"/>` +
    `</g>`
  );
}
