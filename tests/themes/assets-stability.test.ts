import { describe, expect, it } from 'vitest';
import type { IsoCell } from '../../src/themes/terrain/blocks.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import * as assets from '../../src/themes/terrain/assets.js';

const palette = getTerrainPalette100('dark');
const cells: IsoCell[] = Array.from({ length: 70 }, (_, i) => ({
  date: new Date(Date.UTC(2025, 0, 5 + i)).toISOString().slice(0, 10),
  week: Math.floor(i / 7),
  day: i % 7,
  level100: 90,
  height: 10,
  isoX: i,
  isoY: i / 2,
  colors: palette.getElevation(90),
}));

function identities(placed: ReturnType<typeof assets.selectAssets>) {
  return placed
    .map(({ cell, type, variant, ox, oy }) => ({ date: cell.date, type, variant, ox, oy }))
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

describe('date-stable asset selection', () => {
  it('preserves type and variant when input traversal reverses', () => {
    const before = assets.selectAssets(cells, 42);
    const after = assets.selectAssets([...cells].reverse(), 42);
    expect(identities(after)).toEqual(identities(before));
  });

  it('preserves existing dates when an earlier week leaves the range', () => {
    const remaining = cells
      .slice(7)
      .map((cell) => ({ ...cell, week: cell.week - 1, isoX: cell.isoX - 8 }));
    const before = assets.selectAssets(cells, 42).filter(({ cell }) => cell.week > 0);
    const after = assets.selectAssets(remaining, 42);
    expect(identities(after)).toEqual(identities(before));
  });

  it('keeps zero activity days free of buildings at maximum density', () => {
    const empty = cells.map((cell) => ({ ...cell, level100: 0 }));
    const placed = assets.selectAssets(empty, 42, undefined, undefined, 0, 10);
    const buildings = new Set([
      'house',
      'houseWinter',
      'barn',
      'church',
      'igloo',
      'hanok',
      'pavilion',
    ]);
    expect(placed.filter((asset) => buildings.has(asset.type))).toEqual([]);
  });
});
