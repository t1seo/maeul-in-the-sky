import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function renderFloatingIsland(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<polygon points="-3.5,3 -2,1 0,0.5 2,1 3.5,3 1,4.5 -1,4.5" fill="${c.boulder}" opacity="0.7"/>` +
    `<polygon points="-2,1 0,0.5 2,1 1,4 -1,4" fill="${c.rock}" opacity="0.5"/>` +
    `<path d="M-1,3 Q-1.5,5 -1,6" stroke="${c.trunk}" stroke-width="0.3" fill="none" opacity="0.5"/>` +
    `<path d="M0.5,3.5 Q0,5.5 0.5,7" stroke="${c.trunk}" stroke-width="0.25" fill="none" opacity="0.4"/>` +
    `<ellipse cx="0" cy="-1" rx="4.5" ry="1.8" fill="${c.leaf}"/>` +
    `<ellipse cx="0" cy="-1.3" rx="3.5" ry="1.2" fill="${c.epicJade}" opacity="0.5"/>` +
    `<rect x="-0.3" y="-4.5" width="0.6" height="3" fill="${c.trunk}"/>` +
    `<ellipse cx="0" cy="-5.5" rx="2" ry="1.5" fill="${c.bushDark}"/>` +
    `<ellipse cx="0" cy="-5.5" rx="1.8" ry="1.3" fill="${c.epicJade}"/>` +
    `<circle cx="2.5" cy="-1.5" r="0.8" fill="${c.epicJade}" opacity="0.7"/>` +
    `<ellipse cx="-3" cy="0" rx="1.2" ry="0.4" fill="${c.epicCrystal}" opacity="0.15"/>` +
    `<ellipse cx="3.5" cy="1" rx="1" ry="0.3" fill="${c.epicCrystal}" opacity="0.12"/>` +
    `</g>`
  );
}

export function renderCrystalSpire(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="3" ry="0.6" fill="${c.shadow}" opacity="0.12"/>` +
    `<polygon points="-3.5,0 -3,-3 -2.5,0" fill="${c.epicCrystal}" opacity="0.4"/>` +
    `<polygon points="3,0 3.5,-2.5 4,0" fill="${c.epicCrystal}" opacity="0.35"/>` +
    `<polygon points="-4.5,0 -4,-2 -3.5,0" fill="${c.epicCrystal}" opacity="0.3"/>` +
    `<polygon points="-2,0 -0.5,-10 0,-13 0,0" fill="${c.epicCrystal}" opacity="0.7"/>` +
    `<polygon points="0,0 0,-13 0.5,-10 2,0" fill="${c.epicCrystal}" opacity="0.5"/>` +
    `<polygon points="-0.5,-3 0,-13 0.5,-3" fill="${c.epicCrystal}" opacity="0.3"/>` +
    `<polygon points="-2.5,0 -1.5,-6 -0.5,0" fill="${c.epicCrystal}" opacity="0.45"/>` +
    `<polygon points="1,0 2,-5 3,0" fill="${c.epicCrystal}" opacity="0.4"/>` +
    `<line x1="-0.3" y1="-8" x2="0.3" y2="-7" stroke="${c.epicCrystal}" stroke-width="0.3" opacity="0.6"/>` +
    `<line x1="-0.5" y1="-5" x2="0.2" y2="-4.5" stroke="${c.epicCrystal}" stroke-width="0.2" opacity="0.5"/>` +
    `<circle cx="0" cy="-13" r="0.4" fill="${c.epicCrystal}" opacity="0.4"/>` +
    `</g>`
  );
}

