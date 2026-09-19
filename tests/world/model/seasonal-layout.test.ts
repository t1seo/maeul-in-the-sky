import { describe, expect, it } from 'vitest';
import { buildWorld, parseWorldScene } from '../../../src/world/model/index.js';
import { calendarSeason } from '../../../src/world/model/dates.js';
import { createCliffs } from '../../../src/world/three/geometry/cliffs.js';
import { terrainPatches } from '../../../src/world/three/geometry/terrain-grid.js';
import type { WorldScene } from '../../../src/world/model/types.js';
import { inputFor, sequence } from './helpers.js';
import { connectedComponents } from './layout-inspect.js';

function terrainTriangles(scene: WorldScene): number {
  const patches = terrainPatches(scene.terrain.tiles, scene.terrain.waterLevel);
  return patches.length * 4 + createCliffs(scene, patches).positions.length / 9;
}

describe('physical seasonal landmasses', () => {
  it.each([
    ['archipelago', 12],
    ['island', 1],
    ['seasonal', 4],
  ] as const)('joins a full annual %s into exactly %i terrain components', (layout, count) => {
    const input = inputFor(sequence('2024-01-01', 366, 10));
    const scene = buildWorld({ ...input, settings: { ...input.settings, layout } });
    const components = connectedComponents(scene.terrain.tiles);
    expect(components).toHaveLength(count);
    expect(scene.islands).toHaveLength(count);
    expect(components.map((tiles) => new Set(tiles.map((tile) => tile.islandId)).size)).toEqual(
      Array.from({ length: count }, () => 1),
    );
    if (layout !== 'archipelago')
      expect(
        connectedComponents(scene.terrain.tiles.filter((tile) => tile.surface !== 'water')),
      ).toHaveLength(count);
  });

  it.each(['north', 'south'] as const)(
    'groups calendar months into connected %s seasons',
    (hemisphere) => {
      const input = inputFor(sequence('2024-01-01', 366));
      const scene = buildWorld({
        ...input,
        settings: { ...input.settings, layout: 'seasonal', hemisphere },
      });
      const expected =
        hemisphere === 'north'
          ? {
              spring: ['03', '04', '05'],
              summer: ['06', '07', '08'],
              autumn: ['09', '10', '11'],
              winter: ['01', '02', '12'],
            }
          : {
              spring: ['09', '10', '11'],
              summer: ['01', '02', '12'],
              autumn: ['03', '04', '05'],
              winter: ['06', '07', '08'],
            };
      for (const [season, months] of Object.entries(expected)) {
        const island = scene.islands.find((island) => island.id === `island:season:${season}`);
        expect(island?.monthKeys).toEqual(months.map((month) => `2024-${month}`));
        const tiles = scene.terrain.tiles.filter((tile) => tile.islandId === island?.id);
        expect(connectedComponents(tiles)).toHaveLength(1);
        expect(connectedComponents(tiles.filter((tile) => tile.surface !== 'water'))).toHaveLength(
          1,
        );
      }
      expect(parseWorldScene(scene)).toEqual(scene);
    },
  );

  it.each([
    ['2024-03-09', 20, 1],
    ['2024-02-20', 20, 2],
    ['2024-12-20', 45, 1],
    ['2025-12-20', 45, 1],
    ['2024-09-19', 366, 4],
    ['2023-12-01', 793, 4],
  ] as const)(
    'keeps only the represented seasonal landmasses for %s plus %i days',
    (from, length, count) => {
      const records = sequence(from, length, 2);
      const last = records.at(-1);
      expect(last).toBeDefined();
      if (!last) return;
      const input = inputFor(records, Number(from.slice(0, 4)), { from, to: last[0] });
      const scene = buildWorld({ ...input, settings: { ...input.settings, layout: 'seasonal' } });
      expect(scene.islands).toHaveLength(count);
      expect(connectedComponents(scene.terrain.tiles)).toHaveLength(count);
      expect(
        connectedComponents(scene.terrain.tiles.filter((tile) => tile.surface !== 'water')),
      ).toHaveLength(count);
      expect(
        new Set(scene.terrain.tiles.map((tile) => `${tile.position.x},${tile.position.z}`)).size,
      ).toBe(scene.terrain.tiles.length);
      expect(scene.days.filter((day) => day.kind === 'observed')).toHaveLength(length);
      for (const island of scene.islands)
        expect(
          new Set(island.monthKeys.map((month) => calendarSeason(`${month}-01`, 'north'))).size,
        ).toBe(1);
      expect(() => parseWorldScene(scene)).not.toThrow();
    },
  );

  it('keeps annual surface and cliff triangles within the existing unified-island budget', () => {
    const input = inputFor(sequence('2024-01-01', 366, 50));
    const island = buildWorld({ ...input, settings: { ...input.settings, layout: 'island' } });
    const seasonal = buildWorld({ ...input, settings: { ...input.settings, layout: 'seasonal' } });
    expect(terrainTriangles(seasonal)).toBeLessThanOrEqual(terrainTriangles(island));
    expect(seasonal.terrain.tiles.length).toBeLessThanOrEqual(island.terrain.tiles.length);
  });
});
