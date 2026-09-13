import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function renderAurora(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0" rx="5" ry="1.5" fill="${c.snowGround}" opacity="0.3"/>` +
    `<path d="M-6,-2 Q-3,-8 0,-5 Q3,-9 6,-3" stroke="${c.epicJade}" stroke-width="1.5" fill="none" opacity="0.4" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<path d="M-5,-3 Q-2,-10 1,-6 Q4,-11 6,-4" stroke="${c.epicPortal}" stroke-width="1" fill="none" opacity="0.35" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<path d="M-6,-1 Q-3,-6 0,-4 Q3,-7 5,-2" stroke="${c.epicMagic}" stroke-width="0.8" fill="none" opacity="0.3"/>` +
    `<path d="M-4,-4 Q-1,-11 2,-7 Q5,-12 6,-5" stroke="${c.epicCrystal}" stroke-width="0.6" fill="none" opacity="0.25" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<polygon points="-4,0 -3.5,-2 -3,0" fill="${c.epicJade}" opacity="0.4"/>` +
    `<polygon points="-2,0 -1.5,-2.5 -1,0" fill="${c.epicJade}" opacity="0.35"/>` +
    `<polygon points="2.5,0 3,-1.8 3.5,0" fill="${c.epicJade}" opacity="0.35"/>` +
    `<circle cx="-3" cy="-10" r="0.2" fill="${c.epicCrystal}" opacity="0.5"/>` +
    `<circle cx="2" cy="-11" r="0.15" fill="${c.epicCrystal}" opacity="0.4"/>` +
    `<circle cx="4.5" cy="-9" r="0.18" fill="${c.epicCrystal}" opacity="0.45"/>` +
    `</g>`
  );
}

export function renderGiantWaterfall(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.5" rx="5" ry="1" fill="${c.shadow}" opacity="0.12"/>` +
    `<rect x="-5.5" y="-10" width="4" height="10" fill="${c.boulder}"/>` +
    `<rect x="-5.5" y="-10" width="2" height="10" fill="${c.rock}" opacity="0.3"/>` +
    `<rect x="1.5" y="-10" width="4" height="10" fill="${c.rock}"/>` +
    `<rect x="3.5" y="-10" width="2" height="10" fill="${c.boulder}" opacity="0.3"/>` +
    `<rect x="-1.5" y="-10" width="3" height="10" fill="${c.epicCrystal}" opacity="0.45"/>` +
    `<rect x="-0.6" y="-10" width="1.2" height="10" fill="${c.epicCrystal}" opacity="0.25"/>` +
    `<line x1="-1" y1="-4" x2="1" y2="-4" stroke="${c.epicCrystal}" stroke-width="0.2" opacity="0.3"/>` +
    `<line x1="-0.8" y1="-7" x2="0.8" y2="-7" stroke="${c.epicCrystal}" stroke-width="0.15" opacity="0.25"/>` +
    `<ellipse cx="0" cy="-10.5" rx="6" ry="1.5" fill="${c.epicJade}"/>` +
    `<ellipse cx="-1" cy="0.5" rx="2.5" ry="0.8" fill="${c.epicCrystal}" opacity="0.2"/>` +
    `<ellipse cx="1" cy="0.3" rx="2" ry="0.6" fill="${c.epicCrystal}" opacity="0.15"/>` +
    `<circle cx="-3" cy="0" r="0.6" fill="${c.boulder}" opacity="0.5"/>` +
    `<circle cx="3.5" cy="0.2" r="0.5" fill="${c.rock}" opacity="0.4"/>` +
    `</g>`
  );
}

export function renderBambooGrove(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.2" rx="3.5" ry="0.7" fill="${c.shadow}" opacity="0.12"/>` +
    `<line x1="-3" y1="0" x2="-3" y2="-11" stroke="${c.epicJade}" stroke-width="0.7"/>` +
    `<line x1="-1.5" y1="0" x2="-1.5" y2="-13" stroke="${c.epicJade}" stroke-width="0.6"/>` +
    `<line x1="0" y1="0" x2="0" y2="-12" stroke="${c.epicJade}" stroke-width="0.7"/>` +
    `<line x1="1.5" y1="0" x2="1.5" y2="-11.5" stroke="${c.epicJade}" stroke-width="0.6"/>` +
    `<line x1="3" y1="0" x2="3" y2="-10" stroke="${c.epicJade}" stroke-width="0.65"/>` +
    `<line x1="-3.4" y1="-4" x2="-2.6" y2="-4" stroke="${c.leaf}" stroke-width="0.3"/>` +
    `<line x1="-3.4" y1="-7" x2="-2.6" y2="-7" stroke="${c.leaf}" stroke-width="0.3"/>` +
    `<line x1="-1.9" y1="-5" x2="-1.1" y2="-5" stroke="${c.leaf}" stroke-width="0.3"/>` +
    `<line x1="-1.9" y1="-9" x2="-1.1" y2="-9" stroke="${c.leaf}" stroke-width="0.3"/>` +
    `<line x1="-0.4" y1="-6" x2="0.4" y2="-6" stroke="${c.leaf}" stroke-width="0.3"/>` +
    `<line x1="1.1" y1="-4.5" x2="1.9" y2="-4.5" stroke="${c.leaf}" stroke-width="0.3"/>` +
    `<line x1="2.6" y1="-5" x2="3.4" y2="-5" stroke="${c.leaf}" stroke-width="0.3"/>` +
    `<path d="M-3,-7 Q-4.5,-7 -5.5,-6.5" stroke="${c.leaf}" stroke-width="0.35" fill="none"/>` +
    `<path d="M-1.5,-9 Q-3,-9 -4,-8.5" stroke="${c.leaf}" stroke-width="0.3" fill="none"/>` +
    `<path d="M0,-6 Q1.5,-6 2.5,-5.5" stroke="${c.leaf}" stroke-width="0.3" fill="none"/>` +
    `<path d="M1.5,-4.5 Q3,-4.5 4,-4" stroke="${c.leaf}" stroke-width="0.3" fill="none"/>` +
    `<path d="M3,-5 Q4.5,-5 5,-4.5" stroke="${c.leaf}" stroke-width="0.25" fill="none"/>` +
    `</g>`
  );
}

