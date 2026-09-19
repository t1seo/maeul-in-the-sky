import { describe, expect, it } from 'vitest';
import type { ActivityBreakdown } from '../../../src/core/activity-types.js';
import { InputValidationError } from '../../../src/core/settings/errors.js';
import {
  createSnapshot,
  parseSnapshot,
  snapshotToContributionData,
} from '../../../src/core/settings/parse.js';
import { serializeSnapshot } from '../../../src/core/settings/serialize.js';
import { snapshotFixture } from './fixtures.js';
import { buildWorld, defaultWorldSettings } from '../../../src/world/model/index.js';
import {
  createWorldDocument,
  parseWorldDocument,
  serializeWorldDocument,
} from '../../../src/world/data/document.js';
import { parseArchive } from '../../../src/core/archive/parse.js';

const month = {
  month: '2024-02',
  from: '2024-02-27T00:00:00.000Z',
  to: '2024-02-29T23:59:59.999Z',
  commits: 8,
  pullRequests: 1,
  issues: 0,
  reviews: 2,
  repositories: 0,
  restricted: 1,
} as const;
const activity: ActivityBreakdown = {
  source: 'github-contributions',
  from: month.from,
  to: month.to,
  months: [month],
};

describe('optional activity evidence', () => {
  it('preserves validated activity through every snapshot conversion', () => {
    // Given complete evidence for the supplied leap-day calendar.
    const input = { ...snapshotFixture(), activity };
    // When the snapshot is imported, converted, recreated and serialized.
    const parsed = parseSnapshot(input);
    const data = snapshotToContributionData(parsed);
    const recreated = createSnapshot(data, parsed.settings, parsed.source);
    const restored = parseSnapshot(serializeSnapshot(recreated));
    // Then each public conversion preserves the same evidence and original counts.
    expect(parsed.activity).toEqual(activity);
    expect(data.activity).toEqual(activity);
    expect(restored).toEqual(parsed);
    expect(data.stats.total).toBe(12);
  });

  it('keeps legacy snapshots unavailable without adding a zero breakdown', () => {
    // Given a snapshot that predates collection of activity evidence.
    const input = snapshotFixture();
    // When it is converted and serialized.
    const parsed = parseSnapshot(input);
    const data = snapshotToContributionData(parsed);
    const restored = createSnapshot(data, parsed.settings, parsed.source);
    // Then absent evidence remains absent on every surface.
    expect(parsed).not.toHaveProperty('activity');
    expect(data).not.toHaveProperty('activity');
    expect(restored).not.toHaveProperty('activity');
    expect(serializeSnapshot(restored)).not.toContain('activity');
  });

  it('strips unknown secrets at every activity nesting level', () => {
    // Given otherwise valid evidence with unrelated imported properties.
    const input = {
      ...snapshotFixture(),
      token: 'top-secret',
      activity: {
        ...activity,
        token: 'activity-secret',
        months: [{ ...month, authorization: 'month-secret', repoNames: ['private/repo'] }],
      },
    };
    // When the input is parsed and exported.
    const serialized = serializeSnapshot(parseSnapshot(input));
    // Then only the declared aggregate evidence survives.
    expect(parseSnapshot(serialized).activity).toEqual(activity);
    expect(serialized).not.toMatch(/secret|authorization|private\/repo|repoNames/);
  });

  it('preserves world identity and activity when a world is exported and reopened', () => {
    // Given identical contribution calendars with and without activity evidence.
    const original = parseSnapshot(snapshotFixture());
    const enriched = parseSnapshot({ ...snapshotFixture(), activity });
    const settings = defaultWorldSettings(original);
    const before = buildWorld({ snapshot: original, settings, repositories: [] });
    // When an enriched world is generated and serialized.
    const scene = buildWorld({ snapshot: enriched, settings, repositories: [] });
    const document = createWorldDocument({ scene, sourceSnapshot: enriched });
    const restored = parseWorldDocument(serializeWorldDocument(document));
    // Then analytics neither changes deterministic scenery nor disappears during export.
    expect(scene).toEqual(before);
    expect(restored.sourceSnapshot.activity).toEqual(activity);
  });

  it('preserves evidence when included in a portable comparison archive', () => {
    // Given a legacy-compatible archive containing an enriched snapshot.
    const input = {
      schemaVersion: 1,
      kind: 'maeul-archive',
      snapshots: [snapshotFixture(2020), { ...snapshotFixture(), activity }],
      comparison: { normalization: { kind: 'fixed', maxCount: 50 }, years: [2020, 2024] },
    };
    // When the archive crosses its existing schema boundary.
    const parsed = parseArchive(input);
    // Then the same snapshot evidence remains available.
    expect(parsed.snapshots[1]?.activity).toEqual(activity);
  });

  it.each([-1, 0.5, Number.MAX_SAFE_INTEGER + 1, '2', null])(
    'rejects an invalid activity count %j',
    (commits) => {
      // Given invalid evidence attached to a valid calendar.
      const input = {
        ...snapshotFixture(),
        activity: { ...activity, months: [{ ...month, commits }] },
      };
      // When / Then importing rejects it rather than inventing zero.
      expect(() => parseSnapshot(input)).toThrow(InputValidationError);
    },
  );

  it.each([
    ['missing counts', { month: month.month, from: month.from, to: month.to }],
    ['impossible UTC date', { ...month, from: '2024-02-30T00:00:00Z' }],
    ['non-UTC offset', { ...month, from: '2024-02-27T00:00:00+09:00' }],
    ['wrong month key', { ...month, month: '2024-03' }],
    ['reversed bounds', { ...month, from: month.to, to: month.from }],
    ['omitted start', { ...month, from: '2024-02-28T00:00:00Z' }],
    ['omitted end', { ...month, to: '2024-02-29T12:00:00Z' }],
  ])('rejects %s in a claimed monthly interval', (_name, invalidMonth) => {
    // Given a present but inconsistent monthly interval.
    const input = { ...snapshotFixture(), activity: { ...activity, months: [invalidMonth] } };
    // When / Then importing rejects the incomplete evidence.
    expect(() => parseSnapshot(input)).toThrow(InputValidationError);
  });

  it.each([
    ['null', null],
    ['wrong source', { ...activity, source: 'estimated' }],
    ['no months', { ...activity, months: [] }],
    ['duplicate month', { ...activity, months: [month, month] }],
    ['too many months', { ...activity, months: Array.from({ length: 14 }, () => month) }],
    ['invalid outer date', { ...activity, from: '2024-02-30T00:00:00Z' }],
  ])('rejects %s activity instead of accepting it as complete', (_name, invalid) => {
    // Given a valid snapshot with a malformed activity object.
    const input = { ...snapshotFixture(), activity: invalid };
    // When / Then importing reports the boundary failure.
    expect(() => parseSnapshot(input)).toThrow(InputValidationError);
  });

  it('rejects evidence for a calendar day that was not observed', () => {
    // Given a hole in an otherwise matching calendar.
    const input = snapshotFixture();
    input.weeks[0].days = input.weeks[0].days.filter((day) => day.date !== '2024-02-28');
    // When / Then the missing day prevents a complete breakdown claim.
    expect(() => parseSnapshot({ ...input, activity })).toThrow(InputValidationError);
  });

  it.each(['0001', '0099', '9999'])('preserves supported year %s in activity dates', (year) => {
    // Given one observed day at a supported year boundary.
    const date = `${year}-12-31`;
    const bounded = {
      ...month,
      month: `${year}-12`,
      from: `${date}T00:00:00.000Z`,
      to: `${date}T23:59:59.999Z`,
    };
    const input = {
      ...snapshotFixture(),
      year: Number(year),
      weeks: [{ firstDay: date, days: [{ date, count: 12, level: 4 }] }],
      activity: { ...activity, from: bounded.from, to: bounded.to, months: [bounded] },
    };
    // When the snapshot is parsed.
    const parsed = parseSnapshot(input);
    // Then the year is neither shifted to 1900 nor reduced to two digits.
    expect(parsed.activity).toEqual(input.activity);
  });
});
