import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function svgMarket(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // With cart variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<rect x="-3" y="-3" width="6" height="3" fill="${c.market}"/>` +
      `<polygon points="-3.5,-3 0,-5 3.5,-3" fill="${c.marketAwning}"/>` +
      `<rect x="-2" y="-1.5" width="1" height="0.8" fill="${c.barrel}" rx="0.2"/>` +
      `<rect x="4" y="-1.5" width="2.5" height="1.2" fill="${c.cart}"/>` +
      `<circle cx="4.5" cy="0" r="0.5" fill="${c.trunk}"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Open stall variant — no back wall, posts only
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="-3" y1="0" x2="-3" y2="-4" stroke="${c.trunk}" stroke-width="0.5"/>` +
      `<line x1="3" y1="0" x2="3" y2="-4" stroke="${c.trunk}" stroke-width="0.5"/>` +
      `<polygon points="-3.5,-4 0,-5.5 3.5,-4" fill="${c.marketAwning}"/>` +
      `<rect x="-2.5" y="-1" width="5" height="0.8" fill="${c.trunk}" opacity="0.4"/>` +
      `<rect x="-2" y="-1.5" width="1" height="0.8" fill="${c.barrel}" rx="0.2"/>` +
      `<rect x="0.5" y="-1.5" width="1" height="0.8" fill="${c.wheat}" rx="0.2"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-3" y="-3" width="6" height="3" fill="${c.market}"/>` +
    `<polygon points="-3.5,-3 0,-5 3.5,-3" fill="${c.marketAwning}"/>` +
    // Goods display
    `<rect x="-2" y="-1.5" width="1" height="0.8" fill="${c.barrel}" rx="0.2"/>` +
    `<rect x="0.5" y="-1.5" width="1" height="0.8" fill="${c.wheat}" rx="0.2"/>` +
    `</g>`
  );
}

export function svgInn(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // With dormer variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<polygon points="-3,0 0,1.5 3,0 3,-4 0,-2.5 -3,-4" fill="${c.inn}"/>` +
      `<polygon points="-3,0 0,1.5 0,-2.5 -3,-4" fill="${c.wallShade}"/>` +
      `<polygon points="0,-7 -3.5,-3.8 0,-2.2 3.5,-3.8" fill="${c.roofB}"/>` +
      `<rect x="-1" y="-5.5" width="1.5" height="1.5" fill="${c.wall}"/>` +
      `<polygon points="-1,-5.5 -0.25,-6.5 0.5,-5.5" fill="${c.roofB}"/>` +
      `<rect x="3" y="-5" width="2" height="1.5" fill="${c.innSign}" rx="0.3"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Outdoor seating variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<polygon points="-3,0 0,1.5 3,0 3,-4 0,-2.5 -3,-4" fill="${c.inn}"/>` +
      `<polygon points="-3,0 0,1.5 0,-2.5 -3,-4" fill="${c.wallShade}"/>` +
      `<polygon points="0,-7 -3.5,-3.8 0,-2.2 3.5,-3.8" fill="${c.roofB}"/>` +
      `<rect x="3" y="-5" width="2" height="1.5" fill="${c.innSign}" rx="0.3"/>` +
      `<rect x="3.5" y="-1.5" width="2" height="0.5" fill="${c.trunk}" opacity="0.6"/>` +
      `<rect x="4" y="-1" width="0.5" height="1" fill="${c.trunk}" opacity="0.5"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-3,0 0,1.5 3,0 3,-4 0,-2.5 -3,-4" fill="${c.inn}"/>` +
    `<polygon points="-3,0 0,1.5 0,-2.5 -3,-4" fill="${c.wallShade}"/>` +
    `<polygon points="0,-7 -3.5,-3.8 0,-2.2 3.5,-3.8" fill="${c.roofB}"/>` +
    // Sign
    `<rect x="3" y="-5" width="2" height="1.5" fill="${c.innSign}" rx="0.3"/>` +
    `</g>`
  );
}

export function svgBlacksmith(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-2.5" y="-3" width="5" height="3" fill="${c.blacksmith}"/>` +
    `<polygon points="-3,-3 0,-5 3,-3" fill="${c.roofA}"/>` +
    // Anvil
    `<polygon points="-1,-0.5 1,-0.5 1.5,-1.5 -1.5,-1.5" fill="${c.anvil}"/>` +
    // Smoke from forge
    `<circle cx="1.5" cy="-5.5" r="0.8" fill="${c.smoke}" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgCastle(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    // Main body
    `<rect x="-3" y="-6" width="6" height="6" fill="${c.castle}"/>` +
    // Battlements
    `<rect x="-3" y="-7" width="1.5" height="1.2" fill="${c.castle}"/>` +
    `<rect x="-0.75" y="-7" width="1.5" height="1.2" fill="${c.castle}"/>` +
    `<rect x="1.5" y="-7" width="1.5" height="1.2" fill="${c.castle}"/>` +
    // Tower
    `<rect x="-1" y="-10" width="2" height="3.5" fill="${c.tower}"/>` +
    `<polygon points="-1.3,-10 0,-12 1.3,-10" fill="${c.castleRoof}"/>` +
    // Gate
    `<rect x="-0.8" y="-2" width="1.6" height="2" fill="${c.blacksmith}" rx="0.8" ry="0"/>` +
    `</g>`
  );
}

export function svgTower(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-1.5" y="-8" width="3" height="8" fill="${c.tower}"/>` +
    `<polygon points="-2,-8 0,-11 2,-8" fill="${c.castleRoof}"/>` +
    // Window
    `<rect x="-0.5" y="-6" width="1" height="1.2" fill="${c.blacksmith}" rx="0.5" ry="0"/>` +
    `</g>`
  );
}

