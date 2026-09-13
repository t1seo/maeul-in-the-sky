import type { AssetColors } from '../../palette.js';

export function renderMountFuji(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.2" rx="5" ry="1" fill="${c.shadow}" opacity="0.15"/>` +
    `<polygon points="-7,0 0,-13 7,0" fill="${c.boulder}"/>` +
    `<polygon points="0,-13 7,0 0,0" fill="${c.rock}" opacity="0.6"/>` +
    `<line x1="-4" y1="-4" x2="4" y2="-4" stroke="${c.rock}" stroke-width="0.3" opacity="0.4"/>` +
    `<line x1="-3" y1="-7" x2="3" y2="-7" stroke="${c.rock}" stroke-width="0.25" opacity="0.35"/>` +
    `<polygon points="-3,-9 0,-13 3,-9" fill="${c.snowCap}"/>` +
    `<polygon points="0,-13 3,-9 0,-9" fill="${c.snowGround}" opacity="0.7"/>` +
    `<path d="M-3,-9 Q-2,-8 -1,-8.6 Q0,-8 1,-8.6 Q2,-8 3,-9" fill="${c.snowCap}" opacity="0.5"/>` +
    `<circle cx="-4" cy="-2" r="0.8" fill="${c.epicJade}" opacity="0.5"/>` +
    `<circle cx="-2.5" cy="-2.5" r="0.7" fill="${c.epicJade}" opacity="0.45"/>` +
    `<circle cx="3" cy="-2" r="0.7" fill="${c.epicJade}" opacity="0.4"/>` +
    `</g>`
  );
}

export function renderGiantSequoia(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.2" rx="3.5" ry="0.8" fill="${c.shadow}" opacity="0.15"/>` +
    `<path d="M-2.5,0 Q-2.2,-0.8 -1.8,-1" stroke="${c.trunk}" stroke-width="0.6" fill="none"/>` +
    `<path d="M2.5,0 Q2.2,-0.8 1.8,-1" stroke="${c.trunk}" stroke-width="0.6" fill="none"/>` +
    `<rect x="-1.8" y="-7" width="3.6" height="7" fill="${c.trunk}" rx="0.6"/>` +
    `<rect x="-0.5" y="-7" width="1" height="7" fill="${c.trunk}" opacity="0.5"/>` +
    `<line x1="-1.8" y1="-4" x2="-2.8" y2="-4.5" stroke="${c.trunk}" stroke-width="0.5"/>` +
    `<line x1="1.8" y1="-5" x2="2.6" y2="-5.5" stroke="${c.trunk}" stroke-width="0.4"/>` +
    `<ellipse cx="0" cy="-9" rx="5.5" ry="3.5" fill="${c.bushDark}"/>` +
    `<ellipse cx="0" cy="-9" rx="5" ry="3.2" fill="${c.epicJade}"/>` +
    `<ellipse cx="-1.5" cy="-11" rx="3.5" ry="2.5" fill="${c.epicJade}" opacity="0.85"/>` +
    `<ellipse cx="1.5" cy="-11" rx="3" ry="2.2" fill="${c.leaf}" opacity="0.6"/>` +
    `<ellipse cx="0" cy="-12.5" rx="2.5" ry="1.8" fill="${c.leafLight}" opacity="0.5"/>` +
    `</g>`
  );
}

