import type { AssetColors } from '../../palette.js';

export function svgCornStalkAsset(x: number, y: number, c: AssetColors, v: number): string {
  const stalk = c.cornStalkColor;
  const ear = c.cornEar;
  const count = v === 1 ? 3 : 1;
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const sx = i * 1.2 - (count - 1) * 0.6;
    parts.push(
      `<line x1="${sx}" y1="0.5" x2="${sx}" y2="-3" stroke="${stalk}" stroke-width="0.4"/>`,
    );
    if (v === 2 || v === 0) {
      parts.push(`<ellipse cx="${sx + 0.5}" cy="-1.5" rx="0.3" ry="0.7" fill="${ear}"/>`);
    }
    parts.push(
      `<path d="M${sx},-2 Q${sx + 1.5},-2.5 ${sx + 1},-1" fill="${stalk}" opacity="0.5"/>`,
    );
    parts.push(
      `<path d="M${sx},-1.5 Q${sx - 1.5},-2 ${sx - 1},-0.5" fill="${stalk}" opacity="0.5"/>`,
    );
  }
  return `<g transform="translate(${x},${y})">${parts.join('')}</g>`;
}

export function svgScarecrowAutumn(x: number, y: number, c: AssetColors, v: number): string {
  /* v8 ignore start */
  const hat = c.scarecrowHat || '#5a4020';
  const body = c.scarecrow || '#8a7040';
  /* v8 ignore stop */
  if (v === 1) {
    // With crow
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="1" x2="0" y2="-3" stroke="${body}" stroke-width="0.5"/>` +
      `<line x1="-2" y1="-1.5" x2="2" y2="-1.5" stroke="${body}" stroke-width="0.4"/>` +
      /* v8 ignore start */
      `<circle cx="0" cy="-3.5" r="0.8" fill="${c.lambWool || '#f0ece5'}"/>` +
      /* v8 ignore stop */
      `<rect x="-1.2" y="-4.5" width="2.4" height="0.5" fill="${hat}"/>` +
      `<rect x="-0.7" y="-5" width="1.4" height="0.6" fill="${hat}"/>` +
      `<circle cx="1.8" cy="-2" r="0.4" fill="#333"/>` +
      `<polygon points="1.8,-2 2.5,-2.1 1.8,-1.8" fill="#333"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // With pumpkin head
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="1" x2="0" y2="-3" stroke="${body}" stroke-width="0.5"/>` +
      `<line x1="-2" y1="-1.5" x2="2" y2="-1.5" stroke="${body}" stroke-width="0.4"/>` +
      /* v8 ignore start */
      `<circle cx="0" cy="-3.8" r="1" fill="${c.pumpkin || '#d07020'}"/>` +
      /* v8 ignore stop */
      `<polygon points="-0.3,-3.8 0,-4.3 0.3,-3.8" fill="#333"/>` +
      `<polygon points="0,-3.5 0.5,-3.3 0,-3.2" fill="#333"/>` +
      `</g>`
    );
  }
  // Classic
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="1" x2="0" y2="-3" stroke="${body}" stroke-width="0.5"/>` +
    `<line x1="-2" y1="-1.5" x2="2" y2="-1.5" stroke="${body}" stroke-width="0.4"/>` +
    /* v8 ignore start */
    `<circle cx="0" cy="-3.5" r="0.8" fill="${c.lambWool || '#f0ece5'}"/>` +
    /* v8 ignore stop */
    `<rect x="-1.2" y="-4.5" width="2.4" height="0.5" fill="${hat}"/>` +
    `<rect x="-0.7" y="-5" width="1.4" height="0.6" fill="${hat}"/>` +
    `<ellipse cx="0" cy="-1" rx="1.2" ry="1.5" fill="${body}" opacity="0.5"/>` +
    /* v8 ignore start */
    `<ellipse cx="-1" cy="-1.8" rx="0.4" ry="0.2" fill="${c.fallenLeafRed || '#c04030'}"/>` +
    /* v8 ignore stop */
    `</g>`
  );
}

export function svgHarvestBasket(x: number, y: number, c: AssetColors, v: number): string {
  /* v8 ignore start */
  const basket = c.oakBrown || '#8a6030';
  /* v8 ignore stop */
  const contents =
    v === 0
      ? [c.harvestApple, c.harvestApple]
      : v === 1
        ? /* v8 ignore start */
          [c.sproutGreen || '#80d050', c.harvestApple, c.sunflowerPetal || '#f0c820']
        : /* v8 ignore stop */
          [c.harvestGrape, c.harvestGrape];
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-1.5,0 Q-1.8,-1 -1,-1.5 Q0,-1.8 1,-1.5 Q1.8,-1 1.5,0 Z" fill="${basket}"/>` +
    `<path d="M-1,-1.3 Q0,-2 1,-1.3" fill="none" stroke="${basket}" stroke-width="0.3"/>` +
    contents
      .map(
        (col, i) =>
          `<circle cx="${(i - (contents.length - 1) / 2) * 0.6}" cy="-1" r="0.35" fill="${col}"/>`,
      )
      .join('') +
    `</g>`
  );
}

export function svgHotDrink(x: number, y: number, c: AssetColors, v: number): string {
  const mug = c.hotDrinkMug;
  const steam = c.hotDrinkSteam;
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-0.6" y="-1" width="1.2" height="1.2" rx="0.2" fill="${mug}"/>` +
    `<path d="M0.6,-0.5 Q1.2,-0.5 1.2,-0.1 Q1.2,0.2 0.6,0.2" fill="none" stroke="${mug}" stroke-width="0.2"/>` +
    `<path d="M-0.3,-1.2 Q-0.3,-1.8 0,-1.5 Q0.3,-1.8 0.3,-1.2" fill="none" stroke="${steam}" stroke-width="0.2" opacity="0.5"/>` +
    (v >= 1
      ? `<path d="M0,-1.5 Q0.2,-2 0,-2.2" fill="none" stroke="${steam}" stroke-width="0.15" opacity="0.4"/>`
      : '') +
    `</g>`
  );
}

