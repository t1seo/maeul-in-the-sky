import type { ContributionData, ColorMode } from '../../core/types.js';
import { svgElement } from '../../core/svg.js';
import { clamp } from '../../utils/math.js';
import { VOYAGE_DARK, VOYAGE_LIGHT } from './palette.js';

// ── Constants ───────────────────────────────────────────────────

/** Default visualization area within the 840x240 viewBox */
const DEFAULT_VIZ_AREA = { x: 20, y: 30, width: 800, height: 160 };

/** Y-coordinate boundaries from design spec */
const Y_MIN = 30;   // top — max contribution
const Y_MAX = 190;  // bottom — min contribution
const Y_CENTER = 110;

// ── Types ───────────────────────────────────────────────────────

export interface TrajectoryPoint {
  x: number;
  y: number;
  weekIdx: number;
  weeklyAvg: number;
  level: number;       // average level for the week (0-4)
  cumulative: number;  // cumulative contributions up to this week
}

// ── Point Generation ────────────────────────────────────────────

/**
 * Generate trajectory points from contribution data.
 *
 * Each week is mapped to an (x, y) coordinate where x is evenly spaced
 * across the visualization area and y is derived from the weekly average
 * contribution count (higher contribution = higher on canvas = lower y value).
 *
 * @param data - Complete contribution data for one year
 * @param vizArea - Rectangular area within the viewBox for the trajectory
 * @returns Array of trajectory points, one per week
 */
export function generateTrajectoryPoints(
  data: ContributionData,
  vizArea: { x: number; y: number; width: number; height: number } = DEFAULT_VIZ_AREA,
): TrajectoryPoint[] {
  const weeks = data.weeks;
  const weekCount = weeks.length;

  if (weekCount === 0) return [];

  // 1. Calculate weekly averages and levels
  const weeklyStats = weeks.map((week) => {
    const activeDays = week.days.filter((d) => d.count > 0);
    const dayCount = week.days.length || 1;
    const totalCount = week.days.reduce((sum, d) => sum + d.count, 0);
    const avgCount = totalCount / dayCount;
    const avgLevel =
      week.days.reduce((sum, d) => sum + d.level, 0) / dayCount;
    return { avgCount, avgLevel, totalCount };
  });

  // 2. Find max weekly average for normalization (guard against zero)
  const maxWeeklyAvg = Math.max(
    ...weeklyStats.map((s) => s.avgCount),
    0.001,
  );

  // 3. Build trajectory points
  let cumulative = 0;
  const points: TrajectoryPoint[] = [];

  for (let i = 0; i < weekCount; i++) {
    const { avgCount, avgLevel, totalCount } = weeklyStats[i];
    cumulative += totalCount;

    // X: evenly spaced across viz area
    const x =
      weekCount === 1
        ? vizArea.x + vizArea.width / 2
        : vizArea.x + (i / (weekCount - 1)) * vizArea.width;

    // Y: from design spec — higher contribution pushes y upward (lower value)
    const normalizedAvg = avgCount / maxWeeklyAvg;
    const y = Y_CENTER - normalizedAvg * (Y_CENTER - Y_MIN);

    points.push({
      x: parseFloat(x.toFixed(2)),
      y: parseFloat(clamp(y, Y_MIN, Y_MAX).toFixed(2)),
      weekIdx: i,
      weeklyAvg: parseFloat(avgCount.toFixed(2)),
      level: parseFloat(clamp(avgLevel, 0, 4).toFixed(2)),
      cumulative,
    });
  }

  return points;
}

// ── Catmull-Rom to Bezier Conversion ────────────────────────────

/**
 * Convert an array of points into a smooth SVG cubic Bezier path string
 * using the Catmull-Rom spline algorithm.
 *
 * For each interior segment (p[i] -> p[i+1]), the control points are
 * derived from the neighboring points using the given tension factor.
 * The first and last points are duplicated so the curve passes through
 * all input points.
 *
 * @param points - Array of {x, y} points to interpolate
 * @param tension - Catmull-Rom tension factor (default 0.5). Lower = tighter curves, higher = looser.
 * @returns SVG path `d` attribute string (e.g., "M 20 110 C ...")
 */
export function catmullRomToBezier(
  points: Array<{ x: number; y: number }>,
  tension: number = 0.5,
): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const parts: string[] = [`M ${points[0].x} ${points[0].y}`];

  if (points.length === 2) {
    parts.push(`L ${points[1].x} ${points[1].y}`);
    return parts.join(' ');
  }

  // The tension factor scales the tangent vectors. Catmull-Rom uses t/6
  // scaling to convert tangents into cubic Bezier control points.
  const alpha = tension / 3;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    // Tangent at p1
    const t1x = (p2.x - p0.x) * alpha;
    const t1y = (p2.y - p0.y) * alpha;

    // Tangent at p2
    const t2x = (p3.x - p1.x) * alpha;
    const t2y = (p3.y - p1.y) * alpha;

    // Cubic Bezier control points
    const cp1x = parseFloat((p1.x + t1x).toFixed(2));
    const cp1y = parseFloat((p1.y + t1y).toFixed(2));
    const cp2x = parseFloat((p2.x - t2x).toFixed(2));
    const cp2y = parseFloat((p2.y - t2y).toFixed(2));

    parts.push(
      `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`,
    );
  }

  return parts.join(' ');
}

// ── Path Conversion ─────────────────────────────────────────────

/**
 * Convert trajectory points to an SVG path `d` attribute string using
 * Catmull-Rom spline interpolation with tension 0.5.
 *
 * @param points - Array of trajectory points
 * @returns SVG path `d` attribute string
 */
export function trajectoryToPath(points: TrajectoryPoint[]): string {
  if (points.length === 0) return '';

  return catmullRomToBezier(
    points.map((p) => ({ x: p.x, y: p.y })),
    0.5,
  );
}

// ── SVG Rendering ───────────────────────────────────────────────

/**
 * Render the trajectory as an SVG `<path>` element.
 *
 * Generates trajectory points from the contribution data and converts
 * them to a smooth Catmull-Rom spline path. The path is styled with the
 * accent color from the appropriate VOYAGE palette.
 *
 * @param data - Complete contribution data for one year
 * @param mode - Color mode (dark or light)
 * @returns SVG `<path>` element string
 */
export function renderTrajectory(
  data: ContributionData,
  mode: ColorMode,
): string {
  const palette = mode === 'dark' ? VOYAGE_DARK : VOYAGE_LIGHT;
  const points = generateTrajectoryPoints(data);

  if (points.length === 0) {
    return '';
  }

  const d = trajectoryToPath(points);

  if (!d) return '';

  return svgElement('path', {
    d,
    fill: 'none',
    stroke: palette.text.accent,
    'stroke-width': 2,
    'stroke-linecap': 'round',
    class: 'trajectory',
  });
}
