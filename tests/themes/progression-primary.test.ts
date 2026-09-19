import { describe, expect, it } from 'vitest';
import { selectAssetPlacements } from '../../src/themes/terrain/assets/selection.js';
import { ASSET_CATALOG, getAssetCatalogEntry } from '../../src/themes/terrain/assets/catalog.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import type { IsoCell } from '../../src/themes/terrain/blocks.js';
import type { BiomeContext } from '../../src/themes/terrain/biomes.js';
import { dailyPrimaryPool } from '../../src/themes/terrain/assets/progression-pool.js';
import { getDailyRewardTier } from '../../src/themes/terrain/assets/progression.js';
import { isNaturalSelection } from './selection-fixtures.js';

const palette = getTerrainPalette100('light');
const cell: IsoCell = {
  date: '2025-07-06',
  week: 0,
  day: 0,
  count: 1,
  level100: 0,
  height: 2,
  isoX: 0,
  isoY: 0,
  colors: palette.getElevation(0),
};
const land: BiomeContext = { isPond: false, isRiver: false, nearWater: false, forestDensity: 0 };
const biomes = [land, { ...land, forestDensity: 1 }, { ...land, isRiver: true }];

describe('guaranteed primary asset families', () => {
  it.each(['classic', 'korean'] as const)(
    'preserves a primary at every tier, density and normalized level in %s',
    (villageStyle) => {
      for (const biome of biomes) {
        for (const count of [1, 5, 10, 25, 50, 100]) {
          const identities = new Set<string>();
          for (const density of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
            for (const level100 of [0, 1, 20, 65, 99]) {
              const assets = selectAssetPlacements([{ ...cell, count, level100 }], 42, {
                villageStyle,
                density,
                hemisphere: 'north',
                biomeMap: new Map([['0,0', biome]]),
              });
              const primary = assets.find((asset) => asset.id === 'asset:2025-07-06:0');
              expect(primary).toBeDefined();
              identities.add(
                JSON.stringify([primary?.catalogId, primary?.variant, primary?.ox, primary?.oy]),
              );
              const tier = getDailyRewardTier(count);
              if (tier !== 0)
                expect(dailyPrimaryPool(tier, 'summer', biome, villageStyle)).toContain(
                  primary?.type,
                );
            }
          }
          expect(identities.size).toBe(1);
        }
      }
    },
  );

  it('retains rare Korean homes among substantial high-tier natural landscapes', () => {
    const chains = Array.from({ length: 400 }, (_, seed) =>
      [10, 25, 50].map(
        (count) =>
          selectAssetPlacements([{ ...cell, count }], seed, {
            villageStyle: 'korean',
            hemisphere: 'north',
            biomeMap: new Map([['0,0', land]]),
          })[0].type,
      ),
    );
    const top = chains.map((chain) => chain[2]);
    expect(top.filter(isNaturalSelection).length).toBeGreaterThanOrEqual(280);
    expect(new Set(top.filter(isNaturalSelection)).size).toBeGreaterThanOrEqual(6);
    expect(new Set(top.filter((type) => !isNaturalSelection(type))).size).toBeGreaterThanOrEqual(3);
    expect(top).toContain('hanokEstate');
    expect(chains.some((chain) => chain[0] === 'choga')).toBe(true);
    expect(chains.some((chain) => chain[1] === 'hanok')).toBe(true);
  });

  it('retains distinctive seasonal primaries without lowering the reward stage', () => {
    const dates = ['2025-12-15', '2025-03-15', '2025-07-15', '2025-10-15'];
    const seasonal = dates.map(
      (date) =>
        new Set(
          Array.from(
            { length: 100 },
            (_, seed) =>
              getAssetCatalogEntry(
                selectAssetPlacements([{ ...cell, date, count: 5 }], seed, {
                  hemisphere: 'north',
                  biomeMap: new Map([['0,0', land]]),
                })[0].type,
              ).season,
          ),
        ),
    );
    for (const [index, season] of (['winter', 'spring', 'summer', 'autumn'] as const).entries())
      expect(seasonal[index].has(season)).toBe(true);
  });

  it('changes decoration while preserving primary variants', () => {
    const cells = Array.from({ length: 120 }, (_, index) => ({
      ...cell,
      date: new Date(Date.UTC(2025, 2, index + 1)).toISOString().slice(0, 10),
      week: Math.floor(index / 7),
      day: index % 7,
      count: 1,
      level100: 65,
    }));
    const low = selectAssetPlacements(cells, 42, { density: 1, hemisphere: 'north' });
    const high = selectAssetPlacements(cells, 42, { density: 10, hemisphere: 'north' });
    const primary = (assets: typeof low) =>
      assets
        .filter((asset) => asset.id.endsWith(':0'))
        .map(({ id, type, variant, ox, oy }) => ({ id, type, variant, ox, oy }));
    expect(primary(high)).toEqual(primary(low));
    expect(high.filter((asset) => asset.id.endsWith(':1'))).not.toEqual(
      low.filter((asset) => asset.id.endsWith(':1')),
    );
  });

  it('keeps the entire catalog reachable through daily rewards and absent-count legacy selection', () => {
    const seen = new Set<string>();
    const dates = ['2025-12-15', '2025-03-15', '2025-07-15', '2025-10-15'];
    const candidates = dates.flatMap((date, day) =>
      [undefined, 1, 5, 10, 25, 50].flatMap((count, stage) =>
        [12, 26, 40, 58, 70, 85, 99].map((level100, index) => ({
          ...cell,
          date,
          day,
          week: stage * 7 + index,
          count,
          level100,
        })),
      ),
    );
    const contexts = [...biomes, { ...land, isPond: true }, { ...land, nearWater: true }];
    for (let seed = 0; seed < 100 && seen.size < ASSET_CATALOG.length; seed++) {
      for (const villageStyle of ['classic', 'korean'] as const) {
        for (const biome of contexts) {
          const biomeMap = new Map(candidates.map((item) => [`${item.week},${item.day}`, biome]));
          for (const asset of selectAssetPlacements(candidates, seed, {
            villageStyle,
            biomeMap,
            hemisphere: 'north',
          })) {
            seen.add(asset.type);
          }
        }
      }
    }
    expect(ASSET_CATALOG.map((entry) => entry.id).filter((id) => !seen.has(id))).toEqual([]);
  });
});