export function renderDragonNest(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="5" ry="1.2" fill="${c.shadow}" opacity="0.15"/>` +
    `<ellipse cx="0" cy="-0.5" rx="5" ry="2" fill="${c.trunk}"/>` +
    `<path d="M-4,-0.5 Q-2,-1.5 0,-0.5 Q2,-1.5 4,-0.5" fill="none" stroke="${c.trunk}" stroke-width="0.5" opacity="0.5"/>` +
    `<path d="M-3.5,0 Q-1.5,-1 0.5,0 Q2.5,-1 4.5,0" fill="none" stroke="${c.trunk}" stroke-width="0.4" opacity="0.4"/>` +
    `<ellipse cx="0" cy="-1" rx="3.5" ry="1.2" fill="${c.trunk}" opacity="0.6"/>` +
    `<ellipse cx="-1.2" cy="-1.5" rx="0.8" ry="1" fill="${c.epicGold}"/>` +
    `<ellipse cx="0.5" cy="-1.5" rx="0.8" ry="1" fill="${c.epicGold}"/>` +
    `<ellipse cx="-0.3" cy="-2" rx="0.7" ry="0.9" fill="${c.epicCrystal}"/>` +
    `<ellipse cx="-1" cy="-1.8" rx="0.2" ry="0.3" fill="${c.epicGold}" opacity="0.3"/>` +
    `<ellipse cx="0.7" cy="-1.8" rx="0.2" ry="0.3" fill="${c.epicGold}" opacity="0.3"/>` +
    `<path d="M3.5,-1 Q4,-3 4.5,-4 Q5.5,-5 5,-6 Q4.5,-5.5 4.5,-5" fill="${c.epicJade}" opacity="0.6"/>` +
    `<path d="M4,-4 Q5.5,-6 6,-4.5 Q5,-3.5 4,-4" fill="${c.epicJade}" opacity="0.4"/>` +
    `<circle cx="4.7" cy="-5.5" r="0.15" fill="${c.epicGold}"/>` +
    `</g>`
  );
}

export function renderWorldTree(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="4" ry="0.8" fill="${c.shadow}" opacity="0.15"/>` +
    `<path d="M-1.5,0 Q-3,0.5 -4,0" stroke="${c.trunk}" stroke-width="0.5" fill="none"/>` +
    `<path d="M1.5,0 Q3,0.5 4,0" stroke="${c.trunk}" stroke-width="0.5" fill="none"/>` +
    `<rect x="-2" y="-7" width="4" height="7" fill="${c.trunk}" rx="0.8"/>` +
    `<line x1="-0.5" y1="0" x2="-0.5" y2="-7" stroke="${c.trunk}" stroke-width="0.5" opacity="0.3"/>` +
    `<line x1="1" y1="0" x2="1" y2="-7" stroke="${c.trunk}" stroke-width="0.4" opacity="0.25"/>` +
    `<ellipse cx="0" cy="-9" rx="6" ry="4.5" fill="${c.bushDark}"/>` +
    `<ellipse cx="0" cy="-9" rx="5.5" ry="4" fill="${c.epicJade}"/>` +
    `<ellipse cx="-2" cy="-11" rx="3.5" ry="2.8" fill="${c.epicJade}" opacity="0.85"/>` +
    `<ellipse cx="2" cy="-11" rx="3.5" ry="2.8" fill="${c.epicJade}" opacity="0.8"/>` +
    `<ellipse cx="0" cy="-13" rx="3" ry="2" fill="${c.leaf}" opacity="0.6"/>` +
    `<ellipse cx="-1" cy="-13.5" rx="1.5" ry="0.8" fill="${c.leafLight}" opacity="0.4"/>` +
    `<circle cx="-4" cy="-9" r="0.3" fill="${c.epicGold}" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<circle cx="3" cy="-11" r="0.3" fill="${c.epicGold}" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<circle cx="0" cy="-7.5" r="0.25" fill="${c.epicGold}" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<circle cx="-2" cy="-13" r="0.2" fill="${c.epicGold}" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<circle cx="1.5" cy="-8" r="0.2" fill="${c.epicGold}" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `</g>`
  );
}

export function renderSakuraEternal(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="4" ry="0.8" fill="${c.shadow}" opacity="0.15"/>` +
    `<path d="M0,0 Q-0.5,-2 -1,-3.5 Q-1.5,-4.5 -1,-5.5" stroke="${c.trunk}" stroke-width="1.8" fill="none"/>` +
    `<path d="M-1,-5 Q-3,-6 -3.5,-7" stroke="${c.trunk}" stroke-width="1" fill="none"/>` +
    `<path d="M-0.8,-4.5 Q1.5,-6 2.5,-7" stroke="${c.trunk}" stroke-width="0.9" fill="none"/>` +
    `<path d="M-1,-5.5 Q-0.5,-7 0,-8" stroke="${c.trunk}" stroke-width="0.6" fill="none"/>` +
    `<ellipse cx="0" cy="-9.5" rx="5.5" ry="3.8" fill="${c.cherryPetalPink}" opacity="0.9"/>` +
    `<ellipse cx="-2" cy="-11" rx="3.5" ry="2.2" fill="${c.cherryPetalPink}" opacity="0.8"/>` +
    `<ellipse cx="2" cy="-11" rx="3" ry="2" fill="${c.cherryPetalWhite}" opacity="0.65"/>` +
    `<ellipse cx="0" cy="-12.5" rx="2.5" ry="1.5" fill="${c.cherryPetalPink}" opacity="0.6"/>` +
    `<ellipse cx="1" cy="-12" rx="1.2" ry="0.6" fill="${c.cherryPetalWhite}" opacity="0.4"/>` +
    `<circle cx="-5" cy="-5" r="0.3" fill="${c.cherryPetalPink}" opacity="0.6" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<circle cx="4" cy="-4" r="0.25" fill="${c.cherryPetalWhite}" opacity="0.5" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<circle cx="-3" cy="-2" r="0.2" fill="${c.cherryPetalPink}" opacity="0.45" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<circle cx="2" cy="-1" r="0.2" fill="${c.cherryPetalWhite}" opacity="0.4" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `<circle cx="-1" cy="0.5" r="0.18" fill="${c.cherryPetalPink}" opacity="0.35"/>` +
    `</g>`
  );
}

export function renderAncientPortal(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx="0" cy="0.3" rx="4" ry="0.8" fill="${c.shadow}" opacity="0.15"/>` +
    `<rect x="-4.5" y="-9" width="2.2" height="9" fill="${c.rock}" rx="0.3"/>` +
    `<rect x="-4.5" y="-9" width="1.1" height="9" fill="${c.boulder}" opacity="0.3"/>` +
    `<rect x="2.3" y="-9" width="2.2" height="9" fill="${c.rock}" rx="0.3"/>` +
    `<rect x="3.4" y="-9" width="1.1" height="9" fill="${c.boulder}" opacity="0.3"/>` +
    `<path d="M-3.5,-9 Q0,-13 3.5,-9" fill="${c.rock}"/>` +
    `<path d="M-2.5,-9 Q0,-12 2.5,-9" fill="${c.boulder}" opacity="0.3"/>` +
    `<line x1="-3.5" y1="-3" x2="-3.5" y2="-4.5" stroke="${c.epicPortal}" stroke-width="0.3" opacity="0.4"/>` +
    `<circle cx="-3.5" cy="-6" r="0.3" fill="none" stroke="${c.epicPortal}" stroke-width="0.2" opacity="0.35"/>` +
    `<line x1="3.4" y1="-3" x2="3.4" y2="-4.5" stroke="${c.epicPortal}" stroke-width="0.3" opacity="0.4"/>` +
    `<circle cx="3.4" cy="-6" r="0.3" fill="none" stroke="${c.epicPortal}" stroke-width="0.2" opacity="0.35"/>` +
    `<ellipse cx="0" cy="-4.5" rx="2.5" ry="3.5" fill="${c.epicPortal}" opacity="0.35" ${motionMarkup('class="epic-portal-swirl"')}/>` +
    `<ellipse cx="0" cy="-4.5" rx="1.5" ry="2.5" fill="${c.epicPortal}" opacity="0.25" ${motionMarkup('class="epic-portal-swirl"')}/>` +
    `<ellipse cx="0" cy="-4.5" rx="0.6" ry="1" fill="${c.epicCrystal}" opacity="0.3" ${motionMarkup('class="epic-portal-swirl"')}/>` +
    `<circle cx="0" cy="-11.5" r="0.4" fill="${c.epicPortal}" opacity="0.4" ${motionMarkup('class="epic-glow-pulse"')}/>` +
    `</g>`
  );
}
