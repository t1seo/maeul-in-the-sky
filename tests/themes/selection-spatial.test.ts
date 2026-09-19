import { describe, expect, it } from 'vitest';
import { dailyPrimaryPool } from '../../src/themes/terrain/assets/progression-pool.js';
import { selectAssetPlacements } from '../../src/themes/terrain/assets/selection.js';
import {
  primaryFocalSite,
  spatialPrimaryType,
} from '../../src/themes/terrain/assets/primary-spatial.js';
import { compositionBiomes, isNaturalSelection, selectionCell } from './selection-fixtures.js';

const cells = Array.from({ length: 364 }, (_, index) =>
  selectionCell(new Date(Date.UTC(2025, 0, index + 1)).toISOString().slice(0, 10)),
);

describe('absolute-date composition fields', () => {
  it.each([0, 1, 42, 333])('keeps focal sites rare but reachable with seed %i', (seed) => {
    // Given a complete calendar of virtual sites.
    // When focal eligibility is ranked without contribution data.
    const focal = cells.filter((cell) => primaryFocalSite(cell, seed));
    // Then architecture remains reachable and cannot dominate.
    expect(focal.length / cells.length).toBeGreaterThan(0.05);
    expect(focal.length / cells.length).toBeLessThanOrEqual(0.2);
  });

  it('separates neighboring eligible focal sites, including virtual unsupplied sites', () => {
    // Given eligibility for a full absolute calendar.
    const focal = new Set(
      cells.filter((cell) => primaryFocalSite(cell, 42)).map((cell) => `${cell.week},${cell.day}`),
    );
    // When the eight immediate neighbors of each site are inspected.
    const conflicts = cells
      .filter((cell) => focal.has(`${cell.week},${cell.day}`))
      .flatMap((cell) =>
        [-1, 0, 1].flatMap((w) =>
          [-1, 0, 1].flatMap((d) =>
            w === 0 && d === 0 ? [] : [focal.has(`${cell.week + w},${cell.day + d}`)],
          ),
        ),
      );
    // Then eligible structures do not touch each other.
    expect(conflicts).not.toContain(true);
  });

  it.each([6, 8, 12])('separates orthogonal neighbors within the same %i-type pool', (size) => {
    // Given one pool with a common season, habitat and tier.
    const pool = dailyPrimaryPool(1, 'summer', compositionBiomes.land)
      .filter(isNaturalSelection)
      .slice(0, size);
    // When spatial candidate selection is evaluated independently for each date.
    const types = new Map(
      cells.map((cell) => [
        `${cell.week},${cell.day}`,
        spatialPrimaryType(pool, cell, cell.date ?? '', 42),
      ]),
    );
    // Then identical primaries cannot be orthogonal neighbors in this uniform pool.
    const conflicts = cells.flatMap((cell) =>
      [
        [1, 0],
        [0, 1],
      ].map(
        ([w, d]) =>
          types.get(`${cell.week},${cell.day}`) === types.get(`${cell.week + w},${cell.day + d}`),
      ),
    );
    expect(conflicts).not.toContain(true);
  });

  it.each(['classic', 'korean'] as const)(
    'deduplicates mapped %s primary IDs before selection',
    (style) => {
      // Given every tier, season and habitat with potentially many-to-one cultural mappings.
      const pools = ([1, 2, 3, 4, 5] as const).flatMap((tier) => {
        return (['winter', 'spring', 'summer', 'autumn'] as const).flatMap((season) =>
          Object.values(compositionBiomes).map((biome) =>
            dailyPrimaryPool(tier, season, biome, style),
          ),
        );
      });
      // When every candidate ID is counted.
      const duplicates = pools.map((pool) => pool.length - new Set(pool).size);
      // Then each cultural silhouette has one slot.
      expect(duplicates.every((count) => count === 0)).toBe(true);
    },
  );

  it.each(['north', undefined] as const)(
    'preserves the primary when range, order and counts change with hemisphere %s',
    (hemisphere) => {
      // Given a fixed date within a full calendar.
      const anchor = selectionCell('2025-07-06', 50);
      const options = { hemisphere, villageStyle: 'korean' } as const;
      const identity = (items: ReturnType<typeof selectAssetPlacements>) =>
        items
          .filter((asset) => asset.date === anchor.date && asset.id.endsWith(':0'))
          .map(({ id, type, variant }) => ({ id, type, variant }));
      // When neighboring counts, order and range-relative coordinates change.
      const full = selectAssetPlacements(
        cells.map((cell) => (cell.date === anchor.date ? anchor : cell)),
        42,
        options,
      );
      const shifted = selectAssetPlacements(
        [...cells].reverse().map((cell) => ({
          ...cell,
          count: cell.date === anchor.date ? 50 : 1000,
          week: cell.week - 200,
        })),
        42,
        options,
      );
      const isolated = selectAssetPlacements([{ ...anchor, week: 0, day: 0 }], 42, options);
      // Then the guaranteed primary keeps the same identity and geometry variant.
      expect(identity(full)).toHaveLength(1);
      expect(identity(shifted)).toEqual(identity(full));
      expect(identity(isolated)).toEqual(identity(full));
    },
  );

  it('does not make focal eligibility depend on the raw reward tier', () => {
    // Given a fixed complete calendar and every positive contribution threshold.
    // When only each date's own raw count changes.
    const sites = [1, 5, 10, 25, 50].map((count) =>
      cells.filter((cell) => primaryFocalSite({ ...cell, count }, 42)).map((cell) => cell.date),
    );
    // Then all tiers share the same rare eligible sites.
    expect(sites.every((site) => JSON.stringify(site) === JSON.stringify(sites[0]))).toBe(true);
  });
});
