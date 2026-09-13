import type { AssetColors } from '../../palette.js';

export function svgAutumnMaple(x: number, y: number, c: AssetColors, v: number): string {
  const trunk = c.trunk;
  // v=0: mostly red/crimson, v=1: orange/gold mix, v=2: mixed with falling leaves
  if (v === 1) {
    // Orange-gold variant with layered foliage
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.6" y="-1" width="1.2" height="3.5" fill="${trunk}"/>` +
      `<circle cx="0" cy="-4" r="2.2" fill="${c.autumnGold}" opacity="0.7"/>` +
      `<circle cx="-1.5" cy="-3" r="1.5" fill="${c.mapleOrange}" opacity="0.65"/>` +
      `<circle cx="1.5" cy="-3" r="1.5" fill="${c.autumnRust}" opacity="0.6"/>` +
      `<circle cx="0" cy="-5.5" r="1" fill="${c.autumnBronze}" opacity="0.55"/>` +
      `<circle cx="-0.5" cy="-2.5" r="0.8" fill="${c.autumnGold}" opacity="0.5"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Mixed colors with falling leaves
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.6" y="-1" width="1.2" height="3.5" fill="${trunk}"/>` +
      `<circle cx="0" cy="-3.8" r="2" fill="${c.mapleRed}" opacity="0.65"/>` +
      `<circle cx="-1.2" cy="-3" r="1.3" fill="${c.autumnGold}" opacity="0.6"/>` +
      `<circle cx="1.2" cy="-3" r="1.3" fill="${c.mapleCrimson}" opacity="0.55"/>` +
      `<circle cx="0" cy="-5" r="0.9" fill="${c.autumnBronze}" opacity="0.5"/>` +
      `<ellipse cx="-1.5" cy="0.5" rx="0.4" ry="0.15" fill="${c.mapleRed}" opacity="0.5"/>` +
      `<ellipse cx="1" cy="0.3" rx="0.3" ry="0.12" fill="${c.autumnGold}" opacity="0.45"/>` +
      `<ellipse cx="0" cy="0.6" rx="0.35" ry="0.12" fill="${c.mapleOrange}" opacity="0.4"/>` +
      `</g>`
    );
  }
  // v=0: Classic red maple with depth
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.6" y="-1" width="1.2" height="3.5" fill="${trunk}"/>` +
    `<circle cx="0" cy="-4" r="2.5" fill="${c.mapleRed}" opacity="0.7"/>` +
    `<circle cx="-1.5" cy="-3" r="1.5" fill="${c.mapleCrimson}" opacity="0.6"/>` +
    `<circle cx="1.5" cy="-3" r="1.5" fill="${c.mapleOrange}" opacity="0.55"/>` +
    `<circle cx="0" cy="-5.5" r="1.2" fill="${c.mapleRed}" opacity="0.5"/>` +
    `<circle cx="-0.8" cy="-2.5" r="0.9" fill="${c.mapleCrimson}" opacity="0.45"/>` +
    `</g>`
  );
}

export function svgAutumnOak(x: number, y: number, c: AssetColors, v: number): string {
  const trunk = c.trunk;
  // v=0: gold/bronze, v=1: brown with some green, v=2: burgundy/rust mix
  if (v === 1) {
    // Late autumn with remaining green
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.7" y="-1" width="1.4" height="4" fill="${trunk}"/>` +
      `<circle cx="0" cy="-3.5" r="2.8" fill="${c.autumnBronze}" opacity="0.65"/>` +
      `<circle cx="-1.2" cy="-4.5" r="1.5" fill="${c.autumnOlive}" opacity="0.55"/>` +
      `<circle cx="1.5" cy="-4" r="1.3" fill="${c.oakBrown}" opacity="0.6"/>` +
      `<circle cx="-0.5" cy="-2.5" r="1" fill="${c.autumnBronze}" opacity="0.5"/>` +
      `<circle cx="0.5" cy="-5.5" r="0.8" fill="${c.autumnOlive}" opacity="0.4"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Burgundy/rust dramatic colors
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.7" y="-1" width="1.4" height="4" fill="${trunk}"/>` +
      `<circle cx="0" cy="-3.5" r="2.6" fill="${c.autumnRust}" opacity="0.65"/>` +
      `<circle cx="-1.4" cy="-4.2" r="1.4" fill="${c.autumnBurgundy}" opacity="0.6"/>` +
      `<circle cx="1.3" cy="-3.8" r="1.5" fill="${c.autumnBronze}" opacity="0.55"/>` +
      `<circle cx="0" cy="-5.5" r="1" fill="${c.autumnRust}" opacity="0.5"/>` +
      `<ellipse cx="0" cy="0.5" rx="1.5" ry="0.3" fill="${c.autumnBurgundy}" opacity="0.3"/>` +
      `</g>`
    );
  }
  // v=0: Classic gold oak with acorn hints
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.7" y="-1" width="1.4" height="4" fill="${trunk}"/>` +
    `<circle cx="0" cy="-3.5" r="2.8" fill="${c.oakGold}" opacity="0.7"/>` +
    `<circle cx="-1.2" cy="-4.5" r="1.5" fill="${c.autumnGold}" opacity="0.6"/>` +
    `<circle cx="1.5" cy="-4" r="1.4" fill="${c.autumnBronze}" opacity="0.55"/>` +
    `<circle cx="-0.5" cy="-2.5" r="1" fill="${c.oakGold}" opacity="0.5"/>` +
    `<ellipse cx="0.8" cy="-2" rx="0.25" ry="0.35" fill="${c.acornBody}"/>` +
    `</g>`
  );
}

