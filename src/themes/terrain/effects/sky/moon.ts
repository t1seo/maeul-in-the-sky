import { motionId } from '../../../../core/animation.js';
import { lerpColor } from '../../../../utils/color.js';
import type { TerrainPalette100 } from '../../palette.js';

const CRESCENT = 'M3.6-9.2A9.9 9.9 0 1 0 6.6 7.4C-1.2 8.6-6.7 3.1-5.6-3.2C-5-7-1.2-9.1 3.6-9.2Z';
const CRATERS = [
  { x: -7.6, y: -2.4, r: 1.05 },
  { x: -6.5, y: 3.3, r: 1.4 },
  { x: -3.1, y: 7, r: 0.85 },
  { x: -5.3, y: -6.3, r: 0.6 },
  { x: -8.1, y: 1, r: 0.45 },
] as const;

export function sculptedMoon(x: number, y: number, palette: TerrainPalette100): string {
  const surface = motionId('sky-moon-surface');
  const halo = motionId('sky-moon-halo');
  const clip = motionId('sky-moon-clip');
  const craterColor = lerpColor(palette.bg.subtle, '#bacbd2', 0.7);
  const craters = CRATERS.map(
    ({ x: cx, y: cy, r }) =>
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${craterColor}" opacity=".5"/>` +
      `<path d="M${(cx - r * 0.8).toFixed(2)} ${(cy + r * 0.35).toFixed(2)}a${r} ${r} 0 0 0 ${(r * 1.6).toFixed(2)} 0" fill="none" stroke="#fff8df" stroke-width=".35" opacity=".7"/>`,
  ).join('');
  return (
    `<g class="sky-moon" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})">` +
    `<defs><radialGradient id="${halo}"><stop stop-color="#c5dbeb" stop-opacity=".2"/>` +
    `<stop offset=".45" stop-color="#b7cfe5" stop-opacity=".06"/><stop offset="1" stop-color="#b7cfe5" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${surface}" cx="28%" cy="26%" r="80%">` +
    `<stop stop-color="#fff9de"/><stop offset=".55" stop-color="#e2e2d0"/><stop offset="1" stop-color="#9bb4c1"/></radialGradient>` +
    `<clipPath id="${clip}"><path d="${CRESCENT}"/></clipPath></defs>` +
    `<circle r="24" fill="url(#${halo})"/>` +
    `<path class="moon-body" d="${CRESCENT}" fill="url(#${surface})"/>` +
    `<g class="moon-craters" clip-path="url(#${clip})">${craters}</g>` +
    `<path d="M-7.7-5.2A9.4 9.4 0 0 0-4.9 8" fill="none" stroke="#fff9e4" stroke-width=".45" opacity=".75"/>` +
    `</g>`
  );
}