export function svgAutumnWreath(x: number, y: number, c: AssetColors, v: number): string {
  const green = c.wreathGreen;
  const berry = c.wreathBerry;
  return (
    `<g transform="translate(${x},${y})">` +
    `<circle cx="0" cy="-1.5" r="1.5" fill="none" stroke="${green}" stroke-width="0.8"/>` +
    `<circle cx="0" cy="-1.5" r="1.2" fill="none" stroke="${green}" stroke-width="0.4" opacity="0.5"/>` +
    (v >= 1
      ? `<circle cx="0.8" cy="-0.8" r="0.2" fill="${berry}"/><circle cx="1" cy="-1" r="0.2" fill="${berry}"/>`
      : '') +
    /* v8 ignore start */
    (v === 2
      ? `<path d="M-0.3,-0.2 Q0,0.2 0.3,-0.2" fill="${c.scarfRed || '#cc3030'}" opacity="0.7"/>`
      : '') +
    /* v8 ignore stop */
    `</g>`
  );
}

export function svgPumpkinPatch(x: number, y: number, c: AssetColors, v: number): string {
  // Cluster of pumpkins with vines
  const pumpkin = c.pumpkin;
  const stem = c.trunk;
  /* v8 ignore start */
  const vine = c.autumnOlive || '#8b8b40';
  /* v8 ignore stop */
  if (v === 1) {
    // Three pumpkins
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="-1" cy="0" rx="1" ry="0.7" fill="${pumpkin}"/>` +
      `<rect x="-1.15" y="-0.7" width="0.3" height="0.4" fill="${stem}"/>` +
      `<ellipse cx="0.8" cy="0.2" rx="0.8" ry="0.6" fill="${pumpkin}"/>` +
      `<rect x="0.65" y="-0.4" width="0.25" height="0.35" fill="${stem}"/>` +
      `<ellipse cx="0" cy="0.5" rx="0.6" ry="0.45" fill="${pumpkin}" opacity="0.9"/>` +
      `<path d="M-1.5,-0.3 Q-2,-0.8 -1.5,-1.2" stroke="${vine}" fill="none" stroke-width="0.15"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Single large pumpkin
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0" rx="1.4" ry="1" fill="${pumpkin}"/>` +
      /* v8 ignore start */
      `<line x1="-0.5" y1="-0.9" x2="-0.5" y2="0.9" stroke="${c.autumnRust || '#c05530'}" stroke-width="0.1" opacity="0.3"/>` +
      `<line x1="0.5" y1="-0.9" x2="0.5" y2="0.9" stroke="${c.autumnRust || '#c05530'}" stroke-width="0.1" opacity="0.3"/>` +
      /* v8 ignore stop */
      `<rect x="-0.15" y="-1" width="0.3" height="0.5" fill="${stem}"/>` +
      `<path d="M0.1,-0.8 Q0.8,-1.2 1.2,-0.8" stroke="${vine}" fill="none" stroke-width="0.12"/>` +
      `</g>`
    );
  }
  // Default: two pumpkins
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="-0.6" cy="0" rx="0.9" ry="0.65" fill="${pumpkin}"/>` +
    `<rect x="-0.75" y="-0.65" width="0.25" height="0.35" fill="${stem}"/>` +
    `<ellipse cx="0.7" cy="0.15" rx="0.7" ry="0.5" fill="${pumpkin}" opacity="0.9"/>` +
    `<rect x="0.55" y="-0.35" width="0.22" height="0.3" fill="${stem}"/>` +
    `<path d="M-1,-0.2 Q-1.5,-0.5 -1.3,-1" stroke="${vine}" fill="none" stroke-width="0.12"/>` +
    `</g>`
  );
}

export function svgHayMaze(x: number, y: number, c: AssetColors, v: number): string {
  // Hay bale maze for autumn festival
  const hay = c.haybale;
  /* v8 ignore start */
  const accent = c.autumnGold || '#d4a84b';
  /* v8 ignore stop */
  if (v === 1) {
    // L-shape arrangement
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-2" y="-0.8" width="4" height="1.2" rx="0.2" fill="${hay}"/>` +
      `<rect x="-2" y="-2" width="1.2" height="1.3" rx="0.2" fill="${hay}"/>` +
      `<line x1="-1.5" y1="-0.7" x2="-1.5" y2="0.3" stroke="${accent}" stroke-width="0.08"/>` +
      `<line x1="0" y1="-0.7" x2="0" y2="0.3" stroke="${accent}" stroke-width="0.08"/>` +
      `<line x1="1.5" y1="-0.7" x2="1.5" y2="0.3" stroke="${accent}" stroke-width="0.08"/>` +
      `</g>`
    );
  }
  // Default: single stack
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-1.5" y="-0.5" width="3" height="1" rx="0.2" fill="${hay}"/>` +
    `<rect x="-1" y="-1.3" width="2" height="0.9" rx="0.2" fill="${hay}" opacity="0.9"/>` +
    `<line x1="-0.8" y1="-0.4" x2="-0.8" y2="0.4" stroke="${accent}" stroke-width="0.08"/>` +
    `<line x1="0.8" y1="-0.4" x2="0.8" y2="0.4" stroke="${accent}" stroke-width="0.08"/>` +
    `</g>`
  );
}
