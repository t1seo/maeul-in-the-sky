import type { ContributionData, ContributionDay, ContributionWeek } from '../../src/core/types.js';
import { computeStats } from '../../src/core/stats.js';
import {
  createEmptyContributionData,
  createFullContributionData,
  createMockContributionData,
} from '../../tests/fixtures/contribution-data.js';

const DAY_MS = 86_400_000;
export const BENCHMARK_OPTIONS = {
  title: '@benchmark',
  width: 840,
  height: 240,
  density: 5,
  hemisphere: 'north',
} as const;

/** Fresh data per call; the seed-42 generator is frozen in the historical capture. */
export function benchmarkFixtures() {
  return [
    { name: 'empty', data: { ...createEmptyContributionData(), username: 'benchmark' } },
    { name: 'mixed', data: { ...createMockContributionData(), username: 'benchmark' } },
    { name: 'full', data: { ...createFullContributionData(), username: 'benchmark' } },
  ] as const;
}

function rangeData(from: string, to: string, count: (index: number) => number): ContributionData {
  const grouped = new Map<string, ContributionWeek>();
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  for (let ms = start, index = 0; ms <= end; ms += DAY_MS, index++) {
    const date = new Date(ms);
    const firstDay = new Date(ms - date.getUTCDay() * DAY_MS).toISOString().slice(0, 10);
    const value = count(index);
    const level: ContributionDay['level'] =
      value === 0 ? 0 : value < 4 ? 1 : value < 8 ? 2 : value < 13 ? 3 : 4;
    const day = { date: date.toISOString().slice(0, 10), count: value, level };
    const week = grouped.get(firstDay);
    if (week) week.days.push(day);
    else grouped.set(firstDay, { firstDay, days: [day] });
  }
  const weeks = [...grouped.values()];
  return { username: 'benchmark', year: Number(to.slice(0, 4)), weeks, stats: computeStats(weeks) };
}

export function improvementFixtures(): Record<string, ContributionData> {
  const fixtures: Record<string, ContributionData> = Object.fromEntries(
    benchmarkFixtures().map(({ name, data }) => [`${name}-2025`, data]),
  );
  fixtures['partial-2025'] = rangeData('2025-01-01', '2025-01-11', (index) => index % 5);
  for (let weekday = 0; weekday < 7; weekday++) {
    const start = Date.UTC(2025, 0, 5 + weekday);
    fixtures[`partial-weekday-${weekday}`] = rangeData(
      new Date(start).toISOString().slice(0, 10),
      new Date(start + 10 * DAY_MS).toISOString().slice(0, 10),
      (index) => index % 5,
    );
  }
  fixtures['leap-2000'] = rangeData('2000-01-01', '2000-12-31', () => 20);
  fixtures['sparse-2025'] = rangeData('2025-01-01', '2025-12-31', (index) =>
    index % 61 === 0 ? 1 : 0,
  );
  fixtures['full-2024'] = rangeData('2024-01-01', '2024-12-31', () => 20);
  fixtures['year-2025'] = rangeData('2025-01-01', '2025-12-31', () => 20);
  fixtures['wonders-2025'] = rangeData('2025-01-01', '2025-12-31', (index) =>
    index % 9 === 0 ? 12 : 80,
  );
  fixtures['no-days-2025'] = {
    username: 'benchmark',
    year: 2025,
    weeks: [],
    stats: computeStats([]),
  };
  const gaps = rangeData('2025-01-01', '2025-01-31', (index) => index % 4);
  gaps.weeks = gaps.weeks.map((week) => ({
    ...week,
    days: week.days.filter(
      ({ date }) => date !== '2025-01-08' && !(date >= '2025-01-12' && date <= '2025-01-18'),
    ),
  }));
  gaps.stats = computeStats(gaps.weeks);
  fixtures['gaps-2025'] = gaps;
  return fixtures;
}

export const FIXTURE_SETTINGS = {
  preset: 'balanced',
  density: 5,
  title: '@benchmark',
  hemisphere: 'north',
  motion: 'full',
  layout: 'banner',
  style: 'classic',
  normalization: { kind: 'relative' },
} as const satisfies import('../../src/core/render-options.js').ResolvedRenderSettings;

export function fixtureSnapshot(
  data: ContributionData,
  settings: import('../../src/core/render-options.js').ResolvedRenderSettings = FIXTURE_SETTINGS,
): import('../../src/core/snapshot-types.js').SnapshotV1 {
  return {
    schemaVersion: 1,
    kind: 'maeul-snapshot',
    username: data.username,
    year: data.year,
    weeks: data.weeks.map((week) => ({
      firstDay: week.firstDay,
      days: week.days.map((day) => ({ ...day })),
    })),
    settings: structuredClone(settings),
    source: { kind: 'sample' },
  };
}