export function renderGlacierPeak(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="5" ry="1" fill="${c.shadow}" opacity="0.12"/>` +
    `<polygon points="-6,0 -1,-10 1,-10 6,0" fill="${c.ice}"/>` +
    `<polygon points="0,-10 1,-10 6,0 0,0" fill="${c.snowGround}" opacity="0.5"/>` +
    `<polygon points="-1,-10 0,-13.5 1,-10" fill="${c.snowCap}"/>` +
    `<polygon points="-3.5,-5 -2.5,-8 -1.5,-5" fill="${c.icicle}" opacity="0.5"/>` +
    `<polygon points="2,-4 3,-7.5 4,-4" fill="${c.icicle}" opacity="0.45"/>` +
    `<path d="M-5,-2 Q-3,-3 -1,-2 Q1,-3 3,-2 Q5,-3 6,0" fill="${c.snowCap}" opacity="0.25"/>` +
    `<line x1="-2" y1="-3" x2="-1" y2="-5.5" stroke="${c.epicCrystal}" stroke-width="0.25" opacity="0.4"/>` +
    `<line x1="1.5" y1="-2" x2="2" y2="-4" stroke="${c.epicCrystal}" stroke-width="0.2" opacity="0.35"/>` +
    `<line x1="-3" y1="-1" x2="-3.2" y2="0" stroke="${c.icicle}" stroke-width="0.3" opacity="0.4"/>` +
    `<line x1="3.5" y1="-1" x2="3.7" y2="0" stroke="${c.icicle}" stroke-width="0.25" opacity="0.35"/>` +
    `</g>`
  );
}

export function renderBioluminescentPool(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="5.5" ry="1.2" fill="${c.shadow}" opacity="0.1"/>` +
    `<ellipse cx="0" cy="0" rx="5.5" ry="2.2" fill="${c.boulder}"/>` +
    `<circle cx="-4" cy="-0.5" r="0.8" fill="${c.rock}" opacity="0.5"/>` +
    `<circle cx="4" cy="-0.3" r="0.7" fill="${c.rock}" opacity="0.45"/>` +
    `<ellipse cx="0" cy="-0.3" rx="4" ry="1.5" fill="${c.epicPortal}" opacity="0.4" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<ellipse cx="0" cy="-0.5" rx="2.5" ry="0.9" fill="${c.epicPortal}" opacity="0.3" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<circle cx="-1.5" cy="-0.3" r="0.3" fill="${c.epicPortal}" opacity="0.6" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<circle cx="1.2" cy="-0.5" r="0.25" fill="${c.epicCrystal}" opacity="0.5" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<circle cx="0" cy="0.2" r="0.2" fill="${c.epicPortal}" opacity="0.4"/>` +
    `<line x1="-3" y1="-1" x2="-3" y2="-2" stroke="${c.epicPortal}" stroke-width="0.2"/>` +
    `<ellipse cx="-3" cy="-2.2" rx="0.4" ry="0.25" fill="${c.epicPortal}" opacity="0.5" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<line x1="3.5" y1="-0.8" x2="3.5" y2="-1.8" stroke="${c.epicPortal}" stroke-width="0.2"/>` +
    `<ellipse cx="3.5" cy="-2" rx="0.35" ry="0.2" fill="${c.epicCrystal}" opacity="0.45" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `</g>`
  );
}

export function renderMeteorCrater(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="5.5" ry="1.2" fill="${c.shadow}" opacity="0.12"/>` +
    `<ellipse cx="0" cy="0" rx="5.5" ry="2.8" fill="${c.rock}"/>` +
    `<ellipse cx="0" cy="-0.3" rx="4" ry="1.8" fill="${c.boulder}" opacity="0.7"/>` +
    `<ellipse cx="0" cy="-0.2" rx="2.2" ry="0.9" fill="${c.shadow}" opacity="0.5"/>` +
    `<polygon points="-0.5,-0.5 0.2,-1.2 0.8,-0.3 0.3,0.2" fill="${c.rock}"/>` +
    `<polygon points="-0.5,-0.5 0.2,-1.2 0.8,-0.3 0.3,0.2" fill="${c.epicGold}" opacity="0.3"/>` +
    `<circle cx="0.1" cy="-0.4" r="1" fill="${c.epicGold}" opacity="0.15"/>` +
    `<circle cx="-4.5" cy="-1" r="0.5" fill="${c.rock}" opacity="0.5"/>` +
    `<circle cx="4" cy="0.5" r="0.6" fill="${c.rock}" opacity="0.45"/>` +
    `<circle cx="-2.5" cy="1.2" r="0.35" fill="${c.boulder}" opacity="0.4"/>` +
    `<circle cx="2.5" cy="-1.5" r="0.4" fill="${c.boulder}" opacity="0.35"/>` +
    `<line x1="0" y1="-0.5" x2="-3" y2="-1.5" stroke="${c.shadow}" stroke-width="0.2" opacity="0.3"/>` +
    `<line x1="0" y1="-0.5" x2="2.5" y2="0.5" stroke="${c.shadow}" stroke-width="0.2" opacity="0.25"/>` +
    `</g>`
  );
}
