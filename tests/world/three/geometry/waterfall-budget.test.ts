import { Group } from 'three';
import { describe, expect, it } from 'vitest';
import type { WorldScene } from '../../../../src/world/model/types.js';
import { GeometryResources } from '../../../../src/world/three/geometry/resources.js';
import { createWaterways } from '../../../../src/world/three/geometry/waterways.js';
import { view } from './fixtures.js';
import { measureGeometry } from './metrics.js';
import { waterfallBatch, waterfallScene } from './waterfall-fixtures.js';

describe('waterfall geometry budget', () => {
  it.each([12, 128])(
    'batches %s waterfalls with bounded geometry and fixed draw calls',
    (count) => {
      // Given
      const fall = waterfallScene.terrain.waterways.find(
        (waterway) => waterway.kind === 'waterfall',
      );
      if (!fall) throw new TypeError('Missing waterfall fixture');
      const scene: WorldScene = {
        ...waterfallScene,
        terrain: {
          ...waterfallScene.terrain,
          tiles: [],
          waterways: Array.from({ length: count }, (_, index) => ({
            ...fall,
            id: `fall:${index}`,
          })),
        },
      };
      const content = new Group();
      const resources = new GeometryResources();
      const update = createWaterways(scene, content, resources);
      // When
      update({ ...view, seasonOverride: 'winter', elapsedSeconds: 4 });
      const batches = ['streaks', 'droplets', 'mist', 'frost'].map((name) =>
        waterfallBatch(content, name),
      );
      const geometry = batches.map((batch) => batch.geometry);
      update({ ...view, seasonOverride: 'winter', elapsedSeconds: 20 });
      // Then
      const effects = new Group();
      for (const batch of batches) effects.add(batch);
      const measured = measureGeometry(effects);
      expect(measured.visibleMeshes).toBeLessThanOrEqual(4);
      expect(measured.triangles).toBeLessThanOrEqual(count * 80);
      expect(measured.instances).toBeLessThanOrEqual(count * 20);
      expect(batches.map((batch) => batch.geometry)).toEqual(geometry);
      resources.dispose();
    },
  );
});
