import { afterEach, describe, expect, it, vi } from 'vitest';
import { prepareTerrainScene } from '../../../../src/themes/terrain/scene/prepare.js';
import { terrainMetadata } from '../../../../src/themes/terrain/scene/metadata.js';
import { calendarFixture, sceneOptions } from './fixtures.js';

afterEach(() => vi.useRealTimers());

describe('supplied activity in the trailing 28 UTC days', () => {
  it.each([
    [4, 0],
    [5, 1],
    [11, 1],
    [12, 2],
    [19, 2],
    [20, 3],
    [28, 3],
    [40, 3],
  ] as const)('assigns %i active days to tier %i', (length, tier) => {
    // Given: consecutive supplied positive dates, including windows longer than 28 days.
    const data = calendarFixture('2024-02-01', length, 1);
    const date = data.weeks.flatMap((week) => week.days).at(-1)?.date;
    // When: preparing both the scene and its public metadata.
    const scene = prepareTerrainScene(data, sceneOptions);
    const metadata = terrainMetadata(scene);
    // Then: thresholds use actual activity and never count more than 28 calendar days.
    const consistency = {
      activeDays: Math.min(length, 28),
      observedDays: Math.min(length, 28),
      tier,
    };
    expect(scene.cells.find((cell) => cell.date === date)).toMatchObject({ consistency });
    expect(metadata.cells.find((cell) => cell.date === date)).toMatchObject({ consistency });
  });

  it('includes current-minus-27 through today across leap day, without filling gaps', () => {
    // Given: February 1 and 2 are outside the March 1 window; February 5 is supplied zero.
    const data = calendarFixture('2024-02-01', 30, 1);
    const supplied = new Set([
      '2024-02-01',
      '2024-02-02',
      '2024-02-03',
      '2024-02-04',
      '2024-02-05',
      '2024-02-28',
      '2024-02-29',
      '2024-03-01',
    ]);
    const weeks = data.weeks.map((week) => ({
      ...week,
      days: week.days
        .filter((day) => supplied.has(day.date))
        .map((day) => ({ ...day, count: day.date === '2024-02-05' ? 0 : 1 })),
    }));
    // When: evaluating the real sparse calendar.
    const scene = prepareTerrainScene({ ...data, weeks }, sceneOptions);
    // Then: only five positive and six observed dates count in the inclusive window.
    expect(scene.cells.find((cell) => cell.date === '2024-03-01')).toMatchObject({
      consistency: { activeDays: 5, observedDays: 6, tier: 1 },
    });
    expect(scene.cells).toHaveLength(supplied.size);
  });

  it('distinguishes equal totals spread over different numbers of dates', () => {
    // Given: both calendars have 28 contributions and the same 28 observed dates.
    const regular = calendarFixture('2025-06-01', 28, 1);
    const concentrated = {
      ...regular,
      weeks: regular.weeks.map((week) => ({
        ...week,
        days: week.days.map((day) => ({ ...day, count: day.date === '2025-06-28' ? 28 : 0 })),
      })),
    };
    // When: the same renderer prepares both calendars.
    const scenes = [regular, concentrated].map((data) => prepareTerrainScene(data, sceneOptions));
    // Then: contribution magnitude cannot replace sustained activity.
    expect(scenes.map((scene) => scene.stats.total)).toEqual([28, 28]);
    expect(scenes[0].cells.find((cell) => cell.date === '2025-06-28')).toMatchObject({
      consistency: { activeDays: 28, observedDays: 28, tier: 3 },
    });
    expect(scenes[1].cells.find((cell) => cell.date === '2025-06-28')).toMatchObject({
      consistency: { activeDays: 1, observedDays: 28, tier: 0 },
    });
  });

  it('does not reward a zero date even after sustained activity', () => {
    // Given: the last supplied date is inactive after 27 active days.
    const data = calendarFixture('2025-06-01', 28, 1);
    const weeks = data.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => ({ ...day, count: day.date === '2025-06-28' ? 0 : 1 })),
    }));
    // When: preparing that calendar.
    const scene = prepareTerrainScene({ ...data, weeks }, sceneOptions);
    // Then: history is reported honestly but the inactive date earns no tier.
    expect(scene.cells.find((cell) => cell.date === '2025-06-28')).toMatchObject({
      consistency: { activeDays: 27, observedDays: 28, tier: 0 },
    });
    expect(scene.consistencyEffects).not.toContainEqual(
      expect.objectContaining({ anchorDate: '2025-06-28' }),
    );
  });

  it('keeps consistency independent of contribution magnitude and normalized height', () => {
    // Given: the same activity dates with different counts and normalization scales.
    const settings = [
      { kind: 'fixed', maxCount: 1 },
      { kind: 'fixed', maxCount: 1000 },
      { kind: 'relative' },
    ] as const;
    // When: preparing all count and height combinations.
    const scenes = [1, 100].flatMap((count) =>
      settings.map((normalization) =>
        prepareTerrainScene(calendarFixture('2025-07-01', 28, count), {
          ...sceneOptions,
          normalization,
        }),
      ),
    );
    // Then: every date reports the same activity count and consistency tier.
    const expected = scenes[0].cells.map(({ date, consistency }) => ({ date, consistency }));
    for (const scene of scenes)
      expect(scene.cells.map(({ date, consistency }) => ({ date, consistency }))).toEqual(expected);
  });

  it.each(['0001-01-01', '2024-02-01', '9999-11-01'])(
    'uses supplied dates without a clock at %s',
    (start) => {
      // Given: a dated calendar spanning a complete trailing window.
      const data = calendarFixture(start, 35, 1);
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2000-01-01T00:00:00Z'));
      const first = prepareTerrainScene(data, sceneOptions);
      // When: the host clock changes by a century.
      vi.setSystemTime(new Date('2100-01-01T00:00:00Z'));
      const second = prepareTerrainScene(data, sceneOptions);
      // Then: the complete prepared data, including consistency, remains identical.
      expect(second).toEqual(first);
      expect(second.cells.find((cell) => cell.date === second.toDate)).toMatchObject({
        consistency: { activeDays: 28, observedDays: 28, tier: 3 },
      });
    },
  );

  it('retains ordinary primary identities when earlier dates change activity', () => {
    // Given: the final positive date is unchanged, while earlier supplied days become inactive.
    const active = calendarFixture('2025-04-01', 20, 1);
    const sparse = {
      ...active,
      weeks: active.weeks.map((week) => ({
        ...week,
        days: week.days.map((day) => ({ ...day, count: day.date === '2025-04-20' ? 1 : 0 })),
      })),
    };
    // When: preparing both calendars with the same fixed normalization.
    const scenes = [active, sparse].map((data) => prepareTerrainScene(data, sceneOptions));
    // Then: consistency changes without changing that date's primary identity.
    const identities = scenes.map((scene) =>
      scene.placements
        .filter((placement) => placement.primary && placement.anchorDate === '2025-04-20')
        .map(({ id, catalogId, variant }) => ({ id, catalogId, variant })),
    );
    expect(identities[0]).toHaveLength(1);
    expect(identities[1]).toEqual(identities[0]);
    expect(scenes[0].cells.find((cell) => cell.date === '2025-04-20')).toMatchObject({
      consistency: { tier: 3 },
    });
    expect(scenes[1].cells.find((cell) => cell.date === '2025-04-20')).toMatchObject({
      consistency: { tier: 0 },
    });
  });
});
