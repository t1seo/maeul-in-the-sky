import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function svgRabbit(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Hopping variant — legs extended
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-1" rx="1" ry="0.7" fill="${c.rabbit}"/>` +
      `<circle cx="-0.8" cy="-1.6" r="0.45" fill="${c.rabbit}"/>` +
      `<ellipse cx="-1" cy="-2.3" rx="0.18" ry="0.5" fill="${c.rabbit}"/>` +
      `<ellipse cx="-0.6" cy="-2.3" rx="0.18" ry="0.5" fill="${c.rabbit}"/>` +
      `<circle cx="-1" cy="-1.7" r="0.1" fill="#222"/>` +
      `<line x1="0.8" y1="-0.5" x2="1.5" y2="0.2" stroke="${c.rabbit}" stroke-width="0.3"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Pair variant — two rabbits
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="-0.5" cy="-0.8" rx="1" ry="0.7" fill="${c.rabbit}"/>` +
      `<circle cx="-1.3" cy="-1.4" r="0.4" fill="${c.rabbit}"/>` +
      `<ellipse cx="-1.5" cy="-2" rx="0.15" ry="0.45" fill="${c.rabbit}"/>` +
      `<ellipse cx="-1.1" cy="-2" rx="0.15" ry="0.45" fill="${c.rabbit}"/>` +
      `<ellipse cx="1.5" cy="-0.6" rx="0.8" ry="0.5" fill="${c.rabbit}" opacity="0.8"/>` +
      `<circle cx="0.9" cy="-1" r="0.3" fill="${c.rabbit}" opacity="0.8"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-0.8" rx="1.2" ry="0.8" fill="${c.rabbit}"/>` +
    `<circle cx="-0.8" cy="-1.5" r="0.5" fill="${c.rabbit}"/>` +
    `<ellipse cx="-1.1" cy="-2.3" rx="0.2" ry="0.6" fill="${c.rabbit}"/>` +
    `<ellipse cx="-0.6" cy="-2.3" rx="0.2" ry="0.6" fill="${c.rabbit}"/>` +
    `<circle cx="-1" cy="-1.6" r="0.1" fill="#222"/>` +
    `</g>`
  );
}

export function svgFox(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Curled up variant — sleeping
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-0.8" rx="1.5" ry="0.8" fill="${c.fox}"/>` +
      `<circle cx="-1" cy="-1.2" r="0.5" fill="${c.fox}"/>` +
      `<polygon points="-1.3,-1.7 -1.5,-2.1 -1,-1.8" fill="${c.fox}"/>` +
      `<polygon points="-0.7,-1.7 -0.5,-2.1 -1,-1.8" fill="${c.fox}"/>` +
      `<path d="M1.5,-0.5 Q1.2,-0.2 0.5,-0.5" stroke="${c.fox}" fill="none" stroke-width="0.5"/>` +
      `<circle cx="0.5" cy="-0.5" r="0.25" fill="#fff" opacity="0.8"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Trotting variant — legs moving
    return (
      `<g transform="translate(${x},${y})">` +
      `<ellipse cx="0" cy="-1.5" rx="1.8" ry="0.9" fill="${c.fox}"/>` +
      `<circle cx="-1.5" cy="-2.3" r="0.55" fill="${c.fox}"/>` +
      `<polygon points="-1.8,-2.8 -2,-3.3 -1.5,-2.9" fill="${c.fox}"/>` +
      `<polygon points="-1.2,-2.8 -1,-3.3 -1.5,-2.9" fill="${c.fox}"/>` +
      `<circle cx="-1.7" cy="-2.4" r="0.1" fill="#222"/>` +
      `<line x1="-0.8" y1="-0.6" x2="-1.3" y2="0.3" stroke="${c.fox}" stroke-width="0.3"/>` +
      `<line x1="0.8" y1="-0.6" x2="1.3" y2="0.3" stroke="${c.fox}" stroke-width="0.3"/>` +
      `<path d="M1.8,-1.3 Q2.5,-1.5 3,-1" stroke="${c.fox}" fill="none" stroke-width="0.5"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-1.2" rx="1.8" ry="1" fill="${c.fox}"/>` +
    `<circle cx="-1.5" cy="-2" r="0.6" fill="${c.fox}"/>` +
    `<polygon points="-1.8,-2.6 -2,-3.2 -1.5,-2.7" fill="${c.fox}"/>` +
    `<polygon points="-1.2,-2.6 -1,-3.2 -1.5,-2.7" fill="${c.fox}"/>` +
    `<circle cx="-1.7" cy="-2.1" r="0.1" fill="#222"/>` +
    `<path d="M1.8,-1 Q2.5,-0.8 3,-1.5" stroke="${c.fox}" fill="none" stroke-width="0.6"/>` +
    `<circle cx="3" cy="-1.5" r="0.3" fill="#fff" opacity="0.8"/>` +
    `</g>`
  );
}

