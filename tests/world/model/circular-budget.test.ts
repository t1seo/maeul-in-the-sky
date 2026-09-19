import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { buildWorld, defaultWorldView, frameWorld } from '../../../src/world/model/index.js';
import { createWorldGeometry } from '../../../src/world/three/geometry/index.js';
import {
  fitCameraToBounds,
  visibleGeometryBounds,
  worldCameraFrame,
} from '../../../src/world/three/camera-fit.js';
import { focusBounds, toBounds } from '../../../src/world/three/focus.js';
import { measureGeometry } from '../three/geometry/metrics.js';
import { circleInput } from './circular-fixture.js';
import { inputFor, sequence } from './helpers.js';

describe('circular scenery rendering cost', () => {
  it('keeps annual month focus below 440000 CPU triangles before shadow passes', () => {
    // Given
    const scene = buildWorld(circleInput(inputFor(sequence('2024-01-01', 366, 25))));
    const view = defaultWorldView(scene);
    const frame = frameWorld(scene, view);
    const world = createWorldGeometry(scene);
    try {
      world.update(frame, view);
      const bounds = toBounds(scene.bounds).union(visibleGeometryBounds(world.content));
      const camera = worldCameraFrame(bounds, 800 / 500);
      const focus = { kind: 'month', monthKey: '2024-06' } as const;
      const month = focusBounds(scene, frame, focus);
      const target = month.getCenter(new Vector3());
      const fitted = camera.clone();
      fitCameraToBounds(fitted, month, 800 / 500);
      // When
      world.update(frame, {
        ...view,
        focus,
        camera: {
          ...view.camera,
          target: { x: target.x, y: target.y, z: target.z },
          zoom: Math.max(0.35, Math.min(18, camera.top / fitted.top)),
        },
      });
      // Then
      expect(measureGeometry(world.content).triangles).toBeLessThan(440_000);
    } finally {
      world.dispose();
    }
  });
});
