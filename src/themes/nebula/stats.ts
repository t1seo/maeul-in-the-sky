import type { ContributionStats, ColorMode, ThemePalette } from '../../core/types.js';
import { svgElement, svgGroup, svgText, formatNumber } from '../../core/svg.js';
import { cssKeyframes } from '../../core/animation.js';
import { NEBULA_DARK, NEBULA_LIGHT } from './palette.js';

// ── Constants ───────────────────────────────────────────────────

/** Font family used for all stats text */
const FONT_FAMILY = "'Segoe UI', system-ui, sans-serif";

/** Font size for stat values (px) */
const VALUE_FONT_SIZE = 13;

/** Font size for stat labels (px) */
const LABEL_FONT_SIZE = 10;

/** X positions for each of the four stat items */
const STAT_X_POSITIONS = [24, 230, 436, 642] as const;

/** Y position for stat value text */
const VALUE_Y = 224;

/** Y position for stat label text */
const LABEL_Y = 224;

/** Y position for stat icons */
const ICON_Y = 218;

// ── Icon Builders ───────────────────────────────────────────────

/**
 * Nebula icon — three overlapping translucent circles representing a miniature nebula.
 * Used for the "total contributions" stat.
 */
function nebulaIcon(x: number, y: number, palette: ThemePalette): string {
  const c1 = palette.contribution.levels[2].hex;
  const c2 = palette.contribution.levels[3].hex;
  const c3 = palette.contribution.levels[4].hex;

  return svgGroup({ transform: `translate(${x}, ${y})` }, [
    svgElement('circle', { cx: 0, cy: 0, r: 3, fill: c1, opacity: 0.7 }),
    svgElement('circle', { cx: 2.5, cy: -1, r: 2.5, fill: c2, opacity: 0.7 }),
    svgElement('circle', { cx: 1, cy: 2, r: 2, fill: c3, opacity: 0.7 }),
  ].join(''));
}

/**
 * Light rays icon — three short parallel lines angled at 45 degrees.
 * Used for the "longest streak" stat.
 */
function lightRaysIcon(x: number, y: number, palette: ThemePalette): string {
  const stroke = palette.contribution.levels[3].hex;

  return svgGroup({ transform: `translate(${x}, ${y})` }, [
    svgElement('line', {
      x1: -3, y1: 3, x2: 1, y2: -1,
      stroke,
      'stroke-width': 1.2,
      'stroke-linecap': 'round',
      opacity: 0.9,
    }),
    svgElement('line', {
      x1: -1, y1: 3, x2: 3, y2: -1,
      stroke,
      'stroke-width': 1.2,
      'stroke-linecap': 'round',
      opacity: 0.7,
    }),
    svgElement('line', {
      x1: 1, y1: 3, x2: 5, y2: -1,
      stroke,
      'stroke-width': 1.2,
      'stroke-linecap': 'round',
      opacity: 0.5,
    }),
  ].join(''));
}

/**
 * Four-point star icon — a diamond-shaped path with four points.
 * Used for the "most active day" stat.
 */
function starIcon(x: number, y: number, palette: ThemePalette): string {
  const fill = palette.contribution.levels[4].hex;

  // Four-point star centered at origin: top, right, bottom, left
  const d = 'M0,-4 L1.2,-1.2 L4,0 L1.2,1.2 L0,4 L-1.2,1.2 L-4,0 L-1.2,-1.2 Z';

  return svgGroup({ transform: `translate(${x}, ${y}) scale(0.8)` }, [
    svgElement('path', { d, fill, opacity: 0.9 }),
  ].join(''));
}

/**
 * Pulsing dot icon — a small circle with the `stat-pulse` animation class.
 * Used for the "current streak" stat.
 */
function pulsingDotIcon(x: number, y: number, palette: ThemePalette): string {
  const fill = palette.text.accent;

  return svgElement('circle', {
    cx: x,
    cy: y,
    r: 3,
    fill,
    class: 'stat-pulse',
  });
}

// ── Stat Item Builder ───────────────────────────────────────────

/**
 * Render a single stat item with icon, value, and label.
 * Layout: [icon 8px gap] [value] [4px gap] [label]
 */
function statItem(
  x: number,
  icon: string,
  value: string,
  label: string,
  palette: ThemePalette,
): string {
  const valueEl = svgText(x + 12, VALUE_Y, value, {
    fill: palette.text.accent,
    'font-family': FONT_FAMILY,
    'font-size': VALUE_FONT_SIZE,
    'font-weight': 600,
  });

  // Approximate value width: ~7.5px per character at font-size 13
  const valueWidth = value.length * 7.5;

  const labelEl = svgText(x + 12 + valueWidth + 4, LABEL_Y, label, {
    fill: palette.text.secondary,
    'font-family': FONT_FAMILY,
    'font-size': LABEL_FONT_SIZE,
  });

  return `${icon}${valueEl}${labelEl}`;
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Render the stats bar overlay at the bottom of the Nebula SVG.
 *
 * Displays four stat items across the bottom of the 840x240 viewBox:
 * 1. Total contributions (nebula icon)
 * 2. Longest streak (light rays icon)
 * 3. Most active day (four-point star icon)
 * 4. Current streak (pulsing dot icon)
 *
 * @param stats - Computed contribution statistics
 * @param mode - Color mode (dark or light)
 * @returns SVG group string containing the stats overlay
 */
export function renderNebulaStats(stats: ContributionStats, mode: ColorMode): string {
  const palette = mode === 'dark' ? NEBULA_DARK : NEBULA_LIGHT;

  const items: string[] = [
    // Total contributions
    statItem(
      STAT_X_POSITIONS[0],
      nebulaIcon(STAT_X_POSITIONS[0] + 4, ICON_Y, palette),
      formatNumber(stats.total),
      'contributions',
      palette,
    ),
    // Longest streak
    statItem(
      STAT_X_POSITIONS[1],
      lightRaysIcon(STAT_X_POSITIONS[1] + 4, ICON_Y, palette),
      String(stats.longestStreak),
      'day streak',
      palette,
    ),
    // Most active day
    statItem(
      STAT_X_POSITIONS[2],
      starIcon(STAT_X_POSITIONS[2] + 4, ICON_Y, palette),
      stats.mostActiveDay,
      '',
      palette,
    ),
    // Current streak
    statItem(
      STAT_X_POSITIONS[3],
      pulsingDotIcon(STAT_X_POSITIONS[3] + 4, ICON_Y, palette),
      String(stats.currentStreak),
      'current',
      palette,
    ),
  ];

  return svgGroup({ class: 'nebula-stats' }, items.join(''));
}

/**
 * Generate the CSS for the pulsing current-streak dot animation.
 *
 * Animation spec:
 * ```
 * @keyframes stat-pulse {
 *   0%, 100% { opacity: 0.6; r: 3; }
 *   50%      { opacity: 1; r: 4; }
 * }
 * .stat-pulse { animation: stat-pulse 2s ease-in-out infinite; }
 * ```
 *
 * @returns CSS string containing @keyframes block and `.stat-pulse` class rule
 */
export function statsPulseCSS(): string {
  return cssKeyframes({
    name: 'stat-pulse',
    keyframes: {
      '0%, 100%': { opacity: '0.6', r: '3' },
      '50%': { opacity: '1', r: '4' },
    },
    duration: '2s',
    easing: 'ease-in-out',
    iterationCount: 'infinite',
  });
}