export function svgButterfly(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<g>` +
    `<ellipse cx="-1" cy="-3.5" rx="1" ry="0.7" fill="${c.butterfly}" opacity="0.8"/>` +
    `<ellipse cx="1" cy="-3.5" rx="1" ry="0.7" fill="${c.butterflyWing}" opacity="0.8"/>` +
    `<ellipse cx="-0.6" cy="-2.8" rx="0.6" ry="0.4" fill="${c.butterflyWing}" opacity="0.7"/>` +
    `<ellipse cx="0.6" cy="-2.8" rx="0.6" ry="0.4" fill="${c.butterfly}" opacity="0.7"/>` +
    `<line x1="0" y1="-2.5" x2="0" y2="-4" stroke="${c.bird}" stroke-width="0.2"/>` +
    motionMarkup(
      `<animateTransform attributeName="transform" type="translate" values="0,0;2,-1;-1,0.5;0,0" dur="6s" repeatCount="indefinite"/>`,
    ) +
    `</g>` +
    `</g>`
  );
}

export function svgBeehive(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="-5" x2="0" y2="-7" stroke="${c.trunk}" stroke-width="0.5"/>` +
    `<path d="M-1,-5 Q1,-4.5 1,-5" stroke="${c.trunk}" fill="none" stroke-width="0.3"/>` +
    `<ellipse cx="0" cy="-3.5" rx="1.2" ry="1.8" fill="${c.beehive}"/>` +
    `<line x1="-1.2" y1="-3.5" x2="1.2" y2="-3.5" stroke="${c.trunk}" stroke-width="0.2" opacity="0.4"/>` +
    `<line x1="-1" y1="-2.5" x2="1" y2="-2.5" stroke="${c.trunk}" stroke-width="0.2" opacity="0.4"/>` +
    `<circle cx="0" cy="-1.8" r="0.25" fill="${c.trunk}"/>` +
    `</g>`
  );
}

export function svgWildflowerPatch(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<circle cx="-1.5" cy="-1.5" r="0.5" fill="${c.flower}"/>` +
    `<circle cx="0" cy="-1.8" r="0.6" fill="${c.wildflower}"/>` +
    `<circle cx="1.2" cy="-1.3" r="0.5" fill="${c.butterflyWing}"/>` +
    `<circle cx="-0.5" cy="-1" r="0.4" fill="${c.flower}" opacity="0.8"/>` +
    `<circle cx="0.8" cy="-2" r="0.35" fill="${c.wildflower}" opacity="0.7"/>` +
    `<line x1="-1.5" y1="-1" x2="-1.5" y2="0" stroke="${c.pine}" stroke-width="0.2"/>` +
    `<line x1="0" y1="-1.2" x2="0" y2="0" stroke="${c.pine}" stroke-width="0.2"/>` +
    `<line x1="1.2" y1="-0.8" x2="1.2" y2="0" stroke="${c.pine}" stroke-width="0.2"/>` +
    `</g>`
  );
}

export function svgTallGrass(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})" ${motionMarkup('class="sway-gentle"')}>` +
    `<line x1="-1" y1="0" x2="-1.3" y2="-3.5" stroke="${c.tallGrass}" stroke-width="0.4"/>` +
    `<line x1="0" y1="0" x2="0.2" y2="-4" stroke="${c.tallGrass}" stroke-width="0.4"/>` +
    `<line x1="1" y1="0" x2="0.8" y2="-3.2" stroke="${c.tallGrass}" stroke-width="0.4"/>` +
    `<line x1="-0.5" y1="0" x2="-0.8" y2="-3.8" stroke="${c.tallGrass}" stroke-width="0.3" opacity="0.7"/>` +
    `</g>`
  );
}

