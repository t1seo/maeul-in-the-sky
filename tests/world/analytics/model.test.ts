import { expect, test } from 'vitest';
import { buildAnalytics } from '../../../src/world/analytics/model.js';
import { activity, records, snapshot } from './fixtures.js';

test('distinguishes an observed zero from a missing calendar date', () => {
  // Given sparse original observations, including a real zero.
  const source = snapshot(records);
  // When the full history is grouped by day.
  const result = buildAnalytics(source, '', 'day');
  // Then missing evidence remains null and coverage counts actual dates.
  expect(result.trend.map((point) => [point.from, point.total])).toEqual([
    ['2024-01-30', 2],
    ['2024-01-31', 0],
    ['2024-02-01', null],
    ['2024-02-02', 5],
  ]);
  expect(result.summary).toEqual({
    contributions: 7,
    activeDays: 2,
    observedDays: 3,
    missingDays: 1,
    longestStreak: 1,
    currentStreak: 1,
  });
  expect(result.monthlySums).toBeUndefined();
});

test('filters exact UTC calendar months while retaining partial-month evidence', () => {
  // Given observations and independently recorded monthly activity.
  const source = snapshot(records, activity);
  // When February is selected.
  const result = buildAnalytics(source, '2024-02', 'month');
  // Then January cannot contribute to either calendar or breakdown totals.
  expect(result.range).toEqual({ from: '2024-02-01', to: '2024-02-02' });
  expect(result.summary.contributions).toBe(5);
  expect(result.summary.missingDays).toBe(1);
  expect(result.breakdown.map((month) => month.activity)).toEqual([activity.months[1]]);
  expect(result.monthlySums).toEqual({ commits: 0, pullRequests: 4, months: 1 });
  expect(result.trend[0]).toMatchObject({ observedDays: 1, missingDays: 1, partial: true });
});

test('retains zero breakdown evidence and marks absent months unavailable', () => {
  // Given metadata for January only.
  const source = snapshot(records, { ...activity, months: [activity.months[0]] });
  // When February is selected.
  const result = buildAnalytics(source, '2024-02');
  // Then an absent month is never fabricated as zero.
  expect(result.monthlySums).toBeUndefined();
  expect(result.breakdown[0].activity).toBeUndefined();
  expect(buildAnalytics(source, '2024-01').monthlySums?.pullRequests).toBe(0);
});

test('uses Sunday weeks across a year boundary and leap-day UTC weekdays', () => {
  // Given a year boundary and the 2024 leap day.
  const source = snapshot([
    ['2023-12-31', 1],
    ['2024-01-01', 2],
    ['2024-02-29', 4],
  ]);
  // When the source is aggregated without local-time conversion.
  const result = buildAnalytics(source, '', 'week');
  // Then the first two dates share a Sunday week and leap day stays Thursday.
  expect(result.trend[0]).toMatchObject({ from: '2023-12-31', to: '2024-01-06', total: 3 });
  expect(result.weekdays.find((day) => day.label === 'Thursday')?.total).toBe(4);
  expect(result.weekdays.find((day) => day.label === 'Sunday')?.total).toBe(1);
});

test('keeps January identities separate across different years', () => {
  // Given two Januaries in a saved history.
  const source = snapshot([
    ['2024-01-01', 2],
    ['2025-01-01', 7],
  ]);
  // When only the later calendar month is selected.
  const result = buildAnalytics(source, '2025-01');
  // Then labels and sums retain the complete year-month identity.
  expect(result.months).toContain('2024-01');
  expect(result.months).toContain('2025-01');
  expect(result.summary.contributions).toBe(7);
  expect(result.range).toEqual({ from: '2025-01-01', to: '2025-01-01' });
});

test('represents empty histories and gap-only selected months without inventing observations', () => {
  // Given an empty legacy snapshot and another with a whole missing month.
  const empty = snapshot([]);
  const sparse = snapshot([
    ['2024-01-31', 0],
    ['2024-03-01', 0],
  ]);
  // When the requested ranges contain no observations.
  const results = [buildAnalytics(empty), buildAnalytics(sparse, '2024-02')];
  // Then unavailable totals are distinct from the observed endpoint zeros.
  expect(results[0].range).toBeUndefined();
  expect(results[0].summary.contributions).toBeNull();
  expect(results[1].summary).toMatchObject({
    contributions: null,
    observedDays: 0,
    missingDays: 29,
  });
  expect(results[1].trend.every((point) => point.total === null)).toBe(true);
  expect(buildAnalytics(sparse, '2024-01').summary.contributions).toBe(0);
});

test('sums monthly evidence exactly without claiming an upstream period total', () => {
  // Given validated monthly evidence with independently recorded category counts.
  const source = snapshot(records, activity);
  // When a monthly sum is requested.
  const result = buildAnalytics(source);
  // Then the sum and its number of contributing months remain explicit.
  expect(result.monthlySums).toEqual({ commits: 2, pullRequests: 4, months: 2 });
});

test('compresses long calendar gaps without allocating one entry per absent date', () => {
  // Given two observations at the supported calendar extremes.
  const source = snapshot([
    ['0001-01-01', 1],
    ['9999-12-31', 2],
  ]);
  // When day-level history is prepared.
  const result = buildAnalytics(source, '', 'day');
  // Then exact coverage survives in a bounded sparse representation.
  expect(result.trend).toHaveLength(3);
  expect(result.summary).toMatchObject({ observedDays: 2, missingDays: 3652057, contributions: 3 });
  expect(result.trend[1]).toMatchObject({ total: null, from: '0001-01-02', to: '9999-12-30' });
});
