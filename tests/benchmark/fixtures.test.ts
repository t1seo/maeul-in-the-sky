import { describe, expect, it } from 'vitest';
import { benchmarkFixtures, improvementFixtures } from '../../scripts/qa/fixtures.js';

const days = (data: ReturnType<typeof improvementFixtures>[string]) =>
  data.weeks.flatMap((week) => week.days);

describe('frozen QA fixtures', () => {
  it('preserves the measured research inputs when requested repeatedly', () => {
    const fixtures = benchmarkFixtures();
    expect(fixtures.map(({ name, data }) => [name, data.stats.total])).toEqual([
      ['empty', 0],
      ['mixed', 803],
      ['full', 7280],
    ]);
    for (const { data } of fixtures) {
      expect(data.username).toBe('benchmark');
      expect(days(data)).toHaveLength(364);
      expect(data.stats.fromDate).toBe('2024-12-29');
      expect(data.stats.toDate).toBe('2025-12-27');
    }
    expect(benchmarkFixtures()).toEqual(fixtures);
  });

  it('covers all partial start weekdays without fabricating preceding days', () => {
    const fixtures = improvementFixtures();
    for (let weekday = 0; weekday < 7; weekday++) {
      const data = fixtures[`partial-weekday-${weekday}`];
      expect(data).toBeDefined();
      expect(new Date(`${days(data)[0].date}T00:00:00Z`).getUTCDay()).toBe(weekday);
      expect(days(data)).toHaveLength(11);
    }
    expect(days(fixtures['partial-2025'])[0].date).toBe('2025-01-01');
  });

  it('includes leap day and both single-day boundary weeks in year 2000', () => {
    const data = improvementFixtures()['leap-2000'];
    expect(data.weeks).toHaveLength(54);
    expect(days(data)).toHaveLength(366);
    expect(days(data).some((day) => day.date === '2000-02-29')).toBe(true);
    expect(data.weeks[0].days.map((day) => day.date)).toEqual(['2000-01-01']);
    expect(data.weeks.at(-1)?.days.map((day) => day.date)).toEqual(['2000-12-31']);
  });

  it('distinguishes absent dates, known zeroes and a completely missing week', () => {
    const data = improvementFixtures()['gaps-2025'];
    const dates = days(data).map((day) => day.date);
    expect(dates).not.toContain('2025-01-08');
    expect(dates.some((date) => date >= '2025-01-12' && date <= '2025-01-18')).toBe(false);
    expect(days(data).find((day) => day.date === '2025-01-09')?.count).toBe(0);
    expect(data.weeks.find((week) => week.firstDay === '2025-01-12')?.days).toEqual([]);
  });
});
