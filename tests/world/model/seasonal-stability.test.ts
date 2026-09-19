import { describe, expect, it } from 'vitest';
import {
  buildWorld,
  defaultWorldView,
  frameWorld,
  parseWorldScene,
  seasonForMonth,
  weatherForMonth,
} from '../../../src/world/model/index.js';
import { assertSceneComplexity } from '../../../src/world/model/complexity.js';
import { inputFor, sequence } from './helpers.js';
import { connectedComponents } from './layout-inspect.js';

describe('seasonal date stability and replay', () => {
  it.each([1, 99, 2024, 2025, 9999])(
    'retains every annual date and valid slots in year %i',
    (year) => {
      const prefix = String(year).padStart(4, '0');
      const input = inputFor(
        [
          [`${prefix}-01-01`, 0],
          [`${prefix}-12-31`, 50],
        ],
        year,
      );
      const scene = buildWorld({ ...input, settings: { ...input.settings, layout: 'seasonal' } });
      expect(scene.days.map((day) => day.date)).toEqual(
        buildWorld(input).days.map((day) => day.date),
      );
      expect(connectedComponents(scene.terrain.tiles)).toHaveLength(4);
      expect(
        new Set(scene.terrain.tiles.map((tile) => `${tile.position.x},${tile.position.z}`)).size,
      ).toBe(scene.terrain.tiles.length);
      expect(parseWorldScene(scene)).toEqual(scene);
    },
  );

  it('retains observed counts, zero, missing days and leap-day identities across every layout', () => {
    const input = inputFor(
      [
        ['2024-02-28', 0],
        ['2024-02-29', 5],
        ['2024-03-02', 50],
      ],
      2024,
      { from: '2024-02-01', to: '2024-03-31' },
    );
    const original = buildWorld(input);
    for (const layout of ['island', 'seasonal'] as const) {
      const scene = buildWorld({ ...input, settings: { ...input.settings, layout } });
      expect(scene.days).toEqual(original.days);
      expect(
        scene.terrain.tiles
          .filter((tile) => tile.source === 'day')
          .map((tile) => tile.id)
          .sort(),
      ).toEqual(
        original.terrain.tiles
          .filter((tile) => tile.source === 'day')
          .map((tile) => tile.id)
          .sort(),
      );
      expect(frameWorld(scene, defaultWorldView(scene)).stats).toEqual(
        frameWorld(original, defaultWorldView(original)).stats,
      );
    }
  });

  it.each(['north', 'south'] as const)(
    'never moves past plots when a %s range and snapshot year expand',
    (hemisphere) => {
      const records = sequence('2024-12-01', 62, 20);
      const input = inputFor(records, 2024, { from: '2024-12-01', to: '2025-01-31' });
      const settings = { ...input.settings, layout: 'seasonal' as const, hemisphere };
      const initial = buildWorld({ ...input, settings });
      const extendedInput = inputFor(sequence('2024-09-01', 730, 20), 2026, {
        from: '2024-09-01',
        to: '2026-08-31',
      });
      const extended = buildWorld({ ...extendedInput, settings });
      const laterTiles = new Map(extended.terrain.tiles.map((tile) => [tile.id, tile]));
      for (const tile of initial.terrain.tiles.filter((tile) => tile.source === 'day'))
        expect(laterTiles.get(tile.id)).toEqual(tile);
      const laterAssets = new Map(
        extended.entities
          .filter((entity) => entity.kind === 'asset')
          .map((entity) => [entity.id, entity.position]),
      );
      for (const entity of initial.entities.filter((entity) => entity.kind === 'asset'))
        expect(laterAssets.get(entity.id)).toEqual(entity.position);
    },
  );

  it('reveals earned scenery, height and counts only at the replay date', () => {
    const input = inputFor([...sequence('2024-01-01', 20, 50), ['2024-12-01', 50]]);
    const scene = buildWorld({ ...input, settings: { ...input.settings, layout: 'seasonal' } });
    const initial = JSON.stringify(scene);
    const view = { ...defaultWorldView(scene), cursorDate: '2024-01-01', elapsedSeconds: 12.5 };
    const frame = frameWorld(scene, view);
    expect(frame.stats).toMatchObject({ totalContributions: 50, observedDays: 1, activeDays: 1 });
    expect(frame.entities.every((entity) => entity.visibleFrom <= view.cursorDate)).toBe(true);
    expect(frame.actors.every((actor) => actor.visibleFrom <= view.cursorDate)).toBe(true);
    expect(frame.events).toEqual([]);
    expect(frame.discoveries.every((discovery) => discovery.availableFrom <= view.cursorDate)).toBe(
      true,
    );
    expect(
      frame.terrain.tiles
        .filter((tile) => tile.date && tile.date > view.cursorDate)
        .every((tile) => tile.activityHeight === 0),
    ).toBe(true);
    expect(frame.terrain.tiles.map((tile) => tile.position)).toEqual(
      scene.terrain.tiles.map((tile) => tile.position),
    );
    expect(JSON.stringify(scene)).toBe(initial);
    expect(frameWorld(parseWorldScene(JSON.parse(initial)), view)).toEqual(frame);
  });

  it('leaves geographic grouping fixed while calendar palettes and explicit overrides work', () => {
    const input = inputFor(sequence('2024-01-01', 366, 1));
    const scene = buildWorld({ ...input, settings: { ...input.settings, layout: 'seasonal' } });
    const view = defaultWorldView(scene);
    const months = ['2024-01', '2024-04', '2024-07', '2024-10'];
    expect(months.map((month) => seasonForMonth(scene, view, month))).toEqual([
      'winter',
      'spring',
      'summer',
      'autumn',
    ]);
    expect(months.map((month) => weatherForMonth(scene, view, month))).toEqual([
      'snow',
      'clear',
      'rain',
      'clear',
    ]);
    const override = { ...view, seasonOverride: 'winter' as const };
    expect(months.map((month) => weatherForMonth(scene, override, month))).toEqual(
      Array(4).fill('snow'),
    );
    expect(frameWorld(scene, override).terrain).toEqual(frameWorld(scene, view).terrain);
  });

  it.each(['north', 'south'] as const)(
    'keeps the maximum whole-month dense range within %s budgets',
    (hemisphere) => {
      const input = inputFor(sequence('2023-12-01', 793, 50), 2025, {
        from: '2023-12-01',
        to: '2026-01-31',
      });
      const settings = { ...input.settings, layout: 'seasonal' as const, hemisphere };
      const scene = buildWorld({ ...input, settings });
      expect(scene.days).toHaveLength(793);
      expect(scene.islands.flatMap((island) => island.monthKeys)).toHaveLength(26);
      expect(scene.terrain.tiles.length).toBeLessThanOrEqual(8192);
      expect(connectedComponents(scene.terrain.tiles)).toHaveLength(4);
      expect(
        connectedComponents(scene.terrain.tiles.filter((tile) => tile.surface !== 'water')),
      ).toHaveLength(4);
      expect(() => assertSceneComplexity(scene)).not.toThrow();
      expect(parseWorldScene(JSON.parse(JSON.stringify(scene)))).toEqual(scene);
      expect(buildWorld({ ...input, settings })).toEqual(scene);
    },
  );
});
