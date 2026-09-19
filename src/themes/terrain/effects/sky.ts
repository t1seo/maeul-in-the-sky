import { currentMotionContext } from '../../../core/animation.js';
import type { TerrainPalette100 } from '../palette.js';
import { seededRandom } from '../../../utils/math.js';
import { cloudPaint, cloudVolume } from './sky/clouds.js';
import { sculptedMoon } from './sky/moon.js';
import { luminousSun } from './sky/sun.js';

const NUM_CLOUDS = 2;

export function renderCelestials(
  seed: number,
  palette: TerrainPalette100,
  isDark: boolean,
): string {
  const rng = seededRandom(seed + 3331);
  const parts: string[] = [];

  if (isDark) {
    const numStars = 18 + Math.floor(rng() * 10);
    for (let i = 0; i < numStars; i++) {
      const sx = 30 + rng() * 780;
      const sy = 5 + rng() * 55;
      const sr = 0.3 + rng() * 0.6;
      const opacity = 0.3 + rng() * 0.5;
      parts.push(
        `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${sr.toFixed(1)}" fill="#fff" opacity="${opacity.toFixed(2)}"/>`,
      );
    }
    for (let i = 0; i < 3; i++) {
      const bx = 60 + rng() * 720;
      const by = 8 + rng() * 40;
      const len = 1.2 + rng() * 0.8;
      parts.push(
        `<g opacity="${(0.5 + rng() * 0.3).toFixed(2)}">` +
          `<line x1="${bx - len}" y1="${by}" x2="${bx + len}" y2="${by}" stroke="#fff" stroke-width="0.4"/>` +
          `<line x1="${bx}" y1="${by - len}" x2="${bx}" y2="${by + len}" stroke="#fff" stroke-width="0.4"/>` +
          `</g>`,
      );
    }
    parts.push(sculptedMoon(750 + rng() * 60, 38 + rng() * 12, palette));
  } else {
    parts.push(luminousSun(770 + rng() * 50, 43 + rng() * 12));
  }

  return `<g class="celestials">${parts.join('')}</g>`;
}

export function renderClouds(seed: number, palette: TerrainPalette100): string {
  const rng = seededRandom(seed);
  const clouds: string[] = [cloudPaint(palette)];
  const mode = currentMotionContext().mode;
  const firstShape = Math.floor(seededRandom(seed + 5009)() * 3);

  for (let i = 0; i < NUM_CLOUDS; i++) {
    const baseCx = 250 + rng() * 500;
    const baseCy = 46 + rng() * 34;
    const scale = 0.8 + rng() * 0.5;
    const fullDuration = (35 + rng() * 20).toFixed(0);
    const dur = mode === 'subtle' ? String(Number(fullDuration) * 2) : fullDuration;
    const fullDrift = 60 + rng() * 50;
    const driftX = mode === 'subtle' ? Math.min(12, fullDrift / 8) : fullDrift;

    clouds.push(
      `<g>` +
        cloudVolume(baseCx, baseCy, scale, firstShape + i) +
        (mode === 'off'
          ? ''
          : `<animateTransform attributeName="transform" type="translate"` +
            ` values="0,0;${driftX.toFixed(0)},0;0,0"` +
            ` dur="${dur}s" repeatCount="indefinite"/>`) +
        `</g>`,
    );
  }

  return `<g class="terrain-clouds">${clouds.join('')}</g>`;
}
