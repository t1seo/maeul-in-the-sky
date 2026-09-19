import { Box3, Matrix4, Mesh, Vector3 } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { visibleGeometryBounds } from '../../../../src/world/three/camera-fit.js';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { frameFor, view } from './fixtures.js';
import { waterfallBatch, waterfallMesh, waterfallScene } from './waterfall-fixtures.js';

describe('falling water details', () => {
  it('moves distinct streaks and droplets down a descending waterfall using elapsed time', () => {
    // Given
    const world = createWorldGeometry(waterfallScene);
    world.update(frameFor(waterfallScene), { ...view, elapsedSeconds: 2 });
    const batches = ['streaks', 'droplets'].map((name) => waterfallBatch(world.content, name));
    const before = batches.map((batch) => Array.from(batch.instanceMatrix.array));
    // When
    world.update(frameFor(waterfallScene), { ...view, elapsedSeconds: 2.05 });
    // Then
    for (const [index, batch] of batches.entries()) {
      const previous = before[index];
      if (!previous) throw new TypeError('Missing initial particle poses');
      const descending = Array.from({ length: batch.count }, (_, particle) => {
        const matrix = new Matrix4();
        batch.getMatrixAt(particle, matrix);
        return matrix.elements[13] < previous[particle * 16 + 13];
      });
      expect(descending.filter(Boolean).length).toBeGreaterThan(batch.count / 2);
      expect(batch.geometry.getAttribute('position').count).toBeLessThan(100);
    }
    world.dispose();
  });

  it.each(['off', 'subtle', 'full'] as const)(
    'reproduces the saved particle pose in %s mode when the shared clock is frozen',
    (motion) => {
      // Given
      const world = createWorldGeometry(waterfallScene);
      const restored = createWorldGeometry(waterfallScene);
      const frozen = { ...view, motion, elapsedSeconds: 8.5 };
      world.update(frameFor(waterfallScene), frozen);
      const names = ['streaks', 'droplets', 'mist'];
      const poses = names.map((name) =>
        Array.from(waterfallBatch(world.content, name).instanceMatrix.array),
      );
      // When
      world.update(frameFor(waterfallScene), frozen);
      restored.update(frameFor(waterfallScene), frozen);
      // Then
      for (const [index, name] of names.entries()) {
        expect(Array.from(waterfallBatch(world.content, name).instanceMatrix.array)).toEqual(
          poses[index],
        );
        expect(Array.from(waterfallBatch(restored.content, name).instanceMatrix.array)).toEqual(
          poses[index],
        );
      }
      restored.dispose();
      world.dispose();
    },
  );

  it('contains every animated particle in the initial camera bounds including the lower mist', () => {
    // Given
    const world = createWorldGeometry(waterfallScene);
    world.update(frameFor(waterfallScene), view);
    const bounds = visibleGeometryBounds(world.content);
    const mist = waterfallBatch(world.content, 'mist');
    const matrix = new Matrix4();
    const position = new Vector3();
    // When
    const sampled = [0, 0.25, 0.75, 1.5, 5, 17].flatMap((elapsedSeconds) => {
      world.update(frameFor(waterfallScene), { ...view, elapsedSeconds });
      return ['streaks', 'droplets', 'mist'].flatMap((name) => {
        const batch = waterfallBatch(world.content, name);
        batch.geometry.computeBoundingBox();
        return Array.from({ length: batch.count }, (_, index) => {
          batch.getMatrixAt(index, matrix);
          return batch.geometry.boundingBox?.clone().applyMatrix4(matrix) ?? new Box3();
        });
      });
    });
    // Then
    expect(bounds.min.y).toBeLessThan(-5.5);
    expect(sampled.every((box) => bounds.containsBox(box))).toBe(true);
    mist.getMatrixAt(0, matrix);
    position.setFromMatrixPosition(matrix);
    expect(position.y).toBeLessThan(-4);
    expect(position.z).toBeGreaterThan(2.4);
    const material = waterfallMesh(world.content, 'waterfalls:mist').material;
    expect(material.transparent).toBe(true);
    expect(material.depthWrite).toBe(false);
    expect(material.map).not.toBeNull();
    world.dispose();
  });

  it('disposes all particle meshes, geometry, materials and mist textures exactly once', () => {
    // Given
    const world = createWorldGeometry(waterfallScene);
    world.update(frameFor(waterfallScene), view);
    const owned = new Set<{ dispose: () => void }>();
    for (const name of ['streaks', 'droplets', 'mist', 'frost']) {
      const batch = waterfallBatch(world.content, name);
      owned.add(batch);
      owned.add(batch.geometry);
      const material = waterfallMesh(world.content, `waterfalls:${name}`).material;
      owned.add(material);
      if (material.map) owned.add(material.map);
    }
    const spies = [...owned].map((resource) => vi.spyOn(resource, 'dispose'));
    // When
    world.dispose();
    world.dispose();
    // Then
    expect(spies.every((spy) => spy.mock.calls.length === 1)).toBe(true);
    expect(world.content.children.filter((object) => object instanceof Mesh)).toHaveLength(0);
  });
});
