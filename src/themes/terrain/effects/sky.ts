import { currentMotionContext } from '../../../core/animation.js';
import type { TerrainPalette100 } from '../palette.js';
import { seededRandom } from '../../../utils/math.js';
const NUM_CLOUDS = 2;
export function renderCelestials(
  seed: number,
  palette: TerrainPalette100,
  isDark: boolean,
): string {
  const rng = seededRandom(seed + 3331);
  const parts: string[] = [];

  if (isDark) {
    // Stars: small dots scattered in the upper sky area
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

    // A few brighter stars (cross shape)
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

    // Crescent moon
    const mx = 750 + rng() * 60;
    const my = 18 + rng() * 15;
    const mr = 8;
    parts.push(
      `<g>` +
        // Full moon circle
        `<circle cx="${mx}" cy="${my}" r="${mr}" fill="#e8e4d0" opacity="0.85"/>` +
        // Dark circle overlapping to create crescent
        `<circle cx="${mx + 3.5}" cy="${my - 1.5}" r="${mr - 0.5}" fill="${palette.bg.subtle}"/>` +
        // Subtle glow
        `<circle cx="${mx}" cy="${my}" r="${mr + 3}" fill="#e8e4d0" opacity="0.04"/>` +
        `</g>`,
    );
  } else {
    // Sun: circle with radiating lines
    const sx = 770 + rng() * 50;
    const sy = 20 + rng() * 12;
    const sr = 7;

    // Outer glow
    parts.push(`<circle cx="${sx}" cy="${sy}" r="${sr + 6}" fill="#ffeebb" opacity="0.1"/>`);
    parts.push(`<circle cx="${sx}" cy="${sy}" r="${sr + 3}" fill="#ffdd88" opacity="0.15"/>`);
    // Sun body
    parts.push(`<circle cx="${sx}" cy="${sy}" r="${sr}" fill="#ffe066" opacity="0.9"/>`);
    // Core highlight
    parts.push(
      `<circle cx="${sx - 1.5}" cy="${sy - 1.5}" r="${sr * 0.45}" fill="#fff8cc" opacity="0.6"/>`,
    );
    // Rays (8 lines radiating outward)
    for (let r = 0; r < 8; r++) {
      const angle = (r / 8) * Math.PI * 2;
      const innerR = sr + 2;
      const outerR = sr + 5 + (r % 2) * 2; // alternating long/short
      const x1 = sx + Math.cos(angle) * innerR;
      const y1 = sy + Math.sin(angle) * innerR;
      const x2 = sx + Math.cos(angle) * outerR;
      const y2 = sy + Math.sin(angle) * outerR;
      parts.push(
        `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" ` +
          `stroke="#ffdd66" stroke-width="0.8" opacity="0.5" stroke-linecap="round"/>`,
      );
    }
  }

  return `<g class="celestials">${parts.join('')}</g>`;
}

// ── Composite Clouds ─────────────────────────────────────────

/**
 * Render drifting composite clouds with structured cumulus shapes.
 * Each cloud has a flat base + billowing top built from carefully
 * placed ellipses. Y-squashed ×0.45 for isometric perspective.
 * Uses SMIL animateTransform for drift animation.
 */
export function renderClouds(seed: number, palette: TerrainPalette100): string {
  const rng = seededRandom(seed);
  const clouds: string[] = [];
  const mode = currentMotionContext().mode;

  for (let i = 0; i < NUM_CLOUDS; i++) {
    const baseCx = 250 + rng() * 500;
    const baseCy = 20 + rng() * 60;
    const scale = 0.8 + rng() * 0.5; // size variation
    const fullDuration = (35 + rng() * 20).toFixed(0);
    const dur = mode === 'subtle' ? String(Number(fullDuration) * 2) : fullDuration;
    const fullDrift = 60 + rng() * 50;
    const driftX = mode === 'subtle' ? Math.min(12, fullDrift / 8) : fullDrift;

    const ellipses: string[] = [];
    const f = palette.cloud.fill;
    const s = palette.cloud.stroke;
    const o = palette.cloud.opacity;

    // Flat base: wide, short ellipse
    ellipses.push(
      `<ellipse cx="${baseCx}" cy="${baseCy}" rx="${(28 * scale).toFixed(1)}" ry="${(5 * scale).toFixed(1)}" fill="${f}" stroke="${s}" stroke-width="0.4" opacity="${o}"/>`,
    );
    // Left billow
    ellipses.push(
      `<ellipse cx="${(baseCx - 14 * scale).toFixed(1)}" cy="${(baseCy - 3 * scale).toFixed(1)}" rx="${(12 * scale).toFixed(1)}" ry="${(6 * scale).toFixed(1)}" fill="${f}" stroke="${s}" stroke-width="0.3" opacity="${o}"/>`,
    );
    // Center billow (tallest)
    ellipses.push(
      `<ellipse cx="${(baseCx - 2 * scale).toFixed(1)}" cy="${(baseCy - 6 * scale).toFixed(1)}" rx="${(14 * scale).toFixed(1)}" ry="${(8 * scale).toFixed(1)}" fill="${f}" stroke="${s}" stroke-width="0.3" opacity="${o}"/>`,
    );
    // Right billow
    ellipses.push(
      `<ellipse cx="${(baseCx + 12 * scale).toFixed(1)}" cy="${(baseCy - 3.5 * scale).toFixed(1)}" rx="${(11 * scale).toFixed(1)}" ry="${(5.5 * scale).toFixed(1)}" fill="${f}" stroke="${s}" stroke-width="0.3" opacity="${o}"/>`,
    );
    // Top highlight (small bright bump)
    ellipses.push(
      `<ellipse cx="${(baseCx - 4 * scale).toFixed(1)}" cy="${(baseCy - 9 * scale).toFixed(1)}" rx="${(7 * scale).toFixed(1)}" ry="${(4 * scale).toFixed(1)}" fill="${f}" stroke="none" opacity="${(o * 0.7).toFixed(2)}"/>`,
    );

    clouds.push(
      `<g>` +
        ellipses.join('') +
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
