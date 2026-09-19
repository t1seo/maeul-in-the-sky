import { describe, expect, it } from 'vitest';
import { Box3, OrthographicCamera, Vector3 } from 'three';
import { fitCameraToBounds } from '../../../src/world/three/camera-fit.js';

describe('orthographic world framing', () => {
  it.each([390 / 844, 1280 / 900, 2.4])('frames elevated island corners at aspect %s', (aspect) => {
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.set(25, 28, 35);
    camera.lookAt(0, 0, 0);
    const bounds = new Box3(new Vector3(-30, -8, -14), new Vector3(48, 20, 25));

    const target = fitCameraToBounds(camera, bounds, aspect);

    expect(target.toArray()).toEqual([9, 6, 5.5]);
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z]) {
          const point = new Vector3(x, y, z).project(camera);
          expect(Math.abs(point.x)).toBeLessThan(1);
          expect(Math.abs(point.y)).toBeLessThan(1);
          expect(Math.abs(point.z)).toBeLessThan(1);
        }
  });

  it('keeps a tiny world finite and visible', () => {
    const camera = new OrthographicCamera();
    const point = new Vector3(0, 0, 0);

    fitCameraToBounds(camera, new Box3(point.clone(), point.clone()), 1);

    expect(camera.top - camera.bottom).toBeGreaterThan(0);
    expect(camera.far).toBeGreaterThan(camera.near);
    expect(point.project(camera).toArray().every(Number.isFinite)).toBe(true);
  });
});
