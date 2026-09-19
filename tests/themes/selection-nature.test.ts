import { describe, expect, it } from 'vitest';
import { dailyPrimaryPool } from '../../src/themes/terrain/assets/progression-pool.js';
import { selectAssetPlacements } from '../../src/themes/terrain/assets/selection.js';
import { getAssetCatalogEntry } from '../../src/themes/terrain/assets/catalog.js';
import { isAssetType } from '../../src/themes/terrain/assets/catalog.js';
import { prepareTerrainScene } from '../../src/themes/terrain/scene/prepare.js';
import { calendarFixture } from './terrain/scene/fixtures.js';
import { compositionBiomes, isNaturalSelection, seasonCohort } from './selection-fixtures.js';

const seasons = [
  ['winter', 0],
  ['spring', 3],
  ['summer', 6],
  ['autumn', 9],
] as const;

describe('nature-led primary composition', () => {
  it.each([
    ['2025-01-01', 'winter', 'summer'],
    ['2025-04-01', 'spring', 'autumn'],
    ['2025-07-01', 'summer', 'winter'],
    ['2025-10-01', 'autumn', 'spring'],
  ] as const)(
    'keeps scene primary rewards in the calendar season throughout %s',
    (date, northSeason, southSeason) => {
      // Given one month spanning early and late season-transition zones.
      for (const hemisphere of ['north', 'south'] as const) {
        const season = hemisphere === 'north' ? northSeason : southSeason;
        for (const count of [1, 5, 10, 25, 50]) {
          const data = calendarFixture(date, 28, count);
          // When date-aware rewards are prepared through the real scene surface.
          const scene = prepareTerrainScene(data, { hemisphere });
          const primaries = scene.placements.filter((asset) => asset.primary);
          // Then no transitional color zone leaks another season's reward artwork.
          expect(primaries.length).toBeGreaterThan(0);
          for (const primary of primaries) {
            expect(isAssetType(primary.catalogId)).toBe(true);
            if (!isAssetType(primary.catalogId)) continue;
            expect(['all', season]).toContain(getAssetCatalogEntry(primary.catalogId).season);
            if (season === 'winter')
              expect(['lotusPond', 'wildflowerMeadow', 'pondLily', 'lily']).not.toContain(
                primary.catalogId,
              );
          }
        }
      }
    },
  );

  for (const [season, month] of seasons) {
    for (const [name, biome] of Object.entries(compositionBiomes)) {
      it.each(['classic', 'korean'] as const)(
        `keeps ${season} ${name} cohorts natural and diverse in %s culture at every tier`,
        (villageStyle) => {
          // Given uniform raw counts throughout a large fixed-season cohort.
          for (const count of [1, 5, 10, 25, 50]) {
            const cells = seasonCohort(month, count);
            const biomeMap = new Map(cells.map((cell) => [`${cell.week},${cell.day}`, biome]));
            // When each date receives its primary.
            const primaries = selectAssetPlacements(cells, 42, {
              hemisphere: 'north',
              villageStyle,
              biomeMap,
            }).filter((asset) => asset.id.endsWith(':0'));
            // Then nature dominates, focal objects are rare, and no silhouette dominates.
            const nature = primaries.filter((asset) => isNaturalSelection(asset.type));
            const tally = new Map<string, number>();
            for (const asset of primaries) tally.set(asset.type, (tally.get(asset.type) ?? 0) + 1);
            expect(primaries, `count=${count}`).toHaveLength(cells.length);
            expect(nature.length / primaries.length, `count=${count}`).toBeGreaterThanOrEqual(0.7);
            expect(
              (primaries.length - nature.length) / primaries.length,
              `count=${count}`,
            ).toBeLessThanOrEqual(0.2);
            expect(
              Math.max(...tally.values()) / primaries.length,
              `count=${count}`,
            ).toBeLessThanOrEqual(0.2);
            if ((biome.isPond || biome.isRiver) && count === 10)
              expect(new Set(nature.map((asset) => asset.type)).size).toBeGreaterThanOrEqual(6);
          }
        },
      );
    }
  }

  it.each(seasons)('fills all five %s water reward pools with seasonal nature', (season) => {
    // Given a real pond habitat at each daily reward tier.
    for (const tier of [1, 2, 3, 4, 5] as const) {
      // When its candidate pool is prepared.
      const pool = dailyPrimaryPool(tier, season, compositionBiomes.pond);
      // Then at least six distinct natural shapes remain, with no seasonal leakage.
      expect(new Set(pool.filter(isNaturalSelection)).size).toBeGreaterThanOrEqual(6);
      expect(
        pool.every((type) => ['all', season].includes(getAssetCatalogEntry(type).season)),
      ).toBe(true);
      expect(new Set(pool).size).toBe(pool.length);
    }
  });

  it('excludes flowering waterscapes and meadows from winter reward pools', () => {
    // Given every winter reward tier and habitat.
    const pools = ([1, 2, 3, 4, 5] as const).flatMap((tier) =>
      Object.values(compositionBiomes).map((biome) => dailyPrimaryPool(tier, 'winter', biome)),
    );
    // When all winter candidates are inspected.
    const candidates = new Set<string>(pools.flat());
    // Then evergreen and bare landscapes replace blooming meadow and lotus silhouettes.
    for (const type of ['lotusPond', 'wildflowerMeadow', 'pondLily', 'lily'])
      expect(candidates.has(type)).toBe(false);
  });

  it('reserves substantial groves and waterscapes for the highest reward tiers', () => {
    // Given explicit rich rewards, excluding single flowers, tiny fish and small grass patches.
    const richWater = new Set<string>([
      'lotusPond',
      'reedMarsh',
      'willowPond',
      'willow',
      'alpineRocks',
      'turtle',
      'frozenPond',
    ]);
    const richLand = new Set<string>([
      'cedarGrove',
      'ancientOak',
      'wildflowerMeadow',
      'bambooThicket',
      'alpineRocks',
      'orchard',
      'gardenTree',
      'snowPine',
      'snowDeciduous',
      'cherryBlossomFull',
      'peachBlossom',
      'autumnOak',
      'autumnGinkgo',
    ]);
    // When each season's upper-tier candidates are inspected.
    for (const [season] of seasons) {
      for (const tier of [4, 5] as const) {
        const water = dailyPrimaryPool(tier, season, compositionBiomes.pond).filter(
          isNaturalSelection,
        );
        const land = dailyPrimaryPool(5, season, compositionBiomes.land).filter(isNaturalSelection);
        // Then every water candidate and every top-tier land candidate has a substantial shape.
        expect(water.every((type) => richWater.has(type))).toBe(true);
        expect(land.every((type) => richLand.has(type))).toBe(true);
        expect(water.length).toBeGreaterThanOrEqual(6);
        expect(land.length).toBeGreaterThanOrEqual(6);
      }
    }
  });
});
