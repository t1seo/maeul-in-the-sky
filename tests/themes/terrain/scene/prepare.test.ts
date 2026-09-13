import { afterEach, describe, expect, it, vi } from 'vitest';
import * as terrain from '../../../../src/themes/terrain/index.js';
import { calendarFixture, sceneOptions } from './fixtures.js';

afterEach(() => vi.useRealTimers());

describe('prepared terrain scene', () => {
  it('exports a pure scene preparation API', () => {
    expect(typeof terrain.prepareTerrainScene).toBe('function');
  });

  it('contains only serializable mode-free data', () => {
    const scene = terrain.prepareTerrainScene(calendarFixture(), sceneOptions);
    expect(JSON.parse(JSON.stringify(scene))).toStrictEqual(scene);
    expect(JSON.stringify(scene)).not.toMatch(/"colors"|"top"|"left"|"right"|<svg|#[0-9a-f]{6}/i);
    expect(scene.cells).toHaveLength(120);
  });

  it('retains layout identities when year, title and username case change', () => {
    const data = calendarFixture();
    const first = terrain.prepareTerrainScene(data, sceneOptions);
    const second = terrain.prepareTerrainScene(
      { ...data, year: 2026, username: 'SCENE-TEST' },
      { ...sceneOptions, title: 'A different title' },
    );
    expect(second.seed).toEqual(first.seed);
    expect(second.cells).toEqual(first.cells);
    expect(second.biomes).toEqual(first.biomes);
    expect(second.placements).toEqual(first.placements);
    expect(second.wonders).toEqual(first.wonders);
  });

  it('preserves fixed-scale geometry and ordinary identities for interior overlapping dates', () => {
    const first = terrain.prepareTerrainScene(calendarFixture('2025-01-05', 140), sceneOptions);
    const next = terrain.prepareTerrainScene(calendarFixture('2025-01-12', 140), sceneOptions);
    for (const cell of next.cells.filter(
      (cell) => cell.date >= '2025-02-01' && cell.date < '2025-05-01',
    )) {
      const previous = first.cells.find((item) => item.date === cell.date);
      expect(previous).toMatchObject({
        count: cell.count,
        level100: cell.level100,
        height: cell.height,
        absoluteWeek: cell.absoluteWeek,
        day: cell.day,
      });
      expect(previous?.isoX).toBe(cell.isoX + 8);
      expect(previous?.isoY).toBe(cell.isoY + 3.5);
      expect(
        next.placements
          .filter((item) => item.anchorDate === cell.date)
          .map((item) => [item.id, item.catalogId, item.variant]),
      ).toEqual(
        first.placements
          .filter((item) => item.anchorDate === cell.date)
          .map((item) => [item.id, item.catalogId, item.variant]),
      );
    }
  });

  it('recomputes truth from supplied dates while preserving absent dates', () => {
    const data = calendarFixture('2025-01-01', 4, 2);
    const weeks = data.weeks.map((week) => ({
      ...week,
      days: week.days.filter((day) => day.date !== '2025-01-02'),
    }));
    const result = terrain.renderTerrain(
      { ...data, weeks, stats: { ...data.stats, total: 9999 } },
      sceneOptions,
    );
    expect(result.metadata.dataDayCount).toBe(3);
    expect(result.metadata.missingDayCount).toBe(1);
    expect(result.metadata.stats.total).toBe(6);
    expect(result.metadata.cells.map((cell) => cell.date)).not.toContain('2025-01-02');
  });

  it('never consults the clock when the calendar is empty', () => {
    const data = calendarFixture('2025-01-01', 0);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    const first = terrain.renderTerrain(data, sceneOptions);
    vi.setSystemTime(new Date('2030-08-19T00:00:00Z'));
    expect(terrain.renderTerrain(data, sceneOptions)).toEqual(first);
  });

  it('marks zero-activity scenery as decoration without inventing buildings or activity', () => {
    const result = terrain.renderTerrain(calendarFixture('2025-01-01', 120, 0), sceneOptions);
    expect(result.metadata.stats.total).toBe(0);
    expect(result.metadata.wonders).toHaveLength(0);
    expect(result.metadata.placements.length).toBeGreaterThan(0);
    expect(result.metadata.placements.every((placement) => placement.decorative)).toBe(true);
    expect(result.metadata.cells.every((cell) => cell.count === 0 && cell.level100 === 0)).toBe(
      true,
    );
    expect(result.dark).toContain('Garden decorations');
  });
});

it('reports the actual achieved gates and source dates for selected Wonders', () => {
  const scene = terrain.prepareTerrainScene(calendarFixture('2025-01-01', 365, 8), {
    ...sceneOptions,
    normalization: { kind: 'relative' },
  });
  expect(scene.wonders.length).toBeGreaterThan(0);
  for (const wonder of scene.wonders) {
    const cell = scene.cells.find((cell) => cell.date === wonder.anchorDate);
    expect(cell?.count).toBeGreaterThan(0);
    expect(wonder.thresholds).toHaveLength(4);
    expect(wonder.thresholds.find((threshold) => threshold.metric === 'level100')?.current).toBe(
      cell?.level100,
    );
    expect(wonder.thresholds.find((threshold) => threshold.metric === 'total')?.current).toBe(
      scene.stats.total,
    );
    expect(
      wonder.thresholds.find((threshold) => threshold.metric === 'longestStreak')?.current,
    ).toBe(scene.stats.longestStreak);
    expect(
      wonder.thresholds.every(
        (threshold) => threshold.achieved === threshold.current >= threshold.required,
      ),
    ).toBe(true);
    expect(wonder.explanation).toContain('deterministic rarity draw');
  }
});
