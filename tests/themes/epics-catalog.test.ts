import { describe, expect, it } from 'vitest';
import * as epics from '../../src/themes/terrain/epics.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import type { IsoCell } from '../../src/themes/terrain/blocks.js';

const palette = getTerrainPalette100('dark');
const stats = {
  total: 2000,
  longestStreak: 60,
  currentStreak: 30,
  activeDays: 364,
  mostActiveDay: 'Monday',
  busiestMonth: '2025-01',
  fromDate: '2025-01-01',
  toDate: '2025-12-31',
};
const cells: IsoCell[] = Array.from({ length: 364 }, (_, i) => ({
  date: new Date(Date.UTC(2025, 0, 5 + i)).toISOString().slice(0, 10),
  week: Math.floor(i / 7),
  day: i % 7,
  level100: 99,
  height: 10,
  isoX: i,
  isoY: i / 2,
  colors: palette.getElevation(99),
}));

describe('Wonder catalog and placement metadata', () => {
  it('separates 30 Wonders into their actual tiers', () => {
    expect(epics.EPIC_CATALOG_COUNTS).toEqual({ total: 30, rare: 14, epic: 10, legendary: 6 });
    expect(epics.EPIC_CATALOG.map((entry) => entry.id).sort()).toEqual(
      epics.EPIC_BUILDINGS.map((entry) => entry.type).sort(),
    );
  });
  it('preserves Wonder identity when input order reverses', () => {
    expect(epics.selectEpicBuildings([...cells].reverse(), 42, stats).placed).toEqual(
      epics.selectEpicBuildings(cells, 42, stats).placed,
    );
  });
  it('includes source dates and matching catalog IDs in actual rendered discoveries', () => {
    const placed = epics.selectEpicBuildings(cells, 42, stats).placed;
    const svg = epics.renderEpicBuildings(placed, [palette]);
    expect(placed.length).toBeGreaterThan(0);
    for (const discovery of placed) {
      expect(discovery.date).toBe(
        cells.find((cell) => cell.week === discovery.week && cell.day === discovery.day)?.date,
      );
      expect(svg).toContain(`data-catalog-id="${discovery.type}"`);
      expect(svg).toContain(`data-date="${discovery.date}"`);
    }
  });
});
