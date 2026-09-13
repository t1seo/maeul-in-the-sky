import { describe, expect, it } from 'vitest';
import {
  parseSettings,
  parseSnapshot,
  createSnapshot,
  snapshotToContributionData,
} from '../../../src/core/settings/parse.js';
import { serializeSettings, serializeSnapshot } from '../../../src/core/settings/serialize.js';
import { snapshotFixture } from './fixtures.js';

describe('C01-roundtrip', () => {
  it('roundtrips settings without changing bytes or inserting a rolling year', () => {
    // Given
    const input = {
      schemaVersion: 1,
      kind: 'maeul-settings',
      username: ' octocat ',
      settings: { layout: 'card' },
    };
    // When
    const first = serializeSettings(parseSettings(input));
    const second = serializeSettings(parseSettings(first));
    // Then
    expect(second).toBe(first);
    expect(JSON.parse(first)).not.toHaveProperty('year');
    expect(JSON.parse(first)).toMatchObject({
      username: 'octocat',
      settings: { title: '@octocat' },
    });
  });

  it.each(['style', 'villageStyle'] as const)(
    'accepts the %s public input alias and serializes only canonical style',
    (alias) => {
      // Given
      const input = JSON.stringify({
        schemaVersion: 1,
        kind: 'maeul-settings',
        username: 'octocat',
        settings: { [alias]: 'korean' },
      });
      // When
      const serialized = serializeSettings(parseSettings(input));
      const document: unknown = JSON.parse(serialized);
      // Then
      expect(document).toMatchObject({ settings: { style: 'korean' } });
      expect(serialized).not.toContain('villageStyle');
    },
  );

  it('accepts villageStyle in snapshots and roundtrips canonical style only', () => {
    // Given
    const input = { ...snapshotFixture(), settings: { villageStyle: 'korean' } };
    // When
    const first = serializeSnapshot(parseSnapshot(input));
    const second = serializeSnapshot(parseSnapshot(first));
    // Then
    expect(second).toBe(first);
    expect(JSON.parse(first)).toMatchObject({ settings: { style: 'korean' } });
    expect(first).not.toContain('villageStyle');
  });

  it.each([
    [
      'settings documents',
      () =>
        parseSettings({
          schemaVersion: 1,
          kind: 'maeul-settings',
          username: 'octocat',
          settings: { style: 'korean', villageStyle: 'korean' },
        }),
    ],
    [
      'snapshots',
      () =>
        parseSnapshot({
          ...snapshotFixture(),
          settings: { style: 'korean', villageStyle: 'korean' },
        }),
    ],
  ] as const)('accepts identical aliases in %s and keeps canonical style', (_surface, parse) => {
    // Given / When
    const document = parse();
    // Then
    expect(document.settings.style).toBe('korean');
    expect(document.settings).not.toHaveProperty('villageStyle');
  });

  it.each([
    [
      'settings documents',
      () =>
        parseSettings({
          schemaVersion: 1,
          kind: 'maeul-settings',
          username: 'octocat',
          settings: { style: 'classic', villageStyle: 'korean' },
        }),
    ],
    [
      'snapshots',
      () =>
        parseSnapshot({
          ...snapshotFixture(),
          settings: { style: 'classic', villageStyle: 'korean' },
        }),
    ],
  ] as const)('rejects conflicting aliases in %s', (_surface, parse) => {
    // Given / When / Then
    expect(parse).toThrow(/settings\.villageStyle.*conflicts/i);
  });

  it('canonicalizes days, source timestamp and settings with deterministic key order', () => {
    // Given
    const input = snapshotFixture();
    // When
    const first = serializeSnapshot(parseSnapshot(input));
    const parsed = parseSnapshot(first);
    // Then
    expect(serializeSnapshot(parsed)).toBe(first);
    expect(Object.keys(parsed)).toEqual([
      'schemaVersion',
      'kind',
      'username',
      'year',
      'weeks',
      'settings',
      'source',
    ]);
    expect(parsed.weeks[0].days.map((day) => day.date)).toEqual([
      '2024-02-27',
      '2024-02-28',
      '2024-02-29',
    ]);
    expect(parsed.source.fetchedAt).toBe('2024-03-01T00:00:00.000Z');
    expect(parsed.settings.title).toBe(input.settings.title);
  });

  it('recomputes statistics and ignores forged totals, scenes, and secrets', () => {
    // Given
    const input = {
      ...snapshotFixture(),
      stats: { total: 1_000_000 },
      scene: '<script>bad()</script>',
      token: 'secret',
    };
    // When
    const snapshot = parseSnapshot(input);
    const data = snapshotToContributionData(snapshot);
    // Then
    expect(data.stats).toMatchObject({
      total: 12,
      activeDays: 2,
      longestStreak: 2,
      currentStreak: 2,
      fromDate: '2024-02-27',
      toDate: '2024-02-29',
    });
    expect(serializeSnapshot(snapshot)).not.toMatch(/secret|1_000_000|<script>/);
    expect(snapshot).not.toHaveProperty('stats');
  });

  it('creates a snapshot without trusting ContributionData statistics', () => {
    // Given
    const data = snapshotToContributionData(parseSnapshot(snapshotFixture()));
    data.stats.total = 999_999;
    // When
    const snapshot = createSnapshot(
      data,
      { normalization: { kind: 'relative' } },
      { kind: 'sample' },
    );
    // Then
    expect(snapshotToContributionData(snapshot).stats.total).toBe(12);
    expect(snapshot.settings.normalization).toEqual({ kind: 'relative' });
    expect(snapshot.source).toEqual({ kind: 'sample' });
  });

  it('keeps missing dates absent and breaks streaks across them', () => {
    // Given
    const input = {
      ...snapshotFixture(),
      weeks: [
        {
          firstDay: '2024-02-25',
          days: [
            { date: '2024-02-26', count: 1, level: 1 },
            { date: '2024-02-28', count: 1, level: 1 },
          ],
        },
      ],
    };
    // When
    const data = snapshotToContributionData(parseSnapshot(input));
    // Then
    expect(data.weeks.flatMap((week) => week.days)).toHaveLength(2);
    expect(data.stats.longestStreak).toBe(1);
  });

  it('roundtrips the earliest supported year with its previous-year Sunday label', () => {
    // Given
    const input = {
      ...snapshotFixture(),
      year: 1,
      weeks: [{ firstDay: '0001-01-01', days: [{ date: '0001-01-01', count: 1, level: 1 }] }],
    };
    // When
    const first = serializeSnapshot(parseSnapshot(input));
    const parsed = parseSnapshot(first);
    // Then
    expect(parsed.weeks[0].firstDay).toBe('0000-12-31');
    expect(serializeSnapshot(parsed)).toBe(first);
  });
});
