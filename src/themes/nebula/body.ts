import type { ContributionData, ColorMode } from '../../core/types.js';
import { svgElement, svgGroup } from '../../core/svg.js';
import { contributionGrid } from '../shared.js';
import { createNoise2D } from '../../utils/noise.js';
import { hash } from '../../utils/math.js';

/** Grid layout constants for the nebula body */
const CELL_SIZE = 10;
const GAP = 2;
const OFFSET_X = 24;
const OFFSET_Y = 40;

/** Glow radius multiplier per contribution level */
const GLOW_RADIUS_FACTOR = 6;

/** Noise frequency — lower values produce smoother distortion */
const NOISE_FREQ = 0.05;

/** Noise offset to decorrelate X and Y displacement channels */
const NOISE_CHANNEL_OFFSET = 100;

/**
 * Render the nebula body visualization.
 *
 * Transforms 52w x 7d contribution data into organic nebula glow forms.
 * Each cell with level > 0 becomes a radial-gradient circle whose radius
 * scales with contribution intensity. Simplex noise displaces circles
 * slightly for an organic, non-grid feel. The entire group is filtered
 * through `nebula-glow` for a soft cosmic glow.
 *
 * @param data - Complete contribution data for one year
 * @param mode - Color mode (dark or light)
 * @returns SVG group string containing all nebula glow circles
 */
export function renderNebulaBody(data: ContributionData, mode: ColorMode): string {
  const cells = contributionGrid(data, {
    cellSize: CELL_SIZE,
    gap: GAP,
    offsetX: OFFSET_X,
    offsetY: OFFSET_Y,
  });

  // Deterministic noise seeded from username
  const seed = hash(data.username);
  const noise = createNoise2D(seed);

  // Half-cell offset so circles sit at cell centers
  const half = CELL_SIZE / 2;

  const circles = cells
    .filter((cell) => cell.level > 0)
    .map((cell) => {
      const level = cell.level;
      const r = level * GLOW_RADIUS_FACTOR;

      // Organic displacement scaled by level (higher = more freedom)
      const dx = noise(cell.x * NOISE_FREQ, cell.y * NOISE_FREQ) * (level * 3);
      const dy =
        noise(
          cell.x * NOISE_FREQ + NOISE_CHANNEL_OFFSET,
          cell.y * NOISE_FREQ + NOISE_CHANNEL_OFFSET,
        ) * (level * 3);

      const cx = +(cell.x + half + dx).toFixed(2);
      const cy = +(cell.y + half + dy).toFixed(2);

      return svgElement('circle', {
        cx,
        cy,
        r,
        fill: `url(#nebula-l${level})`,
      });
    })
    .join('');

  return svgGroup(
    { class: 'nebula-body', filter: 'url(#nebula-glow)' },
    circles,
  );
}

/**
 * CSS for the nebula breathing animation.
 *
 * Produces a gentle scale + opacity pulse on the nebula body group,
 * giving the visualization a living, breathing quality.
 *
 * @returns CSS string (without `<style>` wrapper)
 */
export function nebulaBreathCSS(): string {
  return [
    '@keyframes nebula-breathe {',
    '  0%, 100% { opacity: 0.85; transform: scale(1); }',
    '  50% { opacity: 1; transform: scale(1.02); }',
    '}',
    '.nebula-body { animation: nebula-breathe 8s ease-in-out infinite; }',
  ].join('\n');
}
