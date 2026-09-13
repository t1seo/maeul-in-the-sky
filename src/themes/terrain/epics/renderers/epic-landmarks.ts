import type { AssetColors } from '../../palette.js';

export function renderBonsaiGiant(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.2" rx="3" ry="0.6" fill="${c.shadow}" opacity="0.15"/>` +
    `<ellipse cx="0" cy="0" rx="2.5" ry="0.8" fill="${c.rock}" opacity="0.5"/>` +
    `<path d="M-0.5,0 Q-1.5,-2 -2,-3.5 Q-2.5,-4.5 -2,-5.5" stroke="${c.trunk}" stroke-width="1.3" fill="none"/>` +
    `<path d="M-1.5,-3 Q0,-4 1.5,-4.5 Q2,-5 2,-6" stroke="${c.trunk}" stroke-width="0.9" fill="none"/>` +
    `<path d="M-2,-5.5 Q-3,-6 -3.5,-6.5" stroke="${c.trunk}" stroke-width="0.5" fill="none"/>` +
    `<ellipse cx="-2.5" cy="-7" rx="2" ry="1.3" fill="${c.bushDark}"/>` +
    `<ellipse cx="-2.5" cy="-7" rx="1.8" ry="1.1" fill="${c.epicJade}"/>` +
    `<ellipse cx="2" cy="-6.5" rx="2.2" ry="1.5" fill="${c.bushDark}"/>` +
    `<ellipse cx="2" cy="-6.5" rx="2" ry="1.3" fill="${c.epicJade}"/>` +
    `<ellipse cx="-0.5" cy="-8.5" rx="1.5" ry="1" fill="${c.bushDark}"/>` +
    `<ellipse cx="-0.5" cy="-8.5" rx="1.3" ry="0.8" fill="${c.epicJade}"/>` +
    `<ellipse cx="-1" cy="-9" rx="0.6" ry="0.4" fill="${c.leafLight}" opacity="0.4"/>` +
    `</g>`
  );
}

export function renderTajMahal(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="5" ry="1" fill="${c.shadow}" opacity="0.15"/>` +
    `<rect x="-5" y="-1" width="10" height="1" fill="${c.epicMarble}" opacity="0.8"/>` +
    `<rect x="-3.5" y="-5" width="7" height="4" fill="${c.epicMarble}"/>` +
    `<rect x="0" y="-5" width="3.5" height="4" fill="${c.wallShade}" opacity="0.1"/>` +
    `<path d="M-1.2,-1 L-1.2,-3.5 Q0,-4.5 1.2,-3.5 L1.2,-1" fill="${c.wallShade}" opacity="0.3"/>` +
    `<path d="M-2.5,-5 Q-2.5,-8 0,-10.5 Q2.5,-8 2.5,-5" fill="${c.epicMarble}"/>` +
    `<line x1="0" y1="-10.5" x2="0" y2="-11.5" stroke="${c.epicGold}" stroke-width="0.3"/>` +
    `<circle cx="0" cy="-11.7" r="0.3" fill="${c.epicGold}"/>` +
    `<rect x="-5.5" y="-8" width="0.8" height="7" fill="${c.epicMarble}"/>` +
    `<circle cx="-5.1" cy="-8.3" r="0.4" fill="${c.epicGold}"/>` +
    `<rect x="4.7" y="-8" width="0.8" height="7" fill="${c.epicMarble}"/>` +
    `<circle cx="5.1" cy="-8.3" r="0.4" fill="${c.epicGold}"/>` +
    `<line x1="-3.5" y1="-3" x2="3.5" y2="-3" stroke="${c.epicGold}" stroke-width="0.2" opacity="0.4"/>` +
    `</g>`
  );
}

export function renderStBasils(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="4" ry="0.8" fill="${c.shadow}" opacity="0.15"/>` +
    `<rect x="-3.5" y="-4" width="7" height="4" fill="${c.epicMarble}"/>` +
    `<rect x="-3.5" y="-4" width="3.5" height="4" fill="${c.wallShade}" opacity="0.1"/>` +
    `<rect x="-0.8" y="-7" width="1.6" height="3" fill="${c.epicMarble}"/>` +
    `<path d="M-3,-4 Q-3,-6 -3,-7 Q-3.8,-6 -3.8,-5 Q-3.8,-4.5 -3,-4" fill="${c.roofA}"/>` +
    `<circle cx="-3" cy="-7.3" r="0.25" fill="${c.epicGold}"/>` +
    `<path d="M-0.8,-7 Q-0.8,-9.5 0,-10.5 Q0.8,-9.5 0.8,-7" fill="${c.epicJade}"/>` +
    `<circle cx="0" cy="-10.8" r="0.3" fill="${c.epicGold}"/>` +
    `<path d="M3,-4 Q3,-6 3,-7 Q3.8,-6 3.8,-5 Q3.8,-4.5 3,-4" fill="${c.epicMagic}"/>` +
    `<circle cx="3" cy="-7.3" r="0.25" fill="${c.epicGold}"/>` +
    `<line x1="-3" y1="-5.5" x2="-3" y2="-6.5" stroke="${c.epicGold}" stroke-width="0.15" opacity="0.4"/>` +
    `<line x1="0" y1="-8" x2="0" y2="-9.5" stroke="${c.epicGold}" stroke-width="0.15" opacity="0.4"/>` +
    `<path d="M-0.4,-4.5 Q0,-5.2 0.4,-4.5" fill="${c.wallShade}" opacity="0.4"/>` +
    `</g>`
  );
}

export function renderOperaHouse(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="5.5" ry="1" fill="${c.shadow}" opacity="0.15"/>` +
    `<rect x="-5.5" y="-0.5" width="11" height="0.8" fill="${c.epicMarble}" opacity="0.8"/>` +
    `<rect x="-5" y="-1" width="10" height="0.5" fill="${c.epicMarble}"/>` +
    `<path d="M-5,-1 Q-3.5,-7 -2,-1" fill="${c.epicMarble}"/>` +
    `<path d="M-2.5,-1 Q-0.5,-9 1.5,-1" fill="${c.epicMarble}"/>` +
    `<path d="M0.5,-1 Q2.5,-7.5 4,-1" fill="${c.epicMarble}"/>` +
    `<path d="M3,-1 Q4.2,-5 5,-1" fill="${c.epicMarble}"/>` +
    `<path d="M-5,-1 Q-3.5,-7 -2,-1" fill="none" stroke="${c.wall}" stroke-width="0.2" opacity="0.3"/>` +
    `<path d="M-2.5,-1 Q-0.5,-9 1.5,-1" fill="none" stroke="${c.wall}" stroke-width="0.2" opacity="0.3"/>` +
    `<ellipse cx="0" cy="0.8" rx="4" ry="0.5" fill="${c.epicCrystal}" opacity="0.15"/>` +
    `</g>`
  );
}
