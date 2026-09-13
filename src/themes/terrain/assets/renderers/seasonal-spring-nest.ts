import type { AssetColors } from '../../palette.js';

export function svgNest(x: number, y: number, c: AssetColors, v: number): string {
  const brown = c.nestBrown;
  const egg1 = c.eggBlue;
  const egg2 = c.eggWhite;
  if (v === 1) {
    // 3 eggs
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0" rx="1.8" ry="0.7" fill="${brown}"/>` +
      `<ellipse cx="0" cy="-0.2" rx="1.3" ry="0.4" fill="${brown}" opacity="0.7"/>` +
      `<ellipse cx="-0.5" cy="-0.4" rx="0.3" ry="0.4" fill="${egg1}"/>` +
      `<ellipse cx="0.2" cy="-0.4" rx="0.3" ry="0.4" fill="${egg1}"/>` +
      `<ellipse cx="0.8" cy="-0.3" rx="0.3" ry="0.35" fill="${egg2}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // With baby bird
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0" rx="1.8" ry="0.7" fill="${brown}"/>` +
      `<ellipse cx="-0.5" cy="-0.4" rx="0.3" ry="0.4" fill="${egg1}"/>` +
      /* v8 ignore start */
      `<circle cx="0.5" cy="-0.8" r="0.5" fill="${c.winterBirdBrown || '#8a6040'}"/>` +
      `<polygon points="0.5,-0.8 0.9,-0.7 0.5,-0.6" fill="${c.snowmanCarrot || '#e07020'}" opacity="0.8"/>` +
      /* v8 ignore stop */
      `<circle cx="0.35" cy="-0.9" r="0.08" fill="#222"/>` +
      `</g>`
    );
  }
  // 2 eggs
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0" rx="1.5" ry="0.6" fill="${brown}"/>` +
    `<ellipse cx="0" cy="-0.2" rx="1" ry="0.35" fill="${brown}" opacity="0.7"/>` +
    `<ellipse cx="-0.3" cy="-0.4" rx="0.3" ry="0.4" fill="${egg1}"/>` +
    `<ellipse cx="0.3" cy="-0.4" rx="0.3" ry="0.4" fill="${egg2}"/>` +
    `</g>`
  );
}

export function svgLamb(x: number, y: number, c: AssetColors, v: number): string {
  const wool = c.lambWool;
  /* v8 ignore start */
  const head = c.winterBirdBrown || '#6a5040';
  /* v8 ignore stop */
  if (v === 1) {
    // Playing
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.5" rx="1.5" ry="1" fill="${wool}"/>` +
      `<circle cx="-1.2" cy="-1.2" r="0.5" fill="${head}"/>` +
      `<circle cx="-1.4" cy="-1.3" r="0.08" fill="#222"/>` +
      `<line x1="-0.5" y1="0.5" x2="-0.8" y2="1.2" stroke="${head}" stroke-width="0.3"/>` +
      `<line x1="0.5" y1="0.5" x2="0.3" y2="1.2" stroke="${head}" stroke-width="0.3"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // With mother (larger sheep nearby)
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="2" cy="-0.8" rx="2" ry="1.3" fill="${c.sheep || wool}"/>` +
      `<circle cx="0.5" cy="-1.5" r="0.6" fill="#444"/>` +
      `<ellipse cx="-1.5" cy="-0.3" rx="1.2" ry="0.8" fill="${wool}"/>` +
      `<circle cx="-2.3" cy="-0.8" r="0.4" fill="${head}"/>` +
      `<circle cx="-2.5" cy="-0.9" r="0.06" fill="#222"/>` +
      `</g>`
    );
  }
  // Standing
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.5" rx="1.3" ry="0.9" fill="${wool}"/>` +
    `<circle cx="-1" cy="-1" r="0.45" fill="${head}"/>` +
    `<circle cx="-1.2" cy="-1.1" r="0.07" fill="#222"/>` +
    `<line x1="-0.5" y1="0.3" x2="-0.5" y2="1" stroke="${head}" stroke-width="0.25"/>` +
    `<line x1="0.5" y1="0.3" x2="0.5" y2="1" stroke="${head}" stroke-width="0.25"/>` +
    `</g>`
  );
}

export function svgCrocus(x: number, y: number, c: AssetColors, v: number): string {
  const colors = [c.crocusPurple, c.crocusYellow, c.cherryPetalWhite];
  const color = colors[v] || c.crocusPurple;
  return (
    `<g transform="translate(${x},${y})">` +
    /* v8 ignore start */
    `<line x1="0" y1="0.5" x2="0" y2="-0.5" stroke="${c.tulipStem || '#5a9a40'}" stroke-width="0.3"/>` +
    /* v8 ignore stop */
    `<path d="M-0.4,-0.5 Q0,-1.5 0.4,-0.5" fill="${color}"/>` +
    `<line x1="0" y1="-0.8" x2="0" y2="-1.2" stroke="${c.crocusYellow}" stroke-width="0.2"/>` +
    `</g>`
  );
}

