import { describe, expect, it } from 'vitest';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { frameFor, view } from './fixtures.js';
import { waterfallBatch, waterfallMesh, waterfallScene } from './waterfall-fixtures.js';

describe('waterfall path compatibility', () => {
  it.each(['vertical', 'duplicate'] as const)('keeps %s descending paths finite', (kind) => {
    // Given
    const scene = {
      ...waterfallScene,
      terrain: {
        ...waterfallScene.terrain,
        waterways: waterfallScene.terrain.waterways.map((waterway) => {
          if (waterway.kind !== 'waterfall') return waterway;
          const start = { x: 0, y: 0, z: 2 };
          const end = { x: 0, y: -1.5, z: 2 };
          return {
            ...waterway,
            points: kind === 'vertical' ? [start, end] : [start, start, end, end],
          };
        }),
      },
    };
    const world = createWorldGeometry(scene);
    // When
    world.update(frameFor(scene), { ...view, elapsedSeconds: 9.75 });
    // Then
    for (const name of ['streaks', 'droplets', 'mist', 'frost'])
      expect(
        Array.from(waterfallBatch(world.content, name).instanceMatrix.array).every(Number.isFinite),
      ).toBe(true);
    expect(waterfallMesh(world.content, 'waterways').geometry.boundingBox?.min.y).toBe(-1.5);
    world.dispose();
  });

  it('leaves non-descending frozen waterways intact without inventing a fall', () => {
    // Given
    const scene = {
      ...waterfallScene,
      terrain: {
        ...waterfallScene.terrain,
        waterways: waterfallScene.terrain.waterways.map((waterway) => ({
          ...waterway,
          points: waterway.points.map((point) => ({ ...point, y: 0 })),
        })),
      },
    };
    const world = createWorldGeometry(scene);
    // When
    world.update(frameFor(scene), view);
    // Then
    expect(
      waterfallMesh(world.content, 'waterways').geometry.getAttribute('position').count,
    ).toBeGreaterThan(0);
    expect(world.content.children.some((object) => object.name.startsWith('waterfalls:'))).toBe(
      false,
    );
    world.dispose();
  });

  it('matches the zero-time pose when elapsed time is clamped before the scene start', () => {
    // Given
    const world = createWorldGeometry(waterfallScene);
    world.update(frameFor(waterfallScene), { ...view, elapsedSeconds: 0 });
    const before = Array.from(waterfallBatch(world.content, 'streaks').instanceMatrix.array);
    // When
    world.update(frameFor(waterfallScene), { ...view, elapsedSeconds: -3 });
    // Then
    expect(Array.from(waterfallBatch(world.content, 'streaks').instanceMatrix.array)).toEqual(
      before,
    );
    world.dispose();
  });
});
