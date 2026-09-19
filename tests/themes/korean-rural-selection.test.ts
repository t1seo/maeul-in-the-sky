import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import {
  ASSET_CATALOG,
  ASSET_CATALOG_COUNTS,
  getAssetCatalogEntry,
  selectAssetPlacements,
} from '../../src/themes/terrain/assets.js';
import { applyVillageStyle } from '../../src/themes/terrain/assets/style-pool.js';
import { getLevelPool100 } from '../../src/themes/terrain/assets/level-pool.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import type { IsoCell } from '../../src/themes/terrain/blocks.js';

const added = [
  'choga',
  'jangseung',
  'sotdae',
  'riceTerrace',
  'koreanWatermill',
  'hanokGate',
  'kimchiGarden',
  'stoneBridge',
  'hanokEstate',
] as const;
const palette = getTerrainPalette100('dark');
const cells: IsoCell[] = Array.from({ length: 700 }, (_, index) => ({
  date: new Date(Date.UTC(2024, 0, 7 + index)).toISOString().slice(0, 10),
  count: 1 + (index % 80),
  level100: 1 + (index % 99),
  week: Math.floor(index / 7),
  day: index % 7,
  height: 6,
  isoX: 0,
  isoY: 0,
  colors: palette.getElevation(index % 100),
}));

describe('Korean rural catalog and cultural selection', () => {
  it('registers exactly nine additional original Korean IDs', () => {
    // Given the complete registry, when counted by culture, then all original IDs remain.
    expect(ASSET_CATALOG_COUNTS).toEqual({ total: 210, classic: 197, korean: 13 });
    expect(new Set(ASSET_CATALOG.map(({ id }) => id)).size).toBe(210);
    const original = z
      .record(z.string(), z.array(z.string()))
      .parse(
        JSON.parse(
          readFileSync(new URL('./assets-classic-fixtures.json', import.meta.url), 'utf8'),
        ),
      );
    expect(
      ASSET_CATALOG.filter(({ style }) => style === 'classic')
        .map(({ id }) => id)
        .sort(),
    ).toEqual(Object.keys(original).sort());
    for (const id of added) {
      const entry = ASSET_CATALOG.find((entry) => entry.id === id);
      expect(entry, id).toMatchObject({ style: 'korean', season: 'all' });
      expect(entry?.description.length, id).toBeGreaterThan(40);
    }
    expect(
      ASSET_CATALOG.filter(({ style }) => style === 'korean')
        .slice(0, 4)
        .map(({ id, bounds }) => ({ id, bounds })),
    ).toEqual([
      { id: 'hanok', bounds: { x: -10, y: -15, width: 20, height: 19 } },
      { id: 'pavilion', bounds: { x: -9, y: -15, width: 18, height: 19 } },
      { id: 'stoneWall', bounds: { x: -9, y: -8, width: 18, height: 15 } },
      { id: 'onggi', bounds: { x: -7, y: -8, width: 14, height: 12 } },
    ]);
  });

  it('retains cottage, house and estate hierarchy without injecting lower-tier props', () => {
    // Given a settlement-only reward pool, when Korean styling is applied, then its tier survives.
    const pool = {
      types: ['hut', 'house', 'inn', 'castle', 'cathedral', 'manor'] as const,
      chance: 0.6,
    };
    expect(applyVillageStyle(pool, 'korean')).toEqual({
      types: ['choga', 'hanok', 'hanokEstate', 'hanokEstate', 'hanokEstate', 'hanokEstate'],
      chance: 0.6,
    });
    expect(applyVillageStyle({ types: ['castle'], chance: 1 }, 'korean').types).toEqual([
      'hanokEstate',
    ]);
  });

  it('maps rural functions to appropriate cultural objects', () => {
    // Given recognizable rural roles, when culturally mapped, then their purpose stays readable.
    expect(
      applyVillageStyle(
        {
          types: [
            'ricePaddy',
            'watermill',
            'gatehouse',
            'gardenBed',
            'bridge',
            'statue',
            'signpost',
            'fence',
            'barrel',
          ],
          chance: 1,
        },
        'korean',
      ).types,
    ).toEqual([
      'riceTerrace',
      'koreanWatermill',
      'hanokGate',
      'kimchiGarden',
      'stoneBridge',
      'jangseung',
      'sotdae',
      'stoneWall',
      'onggi',
    ]);
  });

  it('preserves every classic pool and excludes Western landmark buildings from Korean pools', () => {
    // Given the existing level pools, when the style changes, then classic remains untouched.
    const western = [
      'castle',
      'cathedral',
      'manor',
      'church',
      'churchWinter',
      'clocktower',
      'tower',
      'gatehouse',
      'inn',
      'windmill',
    ];
    for (let level = 0; level < 100; level++) {
      const pool = getLevelPool100(level);
      expect(applyVillageStyle(pool, 'classic')).toBe(pool);
      expect(applyVillageStyle(pool, 'korean').types.filter((id) => western.includes(id))).toEqual(
        [],
      );
    }
  });

  it('reaches all thirteen cultural entries through ordinary selection without classic leakage', () => {
    // Given real date-positioned cells across levels, when seeded selection runs, then new art is reachable.
    const selected = new Set<string>();
    for (let seed = 0; seed < 12; seed++) {
      for (const item of selectAssetPlacements(cells, seed, {
        villageStyle: 'korean',
        hemisphere: 'north',
      }))
        selected.add(item.type);
      expect(
        selectAssetPlacements(cells, seed, { villageStyle: 'classic' }).every(
          ({ type }) => getAssetCatalogEntry(type).style === 'classic',
        ),
      ).toBe(true);
    }
    for (const id of ['hanok', 'pavilion', 'stoneWall', 'onggi', ...added])
      expect(selected.has(id), id).toBe(true);
  });

  it('keeps explicitly zero days barren under Korean styling and maximum density', () => {
    // Given contradictory zero-count/high-level cells, when styled, then no cultural settlement is fabricated.
    const barren = cells.map((cell) => ({ ...cell, count: 0, level100: 99 }));
    const placed = selectAssetPlacements(barren, 42, {
      villageStyle: 'korean',
      hemisphere: 'north',
      density: 10,
    });
    expect(
      placed.every(({ type }) => ['rock', 'boulder', 'stump', 'deadTree', 'puddle'].includes(type)),
    ).toBe(true);
  });
});
