import type { ThemePalette } from '../../core/types.js';

// ── Dark Mode Palette ──────────────────────────────────────────
// Designed for GitHub dark background (#0d1117)
// Trail intensity: cold void -> dim -> warm -> hot -> blazing

export const VOYAGE_DARK: ThemePalette = {
  contribution: {
    levels: [
      { hex: '#0C1222', opacity: 0.2 },  // L0 — cold void
      { hex: '#1E40AF', opacity: 0.5 },  // L1 — dim trail
      { hex: '#3B82F6', opacity: 0.7 },  // L2 — warm trail
      { hex: '#F59E0B', opacity: 0.85 }, // L3 — hot trail
      { hex: '#FBBF24', opacity: 1.0 },  // L4 — blazing trail
    ],
  },
  text: {
    primary: '#E2E8F0',
    secondary: '#94A3B8',
    accent: '#F59E0B',
  },
  background: {
    subtle: '#1E3A5F', // space dust
  },
};

// ── Light Mode Palette ─────────────────────────────────────────
// Designed for GitHub light background (#ffffff)
// Trail intensity: faint -> light -> medium -> warm -> hot

export const VOYAGE_LIGHT: ThemePalette = {
  contribution: {
    levels: [
      { hex: '#F0F4FF', opacity: 0.2 },  // L0 — faint
      { hex: '#93C5FD', opacity: 0.5 },  // L1 — light trail
      { hex: '#3B82F6', opacity: 0.7 },  // L2 — medium trail
      { hex: '#D97706', opacity: 0.85 }, // L3 — warm trail
      { hex: '#B45309', opacity: 1.0 },  // L4 — hot trail
    ],
  },
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    accent: '#D97706',
  },
  background: {
    subtle: '#DBEAFE', // sky dust
  },
};

// ── Accent Colors ──────────────────────────────────────────────

/** Engine glow color for spaceship flame and hot-trail effects */
export const VOYAGE_ENGINE = { dark: '#F59E0B', light: '#D97706' } as const;

/** Warp effect color for streak highlights and speed-line accents */
export const VOYAGE_WARP = { dark: '#60A5FA', light: '#3B82F6' } as const;
