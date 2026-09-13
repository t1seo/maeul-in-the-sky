import { describe, expect, it } from 'vitest';
import { dateSeasonPosition, dateSeasonZone } from '../../../../src/themes/terrain/scene/season.js';

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
