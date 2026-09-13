import type { AssetColors } from '../../palette.js';

export function svgParasol(x: number, y: number, c: AssetColors, v: number): string {
  const colors = [c.parasolRed, c.parasolBlue, c.parasolYellow];
  const color = colors[v] || c.parasolRed;
  return (
    `<g transform="translate(${x},${y})">` +
    /* v8 ignore start */
    `<line x1="0" y1="0.5" x2="0" y2="-4" stroke="${c.bareBranch || '#6a5a4a'}" stroke-width="0.4"/>` +
    /* v8 ignore stop */
    `<path d="M-3,-4 Q0,-6 3,-4 L0,-4.5 Z" fill="${color}"/>` +
    `<path d="M-1.5,-4.2 Q0,-5 1.5,-4.2" fill="${c.parasolStripe}" opacity="0.3"/>` +
    `</g>`
  );
}

export function svgBeachTowel(x: number, y: number, c: AssetColors, v: number): string {
  const colors = [c.beachTowelA, c.beachTowelB, c.parasolYellow];
  const color = colors[v] || c.beachTowelA;
  if (v === 2) {
    // With sunglasses
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-2.5" y="-0.3" width="5" height="1.5" rx="0.3" fill="${color}" opacity="0.8"/>` +
      `<circle cx="-0.3" cy="0.2" r="0.35" fill="#333" opacity="0.6"/>` +
      `<circle cx="0.4" cy="0.2" r="0.35" fill="#333" opacity="0.6"/>` +
      `<line x1="-0.3" y1="0.2" x2="0.4" y2="0.2" stroke="#333" stroke-width="0.15"/>` +
      `</g>`
    );
  }
  // Striped or solid
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-2.5" y="-0.3" width="5" height="1.5" rx="0.3" fill="${color}" opacity="0.8"/>` +
    (v === 0
      ? `<line x1="-2.5" y1="0.3" x2="2.5" y2="0.3" stroke="${c.parasolStripe}" stroke-width="0.3" opacity="0.4"/>`
      : '') +
    `</g>`
  );
}

export function svgSandcastleSummer(x: number, y: number, c: AssetColors, v: number): string {
  const sand = c.sandcastleWall;
  if (v === 1) {
    // With flag
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-1.5" y="-1" width="3" height="1.5" fill="${sand}"/>` +
      `<rect x="-0.8" y="-2" width="1.6" height="1" fill="${sand}"/>` +
      `<rect x="-0.4" y="-2.8" width="0.8" height="0.8" fill="${sand}"/>` +
      /* v8 ignore start */
      `<line x1="0" y1="-2.8" x2="0" y2="-3.5" stroke="${c.bareBranch || '#6a5a4a'}" stroke-width="0.2"/>` +
      `<polygon points="0,-3.5 0.8,-3.2 0,-2.9" fill="${c.scarfRed || '#cc3030'}"/>` +
      /* v8 ignore stop */
      `</g>`
    );
  }
  if (v === 2) {
    // Elaborate
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-2" y="-0.5" width="4" height="1" fill="${sand}"/>` +
      `<rect x="-1.5" y="-1.5" width="1.2" height="1" fill="${sand}"/>` +
      `<rect x="0.3" y="-1.5" width="1.2" height="1" fill="${sand}"/>` +
      `<rect x="-0.5" y="-2.5" width="1" height="1" fill="${sand}"/>` +
      `<polygon points="-1.5,-1.5 -0.9,-2 -0.3,-1.5" fill="${sand}" opacity="0.8"/>` +
      `<polygon points="0.3,-1.5 0.9,-2 1.5,-1.5" fill="${sand}" opacity="0.8"/>` +
      `</g>`
    );
  }
  // Simple
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-1.2" y="-0.5" width="2.4" height="1" fill="${sand}"/>` +
    `<rect x="-0.6" y="-1.3" width="1.2" height="0.8" fill="${sand}"/>` +
    `<polygon points="-0.6,-1.3 0,-1.8 0.6,-1.3" fill="${sand}" opacity="0.8"/>` +
    `</g>`
  );
}

export function svgSurfboard(x: number, y: number, c: AssetColors, v: number): string {
  const body = c.surfboardBody;
  const stripe = c.surfboardStripe;
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-2" rx="0.8" ry="3" fill="${body}" transform="rotate(${v === 1 ? -10 : v === 2 ? 10 : 5})"/>` +
    `<line x1="0" y1="-3.5" x2="0" y2="-0.5" stroke="${stripe}" stroke-width="0.3" opacity="0.6" transform="rotate(${v === 1 ? -10 : v === 2 ? 10 : 5})"/>` +
    `</g>`
  );
}

export function svgIceCreamCartAsset(x: number, y: number, c: AssetColors, v: number): string {
  const cart = c.iceCreamCart;
  const umbrella = c.iceCreamUmbrella;
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-1.5" y="-1.5" width="3" height="2" rx="0.3" fill="${cart}"/>` +
    `<circle cx="-1" cy="0.8" r="0.4" fill="#555"/>` +
    `<circle cx="1" cy="0.8" r="0.4" fill="#555"/>` +
    /* v8 ignore start */
    `<line x1="0" y1="-1.5" x2="0" y2="-3.5" stroke="${c.bareBranch || '#6a5a4a'}" stroke-width="0.3"/>` +
    /* v8 ignore stop */
    `<path d="M-2,-3.5 Q0,-4.5 2,-3.5" fill="${umbrella}"/>` +
    /* v8 ignore start */
    (v === 1
      ? `<polygon points="1.5,-2 2.5,-2.3 1.5,-2.5" fill="${c.scarfRed || '#cc3030'}"/>`
      : '') +
    (v === 2
      ? `<rect x="-0.5" y="-2.5" width="1" height="0.8" rx="0.2" fill="${c.sunflowerPetal || '#f0c820'}"/>`
      : '') +
    /* v8 ignore stop */
    `</g>`
  );
}

