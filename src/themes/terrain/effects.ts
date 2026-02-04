import type { IsoCell } from './blocks.js';
import type { TerrainPalette100 } from './palette.js';
import { THW, THH } from './blocks.js';
import { seededRandom } from '../../utils/math.js';

// ── Animation Budget ─────────────────────────────────────────
// Total: 50 max
//   Water shimmer:    up to 15
//   Town sparkle:     up to 10
//   Clouds:           4 (SMIL animateTransform)
//   Windmill:         4 (SMIL animateTransform)
//   Flag wave:        4 (CSS @keyframes)
// Total animated:     ~42/50

const MAX_WATER = 15;
const MAX_SPARKLE = 10;
const NUM_CLOUDS = 4;

// ── CSS Animations ───────────────────────────────────────────

export function renderTerrainCSS(isoCells: IsoCell[]): string {
  const blocks: string[] = [];

  const hasWater = isoCells.some(c => c.level100 <= 5);
  const hasTown = isoCells.some(c => c.level100 >= 90);

  if (hasWater) {
    blocks.push(
      `@keyframes water-shimmer {`
      + ` 0% { opacity: 0.7; }`
      + ` 50% { opacity: 1; }`
      + ` 100% { opacity: 0.7; }`
      + ` }`,
    );

    const waterCells = isoCells.filter(c => c.level100 <= 5);
    const selected = selectEvenly(waterCells, MAX_WATER);
    for (let i = 0; i < selected.length; i++) {
      const dur = (3 + (i % 3) * 0.8).toFixed(1);
      const delay = ((i * 0.7) % 4).toFixed(1);
      blocks.push(
        `.water-${i} { animation: water-shimmer ${dur}s ease-in-out ${delay}s infinite; }`,
      );
    }
  }

  if (hasTown) {
    blocks.push(
      `@keyframes town-sparkle {`
      + ` 0% { opacity: 1; }`
      + ` 40% { opacity: 0.5; }`
      + ` 100% { opacity: 1; }`
      + ` }`,
    );

    const townCells = isoCells.filter(c => c.level100 >= 90);
    const selected = selectEvenly(townCells, MAX_SPARKLE);
    for (let i = 0; i < selected.length; i++) {
      const dur = (2 + (i % 4) * 0.5).toFixed(1);
      const delay = ((i * 0.9) % 3.5).toFixed(1);
      blocks.push(
        `.sparkle-${i} { animation: town-sparkle ${dur}s ease-in-out ${delay}s infinite; }`,
      );
    }
  }

  // Windmill rotation (SMIL handles this, but flag wave needs CSS)
  blocks.push(
    `@keyframes flag-wave {`
    + ` 0% { transform: scaleX(1); }`
    + ` 50% { transform: scaleX(0.7); }`
    + ` 100% { transform: scaleX(1); }`
    + ` }`,
  );

  return blocks.join('\n');
}

// ── Animated Overlays ────────────────────────────────────────

export function renderAnimatedOverlays(
  isoCells: IsoCell[],
  palette: TerrainPalette100,
): string {
  const overlays: string[] = [];

  // Water shimmer overlays (level 0-5)
  const waterCells = isoCells.filter(c => c.level100 <= 5);
  const selectedWater = selectEvenly(waterCells, MAX_WATER);
  for (let i = 0; i < selectedWater.length; i++) {
    const cell = selectedWater[i];
    const { isoX: cx, isoY: cy } = cell;
    const points = [
      `${cx},${cy - THH + 1}`,
      `${cx + THW - 2},${cy}`,
      `${cx},${cy + THH - 1}`,
      `${cx - THW + 2},${cy}`,
    ].join(' ');
    overlays.push(
      `<polygon points="${points}" fill="${palette.text.accent}" opacity="0.15" class="water-${i}"/>`,
    );
  }

  // Town sparkle overlays (level 90+)
  const townCells = isoCells.filter(c => c.level100 >= 90);
  const selectedTown = selectEvenly(townCells, MAX_SPARKLE);
  for (let i = 0; i < selectedTown.length; i++) {
    const cell = selectedTown[i];
    const { isoX: cx, isoY: cy, height: h } = cell;
    overlays.push(
      `<circle cx="${cx}" cy="${cy - h - 1}" r="1" fill="#ffe080" opacity="0.7" class="sparkle-${i}"/>`,
    );
  }

  return `<g class="terrain-overlays">${overlays.join('')}</g>`;
}

// ── Composite Clouds ─────────────────────────────────────────

/**
 * Render drifting composite clouds with multiple overlapping ellipses.
 * Each cloud = 3-5 circles, Y-squashed ×0.5 for isometric perspective.
 * Uses SMIL animateTransform for drift animation.
 */
export function renderClouds(seed: number, palette: TerrainPalette100): string {
  const rng = seededRandom(seed);
  const clouds: string[] = [];

  for (let i = 0; i < NUM_CLOUDS; i++) {
    const baseCx = 60 + rng() * 650;
    const baseCy = 25 + rng() * 85;
    const baseW = 25 + rng() * 35;
    const numCircles = 3 + Math.floor(rng() * 3); // 3-5 circles
    const dur = (30 + rng() * 25).toFixed(0);
    const driftX = 80 + rng() * 60;

    const ellipses: string[] = [];
    for (let j = 0; j < numCircles; j++) {
      // Offset each circle from center
      const ox = (rng() - 0.5) * baseW * 0.8;
      const oy = (rng() - 0.5) * 6;
      const rx = (baseW * 0.3 + rng() * baseW * 0.3);
      const ry = rx * 0.45; // Y-squash for isometric

      ellipses.push(
        `<ellipse cx="${(baseCx + ox).toFixed(1)}" cy="${(baseCy + oy).toFixed(1)}"`
        + ` rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"`
        + ` fill="${palette.cloud.fill}" stroke="${palette.cloud.stroke}" stroke-width="0.5"`
        + ` opacity="${palette.cloud.opacity}"/>`,
      );
    }

    // Wrap in a group with SMIL translation
    clouds.push(
      `<g>`
      + ellipses.join('')
      + `<animateTransform attributeName="transform" type="translate"`
      + ` values="0,0;${driftX.toFixed(0)},0;0,0"`
      + ` dur="${dur}s" repeatCount="indefinite"/>`
      + `</g>`,
    );
  }

  return `<g class="terrain-clouds">${clouds.join('')}</g>`;
}

// ── Helpers ──────────────────────────────────────────────────

function selectEvenly<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  const step = items.length / max;
  const result: T[] = [];
  for (let i = 0; i < max; i++) {
    result.push(items[Math.floor(i * step)]);
  }
  return result;
}
