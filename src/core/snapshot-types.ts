import type { ResolvedRenderSettings } from './render-options.js';
import type { ContributionDay } from './types.js';
import type { ActivityBreakdown } from './activity-types.js';

export type SettingsV1 = {
  readonly schemaVersion: 1;
  readonly kind: 'maeul-settings';
  readonly username: string;
  readonly year?: number;
  readonly settings: ResolvedRenderSettings;
};

export type SnapshotSource = {
  readonly kind: 'github' | 'import' | 'sample';
  readonly fetchedAt?: string;
};

export type SnapshotWeek = {
  readonly firstDay: string;
  readonly days: readonly Readonly<ContributionDay>[];
};

export type SnapshotV1 = {
  readonly schemaVersion: 1;
  readonly kind: 'maeul-snapshot';
  readonly username: string;
  readonly year: number;
  readonly weeks: readonly SnapshotWeek[];
  readonly settings: ResolvedRenderSettings;
  readonly source: SnapshotSource;
  readonly activity?: ActivityBreakdown;
};

export type ArchiveComparison = {
  readonly normalization: { readonly kind: 'fixed'; readonly maxCount: number };
  readonly years: readonly number[];
};

export type ArchiveV1 = {
  readonly schemaVersion: 1;
  readonly kind: 'maeul-archive';
  readonly snapshots: readonly SnapshotV1[];
  readonly comparison: ArchiveComparison;
};