export function svgHammock(x: number, y: number, c: AssetColors, v: number): string {
  const fabric = c.hammockFabric;
  return (
    `<g transform="translate(${x},${y})">` +
    /* v8 ignore start */
    `<line x1="-3" y1="0" x2="-3" y2="-3" stroke="${c.bareBranch || '#6a5a4a'}" stroke-width="0.5"/>` +
    `<line x1="3" y1="0" x2="3" y2="-3" stroke="${c.bareBranch || '#6a5a4a'}" stroke-width="0.5"/>` +
    /* v8 ignore stop */
    `<path d="M-3,-2.5 Q0,-0.5 3,-2.5" fill="none" stroke="${fabric}" stroke-width="0.8"/>` +
    `<path d="M-2.5,-2.2 Q0,-0.2 2.5,-2.2" fill="${fabric}" opacity="0.5"/>` +
    /* v8 ignore start */
    (v === 2
      ? `<rect x="-1" y="-1.8" width="2" height="1" rx="0.3" fill="${c.beachTowelA || '#e05050'}" opacity="0.4"/>`
      : '') +
    /* v8 ignore stop */
    `</g>`
  );
}

export function svgSunflower(x: number, y: number, c: AssetColors, v: number): string {
  const petal = c.sunflowerPetal;
  const center = c.sunflowerCenter;
  /* v8 ignore start */
  const stem = c.tulipStem || '#5a9a40';
  /* v8 ignore stop */
  const count = v === 2 ? 3 : v === 1 ? 2 : 1;
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const ox = i * 1.5 - (count - 1) * 0.75;
    const h = 3 + i * 0.5;
    parts.push(
      `<line x1="${ox}" y1="0.5" x2="${ox}" y2="${-h}" stroke="${stem}" stroke-width="0.4"/>`,
      `<circle cx="${ox}" cy="${-h}" r="0.6" fill="${center}"/>`,
    );
    for (let p = 0; p < 8; p++) {
      const angle = (p / 8) * Math.PI * 2;
      const px = ox + Math.cos(angle) * 1.2;
      const py = -h + Math.sin(angle) * 1.2;
      parts.push(
        `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="0.5" ry="0.25" fill="${petal}" transform="rotate(${(p * 45).toFixed(0)},${px.toFixed(1)},${py.toFixed(1)})"/>`,
      );
    }
  }
  return `<g transform="translate(${x},${y})">${parts.join('')}</g>`;
}

export function svgWatermelon(x: number, y: number, c: AssetColors, v: number): string {
  const rind = c.watermelonRind;
  const flesh = c.watermelonFlesh;
  const seed = c.watermelonSeed;
  if (v === 0) {
    // Whole
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0" rx="1.5" ry="1" fill="${rind}"/>` +
      `<line x1="-1" y1="0" x2="1" y2="0" stroke="${rind}" stroke-width="0.15" opacity="0.5"/>` +
      `</g>`
    );
  }
  if (v === 1) {
    // Half
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M-1.5,0 A1.5,1 0 0 1 1.5,0 Z" fill="${rind}"/>` +
      `<path d="M-1.2,0 A1.2,0.8 0 0 1 1.2,0 Z" fill="${flesh}"/>` +
      `<circle cx="-0.3" cy="-0.2" r="0.12" fill="${seed}"/>` +
      `<circle cx="0.4" cy="-0.3" r="0.12" fill="${seed}"/>` +
      `</g>`
    );
  }
  // Slice
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-1,0 Q0,-1.5 1,0 Z" fill="${rind}"/>` +
    `<path d="M-0.8,0 Q0,-1.2 0.8,0 Z" fill="${flesh}"/>` +
    `<circle cx="-0.2" cy="-0.3" r="0.1" fill="${seed}"/>` +
    `<circle cx="0.3" cy="-0.4" r="0.1" fill="${seed}"/>` +
    `</g>`
  );
}

export function svgSprinkler(x: number, y: number, c: AssetColors, v: number): string {
  const metal = c.sprinklerMetal;
  const water = c.poolWater || c.water;
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0.5" x2="0" y2="-0.5" stroke="${metal}" stroke-width="0.5"/>` +
    `<circle cx="0" cy="-0.8" r="0.4" fill="${metal}"/>` +
    `<line x1="-1.5" y1="-2" x2="0" y2="-0.8" stroke="${water}" stroke-width="0.2" opacity="0.4"/>` +
    `<line x1="1.5" y1="-2" x2="0" y2="-0.8" stroke="${water}" stroke-width="0.2" opacity="0.4"/>` +
    `<line x1="0" y1="-2.5" x2="0" y2="-0.8" stroke="${water}" stroke-width="0.2" opacity="0.4"/>` +
    (v === 2
      ? `<path d="M-1.5,-2 Q0,-1.5 1.5,-2" fill="none" stroke="${water}" stroke-width="0.15" opacity="0.3"/>`
      : '') +
    `</g>`
  );
}
