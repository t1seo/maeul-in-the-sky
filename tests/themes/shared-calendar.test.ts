import { describe, expect, it } from 'vitest';
import { contributionGrid, enrichGridCells100 } from '../../src/themes/shared.js';
import { computeStats } from '../../src/core/stats.js';

const weeks = [
  {
    firstDay: '2025-01-01',
    days: [
      { date: '2025-01-01', count: 4, level: 1 as const },
      { date: '2025-01-20', count: 16, level: 2 as const },
    ],
  },
];
const data = { weeks, stats: computeStats(weeks), year: 2025, username: 'calendar' };

describe('shared calendar integration', () => {
  it('retains missing calendar weeks when positioning supplied dates', () => {
    // Given two supplied dates separated by empty weeks.
    // When constructing the contribution grid.
    const cells = contributionGrid(data, { cellSize: 10, gap: 2, offsetX: 0, offsetY: 0 });
    // Then no date is invented and Monday remains in week three.
    expect(cells).toHaveLength(2);
    expect(cells[1]).toMatchObject({ week: 3, day: 1, x: 36, y: 12 });
  });

  it('uses an explicit fixed scale when enriching counts', () => {
    // Given a fixed comparison scale.
    const cells = contributionGrid(data, { cellSize: 1, gap: 0, offsetX: 0, offsetY: 0 });
    // When enriching on that shared scale.
    const enriched = enrichGridCells100(cells, data, { kind: 'fixed', maxCount: 64 });
    // Then equal input counts are mapped against 64, not local P90.
    expect(enriched.map((cell) => cell.level100)).toEqual([26, 50]);
  });
});
