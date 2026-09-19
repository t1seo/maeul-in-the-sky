import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  buildWorld,
  defaultWorldView,
  frameWorld,
  parseWorldScene,
} from '../../../src/world/model/index.js';
import { assertSceneComplexity } from '../../../src/world/model/complexity.js';
import { datesIn } from '../../../src/world/model/dates.js';
import { circleInput } from './circular-fixture.js';
import { inputFor, sequence } from './helpers.js';
import { connectedComponents } from './layout-inspect.js';

describe('immutable circular calendar slots', () => {
  it.each(['north', 'south'] as const)(
    'retains past %s plots when ranges and snapshot years grow',
    (hemisphere) => {
      // Given
      const first = circleInput(
        inputFor(sequence('2024-12-01', 62, 20), 2024, { from: '2024-12-01', to: '2025-01-31' }),
      );
      const later = circleInput(
        inputFor(sequence('2024-09-01', 730, 20), 2026, { from: '2024-09-01', to: '2026-08-31' }),
      );
      // When
      const initial = buildWorld({ ...first, settings: { ...first.settings, hemisphere } });
      const extended = buildWorld({ ...later, settings: { ...later.settings, hemisphere } });
      // Then
      const tiles = new Map(extended.terrain.tiles.map((tile) => [tile.id, tile]));
      for (const tile of initial.terrain.tiles.filter((tile) => tile.source === 'day'))
        expect(tiles.get(tile.id)).toEqual(tile);
      const assets = new Map(
        extended.entities
          .filter((entity) => entity.kind === 'asset')
          .map((entity) => [entity.id, entity.position]),
      );
      for (const entity of initial.entities.filter((entity) => entity.kind === 'asset'))
        expect(assets.get(entity.id)).toEqual(entity.position);
    },
  );

  it.each(['north', 'south'] as const)(
    'roundtrips the dense 793-day %s range without year-slot collisions',
    (hemisphere) => {
      // Given
      const input = circleInput(
        inputFor(sequence('2023-12-01', 793, 50), 2025, { from: '2023-12-01', to: '2026-01-31' }),
      );
      // When
      const scene = buildWorld({ ...input, settings: { ...input.settings, hemisphere } });
      // Then
      expect(scene.days).toHaveLength(793);
      expect(new Set(scene.days.map((day) => day.monthKey)).size).toBe(26);
      expect(
        new Set(scene.terrain.tiles.map((tile) => `${tile.position.x},${tile.position.z}`)).size,
      ).toBe(scene.terrain.tiles.length);
      expect(
        connectedComponents(scene.terrain.tiles.filter((tile) => tile.surface !== 'water')),
      ).toHaveLength(1);
      expect(scene.regions.length).toBeLessThanOrEqual(82);
      expect(() => assertSceneComplexity(scene)).not.toThrow();
      expect(parseWorldScene(JSON.parse(JSON.stringify(scene)))).toEqual(scene);
      expect(buildWorld({ ...input, settings: { ...input.settings, hemisphere } })).toEqual(scene);
    },
  );

  it.each([1, 99, 2024, 2025, 9999])(
    'preserves complete dates and valid geometry in year %i',
    (year) => {
      // Given
      const prefix = String(year).padStart(4, '0');
      const input = circleInput(
        inputFor(
          [
            [`${prefix}-01-01`, 0],
            [`${prefix}-12-31`, 50],
          ],
          year,
        ),
      );
      // When
      const scene = buildWorld(input);
      // Then
      expect(scene.days[0]?.date).toBe(`${prefix}-01-01`);
      expect(scene.days.at(-1)?.date).toBe(`${prefix}-12-31`);
      expect(parseWorldScene(scene)).toEqual(scene);
    },
  );

  it('keeps zero, missing and leap-day identities and hides future replay rewards', () => {
    // Given
    const base = inputFor(
      [
        ['2024-02-28', 0],
        ['2024-02-29', 5],
        ['2024-03-02', 50],
      ],
      2024,
      { from: '2024-02-01', to: '2024-03-31' },
    );
    const scene = buildWorld(circleInput(base));
    const serialized = JSON.stringify(scene);
    const view = { ...defaultWorldView(scene), cursorDate: '2024-02-29', elapsedSeconds: 12.5 };
    // When
    const frame = frameWorld(scene, view);
    // Then
    expect(scene.days).toEqual(buildWorld(base).days);
    expect(frame.stats).toMatchObject({ observedDays: 2, activeDays: 1, totalContributions: 5 });
    expect(frame.entities.every((entity) => entity.visibleFrom <= view.cursorDate)).toBe(true);
    expect(
      frame.terrain.tiles
        .filter((tile) => tile.date && tile.date > view.cursorDate)
        .every((tile) => tile.activityHeight === 0),
    ).toBe(true);
    expect(frame.terrain.tiles.map((tile) => tile.position)).toEqual(
      scene.terrain.tiles.map((tile) => tile.position),
    );
    expect(JSON.stringify(scene)).toBe(serialized);
    expect(frameWorld(parseWorldScene(JSON.parse(serialized)), view)).toEqual(frame);
  });

  it('retains the 800-day parser limit and the stricter whole-month builder boundary', () => {
    // Given
    const exact = { from: '2023-12-01', to: '2026-02-07' };
    // When
    const dates = datesIn(exact);
    // Then
    expect(dates).toHaveLength(800);
    expect(() => datesIn({ ...exact, to: '2026-02-08' })).toThrow();
    expect(() => buildWorld(circleInput(inputFor([], 2025, exact)))).toThrow();
  });
});

describe('legacy geometry compatibility', () => {
  it.each([
    ['archipelago', '542862c8494108cabdee9dbf100b6ee33baecdb2b42ee9c5e5937c4808624f4c'],
    ['island', '08a3700293a016ac003b97b767acbd302ba4167219e57a28dc845ff8e2db1025'],
    ['seasonal', '5e51865bfb93de4dd5b318f91d9965498cda1a6117f4a877e60da0287d29f12f'],
  ] as const)('retains the pre-change frozen %s scene', (layout, expected) => {
    // Given
    const input = inputFor(sequence('2024-09-19', 366, 25), 2025);
    // When
    const scene = buildWorld({ ...input, settings: { ...input.settings, layout } });
    const portableGeometry = JSON.stringify(scene, (_key, value: unknown) =>
      typeof value === 'number' && !Number.isInteger(value) ? Number(value.toFixed(12)) : value,
    );
    // Then
    expect(createHash('sha256').update(portableGeometry).digest('hex')).toBe(expected);
  });
});
