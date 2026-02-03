import type { ThemePalette } from '../../core/types.js';

// ── Dark Mode Palette ──────────────────────────────────────────
// Designed for GitHub dark background (#0d1117)

export const NEBULA_DARK: ThemePalette = {
  contribution: {
    levels: [
      { hex: '#1E1048', opacity: 0.4 },
      { hex: '#7C3AED', opacity: 0.6 },
      { hex: '#A78BFA', opacity: 0.75 },
      { hex: '#7DD3FC', opacity: 0.85 },
      { hex: '#F0E6FF', opacity: 0.95 },
    ],
  },
  text: {
    primary: '#E2E8F0',
    secondary: '#94A3B8',
    accent: '#67E8F9',
  },
  background: {
    subtle: '#FDE68A',
  },
};

// ── Light Mode Palette ─────────────────────────────────────────
// Designed for GitHub light background (#ffffff)

export const NEBULA_LIGHT: ThemePalette = {
  contribution: {
    levels: [
      { hex: '#EDE9FE', opacity: 0.4 },
      { hex: '#C4B5FD', opacity: 0.6 },
      { hex: '#A78BFA', opacity: 0.75 },
      { hex: '#7C3AED', opacity: 0.85 },
      { hex: '#5B21B6', opacity: 0.95 },
    ],
  },
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    accent: '#4F46E5',
  },
  background: {
    subtle: '#D97706',
  },
};

// ── Accent Colors ──────────────────────────────────────────────

/** Glow accent used for hover/focus effects */
export const NEBULA_ACCENT = { dark: '#F472B6', light: '#DB2777' } as const;

/** Star particle color for ambient background animation */
export const NEBULA_STAR = { dark: '#FDE68A', light: '#D97706' } as const;
