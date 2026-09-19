import { describe, expect, it } from 'vitest';
import { prepareTerrainScene, renderTerrainScene } from '../../../../src/themes/terrain/index.js';
import { terrainMetadata } from '../../../../src/themes/terrain/scene/metadata.js';
import { describeDay } from '../../../../src/demo/day-details.js';
import { calendarFixture, sceneOptions } from './fixtures.js';

describe('bounded consistency effect groups', () => {
  it.each([
    ['2025-01-01', 'winterFrost'],
    ['2025-04-01', 'springPetals'],
    ['2025-07-01', 'summerFireflies'],
    ['2025-10-01', 'autumnLeaves'],
    ['2025-03-10', 'springPetals'],
    ['2025-06-15', 'summerFireflies'],
    ['2025-09-15', 'autumnLeaves'],
    ['2025-12-01', 'winterFrost'],
  ])('uses dated seasonal effects at %s', (start, kind) => {
    // Given: a month of positive activity entirely in a peak season.
    const data = calendarFixture(start, 28, 1);
    // When: preparing the scene and its public metadata.
    const scene = prepareTerrainScene(data, sceneOptions);
    const metadata = terrainMetadata(scene);
    // Then: at most ten dated groups match that season and the positive source date.
    expect(scene.consistencyEffects).toHaveLength(10);
    for (const effect of scene.consistencyEffects ?? []) {
      expect(effect.kind).toBe(kind);
      const cell = scene.cells.find((cell) => cell.date === effect.anchorDate);
      expect(cell?.count).toBeGreaterThan(0);
      expect(cell?.consistency?.tier).toBe(effect.tier);
      expect(
        metadata.cells.find((cell) => cell.date === effect.anchorDate)?.consistencyEffectIds,
      ).toContain(effect.id);
    }
    expect(metadata.consistencyEffects).toEqual(scene.consistencyEffects);
  });

  it('follows hemisphere without changing the active-day counts', () => {
    // Given: the same December calendar in both hemispheres.
    const data = calendarFixture('2025-12-01', 25, 1);
    // When: preparing both hemisphere settings.
    const north = prepareTerrainScene(data, { ...sceneOptions, hemisphere: 'north' });
    const south = prepareTerrainScene(data, { ...sceneOptions, hemisphere: 'south' });
    // Then: frost becomes fireflies while consistency remains unchanged.
    expect(north.consistencyEffects?.map((effect) => effect.kind)).toEqual(
      Array(10).fill('winterFrost'),
    );
    expect(south.consistencyEffects?.map((effect) => effect.kind)).toEqual(
      Array(10).fill('summerFireflies'),
    );
    expect(south.cells.map((cell) => cell.consistency)).toEqual(
      north.cells.map((cell) => cell.consistency),
    );
  });

  it.each([
    [0, 0],
    [60, 0],
    [4, 1],
  ] as const)('creates no rewards for length %i and count %i', (length, count) => {
    // Given: an empty, inactive, or below-threshold calendar.
    const data = calendarFixture('2025-12-01', length, count);
    // When: preparing the calendar.
    const scene = prepareTerrainScene(data, sceneOptions);
    // Then: no consistency shapes or motion are fabricated.
    expect(scene.consistencyEffects).toEqual([]);
    expect(renderTerrainScene(scene, 'light')).not.toContain('data-consistency-id');
  });

  it('is deterministic for reversed input and independent of density and motion', () => {
    // Given: a complete calendar and the same dates in reverse order.
    const data = calendarFixture('2025-01-01', 365, 1);
    const reversed = {
      ...data,
      weeks: [...data.weeks].reverse().map((week) => ({ ...week, days: [...week.days].reverse() })),
    };
    const first = prepareTerrainScene(data, { ...sceneOptions, density: 1 });
    // When: changing presentation settings without changing supplied dates.
    const second = prepareTerrainScene(reversed, {
      ...sceneOptions,
      density: 10,
      motion: 'full',
      artStyle: 'pixel',
    });
    // Then: the ten groups remain identical serializable scene data.
    expect(first.consistencyEffects).toHaveLength(10);
    expect(second.consistencyEffects).toEqual(first.consistencyEffects);
    expect(JSON.parse(JSON.stringify(second))).toEqual(second);
  });

  it.each(['off', 'subtle', 'full'] as const)(
    'retains static rewards in %s and replaces town sparkles',
    (motion) => {
      // Given: a high normalized calendar previously eligible for town sparkles.
      const scene = prepareTerrainScene(calendarFixture('2025-03-10', 25, 1), {
        ...sceneOptions,
        normalization: { kind: 'fixed', maxCount: 1 },
      });
      // When: rendering a chosen motion policy.
      const svg = renderTerrainScene(scene, 'light', { motion });
      // Then: the reward shape exists in every branch and only full adds its gentle animation.
      expect(svg.match(/data-consistency-id=/g)).toHaveLength(motion === 'off' ? 10 : 20);
      const groups = Array.from(
        svg.matchAll(/<g\b[^>]*data-consistency-id="[^"]+"[^>]*>/g),
        (match) => match[0],
      );
      for (const effect of scene.consistencyEffects ?? []) {
        expect(
          groups.find((group) => group.includes(`data-consistency-id="${effect.id}"`)),
        ).toContain(`data-anchor-date="${effect.anchorDate}"`);
      }
      expect(svg).not.toMatch(/town-sparkle|--sparkle-/);
      expect(svg.includes('data-consistency-motion')).toBe(motion === 'full');
      expect(svg).not.toMatch(/<filter|<script|<image|url\(https?:/);
      if (motion === 'off') expect(svg).not.toMatch(/@keyframes|animation\s*:|<animate/);
    },
  );

  it.each([1, 2] as const)(
    'keeps layout %i prepared scenes renderable with legacy sparkles',
    (layoutVersion) => {
      // Given: a prepared scene with the fields shipped before consistency rewards.
      const current = prepareTerrainScene(calendarFixture('2025-03-10', 25, 1), {
        ...sceneOptions,
        normalization: { kind: 'fixed', maxCount: 1 },
      });
      const { consistencyEffects: _effects, ...legacy } = current;
      const scene = {
        ...legacy,
        layoutVersion,
        cells: legacy.cells.map(({ consistency: _consistency, ...cell }) => cell),
      };
      // When: the current renderer consumes the old prepared representation.
      const svg = renderTerrainScene(scene, 'light', { motion: 'full' });
      // Then: legacy overlays still render without adding fabricated consistency data.
      expect(svg).toContain('town-sparkle');
      expect(svg).not.toContain('data-consistency-id');
      expect(terrainMetadata(scene).cells.every((cell) => cell.consistency === undefined)).toBe(
        true,
      );
    },
  );

  it('explains activity and observed history for an inspected day', () => {
    // Given: only twelve supplied positive dates are present in the 28-day window.
    const scene = prepareTerrainScene(calendarFixture('2025-03-10', 12, 1), sceneOptions);
    const metadata = terrainMetadata(scene);
    const cell = metadata.cells.find((cell) => cell.date === scene.toDate);
    expect(cell).toBeDefined();
    if (!cell) return;
    // When: the demo describes the selected day.
    const detail = describeDay(cell, metadata);
    // Then: both the earned tier and incomplete supplied history are visible.
    expect(detail).toContain('Consistency 2/3');
    expect(detail).toContain('12 active days in trailing 28 days');
    expect(detail).toContain('12 supplied');
  });
});
