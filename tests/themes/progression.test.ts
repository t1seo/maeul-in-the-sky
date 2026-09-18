import { describe, expect, it } from 'vitest';
import { prepareTerrainScene } from '../../src/themes/terrain/scene/prepare.js';
import { terrainMetadata } from '../../src/themes/terrain/scene/metadata.js';
import { calendarFixture } from './terrain/scene/fixtures.js';
import { selectAssetPlacements } from '../../src/themes/terrain/assets/selection.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import type { IsoCell } from '../../src/themes/terrain/blocks.js';

const boundaries = [
  [0, 0],
  [1, 1],
  [4, 1],
  [5, 2],
  [9, 2],
  [10, 3],
  [24, 3],
  [25, 4],
  [49, 4],
  [50, 5],
  [100, 5],
] as const;

describe('absolute daily contribution rewards', () => {
  it.each(boundaries)(
    'assigns count %i to reward tier %i even after fixed-scale saturation',
    (count, tier) => {
      // Given
      const data = calendarFixture('2025-07-06', 1, count);
      // When
      const scene = prepareTerrainScene(data, { normalization: { kind: 'fixed', maxCount: 20 } });
      const metadata = terrainMetadata(scene);
      // Then
      expect(metadata.cells[0].rewardTier).toBe(tier);
      expect(scene.cells[0].rewardTier).toBe(tier);
      expect(scene.rewards?.length).toBe(tier === 0 ? 0 : 1);
      expect(scene.layoutVersion).toBe(2);
      expect(metadata.layoutVersion).toBe(2);
      expect(scene.seed.policy).toBe('username-date-v2');
      if (count >= 20) expect(scene.cells[0].level100).toBe(99);
      if (count === 0) expect(scene.cells[0].level100).toBe(0);
    },
  );

  it.each(['classic', 'korean'] as const)(
    'guarantees a tier-five primary on an isolated peak in %s culture at every density',
    (style) => {
      // Given
      const data = calendarFixture('2025-07-06', 14, 0);
      const weeks = data.weeks.map((week) => ({
        ...week,
        days: week.days.map((day) => ({
          ...day,
          count: day.date === '2025-07-10' ? 100 : 0,
        })),
      }));
      // When
      const scenes = Array.from({ length: 10 }, (_, index) =>
        prepareTerrainScene(
          { ...data, weeks },
          {
            style,
            density: index + 1,
            normalization: { kind: 'fixed', maxCount: 20 },
          },
        ),
      );
      // Then
      const primaryIds = scenes.map((scene) => {
        const primary = scene.placements.filter((placement) => placement.primary);
        expect(primary).toHaveLength(1);
        expect(primary[0]).toMatchObject({ anchorDate: '2025-07-10', rewardTier: 5 });
        expect(scene.rewards).toHaveLength(1);
        expect(scene.wonders).toHaveLength(0);
        return [primary[0].id, primary[0].catalogId, primary[0].variant];
      });
      expect(
        primaryIds.every((identity) => JSON.stringify(identity) === JSON.stringify(primaryIds[0])),
      ).toBe(true);
    },
  );

  it('preserves legacy absent-count selection while treating explicit zero as inactive', () => {
    // Given
    const palette = getTerrainPalette100('light');
    const cells: IsoCell[] = Array.from({ length: 70 }, (_, index) => ({
      week: Math.floor(index / 7),
      day: index % 7,
      level100: 99,
      height: 10,
      isoX: index,
      isoY: 0,
      colors: palette.getElevation(99),
    }));
    // When
    const legacy = selectAssetPlacements(cells, 42);
    const zero = selectAssetPlacements(
      cells.map((cell) => ({ ...cell, count: 0 })),
      42,
      { density: 10 },
    );
    // Then
    expect(legacy.length).toBeGreaterThan(0);
    expect(
      zero.every((asset) =>
        ['rock', 'boulder', 'stump', 'deadTree', 'puddle'].includes(asset.type),
      ),
    ).toBe(true);
  });
});
