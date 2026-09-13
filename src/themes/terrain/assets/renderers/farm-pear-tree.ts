import type { AssetColors } from '../../palette.js';

export function svgPearTree(x: number, y: number, c: AssetColors, v: number): string {
  // Pear tree with pear-shaped fruits
  const leaf = c.orchard;
  /* v8 ignore start */
  const pear = c.pearGreen || '#d1e231';
  /* v8 ignore stop */
  const trunk = c.trunk;
  if (v === 1) {
    // Ripe pears
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/>` +
      `<circle cx="0" cy="-4.5" r="2.5" fill="${leaf}"/>` +
      `<circle cx="-1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.9"/>` +
      `<circle cx="1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.85"/>` +
      `<path d="M-0.8,-4.3 Q-0.8,-4.8 -0.6,-4.8 Q-0.4,-4.8 -0.4,-4.3 Q-0.4,-3.8 -0.6,-3.6 Q-0.8,-3.8 -0.8,-4.3" fill="${pear}"/>` +
      `<path d="M0.6,-4.8 Q0.6,-5.3 0.8,-5.3 Q1,-5.3 1,-4.8 Q1,-4.3 0.8,-4.1 Q0.6,-4.3 0.6,-4.8" fill="${pear}"/>` +
      `<path d="M0.3,-3.5 Q0.3,-4 0.5,-4 Q0.7,-4 0.7,-3.5 Q0.7,-3 0.5,-2.8 Q0.3,-3 0.3,-3.5" fill="${pear}"/>` +
      `</g>`
    );
  }
  // Standard pear tree
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/>` +
    `<circle cx="0" cy="-4.5" r="2.5" fill="${leaf}"/>` +
    `<circle cx="-1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.9"/>` +
    `<circle cx="1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.85"/>` +
    `<path d="M-0.6,-4.5 Q-0.6,-5 -0.4,-5 Q-0.2,-5 -0.2,-4.5 Q-0.2,-4 -0.4,-3.8 Q-0.6,-4 -0.6,-4.5" fill="${pear}"/>` +
    `<path d="M0.7,-4 Q0.7,-4.5 0.9,-4.5 Q1.1,-4.5 1.1,-4 Q1.1,-3.5 0.9,-3.3 Q0.7,-3.5 0.7,-4" fill="${pear}"/>` +
    `</g>`
  );
}

export function svgPeachTree(x: number, y: number, c: AssetColors, v: number): string {
  // Peach tree with peach fruits
  const leaf = c.orchard;
  /* v8 ignore start */
  const peach = c.peachFruit || '#ffcba4';
  /* v8 ignore stop */
  const trunk = c.trunk;
  if (v === 1) {
    // Ripe peaches
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/>` +
      `<circle cx="0" cy="-4" r="2.2" fill="${leaf}"/>` +
      `<circle cx="-1.2" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.9"/>` +
      `<circle cx="1.2" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.85"/>` +
      `<circle cx="-0.6" cy="-4" r="0.4" fill="${peach}"/>` +
      `<circle cx="0.5" cy="-4.3" r="0.35" fill="${peach}"/>` +
      `<circle cx="0.8" cy="-3.3" r="0.35" fill="${peach}"/>` +
      `</g>`
    );
  }
  // Standard peach tree
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/>` +
    `<circle cx="0" cy="-4" r="2.2" fill="${leaf}"/>` +
    `<circle cx="-1.2" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.9"/>` +
    `<circle cx="1.2" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.85"/>` +
    `<circle cx="-0.5" cy="-4" r="0.35" fill="${peach}"/>` +
    `<circle cx="0.6" cy="-4.2" r="0.35" fill="${peach}"/>` +
    `</g>`
  );
}

export function svgBeeFarm(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-1.5" y="-2.5" width="3" height="2.5" fill="${c.beeFarm}"/>` +
    `<rect x="-1.5" y="-2.5" width="3" height="0.8" fill="${c.beeFarm}" stroke="${c.trunk}" stroke-width="0.2"/>` +
    `<rect x="-1.5" y="-1.7" width="3" height="0.8" fill="${c.beeFarm}" stroke="${c.trunk}" stroke-width="0.2"/>` +
    `<polygon points="-1.5,-2.5 0,-3.5 1.5,-2.5" fill="${c.roofB}"/>` +
    `</g>`
  );
}

export function svgPumpkin(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.8" rx="1.5" ry="1" fill="${c.pumpkin}"/>` +
    `<ellipse cx="-0.5" cy="-0.8" rx="0.8" ry="1" fill="${c.pumpkin}" opacity="0.6"/>` +
    `<ellipse cx="0.5" cy="-0.8" rx="0.8" ry="1" fill="${c.pumpkin}" opacity="0.6"/>` +
    `<line x1="0" y1="-1.8" x2="0.3" y2="-2.3" stroke="${c.pine}" stroke-width="0.3"/>` +
    `</g>`
  );
}
