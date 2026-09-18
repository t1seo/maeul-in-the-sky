import type { RewardTier } from '../../../core/scene-types.js';

export const DAILY_REWARD_MINIMUMS: Readonly<Record<RewardTier, number>> = {
  0: 0,
  1: 1,
  2: 5,
  3: 10,
  4: 25,
  5: 50,
};

export const DAILY_DECORATION_CEILINGS: Readonly<Record<RewardTier, number>> = {
  0: 0,
  1: 65,
  2: 78,
  3: 90,
  4: 95,
  5: 99,
};

export function getDailyRewardTier(count: number): RewardTier {
  if (count >= 50) return 5;
  if (count >= 25) return 4;
  if (count >= 10) return 3;
  if (count >= 5) return 2;
  return count > 0 ? 1 : 0;
}