export function svgAutumnBirch(x: number, y: number, c: AssetColors, v: number): string {
  const yellow = c.birchYellow;
  const bark = c.birchBark;
  if (v === 2) {
    // Half-bare
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.4" y="-1" width="0.8" height="4" fill="${bark}"/>` +
      `<line x1="0" y1="-2" x2="-2" y2="-3.5" stroke="${bark}" stroke-width="0.3"/>` +
      `<line x1="0" y1="-3" x2="1.5" y2="-4" stroke="${bark}" stroke-width="0.3"/>` +
      `<circle cx="-1.5" cy="-3.8" r="1" fill="${yellow}" opacity="0.4"/>` +
      `<circle cx="1" cy="-4.2" r="0.8" fill="${yellow}" opacity="0.35"/>` +
      `</g>`
    );
  }
  // Bright yellow / pale gold
  const opacity = v === 1 ? 0.55 : 0.7;
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.4" y="-1" width="0.8" height="4" fill="${bark}"/>` +
    `<circle cx="0" cy="-3" r="2" fill="${yellow}" opacity="${opacity}"/>` +
    `<circle cx="-1" cy="-2" r="1.2" fill="${yellow}" opacity="${opacity * 0.8}"/>` +
    `<circle cx="1" cy="-3.5" r="1" fill="${yellow}" opacity="${opacity * 0.7}"/>` +
    `</g>`
  );
}

export function svgAutumnGinkgo(x: number, y: number, c: AssetColors, v: number): string {
  const yellow = c.ginkgoYellow;
  const trunk = c.trunk;
  if (v === 1) {
    // Half-fallen
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.4" y="-1" width="0.8" height="3" fill="${trunk}"/>` +
      `<circle cx="0" cy="-3" r="1.8" fill="${yellow}" opacity="0.55"/>` +
      `<ellipse cx="0" cy="0.5" rx="2" ry="0.4" fill="${yellow}" opacity="0.3"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Golden carpet
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-0.4" y="-1" width="0.8" height="3" fill="${trunk}"/>` +
      `<circle cx="0" cy="-3" r="1.5" fill="${yellow}" opacity="0.4"/>` +
      `<ellipse cx="0" cy="0.5" rx="3" ry="0.8" fill="${yellow}" opacity="0.35"/>` +
      `</g>`
    );
  }
  // Full yellow
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.4" y="-1" width="0.8" height="3" fill="${trunk}"/>` +
    `<circle cx="0" cy="-3.2" r="2" fill="${yellow}" opacity="0.7"/>` +
    `<circle cx="-0.8" cy="-2.5" r="1" fill="${yellow}" opacity="0.5"/>` +
    `<circle cx="0.8" cy="-2.5" r="1" fill="${yellow}" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgFallenLeaves(x: number, y: number, c: AssetColors, v: number): string {
  const colors =
    v === 0
      ? [c.fallenLeafRed, c.fallenLeafOrange]
      : v === 1
        ? [c.fallenLeafGold, c.fallenLeafBrown]
        : [c.fallenLeafRed, c.fallenLeafGold, c.fallenLeafOrange];
  const parts: string[] = [];
  for (let i = 0; i < colors.length; i++) {
    const lx = (i - colors.length / 2) * 1.2;
    const ly = (i % 2) * 0.3;
    const rot = i * 35 - 20;
    parts.push(
      `<ellipse cx="${lx}" cy="${ly}" rx="0.6" ry="0.25" fill="${colors[i]}" opacity="0.7" transform="rotate(${rot},${lx},${ly})"/>`,
    );
  }
  return `<g transform="translate(${x},${y})">${parts.join('')}</g>`;
}

export function svgLeafSwirl(x: number, y: number, c: AssetColors, v: number): string {
  const colors =
    v === 1
      ? [c.fallenLeafRed, c.mapleRed]
      : v === 2
        ? [c.fallenLeafGold, c.oakGold]
        : [c.fallenLeafRed, c.fallenLeafOrange, c.fallenLeafGold];
  const parts: string[] = [];
  for (let i = 0; i < colors.length; i++) {
    const angle = (i / colors.length) * Math.PI * 2;
    const radius = 1 + i * 0.3;
    const lx = Math.cos(angle) * radius;
    const ly = -1.5 + Math.sin(angle) * radius * 0.5;
    parts.push(
      `<ellipse cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" rx="0.4" ry="0.2" fill="${colors[i]}" opacity="0.65" transform="rotate(${(i * 60).toFixed(0)},${lx.toFixed(1)},${ly.toFixed(1)})"/>`,
    );
  }
  return `<g transform="translate(${x},${y})">${parts.join('')}</g>`;
}

export function svgAcorn(x: number, y: number, c: AssetColors, v: number): string {
  const body = c.acornBody;
  const cap = c.acornCap;
  const count = v === 1 ? 2 : 1;
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const ax = i * 1 - (count - 1) * 0.5;
    if (v === 2) {
      // Cap separated
      parts.push(`<ellipse cx="${ax}" cy="0" rx="0.4" ry="0.5" fill="${body}"/>`);
      parts.push(`<ellipse cx="${ax + 0.5}" cy="0.1" rx="0.4" ry="0.25" fill="${cap}"/>`);
    } else {
      parts.push(`<ellipse cx="${ax}" cy="0" rx="0.4" ry="0.5" fill="${body}"/>`);
      parts.push(`<path d="M${ax - 0.45},-0.15 Q${ax},-0.45 ${ax + 0.45},-0.15" fill="${cap}"/>`);
      parts.push(
        `<line x1="${ax}" y1="-0.35" x2="${ax}" y2="-0.55" stroke="${cap}" stroke-width="0.15"/>`,
      );
    }
  }
  return `<g transform="translate(${x},${y})">${parts.join('')}</g>`;
}
