import { describe, expect, it } from 'vitest';
import { selectEpicBuildings } from '../../src/themes/terrain/epics/selection.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import type { IsoCell } from '../../src/themes/terrain/blocks.js';
import type { ContributionStats } from '../../src/core/types.js';

const stats: ContributionStats = {
  total: 2000,
  longestStreak: 60,
  currentStreak: 0,
  activeDays: 100,
  mostActiveDay: 'Monday',
  busiestMonth: '2025-01',
  fromDate: '2025-01-01',
  toDate: '2025-12-31',
};

function isolatedCandidate(level: number, count = 100): IsoCell[] {
  const palette = getTerrainPalette100('light');
  return Array.from({ length: 9 }, (_, index) => ({
    week: Math.floor(index / 3),
    day: index % 3,
    date: index === 4 ? '2025-01-13' : `2025-01-0${index + 1}`,
    // Inactive neighbors provide a controlled richness fixture, but cannot win a draw.
    count: index === 4 ? count : 0,
    level100: index === 4 ? level : 99,
    height: 10,
    isoX: index,
    isoY: 0,
    colors: palette.getElevation(99),
  }));
}

describe('independent Wonder tier draws', () => {
  it('retains an eligible rare success when newly eligible higher tiers fail', () => {
    // Given: seed 55 draws rare < .027, epic > .012 and legendary > .0045.
    // When
    const rareOnly = selectEpicBuildings(isolatedCandidate(92), 55, stats);
    const allTiers = selectEpicBuildings(isolatedCandidate(99), 55, stats);
    // Then
    expect(rareOnly.placed).toHaveLength(1);
    expect(allTiers.placed).toEqual(rareOnly.placed);
    expect(allTiers.placed[0]).toMatchObject({ date: '2025-01-13', tier: 'rare' });
  });

  it('keeps zero and water cells ineligible despite a successful draw', () => {
    // Given
    const biomes = new Map([
      ['1,1', { isRiver: true, isPond: false, nearWater: true, forestDensity: 0 }],
    ]);
    // When / Then
    expect(selectEpicBuildings(isolatedCandidate(99, 0), 55, stats).placed).toHaveLength(0);
    expect(selectEpicBuildings(isolatedCandidate(99), 55, stats, biomes).placed).toHaveLength(0);
  });
});
