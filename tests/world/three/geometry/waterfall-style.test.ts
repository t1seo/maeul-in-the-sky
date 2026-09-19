import { describe, expect, it } from 'vitest';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { frameFor, view } from './fixtures.js';
import { waterfallMesh, waterfallScene } from './waterfall-fixtures.js';

describe('waterfall overview contrast', () => {
  it('fans the falling water below the mouth while retaining the river width at its lip', () => {
    // Given
    const world = createWorldGeometry(waterfallScene);
    // When
    world.update(frameFor(waterfallScene), { ...view, seasonOverride: 'summer' });
    const position = waterfallMesh(world.content, 'waterways').geometry.getAttribute('position');
    const mouth: number[] = [];
    const lower: number[] = [];
    for (let index = 0; index < position.count; index += 1) {
      if (position.getY(index) === 0) mouth.push(position.getX(index));
      if (position.getY(index) === -5) lower.push(position.getX(index));
    }
    // Then
    expect(Math.max(...mouth) - Math.min(...mouth)).toBeCloseTo(0.8);
    expect(Math.max(...lower) - Math.min(...lower)).toBeGreaterThan(0.8 * 1.4);
    world.dispose();
  });

  it('uses a brighter cyan surface for the falling face than the river under the same light', () => {
    // Given
    const world = createWorldGeometry(waterfallScene);
    // When
    world.update(frameFor(waterfallScene), { ...view, seasonOverride: 'summer' });
    const geometry = waterfallMesh(world.content, 'waterways').geometry;
    const position = geometry.getAttribute('position');
    const color = geometry.getAttribute('color');
    const river: number[] = [];
    const fall: number[] = [];
    for (let index = 0; index < position.count; index += 1) {
      const luminance =
        color.getX(index) * 0.2126 + color.getY(index) * 0.7152 + color.getZ(index) * 0.0722;
      if (position.getY(index) > 0) river.push(luminance);
      if (position.getY(index) < -4) fall.push(luminance);
    }
    // Then
    const average = (values: readonly number[]) =>
      values.reduce((sum, value) => sum + value, 0) / values.length;
    expect(average(fall)).toBeGreaterThan(average(river) * 1.5);
    world.dispose();
  });
});