export function renderCoralReef(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="5.5" ry="1.2" fill="${c.shadow}" opacity="0.12"/>` +
    `<ellipse cx="0" cy="0" rx="5" ry="1.5" fill="${c.coral}" opacity="0.3"/>` +
    `<path d="M-3,0 L-3,-4 L-4,-5.5 M-3,-3 L-2,-5" stroke="${c.coral}" stroke-width="0.8" fill="none"/>` +
    `<path d="M1,0 L1,-5 L0,-7 M1,-3 L2.2,-5.5" stroke="${c.epicMagic}" stroke-width="0.7" fill="none"/>` +
    `<path d="M3.5,0 Q3,-2 4.5,-4 Q5,-3 5.5,-4 Q5,-1.5 3.5,0" fill="${c.epicPortal}" opacity="0.5"/>` +
    `<circle cx="-4" cy="-5.8" r="1" fill="${c.coral}"/>` +
    `<circle cx="-2" cy="-5.3" r="0.7" fill="${c.coral}" opacity="0.8"/>` +
    `<circle cx="0" cy="-7.2" r="1.1" fill="${c.epicMagic}"/>` +
    `<circle cx="2.2" cy="-5.8" r="0.8" fill="${c.epicMagic}" opacity="0.8"/>` +
    `<path d="M-1,-3 L0.2,-3.4 L-1,-3.8 Z" fill="${c.epicGold}" opacity="0.7"/>` +
    `<path d="M-1.3,-3.2 L-1,-3.4 L-1.3,-3.6" fill="${c.epicGold}" opacity="0.5"/>` +
    `<circle cx="1.5" cy="-6" r="0.2" fill="${c.epicCrystal}" opacity="0.3"/>` +
    `<circle cx="0.5" cy="-8" r="0.15" fill="${c.epicCrystal}" opacity="0.25"/>` +
    `</g>`
  );
}

export function renderGeyser(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.2" rx="3.5" ry="0.8" fill="${c.shadow}" opacity="0.15"/>` +
    `<ellipse cx="0" cy="0" rx="3.5" ry="1.4" fill="${c.rock}"/>` +
    `<ellipse cx="0" cy="-0.3" rx="2.5" ry="1" fill="${c.boulder}"/>` +
    `<ellipse cx="0" cy="-0.2" rx="1.5" ry="0.5" fill="${c.epicGold}" opacity="0.2"/>` +
    `<path d="M-1,-1 Q-0.6,-5 0,-9 Q0.6,-5 1,-1" fill="${c.epicCrystal}" opacity="0.45"/>` +
    `<path d="M-0.5,-1 Q0,-6 0.5,-1" fill="${c.epicCrystal}" opacity="0.25"/>` +
    `<circle cx="-1.5" cy="-9" r="0.6" fill="${c.epicCrystal}" opacity="0.3"/>` +
    `<circle cx="1.2" cy="-9.5" r="0.5" fill="${c.epicCrystal}" opacity="0.25"/>` +
    `<circle cx="0" cy="-10.5" r="0.7" fill="${c.epicCrystal}" opacity="0.2"/>` +
    `<circle cx="-0.8" cy="-11" r="0.4" fill="${c.epicCrystal}" opacity="0.15"/>` +
    `<path d="M-2,-7 Q-2.5,-8.5 -1.5,-9.5" stroke="${c.epicCrystal}" stroke-width="0.3" fill="none" opacity="0.2"/>` +
    `<path d="M1.5,-8 Q2,-9.5 1,-10" stroke="${c.epicCrystal}" stroke-width="0.25" fill="none" opacity="0.18"/>` +
    `</g>`
  );
}

