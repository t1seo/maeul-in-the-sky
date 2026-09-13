import type { RenderSettingsInput } from '../render-options.js';
import type { SettingsV1, SnapshotSource, SnapshotV1 } from '../snapshot-types.js';
import type { ContributionData } from '../types.js';
import { computeStats } from '../stats.js';
import { parseBoundary, readJsonInput } from './boundary.js';
import { resolveRenderSettings } from './resolve.js';
import { settingsEnvelopeSchema, snapshotSchema } from './snapshot-schema.js';

export function parseSettings(input: unknown): SettingsV1 {
  const parsed = parseBoundary(settingsEnvelopeSchema, readJsonInput(input));
  return {
    schemaVersion: 1,
    kind: 'maeul-settings',
    username: parsed.username,
    ...(parsed.year === undefined ? {} : { year: parsed.year }),
    settings: resolveRenderSettings(parsed.settings, {}, parsed.username),
  };
}

export function parseSnapshot(input: unknown): SnapshotV1 {
  return parseBoundary(snapshotSchema, readJsonInput(input));
}

export function snapshotToContributionData(snapshot: SnapshotV1): ContributionData {
  const weeks = snapshot.weeks.map((week) => ({
    firstDay: week.firstDay,
    days: week.days.map((day) => ({ ...day })),
  }));
  return { username: snapshot.username, year: snapshot.year, weeks, stats: computeStats(weeks) };
}

export function createSnapshot(
  data: ContributionData,
  settings: RenderSettingsInput = {},
  source: SnapshotSource = { kind: 'import' },
): SnapshotV1 {
  return parseSnapshot({
    schemaVersion: 1,
    kind: 'maeul-snapshot',
    username: data.username,
    year: data.year,
    weeks: data.weeks,
    settings,
    source,
  });
}
