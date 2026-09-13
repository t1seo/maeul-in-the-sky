import type { ContributionStats } from '../../../core/types.js';
import type { EpicTier } from './types.js';

export interface EpicStatsRule {
  readonly combination: 'or' | 'and';
  readonly total: number;
  readonly longestStreak: number;
}
export interface EpicGateThreshold {
  readonly metric: 'total' | 'longestStreak';
  readonly required: number;
  readonly current: number;
  readonly achieved: boolean;
}
export const EPIC_STATS_RULES: Readonly<Record<EpicTier, EpicStatsRule>> = {
  rare: { combination: 'or', total: 200, longestStreak: 7 },
  epic: { combination: 'and', total: 500, longestStreak: 14 },
  legendary: { combination: 'and', total: 1000, longestStreak: 30 },
};

export function getEpicGateThresholds(
  tier: EpicTier,
  stats: ContributionStats,
): readonly EpicGateThreshold[] {
  return (['total', 'longestStreak'] as const).map((metric) => ({
    metric,
    required: EPIC_STATS_RULES[tier][metric],
    current: stats[metric],
    achieved: stats[metric] >= EPIC_STATS_RULES[tier][metric],
  }));
}

export function passesEpicStatsGate(tier: EpicTier, stats: ContributionStats): boolean {
  const thresholds = getEpicGateThresholds(tier, stats);
  switch (EPIC_STATS_RULES[tier].combination) {
    case 'or':
      return thresholds.some((threshold) => threshold.achieved);
    case 'and':
      return thresholds.every((threshold) => threshold.achieved);
  }
}

export function describeEpicStatsGate(tier: EpicTier): string {
  const rule = EPIC_STATS_RULES[tier];
  return `At least ${rule.total} total contributions ${rule.combination.toUpperCase()} a longest streak of at least ${rule.longestStreak} days.`;
}