export function renderHotSpring(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="5" ry="1.2" fill="${c.shadow}" opacity="0.12"/>` +
    `<ellipse cx="0" cy="0" rx="5" ry="2.2" fill="${c.rock}"/>` +
    `<circle cx="-3.5" cy="-0.5" r="1" fill="${c.boulder}" opacity="0.6"/>` +
    `<circle cx="3.5" cy="-0.3" r="0.9" fill="${c.boulder}" opacity="0.55"/>` +
    `<circle cx="0" cy="-1.8" r="0.7" fill="${c.boulder}" opacity="0.5"/>` +
    `<ellipse cx="0" cy="-0.3" rx="3.8" ry="1.6" fill="none" stroke="${c.epicGold}" stroke-width="0.3" opacity="0.2"/>` +
    `<ellipse cx="0" cy="-0.3" rx="3.5" ry="1.5" fill="${c.epicCrystal}" opacity="0.45"/>` +
    `<ellipse cx="0" cy="-0.5" rx="2" ry="0.8" fill="${c.epicPortal}" opacity="0.25"/>` +
    `<path d="M-1.5,-1 Q-2,-3 -1,-4.5" stroke="${c.epicCrystal}" stroke-width="0.3" fill="none" opacity="0.35"/>` +
    `<path d="M0.5,-1 Q0,-3.5 1,-5" stroke="${c.epicCrystal}" stroke-width="0.3" fill="none" opacity="0.3"/>` +
    `<path d="M2,-0.8 Q2.5,-2.5 2,-4" stroke="${c.epicCrystal}" stroke-width="0.25" fill="none" opacity="0.25"/>` +
    `</g>`
  );
}

export function renderGrandCanyon(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="6" ry="1" fill="${c.shadow}" opacity="0.12"/>` +
    `<polygon points="-6,0 -5,-7 -3,-6 -2,-8 -1,-4" fill="${c.boulder}"/>` +
    `<polygon points="-6,0 -5,-5 -3,-4 -1,-4 -1,0" fill="${c.rock}" opacity="0.7"/>` +
    `<line x1="-5.5" y1="-2" x2="-1.5" y2="-2" stroke="${c.epicGold}" stroke-width="0.3" opacity="0.3"/>` +
    `<line x1="-5" y1="-4" x2="-2" y2="-4" stroke="${c.rock}" stroke-width="0.25" opacity="0.4"/>` +
    `<polygon points="1,-4 2,-8 3,-6 5,-7 6,0" fill="${c.boulder}"/>` +
    `<polygon points="1,-4 1,0 6,0 5,-5 3,-4" fill="${c.rock}" opacity="0.7"/>` +
    `<line x1="1.5" y1="-2" x2="5.5" y2="-2" stroke="${c.epicGold}" stroke-width="0.3" opacity="0.3"/>` +
    `<line x1="2" y1="-4" x2="5" y2="-4" stroke="${c.rock}" stroke-width="0.25" opacity="0.4"/>` +
    `<path d="M-0.8,0 Q0,-0.3 0.8,0" fill="${c.epicCrystal}" opacity="0.4"/>` +
    `<circle cx="-5" cy="-7.3" r="0.5" fill="${c.epicJade}" opacity="0.4"/>` +
    `<circle cx="4.5" cy="-7.3" r="0.4" fill="${c.epicJade}" opacity="0.35"/>` +
    `</g>`
  );
}

export function renderOasis(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="5" ry="1.2" fill="${c.shadow}" opacity="0.12"/>` +
    `<ellipse cx="0" cy="0.2" rx="5.5" ry="2" fill="${c.epicGold}" opacity="0.15"/>` +
    `<ellipse cx="0" cy="0" rx="4" ry="1.5" fill="${c.epicCrystal}" opacity="0.5"/>` +
    `<ellipse cx="0" cy="-0.2" rx="3" ry="1" fill="${c.epicCrystal}" opacity="0.3"/>` +
    `<path d="M-2.5,0 Q-2.8,-3 -2.2,-6" stroke="${c.trunk}" stroke-width="0.7" fill="none"/>` +
    `<path d="M-2.2,-6 Q-4.5,-5.5 -5.5,-4.5" stroke="${c.palm}" stroke-width="0.5" fill="none"/>` +
    `<path d="M-2.2,-6 Q-0.5,-5.5 0.5,-5.5" stroke="${c.palm}" stroke-width="0.5" fill="none"/>` +
    `<path d="M-2.2,-6 Q-3.5,-5 -4,-3.5" stroke="${c.palm}" stroke-width="0.4" fill="none"/>` +
    `<path d="M-2.2,-6 Q-1,-7 0,-7" stroke="${c.palm}" stroke-width="0.4" fill="none"/>` +
    `<path d="M2,0 Q2.3,-2.5 1.8,-5" stroke="${c.trunk}" stroke-width="0.6" fill="none"/>` +
    `<path d="M1.8,-5 Q4,-4.5 4.5,-3.5" stroke="${c.palm}" stroke-width="0.45" fill="none"/>` +
    `<path d="M1.8,-5 Q0,-4.5 -0.8,-4.5" stroke="${c.palm}" stroke-width="0.45" fill="none"/>` +
    `<path d="M1.8,-5 Q3,-3.5 3.5,-2.5" stroke="${c.palm}" stroke-width="0.35" fill="none"/>` +
    `</g>`
  );
}
