import type { ColorMode } from '../../core/types.js';
import { svgElement, svgGroup } from '../../core/svg.js';
import { cssKeyframes } from '../../core/animation.js';
import { createNoise2D } from '../../utils/noise.js';
import { seededRandom, hash, clamp } from '../../utils/math.js';
import { NEBULA_ACCENT } from './palette.js';

// ── Constants ───────────────────────────────────────────────────

/** Total number of filament paths to render */
const FILAMENT_COUNT = 10;

/** ViewBox dimensions */
const VIEW_WIDTH = 840;
const VIEW_HEIGHT = 240;

/** Vertical band for filaments (middle 60% of viewBox) */
const Y_MIN = 50;
const Y_MAX = 190;

/** Starting x range for filament origins */
const START_X_MIN = 20;
const START_X_MAX = 200;

/** Horizontal step range between control points */
const STEP_X_MIN = 80;
const STEP_X_MAX = 120;

/** Maximum noise-based vertical displacement per control point */
const NOISE_Y_AMPLITUDE = 40;

/** Control point count range per filament */
const MIN_CONTROL_POINTS = 5;
const MAX_CONTROL_POINTS = 8;

/** Stroke width range (px) */
const MIN_STROKE_WIDTH = 0.5;
const MAX_STROKE_WIDTH = 1.5;

/** Opacity range — kept subtle for atmospheric feel */
const MIN_OPACITY = 0.15;
const MAX_OPACITY = 0.35;

/** Filament drift animation duration (seconds) */
const DRIFT_DURATION = 30;

/** Dash pattern for animated stroke */
const DASH_ARRAY = '100 50';

/** Total dashoffset travel per animation cycle */
const DASH_OFFSET_TRAVEL = -200;

/**
 * Filament colors by mode.
 * Two complementary tones alternate across filaments.
 */
const FILAMENT_COLORS: Record<ColorMode, [string, string]> = {
  dark: [NEBULA_ACCENT.dark, '#67E8F9'],
  light: [NEBULA_ACCENT.light, '#4F46E5'],
};

// ── Path Generation Helpers ─────────────────────────────────────

/** A 2D point used to build filament curves */
interface Point {
  x: number;
  y: number;
}

/**
 * Generate control points for a single filament path.
 *
 * Points march rightward from a random starting position, with simplex noise
 * providing organic vertical variation. The y coordinate is clamped to the
 * defined vertical band so filaments stay within the nebula's core.
 *
 * @param rng - Seeded random number generator
 * @param noise - Seeded 2D simplex noise function
 * @param filamentIndex - Index of this filament (used as noise channel offset)
 * @returns Array of control points
 */
function generateControlPoints(
  rng: () => number,
  noise: (x: number, y: number) => number,
  filamentIndex: number,
): Point[] {
  const count = MIN_CONTROL_POINTS + Math.floor(rng() * (MAX_CONTROL_POINTS - MIN_CONTROL_POINTS + 1));
  const startX = parseFloat((START_X_MIN + rng() * (START_X_MAX - START_X_MIN)).toFixed(2));
  const startY = parseFloat((Y_MIN + rng() * (Y_MAX - Y_MIN)).toFixed(2));

  const points: Point[] = [{ x: startX, y: startY }];

  for (let i = 1; i < count; i++) {
    const prevPoint = points[i - 1];
    const stepX = STEP_X_MIN + rng() * (STEP_X_MAX - STEP_X_MIN);
    const nx = prevPoint.x + stepX;
    // Sample noise at a scaled position; filamentIndex offsets the y-channel
    // so each filament follows a unique organic path.
    const noiseVal = noise(nx * 0.005, filamentIndex * 3.7);
    const ny = clamp(prevPoint.y + noiseVal * NOISE_Y_AMPLITUDE, Y_MIN, Y_MAX);

    points.push({
      x: parseFloat(nx.toFixed(2)),
      y: parseFloat(ny.toFixed(2)),
    });
  }

  return points;
}

/**
 * Build a smooth cubic Bezier SVG path `d` attribute from a sequence of points.
 *
 * Uses the Catmull-Rom-to-Bezier approach: for each pair of adjacent points
 * we derive two cubic control handles that ensure a smooth, flowing curve
 * through all points.
 *
 * @param points - Ordered control points
 * @returns SVG path `d` attribute string (e.g., "M 20 120 C …")
 */
