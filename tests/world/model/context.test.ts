import { describe, expect, it } from 'vitest';
import { buildWorld, parseWorldScene } from '../../../src/world/model/index.js';
import { inputFor, sequence } from './helpers.js';

describe('context geometry and route integrity', () => {
  it('places settlement homes in town and earned city towers near a station in city land', () => {
    const scene = buildWorld(inputFor(sequence('2024-01-01', 366, 1)));
    const regions = new Map(scene.regions.map((region) => [region.id, region.kind]));
    for (const home of scene.entities.filter((entity) => entity.id.endsWith(':home')))
      expect(regions.get(home.regionId)).toBe('town');
    for (const tower of scene.entities.filter(
      (entity) => entity.id.startsWith('settlement:') && entity.id.endsWith(':tower'),
    )) {
      expect(regions.get(tower.regionId)).toBe('city');
      expect(
        scene.entities.some(
          (entity) =>
            entity.kind === 'station' &&
            entity.islandId === tower.islandId &&
            Math.hypot(entity.position.x - tower.position.x, entity.position.z - tower.position.z) <
              3,
        ),
      ).toBe(true);
    }
  });
  it('orients each pier along the water-to-dock direction after island rotation', () => {
    const scene = buildWorld(inputFor([]));
    for (const pier of scene.entities.filter((entity) => entity.kind === 'pier')) {
      const dock = scene.entities.find((entity) => entity.id === pier.parentId);
      expect(dock).toBeDefined();
      if (!dock) continue;
      const dx = dock.position.x - pier.position.x;
      const dz = dock.position.z - pier.position.z;
      const agreement = Math.abs(
        (dx * Math.sin(pier.yaw) + dz * Math.cos(pier.yaw)) / Math.hypot(dx, dz),
      );
      expect(agreement).toBeCloseTo(1, 8);
    }
  });

  it('places stair bases at the lower neighboring terrain height', () => {
    const scene = buildWorld(inputFor(sequence('2024-01-01', 366, 1)));
    for (const stair of scene.entities.filter((entity) => entity.kind === 'stair')) {
      const parent = scene.entities.find((entity) => entity.id === stair.parentId);
      expect(parent).toBeDefined();
      if (!parent) continue;
      expect(stair.position.y).toBeLessThanOrEqual(parent.position.y);
      expect(
        Math.hypot(stair.position.x - parent.position.x, stair.position.z - parent.position.z),
      ).toBeCloseTo(0.5, 8);
    }
  });

  it('rejects a route segment that jumps across disconnected traversable cells', () => {
    const scene = buildWorld(inputFor([]));
    const first = scene.routes.find((route) => route.kind === 'walk');
    const second = scene.routes.find((route) => route.kind === 'walk' && route.id !== first?.id);
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (!first || !second) return;
    const a = first.points[0];
    const b = second.points[0];
    const badRoute = {
      ...first,
      nodeIds: [first.nodeIds[0], second.nodeIds[0]],
      points: [a, b],
      length: Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z),
    };
    expect(() =>
      parseWorldScene({
        ...scene,
        routes: scene.routes.map((route) => (route.id === first.id ? badRoute : route)),
      }),
    ).toThrow();
  });
});
