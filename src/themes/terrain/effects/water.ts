import { currentMotionContext, motionId } from '../../../core/animation.js';
import type { IsoCell } from '../blocks.js';
import type { TerrainPalette100 } from '../palette.js';
import type { BiomeContext } from '../biomes.js';
import { THW, THH } from '../blocks.js';
import { seededRandom } from '../../../utils/math.js';
export function renderWaterOverlays(
  isoCells: IsoCell[],
  palette: TerrainPalette100,
  biomeMap: Map<string, BiomeContext>,
): string {
  const overlays: string[] = [];
  let shimmerIdx = 0;
  const mode = currentMotionContext().mode;
  const naturalWaterCount = isoCells.filter(
    (cell) => cell.level100 >= 10 && cell.level100 <= 22,
  ).length;
  const maxShimmer = mode === 'subtle' ? Math.max(0, 4 - naturalWaterCount) : 8;

  for (const cell of isoCells) {
    const biome = biomeMap.get(`${cell.week},${cell.day}`);
    if (!biome || (!biome.isRiver && !biome.isPond)) continue;

    const { isoX: cx, isoY: cy } = cell;
    const color = biome.isPond ? palette.assets.pondOverlay : palette.assets.riverOverlay;

    // 6b: Two-tone water overlay — outer edge darker, inner area lighter
    // Outer diamond (slightly inset from block edge)
    const outerPoints = [
      `${cx},${cy - THH + 0.5}`,
      `${cx + THW - 1},${cy}`,
      `${cx},${cy + THH - 0.5}`,
      `${cx - THW + 1},${cy}`,
    ].join(' ');

    // Inner diamond (further inset — lighter water surface)
    const innerInset = 2.2;
    const innerPoints = [
      `${cx},${cy - THH + innerInset}`,
      `${cx + THW - innerInset * 1.2},${cy}`,
      `${cx},${cy + THH - innerInset}`,
      `${cx - THW + innerInset * 1.2},${cy}`,
    ].join(' ');

    const shimmerClass =
      mode !== 'off' && cell.level100 > 22 && shimmerIdx < maxShimmer
        ? ` class="${motionId('river-shimmer-' + shimmerIdx++)}"`
        : '';

    // Outer: darker edge
    overlays.push(
      `<polygon points="${outerPoints}" fill="${color}"${mode === 'full' ? shimmerClass : ''}/>`,
    );
    // Inner: lighter surface (reduced opacity for lighter feel)
    overlays.push(
      `<polygon points="${innerPoints}" fill="${palette.assets.waterLight}" opacity="0.18"${mode === 'subtle' ? shimmerClass : ''}/>`,
    );
  }

  return overlays.length > 0 ? `<g class="water-overlays">${overlays.join('')}</g>` : '';
}

// ── Water Ripple Lines ──────────────────────────────────────

/**
 * Render static wavy SVG paths on the top face of water cells.
 * 6c: 3 ripple lines per cell, varied curve amplitude,
 * isometric diamond orientation, staggered positions, thinner strokes.
 */
export function renderWaterRipples(
  isoCells: IsoCell[],
  palette: TerrainPalette100,
  biomeMap: Map<string, BiomeContext>,
): string {
  const ripples: string[] = [];
  const color = palette.assets.waterLight;
  const rng = seededRandom(isoCells.length * 7 + 31);

  for (const cell of isoCells) {
    const biome = biomeMap.get(`${cell.week},${cell.day}`);
    if (!biome || (!biome.isRiver && !biome.isPond)) continue;

    const { isoX: cx, isoY: cy } = cell;
    // Stagger horizontal offset per cell using seeded RNG
    const jitterX = (rng() - 0.5) * 2;
    const jitterY = (rng() - 0.5) * 0.8;

    // Ripple 1: upper-left to center-right, following isometric diamond
    const amp1 = 0.3 + rng() * 0.15;
    ripples.push(
      `<path d="M${cx - THW * 0.55 + jitterX},${cy - THH * 0.05 + jitterY} ` +
        `Q${cx - THW * 0.1},${cy - THH * amp1} ${cx + THW * 0.4},${cy - THH * 0.12}" ` +
        `stroke="${color}" fill="none" stroke-width="0.25" opacity="0.28"/>`,
    );

    // Ripple 2: center, varied amplitude, isometric angle
    const amp2 = 0.15 + rng() * 0.2;
    ripples.push(
      `<path d="M${cx - THW * 0.35 + jitterX * 0.5},${cy + THH * 0.15 + jitterY} ` +
        `Q${cx + THW * 0.05},${cy - THH * amp2} ${cx + THW * 0.45},${cy + THH * 0.05}" ` +
        `stroke="${color}" fill="none" stroke-width="0.2" opacity="0.22"/>`,
    );

    // Ripple 3: lower region, gentler curve
    const amp3 = 0.1 + rng() * 0.12;
    ripples.push(
      `<path d="M${cx - THW * 0.2 + jitterX * 0.3},${cy + THH * 0.35 + jitterY} ` +
        `Q${cx + THW * 0.15},${cy + THH * amp3} ${cx + THW * 0.35},${cy + THH * 0.28}" ` +
        `stroke="${color}" fill="none" stroke-width="0.2" opacity="0.18"/>`,
    );
  }

  return ripples.length > 0 ? `<g class="water-ripples">${ripples.join('')}</g>` : '';
}