export function svgBridge(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-4,0 Q0,-2 4,0" fill="${c.bridge}" stroke="${c.trunk}" stroke-width="0.4"/>` +
    `<line x1="-3" y1="-0.8" x2="-3" y2="-2.5" stroke="${c.trunk}" stroke-width="0.4"/>` +
    `<line x1="3" y1="-0.8" x2="3" y2="-2.5" stroke="${c.trunk}" stroke-width="0.4"/>` +
    `<line x1="-3" y1="-2.5" x2="3" y2="-2.5" stroke="${c.trunk}" stroke-width="0.3"/>` +
    `</g>`
  );
}

export function svgCathedral(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-3,0 0,1.5 3,0 3,-6 0,-4.5 -3,-6" fill="${c.cathedral}"/>` +
    `<polygon points="-3,0 0,1.5 0,-4.5 -3,-6" fill="${c.wallShade}"/>` +
    `<polygon points="0,-10 -3.5,-5.5 0,-4 3.5,-5.5" fill="${c.roofA}"/>` +
    `<circle cx="0" cy="-7" r="1" fill="${c.cathedralWindow}" opacity="0.7"/>` +
    `<line x1="0" y1="-12" x2="0" y2="-10" stroke="${c.wall}" stroke-width="0.5"/>` +
    `<line x1="-0.8" y1="-11" x2="0.8" y2="-11" stroke="${c.wall}" stroke-width="0.4"/>` +
    `</g>`
  );
}

export function svgLibrary(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-2.5" y="-4" width="5" height="4" fill="${c.library}"/>` +
    `<polygon points="-3,-4 0,-6 3,-4" fill="${c.roofB}"/>` +
    `<rect x="-1.5" y="-3.5" width="1" height="1.5" fill="${c.blacksmith}" rx="0.2"/>` +
    `<rect x="0.5" y="-3.5" width="1" height="1.5" fill="${c.blacksmith}" rx="0.2"/>` +
    `</g>`
  );
}

export function svgClocktower(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-1.5" y="-10" width="3" height="10" fill="${c.clocktower}"/>` +
    `<polygon points="-2,-10 0,-12.5 2,-10" fill="${c.castleRoof}"/>` +
    `<circle cx="0" cy="-8" r="1.2" fill="${c.clockFace}"/>` +
    `<g>` +
    `<line x1="0" y1="-8" x2="0" y2="-9" stroke="${c.bird}" stroke-width="0.3"/>` +
    motionMarkup(
      `<animateTransform attributeName="transform" type="rotate" values="-15 0 -8;15 0 -8;-15 0 -8" dur="4s" repeatCount="indefinite"/>`,
    ) +
    `</g>` +
    `<line x1="0" y1="-8" x2="0.6" y2="-7.5" stroke="${c.bird}" stroke-width="0.2"/>` +
    `</g>`
  );
}

export function svgStatue(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-1" y="-1.5" width="2" height="1.5" fill="${c.rock}"/>` +
    `<rect x="-0.6" y="-4" width="1.2" height="2.5" fill="${c.statue}"/>` +
    `<circle cx="0" cy="-4.5" r="0.6" fill="${c.statue}"/>` +
    `</g>`
  );
}

export function svgPark(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="2" y1="0" x2="2" y2="-3" stroke="${c.trunk}" stroke-width="0.5"/>` +
    `<circle cx="2" cy="-4.5" r="2" fill="${c.gardenTree}"/>` +
    `<rect x="-3" y="-1" width="3" height="0.5" fill="${c.parkBench}"/>` +
    `<line x1="-3" y1="-1" x2="-3" y2="0" stroke="${c.parkBench}" stroke-width="0.3"/>` +
    `<line x1="0" y1="-1" x2="0" y2="0" stroke="${c.parkBench}" stroke-width="0.3"/>` +
    `</g>`
  );
}

export function svgWarehouse(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-3.5" y="-3.5" width="7" height="3.5" fill="${c.warehouse}"/>` +
    `<polygon points="-4,-3.5 0,-5.5 4,-3.5" fill="${c.roofA}" opacity="0.8"/>` +
    `<rect x="-1" y="-2" width="2" height="2" fill="${c.blacksmith}" opacity="0.5"/>` +
    `</g>`
  );
}

export function svgGatehouse(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<rect x="-2" y="-6" width="4" height="6" fill="${c.gatehouse}"/>` +
    `<rect x="-1" y="-4" width="2" height="4" fill="${c.blacksmith}" rx="1" ry="0"/>` +
    `<rect x="-3" y="-7" width="2" height="1.5" fill="${c.tower}"/>` +
    `<rect x="1" y="-7" width="2" height="1.5" fill="${c.tower}"/>` +
    `</g>`
  );
}
