import { createSnapshot, snapshotToContributionData } from '../../../src/core/settings/parse.js';
import type { SnapshotV1 } from '../../../src/core/snapshot-types.js';
import type { ContributionWeek } from '../../../src/core/types.js';
import type { RenderSettingsInput } from '../../../src/core/render-options.js';
import { computeStats } from '../../../src/core/stats.js';
import { prepareTerrainScene } from '../../../src/themes/terrain/scene/prepare.js';

export function snapshotFor(
  dates: readonly string[],
  settings: RenderSettingsInput = {},
): SnapshotV1 {
  const weeks: ContributionWeek[] = dates.map((date, index) => ({
    firstDay: date,
    days: [{ date, count: index === 0 ? 0 : 25, level: 4 }],
  }));
  return createSnapshot(
    { username: 'tour-visitor', year: 2025, weeks, stats: computeStats(weeks) },
    { style: 'korean', ...settings },
    { kind: 'import' },
  );
}

export function sceneFor(snapshot: SnapshotV1) {
  return prepareTerrainScene(snapshotToContributionData(snapshot), snapshot.settings);
}

export function datesFrom(first: string, count: number): readonly string[] {
  const start = Date.parse(`${first}T00:00:00.000Z`);
  return Array.from({ length: count }, (_, index) =>
    new Date(start + index * 86_400_000).toISOString().slice(0, 10),
  );
}
