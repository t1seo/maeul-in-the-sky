import { describe, expect, it } from 'vitest';
import { prepareTerrainScene } from '../../src/themes/terrain/scene/prepare.js';
import { calendarFixture } from './terrain/scene/fixtures.js';

describe('daily reward identity', () => {
  it.each(['relative', 'fixed'] as const)(
    'keeps the same raw-count reward when other dates change under %s normalization',
    (kind) => {
      // Given
      const data = calendarFixture('2025-07-06', 14, 10);
      const normalization = kind === 'fixed' ? { kind, maxCount: 20 } : { kind };
      const changed = {
        ...data,
        weeks: data.weeks.map((week) => ({
          ...week,
          days: week.days.map((day) => ({ ...day, count: day.date === '2025-07-10' ? 10 : 1000 })),
        })),
      };
      // When
      const original = prepareTerrainScene(data, { normalization });
      const next = prepareTerrainScene(changed, { normalization });
      // Then
      const reward = (scene: typeof original) => {
        const entry = scene.rewards?.find((item) => item.anchorDate === '2025-07-10');
        return (
          entry && {
            id: entry.id,
            rewardTier: entry.rewardTier,
            count: entry.count,
            minimumCount: entry.minimumCount,
          }
        );
      };
      const primary = (scene: typeof original) => {
        const entry = scene.placements.find(
          (item) => item.anchorDate === '2025-07-10' && item.primary,
        );
        return (
          entry && {
            id: entry.id,
            catalogId: entry.catalogId,
            variant: entry.variant,
            rewardTier: entry.rewardTier,
          }
        );
      };
      expect(reward(original)?.rewardTier).toBe(3);
      expect(reward(next)).toEqual(reward(original));
      expect(primary(next)).toEqual(primary(original));
    },
  );

  it('keeps reward and primary identities across art styles, motion settings and reversed input', () => {
    // Given
    const data = calendarFixture('2025-07-06', 21, 25);
    const reversed = {
      ...data,
      weeks: [...data.weeks].reverse().map((week) => ({ ...week, days: [...week.days].reverse() })),
    };
    // When
    const baseline = prepareTerrainScene(data, { artStyle: 'miniature', motion: 'full' });
    const changed = prepareTerrainScene(reversed, { artStyle: 'pixel', motion: 'off' });
    // Then
    expect(baseline.rewards?.length).toBe(21);
    expect(changed.rewards).toEqual(baseline.rewards);
    expect(changed.placements.filter((entry) => entry.primary)).toEqual(
      baseline.placements.filter((entry) => entry.primary),
    );
  });
});