export function svgRainPuddle(x: number, y: number, c: AssetColors, v: number): string {
  const water = c.poolWater || c.water;
  if (v === 1) {
    // With reflection
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="0" rx="2" ry="0.8" fill="${water}" opacity="0.4"/>` +
      `<ellipse cx="0.3" cy="-0.1" rx="0.8" ry="0.3" fill="#fff" opacity="0.1"/>` +
      `<circle cx="-0.5" cy="-0.2" r="0.4" fill="${water}" opacity="0.15" stroke="${water}" stroke-width="0.2"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // In mud
    return (
      `<g transform="translate(${x},${y})">` +
      /* v8 ignore start */
      `<ellipse cx="0" cy="0" rx="1.8" ry="0.7" fill="${c.gardenSoil || '#5a4030'}" opacity="0.3"/>` +
      /* v8 ignore stop */
      `<ellipse cx="0" cy="0" rx="1.5" ry="0.5" fill="${water}" opacity="0.35"/>` +
      `</g>`
    );
  }
  // Small
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0" rx="1.5" ry="0.6" fill="${water}" opacity="0.35"/>` +
    `<ellipse cx="0.2" cy="-0.1" rx="0.6" ry="0.25" fill="#fff" opacity="0.1"/>` +
    `</g>`
  );
}

export function svgBirdhouse(x: number, y: number, c: AssetColors, v: number): string {
  const wood = c.birdhouseWood;
  if (v === 1) {
    // Painted
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0.5" x2="0" y2="-2" stroke="${wood}" stroke-width="0.5"/>` +
      /* v8 ignore start */
      `<rect x="-1" y="-3.5" width="2" height="1.5" fill="${c.parasolBlue || '#4080d0'}"/>` +
      `<polygon points="-1.2,-3.5 0,-4.5 1.2,-3.5" fill="${c.tulipRed || '#e04050'}"/>` +
      /* v8 ignore stop */
      `<circle cx="0" cy="-3" r="0.3" fill="#333"/>` +
      `<line x1="0" y1="-2.7" x2="0.5" y2="-2.5" stroke="${wood}" stroke-width="0.3"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // With bird
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="0" y1="0.5" x2="0" y2="-2" stroke="${wood}" stroke-width="0.5"/>` +
      `<rect x="-1" y="-3.5" width="2" height="1.5" fill="${wood}"/>` +
      `<polygon points="-1.2,-3.5 0,-4.5 1.2,-3.5" fill="${wood}" opacity="0.8"/>` +
      `<circle cx="0" cy="-3" r="0.3" fill="#333"/>` +
      /* v8 ignore start */
      `<circle cx="1.2" cy="-3.8" r="0.4" fill="${c.winterBirdBrown || '#8a6040'}"/>` +
      `<ellipse cx="1.2" cy="-3.5" rx="0.5" ry="0.3" fill="${c.winterBirdBrown || '#8a6040'}"/>` +
      /* v8 ignore stop */
      `</g>`
    );
  }
  // Classic
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0.5" x2="0" y2="-2" stroke="${wood}" stroke-width="0.5"/>` +
    `<rect x="-1" y="-3.5" width="2" height="1.5" fill="${wood}"/>` +
    `<polygon points="-1.2,-3.5 0,-4.5 1.2,-3.5" fill="${wood}" opacity="0.8"/>` +
    `<circle cx="0" cy="-3" r="0.3" fill="#333"/>` +
    `<line x1="0" y1="-2.7" x2="0.5" y2="-2.5" stroke="${wood}" stroke-width="0.3"/>` +
    `</g>`
  );
}

export function svgGardenBed(x: number, y: number, c: AssetColors, v: number): string {
  const soil = c.gardenSoil;
  const green = c.sproutGreen;
  if (v === 1) {
    // Sprouts showing
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-2.5" y="-0.3" width="5" height="1" rx="0.3" fill="${soil}"/>` +
      `<line x1="-1.5" y1="-0.3" x2="-1.5" y2="-1" stroke="${green}" stroke-width="0.3"/>` +
      `<line x1="0" y1="-0.3" x2="0" y2="-0.8" stroke="${green}" stroke-width="0.3"/>` +
      `<line x1="1.5" y1="-0.3" x2="1.5" y2="-1.1" stroke="${green}" stroke-width="0.3"/>` +
      `<path d="M-1.5,-1 Q-1.5,-1.5 -1,-1.2" fill="${green}"/>` +
      `<path d="M1.5,-1.1 Q1.5,-1.6 2,-1.3" fill="${green}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // With fence
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-2.5" y="-0.3" width="5" height="1" rx="0.3" fill="${soil}"/>` +
      `<line x1="-2.5" y1="-0.8" x2="2.5" y2="-0.8" stroke="${c.fence}" stroke-width="0.3"/>` +
      `<line x1="-2" y1="-1.3" x2="-2" y2="0" stroke="${c.fence}" stroke-width="0.3"/>` +
      `<line x1="2" y1="-1.3" x2="2" y2="0" stroke="${c.fence}" stroke-width="0.3"/>` +
      `<line x1="0" y1="-0.3" x2="0" y2="-0.7" stroke="${green}" stroke-width="0.3"/>` +
      `</g>`
    );
  }
  // Just planted
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-2" y="-0.3" width="4" height="0.8" rx="0.3" fill="${soil}"/>` +
    `<line x1="-1" y1="-0.1" x2="-1" y2="-0.1" stroke="${soil}" stroke-width="0.8"/>` +
    `<line x1="0.5" y1="-0.1" x2="0.5" y2="-0.1" stroke="${soil}" stroke-width="0.8"/>` +
    `</g>`
  );
}
