import { describe, expect, it } from 'vitest';
import { selectAssetPlacements } from '../../src/themes/terrain/assets/selection.js';
import { getAssetCatalogEntry } from '../../src/themes/terrain/assets/catalog.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import type { IsoCell } from '../../src/themes/terrain/blocks.js';
import { prepareTerrainScene } from '../../src/themes/terrain/scene/prepare.js';
import { snapshotToContributionData } from '../../src/core/settings/parse.js';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { isAssetType } from '../../src/themes/terrain/assets/catalog.js';
import { isNaturalSelection } from './selection-fixtures.js';

const cells: IsoCell[] = Array.from({ length: 364 }, (_, index) => ({
  date: new Date(Date.UTC(2025, 0, index + 1)).toISOString().slice(0, 10),
  week: Math.floor(index / 7),
  day: index % 7,
  count: 20,
  level100: 99,
  height: 10,
  isoX: 0,
  isoY: 0,
  colors: getTerrainPalette100('light').getElevation(99),
}));

describe('readable daily reward compositions', () => {
  it('keeps the real demo nature-led with at most eight sailboat primaries', () => {
    // Given the reproducible demo calendar and published rendering settings.
    const data = snapshotToContributionData(sampleSnapshot());
    // When the complete scene is prepared through the public terrain surface.
    const scene = prepareTerrainScene(data, { style: 'classic', density: 6, motion: 'off' });
    // Then the previous 26 repeated sailboats are replaced by varied natural rewards.
    const primaries = scene.placements.filter((asset) => asset.primary);
    const nature = primaries.filter(
      (asset) => isAssetType(asset.catalogId) && isNaturalSelection(asset.catalogId),
    );
    const activeDates = data.weeks
      .flatMap((week) => week.days)
      .filter((day) => day.count > 0)
      .map((day) => day.date)
      .sort();
    const rewardedDates = [...primaries, ...scene.wonders].map((asset) => asset.anchorDate).sort();
    expect(rewardedDates).toEqual(activeDates);
    expect(primaries.filter((asset) => asset.catalogId === 'sailboat').length).toBeLessThanOrEqual(
      8,
    );
    expect(nature.length / primaries.length).toBeGreaterThanOrEqual(0.7);
    expect(new Set(nature.map((asset) => asset.catalogId)).size).toBeGreaterThan(30);
  });

  it.each(['classic', 'korean'] as const)('keeps tier-three %s scenery varied', (villageStyle) => {
    const assets = selectAssetPlacements(cells, 42, {
      villageStyle,
      density: 10,
      hemisphere: 'north',
    });
    const primaries = assets.filter((asset) => asset.id.endsWith(':0'));
    expect(primaries).toHaveLength(cells.length);
    expect(new Set(primaries.map((asset) => asset.type)).size).toBeGreaterThan(10);
  });

  it.each(['classic', 'korean'] as const)(
    'keeps bounded %s secondaries separate from their primary',
    (villageStyle) => {
      const staged = cells.map((cell, index) => ({
        ...cell,
        count: [1, 5, 10, 25, 50][index % 5],
      }));
      const assets = selectAssetPlacements(staged, 42, {
        villageStyle,
        density: 10,
        hemisphere: 'north',
      });
      const primaries = assets.filter((asset) => asset.id.endsWith(':0'));
      const byDate = new Map(
        primaries.map((asset) => [asset.date, getAssetCatalogEntry(asset.type).bounds]),
      );
      const secondaries = assets.filter((asset) => asset.id.endsWith(':1'));
      expect(secondaries.length).toBeGreaterThan(0);
      for (const asset of secondaries) {
        const bounds = getAssetCatalogEntry(asset.type).bounds;
        const primary = byDate.get(asset.date);
        expect(primary).toBeDefined();
        if (!primary) continue;
        const x = asset.ox + bounds.x;
        const y = asset.oy + bounds.y;
        expect(bounds.width).toBeLessThanOrEqual(6);
        expect(bounds.height).toBeLessThanOrEqual(7);
        expect(
          x + bounds.width <= primary.x ||
            x >= primary.x + primary.width ||
            y + bounds.height <= primary.y ||
            y >= primary.y + primary.height,
        ).toBe(true);
        expect(x).toBeGreaterThanOrEqual(-8);
        expect(x + bounds.width).toBeLessThanOrEqual(8);
      }
    },
  );
});
