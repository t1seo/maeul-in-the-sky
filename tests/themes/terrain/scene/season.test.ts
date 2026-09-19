import { describe, expect, it } from 'vitest';
import {
  datePeakSeason,
  dateSeasonPosition,
  dateSeasonZone,
} from '../../../../src/themes/terrain/scene/season.js';

describe('absolute date seasons across the supported year range', () => {
  it.each(['0001', '0004', '0099', '0100', '2025', '9999'])(
    'keeps winter, summer and the December reset aligned in year %s',
    (year) => {
      // Given a validated calendar year, including years before 100.
      const dates = [`${year}-01-01`, `${year}-07-01`, `${year}-12-01`];

      // When seasons are derived from each absolute date.
      const north = dates.map((date) => dateSeasonPosition(date, 'north'));
      const south = dates.map((date) => dateSeasonPosition(date, 'south'));

      // Then the same calendar dates retain their seasonal positions and hemisphere shift.
      expect(north).toEqual([4, 30, 0]);
      expect(south).toEqual([30, 4, 26]);
      expect(dateSeasonZone(`${year}-07-01`, 'north')).toBe(4);
    },
  );

  it('keeps the empty-calendar fallback independent of the clock', () => {
    expect(dateSeasonPosition('', 'north')).toBe(0);
    expect(dateSeasonPosition('', 'south')).toBe(26);
  });
});

describe('calendar peak seasons for dated rewards', () => {
  it.each([
    ['01', 'winter', 'summer'],
    ['02', 'winter', 'summer'],
    ['03', 'spring', 'autumn'],
    ['04', 'spring', 'autumn'],
    ['05', 'spring', 'autumn'],
    ['06', 'summer', 'winter'],
    ['07', 'summer', 'winter'],
    ['08', 'summer', 'winter'],
    ['09', 'autumn', 'spring'],
    ['10', 'autumn', 'spring'],
    ['11', 'autumn', 'spring'],
    ['12', 'winter', 'summer'],
  ])('uses month %s without promoting an early transition', (month, north, south) => {
    // Given: an absolute mid-month date, including existing palette transition zones.
    const date = `2025-${month}-15`;
    // When: identifying its calendar season in both hemispheres.
    const seasons = [datePeakSeason(date, 'north'), datePeakSeason(date, 'south')];
    // Then: hemisphere shifts six months while transitions do not advance the season.
    expect(seasons).toEqual([north, south]);
  });

  it.each([
    ['2024-02-29', 'winter'],
    ['2024-03-01', 'spring'],
    ['2025-05-31', 'spring'],
    ['2025-06-01', 'summer'],
    ['2025-08-31', 'summer'],
    ['2025-09-01', 'autumn'],
    ['2025-11-30', 'autumn'],
    ['2025-12-01', 'winter'],
    ['0001-01-01', 'winter'],
    ['0004-02-29', 'winter'],
    ['9999-12-31', 'winter'],
  ])('honors UTC month boundaries at %s', (date, season) => {
    // Given: a valid leap day, season boundary, or supported extreme year.
    // When: deriving the season from the supplied date.
    const actual = datePeakSeason(date, 'north');
    // Then: neither the current clock nor host timezone shifts the calendar month.
    expect(actual).toBe(season);
  });

  it('uses deterministic winter and summer fallbacks for empty calendars', () => {
    // Given: no supplied date exists.
    // When: resolving both hemispheres without consulting the clock.
    const seasons = [datePeakSeason('', 'north'), datePeakSeason('', 'south')];
    // Then: fallbacks agree with the existing December-based scene convention.
    expect(seasons).toEqual(['winter', 'summer']);
  });
});
