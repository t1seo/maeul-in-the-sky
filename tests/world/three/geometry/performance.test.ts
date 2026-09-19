import { InstancedMesh } from 'three';
import { describe, expect, it } from 'vitest';
import { buildWorld, defaultWorldView, frameWorld } from '../../../../src/world/model/index.js';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { inputFor, sequence } from '../../model/helpers.js';
import { measureGeometry } from './metrics.js';

describe('complete annual world budget', () => {
  it.each(['archipelago', 'island', 'seasonal'] as const)(
    'batches a real 366-day %s below 150 visible meshes and 200000 triangles',
    (layout) => {
      // Given
      const input = inputFor(sequence('2024-01-01', 366, 25));
      const scene = buildWorld({ ...input, settings: { ...input.settings, layout } });
      const view = defaultWorldView(scene);
      const world = createWorldGeometry(scene);
      // When
      world.update(frameWorld(scene, view), view);
      const measured = measureGeometry(world.content);
      // Then
      expect(measured.instances).toBeGreaterThan(1000);
      expect(measured.visibleMeshes).toBeLessThan(150);
      expect(measured.triangles).toBeLessThan(200000);
      const visibleIds = new Set<string>();
      world.content.traverseVisible((object) => {
        if (!(object instanceof InstancedMesh)) return;
        const ids: unknown = object.userData.instanceIds;
        if (Array.isArray(ids))
          for (const id of ids) if (typeof id === 'string') visibleIds.add(id);
      });
      expect(frameWorld(scene, view).entities.every((entity) => visibleIds.has(entity.id))).toBe(
        true,
      );
      world.dispose();
    },
  );

  it('restores detailed recipe parts only near month focus and all parts for export', () => {
    // Given
    const scene = buildWorld(inputFor(sequence('2024-01-01', 366, 25)));
    const view = defaultWorldView(scene);
    const world = createWorldGeometry(scene);
    const frame = frameWorld(scene, view);
    world.update(frame, view);
    const overview = measureGeometry(world.content);
    // When
    world.update(frame, { ...view, focus: { kind: 'month', monthKey: '2024-06' } });
    const month = measureGeometry(world.content);
    world.update(frame, { ...view, camera: { ...view.camera, zoom: 32 } });
    const full = measureGeometry(world.content);
    // Then
    expect(month.instances).toBeGreaterThan(overview.instances);
    expect(month.triangles).toBeLessThan(full.triangles / 2);
    expect(month.visibleMeshes).toBeLessThan(150);
    expect(full.instances).toBeGreaterThan(month.instances);
    world.dispose();
  });
});
