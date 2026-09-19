import type { ActivityMonth } from '../../core/activity-types.js';
import type { SnapshotSource } from '../../core/snapshot-types.js';
import type { WorldRange } from '../model/types.js';

export type Granularity = 'day' | 'week' | 'month';
export type Observation = { readonly date: string; readonly count: number };
export type ContributionBucket = WorldRange & {
  readonly label: string;
  readonly total: number | null;
  readonly observedDays: number;
  readonly missingDays: number;
  readonly partial: boolean;
};
export type MonthlyActivity = {
  readonly month: string;
  readonly activity: ActivityMonth | undefined;
};
export type AnalyticsModel = {
  readonly username: string;
  readonly source: SnapshotSource;
  readonly range: WorldRange | undefined;
  readonly months: readonly string[];
  readonly summary: {
    readonly contributions: number | null;
    readonly activeDays: number | null;
    readonly observedDays: number;
    readonly missingDays: number;
    readonly longestStreak: number;
    readonly currentStreak: number;
  };
  readonly monthlySums:
    | { readonly commits: number; readonly pullRequests: number; readonly months: number }
    | undefined;
  readonly trend: readonly ContributionBucket[];
  readonly weekdays: readonly ContributionBucket[];
  readonly breakdown: readonly MonthlyActivity[];
};
