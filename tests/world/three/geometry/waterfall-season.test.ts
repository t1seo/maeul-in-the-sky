import { Matrix4, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import type { WorldScene } from '../../../../src/world/model/types.js';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { frameFor, view } from './fixtures.js';
import { waterfallBatch, waterfallMesh, waterfallScene } from './waterfall-fixtures.js';

describe('seasonal waterfall frost', () => {
  it.each([
    { hemisphere: 'north', seasonOverride: 'calendar', frozen: true },
    { hemisphere: 'south', seasonOverride: 'calendar', frozen: false },
    { hemisphere: 'north', seasonOverride: 'summer', frozen: false },
    { hemisphere: 'south', seasonOverride: 'winter', frozen: true },
  ] as const)(
    'uses the February mouth region for $hemisphere / $seasonOverride',
    ({ hemisphere, seasonOverride, frozen }) => {
      // Given
      const scene = {
        ...waterfallScene,
        settings: { ...waterfallScene.settings, hemisphere },
      };
      const world = createWorldGeometry(scene);
      // When
      world.update(frameFor(scene), { ...view, seasonOverride, cursorDate: '2024-08-01' });
      // Then
      const frost = waterfallBatch(world.content, 'frost');
      expect(frost.visible).toBe(frozen);
      expect(frost.count > 0).toBe(frozen);
      world.dispose();
    },
  );

  it('restores the original flowing water colors after a winter override', () => {
    // Given
    const world = createWorldGeometry(waterfallScene);
    world.update(frameFor(waterfallScene), { ...view, seasonOverride: 'summer' });
    const geometry = waterfallMesh(world.content, 'waterways').geometry;
    const original = Array.from(geometry.getAttribute('color').array);
    world.update(frameFor(waterfallScene), { ...view, seasonOverride: 'winter' });
    const winter = Array.from(geometry.getAttribute('color').array);
    // When
    world.update(frameFor(waterfallScene), { ...view, seasonOverride: 'spring' });
    // Then
    const positions = geometry.getAttribute('position');
    const changed = Array.from({ length: positions.count }, (_, index) =>
      original
        .slice(index * 3, index * 3 + 3)
        .some((value, axis) => value !== winter[index * 3 + axis])
        ? positions.getY(index)
        : undefined,
    ).filter((value) => value !== undefined);
    expect(changed.length).toBeGreaterThan(0);
    expect(changed.every((height) => height <= 0)).toBe(true);
    expect(Array.from(geometry.getAttribute('color').array)).toEqual(original);
    world.dispose();
  });

  it('keeps different month mouths seasonal when they share one island', () => {
    // Given
    const scene: WorldScene = {
      ...waterfallScene,
      regions: waterfallScene.regions.flatMap((region) => [
        region,
        { ...region, id: 'summer-region', monthKey: '2024-07' },
      ]),
      terrain: {
        ...waterfallScene.terrain,
        tiles: waterfallScene.terrain.tiles.flatMap((tile) => [
          tile,
          {
            ...tile,
            id: `summer:${tile.id}`,
            regionId: 'summer-region',
            position: { ...tile.position, x: tile.position.x + 20 },
          },
        ]),
        waterways: waterfallScene.terrain.waterways.flatMap((waterway) => [
          waterway,
          {
            ...waterway,
            id: `summer:${waterway.id}`,
            points: waterway.points.map((point) => ({ ...point, x: point.x + 20 })),
          },
        ]),
      },
    };
    const world = createWorldGeometry(scene);
    // When
    world.update(frameFor(scene), { ...view, seasonOverride: 'calendar' });
    // Then
    const frost = waterfallBatch(world.content, 'frost');
    expect(frost.count).toBeGreaterThan(0);
    const matrix = new Matrix4();
    for (let index = 0; index < frost.count; index += 1) {
      frost.getMatrixAt(index, matrix);
      expect(Math.abs(new Vector3().setFromMatrixPosition(matrix).x)).toBeLessThan(1);
    }
    world.dispose();
  });
});
