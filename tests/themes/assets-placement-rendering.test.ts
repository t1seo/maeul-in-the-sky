import { describe, expect, it } from 'vitest';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import { withMotionContext } from '../../src/core/animation.js';
import {
  selectAssetPlacements,
  renderAssetPlacements,
  renderCatalogAsset,
  getAssetCatalogEntry,
  dateSeasonWeek,
} from '../../src/themes/terrain/assets.js';
import type { IsoCell } from '../../src/themes/terrain/blocks.js';

const palette = getTerrainPalette100('dark');
const cells: IsoCell[] = Array.from({ length: 364 }, (_, i) => ({
  date: new Date(Date.UTC(2025, 0, 5 + i)).toISOString().slice(0, 10),
  count: 20,
  week: Math.floor(i / 7),
  day: i % 7,
  level100: 90,
  height: 10,
  isoX: Math.floor(i / 7) * 8,
  isoY: (i % 7) * 3.5,
  colors: palette.getElevation(90),
}));

describe('shared scene asset contract', () => {
  it('keeps explicit zero counts barren even when a hand-built cell has a high level', () => {
    const zeroCounts = cells.map((cell) => ({ ...cell, count: 0 }));
    const placed = selectAssetPlacements(zeroCounts, 42, {
      villageStyle: 'korean',
      hemisphere: 'north',
      density: 10,
    });
    expect(
      placed.every((item) =>
        ['rock', 'boulder', 'stump', 'deadTree', 'puddle'].includes(item.type),
      ),
    ).toBe(true);
  });
  it('renders the same selected IDs, types, variants and anchors with either mode palette', () => {
    const placed = selectAssetPlacements(cells, 42, { villageStyle: 'korean' });
    const dark = renderAssetPlacements(placed, palette);
    const light = renderAssetPlacements(placed, getTerrainPalette100('light'));
    for (const item of placed) {
      expect(dark).toContain(
        `data-asset-id="${item.id}" data-catalog-id="${item.type}" data-date="${item.date}"`,
      );
      expect(light).toContain(
        `data-asset-id="${item.id}" data-catalog-id="${item.type}" data-date="${item.date}"`,
      );
      const expected = withMotionContext(
        { mode: item.animated ? 'full' : 'off', namespace: '' },
        () => renderCatalogAsset(item.type, palette.assets, item.variant),
      );
      expect(dark).toContain(
        expected.replace('translate(0,0)', `translate(${item.cx + item.ox},${item.cy + item.oy})`),
      );
    }
  });
  it('keeps the four original Korean assets reachable across settlement levels while classic stays the default', () => {
    const settlementCells = cells.map((cell, index) => ({
      ...cell,
      level100: [70, 80, 90][index % 3],
      count: [1, 5, 10, 25, 50][index % 5],
    }));
    const korean = new Set(
      Array.from({ length: 10 }, (_, seed) =>
        selectAssetPlacements(settlementCells, seed, { villageStyle: 'korean' }).map(
          (item) => item.type,
        ),
      ).flat(),
    );
    expect(
      (['hanok', 'pavilion', 'stoneWall', 'onggi'] as const).filter((type) => !korean.has(type)),
    ).toEqual([]);
    expect(
      selectAssetPlacements(cells, 42).every(
        (item) => getAssetCatalogEntry(item.type).style === 'classic',
      ),
    ).toBe(true);
  });
  it('preserves seasonal identities when the year-crossing window shifts', () => {
    const before = selectAssetPlacements(cells, 42, {
      hemisphere: 'north',
      villageStyle: 'korean',
    });
    const after = selectAssetPlacements(
      cells.slice(7).map((cell) => ({ ...cell, week: cell.week - 1 })),
      42,
      { hemisphere: 'north', villageStyle: 'korean' },
    );
    const identity = (items: typeof before) =>
      items
        .map(({ id, type, variant, ox, oy }) => ({ id, type, variant, ox, oy }))
        .sort((a, b) => a.id.localeCompare(b.id));
    expect(identity(after)).toEqual(identity(before.filter((item) => item.cell.week > 0)));
    expect(dateSeasonWeek('2025-01-01', 'south')).toBe(
      (dateSeasonWeek('2025-01-01', 'north') + 26) % 52,
    );
  });
  it('does not perturb other dates when one cell is excluded or changes intensity', () => {
    const before = selectAssetPlacements(cells, 42);
    const after = selectAssetPlacements(
      cells.map((cell, i) => (i === 20 ? { ...cell, level100: 0, count: 0 } : cell)),
      42,
      { excludeCells: new Set(['1,0']) },
    );
    const relevant = (items: typeof before) =>
      items
        .filter((item) => item.date !== cells[20].date && item.date !== cells[7].date)
        .map(({ id, type, variant, ox, oy }) => ({ id, type, variant, ox, oy }))
        .sort((a, b) => a.id.localeCompare(b.id));
    expect(relevant(after)).toEqual(relevant(before));
  });
  it('retains geometry under motion budgets and suppresses all motion in off mode', () => {
    const waterCells = cells.map((cell) => ({ ...cell, count: 50 }));
    const biomeMap = new Map(
      waterCells.map((cell) => [
        `${cell.week},${cell.day}`,
        { isRiver: true, isPond: false, nearWater: true, forestDensity: 0 },
      ]),
    );
    const placed = selectAssetPlacements(waterCells, 42, { biomeMap });
    const full = renderAssetPlacements(placed, palette);
    const off = withMotionContext({ mode: 'off', namespace: 'test' }, () =>
      renderAssetPlacements(placed, palette),
    );
    expect(placed.filter((item) => item.animated).length).toBeLessThanOrEqual(33);
    expect(
      placed.some(
        (item) =>
          !item.animated &&
          /<animate/.test(renderCatalogAsset(item.type, palette.assets, item.variant)),
      ),
    ).toBe(true);
    expect(full).toContain('<animate');
    expect(off).not.toMatch(/<animate|class="sway/);
    expect((off.match(/data-asset-id=/g) ?? []).length).toBe(placed.length);
  });
});
