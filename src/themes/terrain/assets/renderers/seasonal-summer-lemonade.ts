import type { AssetColors } from '../../palette.js';

export function svgLemonade(x: number, y: number, c: AssetColors, v: number): string {
  const stand = c.lemonadeStand;
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-2" y="-1.5" width="4" height="2" fill="${stand}"/>` +
    /* v8 ignore start */
    `<line x1="-2" y1="-1.5" x2="-2" y2="0.8" stroke="${c.bareBranch || '#6a5a4a'}" stroke-width="0.4"/>` +
    `<line x1="2" y1="-1.5" x2="2" y2="0.8" stroke="${c.bareBranch || '#6a5a4a'}" stroke-width="0.4"/>` +
    /* v8 ignore stop */
    (v >= 1
      ? `<rect x="-1" y="-2" width="2" height="0.5" rx="0.2" fill="${stand}" opacity="0.8"/>`
      : '') +
    /* v8 ignore start */
    `<circle cx="0" cy="-0.8" r="0.4" fill="${c.sunflowerPetal || '#f0c820'}" opacity="0.7"/>` +
    /* v8 ignore stop */
    `</g>`
  );
}

export function svgFirefliesAsset(x: number, y: number, c: AssetColors, v: number): string {
  /* v8 ignore start */
  const glow = c.lanternGlow || '#ffc840';
  /* v8 ignore stop */
  const count = v === 0 ? 3 : v === 1 ? 6 : 1;
  const parts: string[] = [];
  if (v === 2) {
    // Jar
    parts.push(
      `<rect x="-0.5" y="-2" width="1" height="1.5" rx="0.2" fill="#fff" opacity="0.15"/>`,
    );
    parts.push(`<circle cx="0" cy="-1.5" r="0.2" fill="${glow}" opacity="0.8"/>`);
    parts.push(`<circle cx="-0.2" cy="-1" r="0.15" fill="${glow}" opacity="0.6"/>`);
  } else {
    for (let i = 0; i < count; i++) {
      const fx = (i - count / 2) * 1.5;
      const fy = -1 - i * 0.5;
      parts.push(`<circle cx="${fx}" cy="${fy}" r="0.2" fill="${glow}" opacity="0.7"/>`);
      parts.push(`<circle cx="${fx}" cy="${fy}" r="0.5" fill="${glow}" opacity="0.15"/>`);
    }
  }
  return `<g transform="translate(${x},${y})">${parts.join('')}</g>`;
}

export function svgSwimmingPool(x: number, y: number, c: AssetColors, v: number): string {
  const water = c.poolWater;
  const edge = c.poolEdge;
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-3" y="-1" width="6" height="2.5" rx="0.5" fill="${edge}"/>` +
    `<rect x="-2.5" y="-0.5" width="5" height="1.5" rx="0.3" fill="${water}" opacity="0.7"/>` +
    /* v8 ignore start */
    (v === 1
      ? `<ellipse cx="0.5" cy="0" rx="0.8" ry="0.3" fill="${c.parasolYellow || '#e8c820'}" opacity="0.5"/>`
      : '') +
    /* v8 ignore stop */
    (v === 2
      ? `<line x1="2.5" y1="-1" x2="2.5" y2="-2.5" stroke="${edge}" stroke-width="0.3"/>`
      : '') +
    `</g>`
  );
}
