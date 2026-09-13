import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function renderVolcano(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="5.5" ry="1.2" fill="${c.shadow}" opacity="0.15"/>` +
    `<polygon points="-6,0 -1.8,-9 1.8,-9 6,0" fill="${c.boulder}"/>` +
    `<polygon points="0,-9 1.8,-9 6,0 0,0" fill="${c.rock}" opacity="0.5"/>` +
    `<line x1="-4" y1="-3" x2="4" y2="-3" stroke="${c.rock}" stroke-width="0.25" opacity="0.3"/>` +
    `<ellipse cx="0" cy="-9" rx="2" ry="0.8" fill="#ff4500"/>` +
    `<ellipse cx="0" cy="-9" rx="1.2" ry="0.5" fill="#ff8c00"/>` +
    `<ellipse cx="0" cy="-9" rx="0.6" ry="0.25" fill="#ffcc00" opacity="0.7"/>` +
    `<path d="M0.5,-9 Q1,-7 0.8,-5" stroke="#ff4500" stroke-width="0.4" fill="none" opacity="0.6"/>` +
    `<circle cx="-0.5" cy="-10.5" r="0.5" fill="${c.rock}" opacity="0.3"/>` +
    `<circle cx="0.5" cy="-11.5" r="0.6" fill="${c.rock}" opacity="0.25"/>` +
    `<circle cx="-0.2" cy="-12.5" r="0.4" fill="${c.rock}" opacity="0.2"/>` +
    `</g>`
  );
}

export function renderGiantMushroom(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.2" rx="3" ry="0.6" fill="${c.shadow}" opacity="0.15"/>` +
    `<rect x="-1.2" y="-5" width="2.4" height="5" fill="${c.mushroom}" rx="0.4"/>` +
    `<ellipse cx="0" cy="-2" rx="1.3" ry="0.3" fill="${c.mushroom}" opacity="0.5"/>` +
    `<ellipse cx="0" cy="-5" rx="5" ry="1.2" fill="${c.mushroom}" opacity="0.6"/>` +
    `<line x1="-3" y1="-5" x2="-1" y2="-5" stroke="${c.mushroom}" stroke-width="0.15" opacity="0.4"/>` +
    `<line x1="1" y1="-5" x2="3" y2="-5" stroke="${c.mushroom}" stroke-width="0.15" opacity="0.4"/>` +
    `<ellipse cx="0" cy="-6.5" rx="5" ry="3.2" fill="${c.mushroomCap}"/>` +
    `<ellipse cx="-1" cy="-7.5" rx="2" ry="1" fill="${c.mushroomCap}" opacity="0.4"/>` +
    `<circle cx="-2.5" cy="-7" r="0.7" fill="${c.mushroom}" opacity="0.5"/>` +
    `<circle cx="1.8" cy="-6.5" r="0.6" fill="${c.mushroom}" opacity="0.45"/>` +
    `<circle cx="0" cy="-8.5" r="0.5" fill="${c.mushroom}" opacity="0.4"/>` +
    `<circle cx="-1" cy="-5.5" r="0.4" fill="${c.mushroom}" opacity="0.35"/>` +
    `</g>`
  );
}

export function renderColosseum(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="5.5" ry="1.2" fill="${c.shadow}" opacity="0.15"/>` +
    `<ellipse cx="0" cy="-2" rx="5.5" ry="3.2" fill="${c.epicMarble}"/>` +
    `<ellipse cx="0" cy="-2.5" rx="3.5" ry="1.8" fill="${c.wallShade}" opacity="0.5"/>` +
    `<line x1="-4" y1="-5" x2="-4" y2="-2" stroke="${c.wall}" stroke-width="0.4"/>` +
    `<line x1="-2" y1="-5.5" x2="-2" y2="-2.5" stroke="${c.wall}" stroke-width="0.4"/>` +
    `<line x1="0" y1="-5.5" x2="0" y2="-2.5" stroke="${c.wall}" stroke-width="0.4"/>` +
    `<line x1="2" y1="-5.5" x2="2" y2="-2.5" stroke="${c.wall}" stroke-width="0.4"/>` +
    `<line x1="4" y1="-5" x2="4" y2="-2" stroke="${c.wall}" stroke-width="0.4"/>` +
    `<path d="M-4,-4.5 Q-3,-5.5 -2,-4.8" fill="none" stroke="${c.wall}" stroke-width="0.3"/>` +
    `<path d="M-2,-5 Q-1,-5.8 0,-5" fill="none" stroke="${c.wall}" stroke-width="0.3"/>` +
    `<path d="M0,-5 Q1,-5.8 2,-5" fill="none" stroke="${c.wall}" stroke-width="0.3"/>` +
    `<path d="M2,-4.8 Q3,-5.5 4,-4.5" fill="none" stroke="${c.wall}" stroke-width="0.3"/>` +
    `</g>`
  );
}

export function renderPagoda(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.2" rx="3" ry="0.6" fill="${c.shadow}" opacity="0.15"/>` +
    `<rect x="-2.5" y="-3" width="5" height="3" fill="${c.epicMarble}"/>` +
    `<rect x="-2.5" y="-3" width="2.5" height="3" fill="${c.wallShade}" opacity="0.2"/>` +
    `<path d="M-4.5,-3 Q-3,-4 0,-4.5 Q3,-4 4.5,-3" fill="${c.roofA}"/>` +
    `<rect x="-1.8" y="-7" width="3.6" height="2.5" fill="${c.epicMarble}"/>` +
    `<path d="M-3.5,-7 Q-2,-8 0,-8.2 Q2,-8 3.5,-7" fill="${c.roofA}"/>` +
    `<rect x="-1.2" y="-10.5" width="2.4" height="2.3" fill="${c.epicMarble}"/>` +
    `<path d="M-2.5,-10.5 Q-1,-11.5 0,-11.8 Q1,-11.5 2.5,-10.5" fill="${c.roofA}"/>` +
    `<line x1="0" y1="-11.8" x2="0" y2="-13.5" stroke="${c.epicGold}" stroke-width="0.4"/>` +
    `<circle cx="0" cy="-13.7" r="0.3" fill="${c.epicGold}"/>` +
    `<circle cx="0" cy="-2" r="0.4" fill="${c.wallShade}" opacity="0.5"/>` +
    `<circle cx="0" cy="-6" r="0.3" fill="${c.wallShade}" opacity="0.4"/>` +
    `</g>`
  );
}