export function svgBirch(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) {
    // Cluster of 3 variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<line x1="-2" y1="0" x2="-2" y2="-5.5" stroke="${c.birchBark}" stroke-width="0.5"/>` +
      `<circle cx="-2" cy="-6.5" r="1.5" fill="${c.leaf}" opacity="0.7"/>` +
      `<line x1="0" y1="0" x2="0" y2="-7" stroke="${c.birchBark}" stroke-width="0.6"/>` +
      `<circle cx="0" cy="-8" r="1.8" fill="${c.leaf}" opacity="0.8"/>` +
      `<line x1="2" y1="0" x2="2" y2="-5" stroke="${c.birchBark}" stroke-width="0.5"/>` +
      `<circle cx="2" cy="-6" r="1.3" fill="${c.leaf}" opacity="0.6"/>` +
      `</g>`
    );
  }
  if (v === 2) {
    // Leaning variant
    return (
      `<g transform="translate(${x},${y})">` +
      `<path d="M0,0 Q-1,-3.5 -0.5,-7" stroke="${c.birchBark}" fill="none" stroke-width="0.7"/>` +
      `<line x1="-0.7" y1="-2" x2="-0.3" y2="-2" stroke="${c.trunk}" stroke-width="0.2" opacity="0.5"/>` +
      `<line x1="-0.5" y1="-4.5" x2="-0.1" y2="-4.5" stroke="${c.trunk}" stroke-width="0.2" opacity="0.5"/>` +
      `<circle cx="-0.5" cy="-8.5" r="2" fill="${c.leaf}" opacity="0.8"/>` +
      `<circle cx="-1.5" cy="-8" r="1.3" fill="${c.leaf}" opacity="0.6"/>` +
      `</g>`
    );
  }
  return (
    `<g transform="translate(${x},${y})">` +
    `<line x1="0" y1="0" x2="0" y2="-7" stroke="${c.birchBark}" stroke-width="0.7"/>` +
    `<line x1="-0.2" y1="-2" x2="0.2" y2="-2" stroke="${c.trunk}" stroke-width="0.2" opacity="0.5"/>` +
    `<line x1="-0.2" y1="-4" x2="0.2" y2="-4" stroke="${c.trunk}" stroke-width="0.2" opacity="0.5"/>` +
    `<circle cx="0" cy="-8.5" r="2.2" fill="${c.leaf}" opacity="0.8"/>` +
    `<circle cx="-1" cy="-8" r="1.5" fill="${c.leaf}" opacity="0.6"/>` +
    `</g>`
  );
}

export function svgHaybale(x: number, y: number, c: AssetColors, _v: number): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="-1" rx="2" ry="1" fill="${c.haybale}"/>` +
    `<rect x="-2" y="-1" width="4" height="1" fill="${c.haybale}"/>` +
    `<ellipse cx="0" cy="0" rx="2" ry="0.6" fill="${c.haybale}" opacity="0.7"/>` +
    `<line x1="-1.5" y1="-0.5" x2="1.5" y2="-0.5" stroke="${c.wheat}" stroke-width="0.2" opacity="0.4"/>` +
    `</g>`
  );
}