function buildSmoothPath(points: Point[]): string {
  if (points.length < 2) return '';

  const parts: string[] = [`M ${points[0].x} ${points[0].y}`];

  if (points.length === 2) {
    // Simple line if only two points
    parts.push(`L ${points[1].x} ${points[1].y}`);
    return parts.join(' ');
  }

  // For each segment, compute cubic Bezier control points using
  // a Catmull-Rom-like smoothing approach.
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    // Tension factor (0.25 gives a gentle curve)
    const tension = 0.25;

    const cp1x = parseFloat((p1.x + (p2.x - p0.x) * tension).toFixed(2));
    const cp1y = parseFloat((p1.y + (p2.y - p0.y) * tension).toFixed(2));
    const cp2x = parseFloat((p2.x - (p3.x - p1.x) * tension).toFixed(2));
    const cp2y = parseFloat((p2.y - (p3.y - p1.y) * tension).toFixed(2));

    parts.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
  }

  return parts.join(' ');
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Generate an SVG group of filament (gas tendril) path elements for the
 * nebula background.
 *
 * Filaments are deterministically placed using a seeded PRNG and simplex
 * noise derived from the provided seed string. The same seed always produces
 * the same set of flowing curves.
 *
 * Each filament is a `<path>` with:
 * - Smooth cubic Bezier curves through noise-generated control points
 * - Alternating complementary accent colors (mode-dependent)
 * - Random stroke-width between 0.5px and 1.5px
 * - Random opacity between 0.15 and 0.35 (subtle, atmospheric)
 * - CSS class "filament" for the drift animation
 * - Staggered animation delays for organic feel
 *
 * @param mode - Color mode (dark or light)
 * @param seed - Seed string for deterministic path generation
 * @returns SVG `<g>` element string containing all filament paths
 */
export function renderFilaments(mode: ColorMode, seed: string): string {
  const rng = seededRandom(hash(seed + 'filaments'));
  const noise = createNoise2D(hash(seed + 'filaments-noise'));
  const colors = FILAMENT_COLORS[mode];

  const paths: string[] = [];

  for (let i = 0; i < FILAMENT_COUNT; i++) {
    const controlPoints = generateControlPoints(rng, noise, i);
    const d = buildSmoothPath(controlPoints);

    if (!d) continue;

    const color = colors[i % 2];
    const strokeWidth = parseFloat(
      (MIN_STROKE_WIDTH + rng() * (MAX_STROKE_WIDTH - MIN_STROKE_WIDTH)).toFixed(2),
    );
    const opacity = parseFloat(
      (MIN_OPACITY + rng() * (MAX_OPACITY - MIN_OPACITY)).toFixed(2),
    );
    const delay = parseFloat((rng() * 10).toFixed(2));

    paths.push(
      svgElement('path', {
        d,
        fill: 'none',
        stroke: color,
        'stroke-width': strokeWidth,
        opacity,
        'stroke-linecap': 'round',
        class: 'filament',
        style: `animation-delay: ${delay}s`,
      }),
    );
  }

  return svgGroup({ class: 'filament-field' }, paths.join(''));
}

/**
 * Generate the CSS `@keyframes` rule and class for the filament drift animation.
 *
 * The drift effect animates `stroke-dashoffset` to create the illusion of gas
 * flowing along each tendril path. Combined with `stroke-dasharray`, this
 * produces a smooth, continuous streaming effect.
 *
 * Animation spec:
 * ```
 * @keyframes filament-drift {
 *   0%   { stroke-dashoffset: 0; }
 *   100% { stroke-dashoffset: -200; }
 * }
 * .filament {
 *   stroke-dasharray: 100 50;
 *   animation: filament-drift 30s linear infinite;
 * }
 * ```
 *
 * @returns CSS string containing @keyframes block and `.filament` class rule
 */
export function filamentDriftCSS(): string {
  const keyframesCSS = cssKeyframes({
    name: 'filament-drift',
    keyframes: {
      '0%': { 'stroke-dashoffset': '0' },
      '100%': { 'stroke-dashoffset': `${DASH_OFFSET_TRAVEL}` },
    },
    duration: `${DRIFT_DURATION}s`,
    easing: 'linear',
    iterationCount: 'infinite',
  });

  // The cssKeyframes helper generates a class keyed to the animation name
  // (.filament-drift), but our paths use class="filament". Add a .filament
  // rule that includes the dasharray and references the same animation so
  // the inline animation-delay takes effect.
  const filamentRule =
    `.filament { stroke-dasharray: ${DASH_ARRAY};` +
    ` animation: filament-drift ${DRIFT_DURATION}s linear infinite; }`;

  return `${keyframesCSS}\n${filamentRule}`;
}
