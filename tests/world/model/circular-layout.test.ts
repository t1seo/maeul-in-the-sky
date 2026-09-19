import { describe, expect, it } from 'vitest';
import { buildWorld, parseWorldScene } from '../../../src/world/model/index.js';
import { calendarSeason } from '../../../src/world/model/dates.js';
import type { WorldSeason } from '../../../src/world/model/types.js';
import { circleInput } from './circular-fixture.js';
import { inputFor, sequence } from './helpers.js';
import { connectedComponents } from './layout-inspect.js';

function quadrant(x: number, z: number): WorldSeason {
  return x < 0 ? (z < 0 ? 'spring' : 'winter') : z < 0 ? 'summer' : 'autumn';
}

describe('one circular seasonal landmass', () => {
  it.each(['north', 'south'] as const)(
    'keeps a full connected unit disk for %s dates',
    (hemisphere) => {
      // Given
      const input = circleInput(inputFor(sequence('2024-09-19', 366, 25), 2025));
      // When
      const scene = buildWorld({ ...input, settings: { ...input.settings, hemisphere } });
      // Then
      expect(scene.islands).toHaveLength(1);
      expect(scene.days).toHaveLength(395);
      expect(new Set(scene.days.map((day) => day.monthKey)).size).toBe(13);
      const tiles = scene.terrain.tiles;
      expect(tiles).toHaveLength(3228);
      expect(new Set(tiles.map((tile) => tile.id)).size).toBe(tiles.length);
      expect(new Set(tiles.map((tile) => `${tile.position.x},${tile.position.z}`)).size).toBe(
        tiles.length,
      );
      expect(tiles.every((tile) => tile.size === 1 && tile.islandId === scene.islands[0]?.id)).toBe(
        true,
      );
      expect(
        tiles.every(
          ({ position: { x, z } }) =>
            Number.isInteger(x - 0.5) && Number.isInteger(z - 0.5) && x * x + z * z <= 32 * 32,
        ),
      ).toBe(true);
      expect(connectedComponents(tiles)).toHaveLength(1);
      expect(connectedComponents(tiles.filter((tile) => tile.surface !== 'water'))).toHaveLength(1);
      for (const tile of tiles.filter((tile) => tile.date)) {
        if (!tile.date) throw new TypeError('Expected a dated tile');
        expect(quadrant(tile.position.x, tile.position.z)).toBe(
          calendarSeason(tile.date, hemisphere),
        );
      }
      expect(parseWorldScene(scene)).toEqual(scene);
    },
  );

  it('keeps unrepresented seasons as owned scenery without fabricated dates', () => {
    // Given
    const input = circleInput(
      inputFor([['2024-04-12', 5]], 2024, { from: '2024-04-01', to: '2024-04-30' }),
    );
    // When
    const scene = buildWorld(input);
    // Then
    expect(scene.days).toHaveLength(30);
    expect(scene.days.filter((day) => day.kind === 'observed')).toHaveLength(1);
    const filler = scene.regions.filter((region) => region.id.includes(':scaffold:'));
    expect(filler).toHaveLength(4);
    expect(
      new Set(filler.map((region) => calendarSeason(`${region.monthKey}-01`, 'north'))).size,
    ).toBe(4);
    expect(filler.every((region) => region.kind === 'nature' && region.tileIds.length > 0)).toBe(
      true,
    );
    const owned = scene.regions.flatMap((region) => region.tileIds);
    expect(new Set(owned).size).toBe(scene.terrain.tiles.length);
    expect(owned).toHaveLength(scene.terrain.tiles.length);
    expect(scene.terrain.tiles.filter((tile) => tile.source === 'day')).toHaveLength(30);
    expect(
      scene.entities.filter((entity) => entity.id.startsWith('scenery:circle:')).length,
    ).toBeLessThanOrEqual(96);
    expect(parseWorldScene(scene)).toEqual(scene);
  });

  it('spills every river from an actual coastline below the floating underside', () => {
    // Given
    const input = circleInput();
    // When
    const scene = buildWorld(input);
    // Then
    const falls = scene.terrain.waterways.filter((way) => way.kind === 'waterfall');
    expect(falls).toHaveLength(4);
    for (const fall of falls) {
      const mouth = fall.points[0];
      const bottom = fall.points.at(-1);
      expect(mouth?.y).toBe(0);
      expect(bottom?.y).toBeLessThanOrEqual(-9);
      const river = scene.terrain.waterways.find(
        (way) => way.id === fall.id.replace(':waterfall', ':river'),
      );
      expect(river?.points.at(-1)).toEqual(mouth);
      if (!mouth || !bottom) throw new TypeError('Missing waterfall endpoints');
      const water = scene.terrain.tiles.find(
        (tile) =>
          tile.surface === 'water' &&
          Math.hypot(tile.position.x - mouth.x, tile.position.z - mouth.z) <= 0.51,
      );
      expect(water).toBeDefined();
      if (!water) throw new TypeError('Missing river-mouth tile');
      const dx = (mouth.x - water.position.x) * 2;
      const dz = (mouth.z - water.position.z) * 2;
      expect(
        scene.terrain.tiles.some(
          (tile) =>
            tile.position.x === water.position.x + dx && tile.position.z === water.position.z + dz,
        ),
      ).toBe(false);
      expect(scene.bounds.min.y).toBeLessThan(bottom.y);
    }
  });

  it('grounds shared transport and keeps houses and attachments coherent', () => {
    // Given
    const input = circleInput();
    // When
    const scene = buildWorld(input);
    // Then
    expect(new Set(scene.routes.map((route) => route.kind))).toEqual(
      new Set(['walk', 'rail', 'water']),
    );
    expect(scene.routes.length).toBeLessThanOrEqual(12);
    expect(scene.routeNodes.length).toBeLessThanOrEqual(256);
    expect(new Set(scene.actors.map((actor) => actor.kind))).toEqual(
      new Set(['wildlife', 'resident', 'train', 'ferry']),
    );
    expect(parseWorldScene(scene)).toEqual(scene);
    const houses = scene.entities.filter((entity) => entity.id.endsWith(':home'));
    expect(houses.length).toBeGreaterThan(0);
    for (const house of houses) {
      const attachments = scene.entities.filter((entity) => entity.parentId === house.id);
      expect(new Set(attachments.map((entity) => entity.kind))).toEqual(
        new Set(['courtyard', 'stair']),
      );
      expect(
        attachments.every(
          (entity) =>
            Math.hypot(
              entity.position.x - house.position.x,
              entity.position.z - house.position.z,
            ) <= 1.5,
        ),
      ).toBe(true);
    }
    const land = scene.terrain.tiles.filter((tile) => tile.surface !== 'water');
    expect(
      land.filter((tile) => tile.regionId.endsWith(':nature')).length / land.length,
    ).toBeGreaterThanOrEqual(0.74);
  });
});
