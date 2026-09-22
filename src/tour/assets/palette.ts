import type { ModelPart, WorldSeason } from '../../world/model/geometry-types.js';
import { PALETTE } from '../../world/model/recipes/primitives.js';

export const GLOW_COLORS = ['#e3b564', '#f6cf82', '#8cd5c3', '#a6c9e5', '#b89bcf'] as const;
export const TOUR_COLORS = {
  ...PALETTE,
  glow: '#f6cf82',
  lotus: '#d78fa7',
  autumn: '#c18a48',
  autumnDark: '#a5683f',
  autumnLight: '#d9b566',
  ice: '#a6c9e5',
  jade: '#8cd5c3',
  violet: '#b89bcf',
} as const;

const FOLIAGE = new Set<string>([
  PALETTE.leaf,
  PALETTE.leafDark,
  PALETTE.leafLight,
  '#c69858',
  '#d9b665',
]);
const TINTS = {
  spring: ['#7f9a62', '#496e50', '#adc280'],
  summer: [PALETTE.leaf, PALETTE.leafDark, PALETTE.leafLight],
  autumn: [TOUR_COLORS.autumn, TOUR_COLORS.autumnDark, TOUR_COLORS.autumnLight],
  winter: ['#b7c6b6', '#71867c', '#e0e7d9'],
} as const satisfies Readonly<Record<WorldSeason, readonly [string, string, string]>>;

export function seasonalParts(
  parts: readonly ModelPart[],
  season: WorldSeason,
): readonly ModelPart[] {
  const colors = TINTS[season];
  return parts.map((item) => {
    if (!FOLIAGE.has(item.color)) return item;
    const color =
      item.color === PALETTE.leafDark
        ? colors[1]
        : item.color === PALETTE.leafLight || item.color === '#d9b665'
          ? colors[2]
          : colors[0];
    return { ...item, color };
  });
}
