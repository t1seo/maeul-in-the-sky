import { describe, expect, it } from 'vitest';
import type { ContributionDay } from '../../../src/core/types.js';
import { normalizeContributionWeeks } from '../../../src/core/calendar.js';
import { contributionGrid, enrichGridCells100 } from '../../../src/themes/shared.js';
import { THH, THW, toIsoCells } from '../../../src/themes/terrain/blocks.js';
import { getTerrainPalette100 } from '../../../src/themes/terrain/palette.js';
import { createMockContributionData } from '../../fixtures/contribution-data.js';

const palette = getTerrainPalette100('dark');
const DAY_MS = 86_400_000;

function makeCalendarCells(dates: string[]) {
  const days: ContributionDay[] = dates.map((date, index) => ({
    date,
    count: index % 20,
    level: 1,
  }));
  const weeks = normalizeContributionWeeks([{ firstDay: '', days }]);
  const data = createMockContributionData({ weeks });
  return enrichGridCells100(
    contributionGrid(data, { cellSize: 17, gap: 3, offsetX: -31, offsetY: 12 }),
    data,
  );
}

function calendarDates(start: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    new Date(Date.parse(start) + index * DAY_MS).toISOString().slice(0, 10),
  );
}

describe('toIsoCells calendar positions', () => {
  it('keeps Wednesday in day 3 when the first calendar week is partial', () => {
    const days: ContributionDay[] = Array.from({ length: 11 }, (_, index) => ({
      date: `2025-01-${String(index + 1).padStart(2, '0')}`,
      count: index + 1,
      level: 1,
    }));
    const weeks = normalizeContributionWeeks([{ firstDay: '2025-01-01', days }]);
    const data = createMockContributionData({ weeks });
    const cells = enrichGridCells100(
      contributionGrid(data, { cellSize: 11, gap: 2, offsetX: 24, offsetY: 42 }),
      data,
    ).map((cell, index) => ({ ...cell, level100: index + 1 }));

    const result = toIsoCells(cells, palette, 405, 50);

    expect(
      result
        .slice()
        .sort((left, right) => left.level100 - right.level100)
        .map(({ week, day }) => [week, day]),
    ).toEqual([
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      [1, 6],
    ]);
  });

  it.each(
    [52, 53].flatMap((weekCount) =>
      Array.from({ length: 7 }, (_, startDay) => ({ weekCount, startDay })),
    ),
  )(
    'preserves all dates for $weekCount weeks starting on weekday $startDay',
    ({ weekCount, startDay }) => {
      const start = new Date(Date.UTC(2025, 0, 5 + startDay)).toISOString().slice(0, 10);
      const dates = calendarDates(start, weekCount * 7 - startDay - 2);
      const cells = makeCalendarCells(dates);

      const result = toIsoCells(cells, palette, 405, 50);

      expect(
        result.slice().sort((left, right) => (left.date ?? '').localeCompare(right.date ?? '')),
      ).toEqual(
        cells.map((cell, index) => {
          const week = Math.floor((index + startDay) / 7);
          const day = (index + startDay) % 7;
          return {
            date: cell.date,
            count: cell.count,
            absoluteWeek: Math.floor((Date.parse(cell.date) - Date.UTC(1970, 0, 4)) / (7 * DAY_MS)),
            week,
            day,
            level100: cell.level100,
            height: palette.getHeight(cell.level100),
            colors: palette.getElevation(cell.level100),
            isoX: 405 + (week - day) * THW,
            isoY: 50 + (week + day) * THH,
          };
        }),
      );
    },
  );

  it('leaves missing days and missing weeks empty when the dates have gaps', () => {
    const dates = ['2025-01-01', '2025-01-04', '2025-01-05', '2025-01-11', '2025-01-19'];
    const cells = makeCalendarCells(dates);

    const result = toIsoCells(cells, palette, 405, 50);

    expect(
      result
        .slice()
        .sort((left, right) => (left.date ?? '').localeCompare(right.date ?? ''))
        .map(({ date, week, day }) => ({ date, week, day })),
    ).toEqual([
      { date: '2025-01-01', week: 0, day: 3 },
      { date: '2025-01-04', week: 0, day: 6 },
      { date: '2025-01-05', week: 1, day: 0 },
      { date: '2025-01-11', week: 1, day: 6 },
      { date: '2025-01-19', week: 3, day: 0 },
    ]);
  });

  it('preserves calendar placement and drawing order when input cells are reversed', () => {
    const cells = makeCalendarCells(calendarDates('2025-01-01', 11));
    const expected = toIsoCells(cells, palette, 405, 50);

    const result = toIsoCells(cells.slice().reverse(), palette, 405, 50);

    expect(result).toEqual(expected);
  });

  it.each([52, 53])('preserves complete %i-week projections and palette values', (weekCount) => {
    const cells = makeCalendarCells(calendarDates('2024-12-29', weekCount * 7));
    const expected = cells
      .map((cell, index) => {
        const week = Math.floor(index / 7);
        const day = index % 7;
        return {
          date: cell.date,
          count: cell.count,
          absoluteWeek: Math.floor((Date.parse(cell.date) - Date.UTC(1970, 0, 4)) / (7 * DAY_MS)),
          week,
          day,
          level100: cell.level100,
          height: palette.getHeight(cell.level100),
          colors: palette.getElevation(cell.level100),
          isoX: 405 + (week - day) * THW,
          isoY: 50 + (week + day) * THH,
        };
      })
      .sort(
        (left, right) => left.week + left.day - right.week - right.day || left.week - right.week,
      );

    const result = toIsoCells(cells, palette, 405, 50);

    expect(result).toEqual(expected);
  });

  it('keeps leap day in place when a partial week crosses February into March', () => {
    const cells = makeCalendarCells(calendarDates('2024-02-28', 5));

    const result = toIsoCells(cells, palette, 405, 50);

    expect(result.map(({ date, week, day }) => ({ date, week, day }))).toEqual([
      { date: '2024-03-03', week: 1, day: 0 },
      { date: '2024-02-28', week: 0, day: 3 },
      { date: '2024-02-29', week: 0, day: 4 },
      { date: '2024-03-01', week: 0, day: 5 },
      { date: '2024-03-02', week: 0, day: 6 },
    ]);
  });

  it('returns no cells when the contribution calendar is empty', () => {
    const cells = makeCalendarCells([]);

    const result = toIsoCells(cells, palette, 405, 50);

    expect(result).toEqual([]);
  });

  it('preserves all 366 dates when leap year 2000 spans 54 Sunday-based weeks', () => {
    const dates = calendarDates('2000-01-01', 366);
    const cells = makeCalendarCells(dates);

    const result = toIsoCells(cells, palette, 405, 50);

    expect(
      result
        .slice()
        .sort((left, right) => (left.date ?? '').localeCompare(right.date ?? ''))
        .map(({ date, week, day }) => ({ date, week, day })),
    ).toEqual(
      dates.map((date, index) => ({
        date,
        week: Math.floor((index + 6) / 7),
        day: (index + 6) % 7,
      })),
    );
  });
});