export function renderTorii(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.2" rx="4" ry="0.7" fill="${c.shadow}" opacity="0.15"/>` +
    `<rect x="-4.5" y="-0.5" width="1.5" height="0.5" fill="${c.rock}" rx="0.2"/>` +
    `<rect x="3" y="-0.5" width="1.5" height="0.5" fill="${c.rock}" rx="0.2"/>` +
    `<path d="M-4.2,-0.5 L-3.8,-8 L-3.3,-8 L-3.5,-0.5 Z" fill="${c.roofA}"/>` +
    `<path d="M3.5,-0.5 L3.3,-8 L3.8,-8 L4.2,-0.5 Z" fill="${c.roofA}"/>` +
    `<path d="M-5.5,-7.5 Q0,-9.5 5.5,-7.5" stroke="${c.roofA}" stroke-width="1" fill="none"/>` +
    `<path d="M-5.5,-7.5 Q0,-9 5.5,-7.5" fill="${c.roofA}"/>` +
    `<rect x="-4.2" y="-6.5" width="8.4" height="0.5" fill="${c.roofA}"/>` +
    `<rect x="-0.8" y="-7.5" width="1.6" height="1.5" fill="${c.epicGold}" opacity="0.3" rx="0.1"/>` +
    `</g>`
  );
}

export function renderEiffelTower(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.2" rx="2.5" ry="0.5" fill="${c.shadow}" opacity="0.15"/>` +
    `<path d="M-3.5,0 Q-1.75,-2 0,0" fill="none" stroke="${c.boulder}" stroke-width="0.4"/>` +
    `<path d="M0,0 Q1.75,-2 3.5,0" fill="none" stroke="${c.boulder}" stroke-width="0.4"/>` +
    `<line x1="-3.5" y1="0" x2="-0.6" y2="-10" stroke="${c.boulder}" stroke-width="0.5"/>` +
    `<line x1="3.5" y1="0" x2="0.6" y2="-10" stroke="${c.boulder}" stroke-width="0.5"/>` +
    `<line x1="-2.5" y1="-3" x2="2.5" y2="-3" stroke="${c.boulder}" stroke-width="0.3"/>` +
    `<line x1="-1.8" y1="-5.5" x2="1.8" y2="-5.5" stroke="${c.boulder}" stroke-width="0.3"/>` +
    `<line x1="-2.5" y1="-3" x2="1.8" y2="-5.5" stroke="${c.boulder}" stroke-width="0.15" opacity="0.5"/>` +
    `<line x1="2.5" y1="-3" x2="-1.8" y2="-5.5" stroke="${c.boulder}" stroke-width="0.15" opacity="0.5"/>` +
    `<rect x="-2" y="-5.8" width="4" height="0.5" fill="${c.boulder}"/>` +
    `<line x1="0" y1="-10" x2="0" y2="-14" stroke="${c.boulder}" stroke-width="0.4"/>` +
    `<rect x="-0.8" y="-10.3" width="1.6" height="0.5" fill="${c.boulder}"/>` +
    `<line x1="0" y1="-14" x2="0" y2="-14.5" stroke="${c.epicGold}" stroke-width="0.2"/>` +
    `</g>`
  );
}

export function renderWindmillGrand(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.2" rx="2.5" ry="0.5" fill="${c.shadow}" opacity="0.15"/>` +
    `<polygon points="-2.5,0 -1.5,-8 1.5,-8 2.5,0" fill="${c.windmill}"/>` +
    `<polygon points="-2.5,0 -1.5,-8 0,-8 0,0" fill="${c.wallShade}" opacity="0.15"/>` +
    `<polygon points="-2,-8 0,-10.5 2,-8" fill="${c.roofA}"/>` +
    `<rect x="-0.6" y="-1.5" width="1.2" height="1.5" fill="${c.wallShade}" opacity="0.4" rx="0.6" ry="0"/>` +
    `<circle cx="0" cy="-5" r="0.5" fill="${c.wallShade}" opacity="0.3"/>` +
    `<g transform="translate(0,-7.5)">` +
    `<g>` +
    `<polygon points="-0.4,0 -0.2,-6 0.2,-6 0.4,0" fill="${c.windBlade}" opacity="0.85"/>` +
    `<polygon points="0,-0.4 6,-0.2 6,0.2 0,0.4" fill="${c.windBlade}" opacity="0.85"/>` +
    `<polygon points="-0.4,0 -0.2,6 0.2,6 0.4,0" fill="${c.windBlade}" opacity="0.85"/>` +
    `<polygon points="0,-0.4 -6,-0.2 -6,0.2 0,0.4" fill="${c.windBlade}" opacity="0.85"/>` +
    motionMarkup(
      `<animateTransform attributeName="transform" type="rotate" values="0;360" dur="6s" repeatCount="indefinite"/>`,
    ) +
    `</g>` +
    `</g>` +
    `<circle cx="0" cy="-7.5" r="0.6" fill="${c.boulder}"/>` +
    `</g>`
  );
}
