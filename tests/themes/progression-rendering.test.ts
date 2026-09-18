import { describe, expect, it } from 'vitest';
import { prepareTerrainScene } from '../../src/themes/terrain/scene/prepare.js';
import { terrainMetadata } from '../../src/themes/terrain/scene/metadata.js';
import { renderDailyRewards } from '../../src/themes/terrain/scene/rewards.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import { describeDay } from '../../src/demo/day-details.js';
import { calendarFixture } from './terrain/scene/fixtures.js';
import type { TerrainScene } from '../../src/core/scene-types.js';

describe('static daily reward signal and truthful metadata', () => {
  it('uses at most five paint paths for each daily reward', () => {
    for (const count of [1, 5, 10, 25, 50]) {
      const scene = prepareTerrainScene(calendarFixture('2025-07-06', 1, count));
      const svg = renderDailyRewards(scene, getTerrainPalette100('light'));
      expect([...svg.matchAll(/<path\b/g)].length, `${count} contributions`).toBeLessThanOrEqual(5);
    }
  });

  it('limits marker coordinate precision to the scene SVG policy', () => {
    const scene = prepareTerrainScene(calendarFixture('2025-07-06', 1, 50));
    const svg = renderDailyRewards(scene, getTerrainPalette100('light'));
    expect(svg).not.toMatch(/\d+\.\d{3}/);
  });

  it('keeps a reward marker and metadata on every Wonder date without overlapping primaries', () => {
    const scene = prepareTerrainScene(calendarFixture('2025-01-01', 365, 100));
    const metadata = terrainMetadata(scene);
    const svg = renderDailyRewards(scene, getTerrainPalette100('light'));
    expect(scene.wonders.length).toBeGreaterThan(0);
    expect(scene.wonders.length).toBeLessThanOrEqual(3);
    for (const wonder of scene.wonders) {
      expect(
        scene.rewards?.find((reward) => reward.anchorDate === wonder.anchorDate),
      ).toMatchObject({ rewardTier: 5, minimumCount: 50, count: 100 });
      expect(
        scene.placements.filter(
          (placement) => placement.anchorDate === wonder.anchorDate && placement.primary,
        ),
      ).toHaveLength(0);
      expect(metadata.cells.find((cell) => cell.date === wonder.anchorDate)).toMatchObject({
        rewardTier: 5,
        rewardIds: [`reward:${wonder.anchorDate}`],
      });
      expect(svg).toContain(`data-reward-id="reward:${wonder.anchorDate}"`);
    }
    expect(svg).not.toMatch(/<animate|<filter|<image|@keyframes/);
  });

  it('renders five distinct positive stages in light and dark while leaving zero unmarked', () => {
    for (const mode of ['light', 'dark'] as const) {
      const shapes = [1, 5, 10, 25, 50].map((count, index) => {
        const scene = prepareTerrainScene(calendarFixture('2025-07-06', 1, count));
        const svg = renderDailyRewards(scene, getTerrainPalette100(mode));
        expect(svg).toContain(`data-reward-tier="${index + 1}"`);
        return svg.match(/<path[^>]+>/g)?.join('');
      });
      expect(new Set(shapes).size).toBe(5);
    }
    const zero = prepareTerrainScene(calendarFixture('2025-07-06', 1, 0));
    expect(zero.rewards).toEqual([]);
    expect(renderDailyRewards(zero, getTerrainPalette100('light'))).toBe('');
  });

  it('describes raw contributions and the reached threshold without a whole-scene quality promise', () => {
    const metadata = terrainMetadata(
      prepareTerrainScene(calendarFixture('2025-07-06', 1, 100), {
        normalization: { kind: 'fixed', maxCount: 20 },
      }),
    );
    expect(describeDay(metadata.cells[0], metadata)).toContain('100 contributions');
    expect(describeDay(metadata.cells[0], metadata)).toContain(
      'Daily reward 5/5 (50+ contributions)',
    );
    const zero = terrainMetadata(prepareTerrainScene(calendarFixture('2025-07-06', 1, 0)));
    expect(describeDay(zero.cells[0], zero)).toContain('0 contributions');
    expect(describeDay(zero.cells[0], zero)).toContain('No daily reward');
    expect(describeDay(zero.cells[0], zero)).not.toContain('commit');
  });

  it('reads legacy scenes without inventing a rendered reward or changing their version', () => {
    const current = prepareTerrainScene(calendarFixture('2025-07-06', 1, 10));
    const { rewards: _rewards, ...rest } = current;
    const legacy: TerrainScene = {
      ...rest,
      layoutVersion: 1,
      seed: { root: 'legacy-root', policy: 'username-date-v1' },
      cells: rest.cells.map(({ rewardTier: _tier, ...cell }) => cell),
    };
    const metadata = terrainMetadata(legacy);
    expect(renderDailyRewards(legacy, getTerrainPalette100('light'))).toBe('');
    expect(metadata.layoutVersion).toBe(1);
    expect(metadata.cells[0].rewardTier).toBeUndefined();
    expect(describeDay(metadata.cells[0], metadata)).not.toContain('Daily reward');
  });

  it('does not turn absent calendar dates into zero days or rewards', () => {
    const data = calendarFixture('2025-07-06', 3, 5);
    const scene = prepareTerrainScene({
      ...data,
      weeks: data.weeks.map((week) => ({
        ...week,
        days: week.days.filter((day) => day.date !== '2025-07-07'),
      })),
    });
    const metadata = terrainMetadata(scene);
    expect(metadata.dataDayCount).toBe(2);
    expect(metadata.missingDayCount).toBe(1);
    expect(metadata.rewards).toHaveLength(2);
    expect(metadata.cells.map((cell) => cell.date)).not.toContain('2025-07-07');
  });
});
