import type { ColorMode, ThemePalette } from '../../core/types.js';

// ── Dark Mode Palette ──────────────────────────────────────────
// Designed for GitHub dark background (#0d1117)
// Turrets rendered as defensive installations: L4 = Plasma Core (max firepower)

export const DEFENSE_DARK: ThemePalette = {
  contribution: {
    levels: [
      { hex: '#0F1A15', opacity: 0.4 },  // L0 — Grid Dark (empty slot)
      { hex: '#047857', opacity: 0.6 },   // L1 — Faint Post
      { hex: '#059669', opacity: 0.75 },  // L2 — Dim Guard
      { hex: '#10B981', opacity: 0.9 },   // L3 — Shield Green
      { hex: '#34D399', opacity: 1.0 },   // L4 — Plasma Core
    ],
  },
  text: {
    primary: '#D1FAE5',   // Terminal Green
    secondary: '#6EE7B7', // Dim Green
    accent: '#34D399',     // Neon Green
  },
  background: {
    subtle: '#134E3A', // Wire Green (grid lines)
  },
};

// ── Light Mode Palette ─────────────────────────────────────────
// Designed for GitHub light background (#ffffff)
// Inverted intensity: deeper greens = stronger turrets

export const DEFENSE_LIGHT: ThemePalette = {
  contribution: {
    levels: [
      { hex: '#F0FDF4', opacity: 0.5 },   // L0 — Light Grid (empty slot)
      { hex: '#6EE7B7', opacity: 0.6 },   // L1 — Pale Mint
      { hex: '#10B981', opacity: 0.75 },  // L2 — Mint
      { hex: '#059669', opacity: 0.9 },   // L3 — Forest
      { hex: '#047857', opacity: 1.0 },   // L4 — Deep Emerald
    ],
  },
  text: {
    primary: '#14532D',   // Dark Green
    secondary: '#166534', // Mid Green
    accent: '#059669',     // Emerald
  },
  background: {
    subtle: '#BBF7D0', // Soft Green (grid lines)
  },
};

// ── Alien Accent Colors ────────────────────────────────────────

/** Alien body color */
export const DEFENSE_ALIEN = { dark: '#F87171', light: '#DC2626' } as const;

/** Alien glow effect */
export const DEFENSE_ALIEN_GLOW = { dark: '#DC2626', light: '#991B1B' } as const;

/** Laser beam color */
export const DEFENSE_LASER = { dark: '#A3E635', light: '#65A30D' } as const;

/** Explosion outer color */
export const DEFENSE_EXPLOSION = { dark: '#FB923C', light: '#EA580C' } as const;

/** Explosion center highlight */
export const DEFENSE_EXPLOSION_CORE = { dark: '#FDE68A', light: '#FDE68A' } as const;

/** Shield bubble color */
export const DEFENSE_SHIELD = { dark: '#22D3EE', light: '#0D9488' } as const;

/** Score text color */
export const DEFENSE_SCORE = { dark: '#FBBF24', light: '#B45309' } as const;

/** Grid line color */
export const DEFENSE_GRID_LINE = { dark: '#134E3A', light: '#BBF7D0' } as const;

// ── Turret Tier Mapping ────────────────────────────────────────

/** Visual properties for a turret at a given contribution level */
export interface TurretProps {
  /** Turret fill color */
  color: string;
  /** Turret radius in SVG units */
  radius: number;
  /** Fill opacity (0-1) */
  opacity: number;
  /** Turret shape form */
  form: 'empty' | 'square' | 'rounded' | 'circle' | 'plasma';
  /** Whether the turret emits a glow effect */
  hasGlow: boolean;
  /** Whether the turret has a shield bubble */
  hasShield: boolean;
  /** Whether the turret renders a crosshair overlay */
  hasCrosshair: boolean;
}

/** Returns visual properties for a turret at the given contribution level and color mode */
export function getTurretProps(level: 0 | 1 | 2 | 3 | 4, mode: ColorMode): TurretProps {
  const palette = mode === 'dark' ? DEFENSE_DARK : DEFENSE_LIGHT;
  const { hex, opacity } = palette.contribution.levels[level];

  const TIER_MAP: Record<0 | 1 | 2 | 3 | 4, Omit<TurretProps, 'color' | 'opacity'>> = {
    0: { radius: 0, form: 'empty', hasGlow: false, hasShield: false, hasCrosshair: false },
    1: { radius: 3, form: 'square', hasGlow: false, hasShield: false, hasCrosshair: false },
    2: { radius: 4, form: 'rounded', hasGlow: false, hasShield: false, hasCrosshair: false },
    3: { radius: 4, form: 'circle', hasGlow: true, hasShield: true, hasCrosshair: false },
    4: { radius: 5, form: 'plasma', hasGlow: true, hasShield: true, hasCrosshair: true },
  };

  return { color: hex, opacity, ...TIER_MAP[level] };
}
