import { afterEach, describe, expect, it, vi } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { createDirector } from '../../../src/tour/navigation/director.js';
import { createGround } from '../../../src/tour/navigation/ground.js';
import { loadTourModel } from '../../../src/tour/model/load.js';

const cleanups: (() => void)[] = [];
afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
  vi.restoreAllMocks();
});

async function setup(water = false) {
  const { model } = await loadTourModel({ pageUrl: 'https://example.github.io/tour/' });
  const canvas = document.createElement('canvas');
  document.body.append(canvas);
  const camera = new PerspectiveCamera(46, 1.5, 0.1, 500);
  const ground = createGround(
    model.cells.map((cell) => ({ ...cell, surface: water ? 'water' : 'grass' })),
    [],
    [],
  );
  const director = createDirector(camera, canvas, model, ground, () => {}, false);
  cleanups.push(() => {
    director.dispose();
    canvas.remove();
  });
  return { director, camera, canvas, model };
}

describe('tour camera and interruption behavior', () => {
  it('walks with keyboard and touch, looks around, and releases input on blur', async () => {
    const { director, camera, canvas } = await setup();
    director.goToStop(100);
    expect(director.walk()).toBe(true);
    const initial = camera.position.clone();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS' }));
    director.update(0.05);
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyS' }));
    expect(camera.position.distanceTo(initial)).toBeGreaterThan(0);
    director.move({ forward: 0, right: -1 });
    director.update(0.05);
    director.move({ forward: 0, right: 0 });
    vi.spyOn(canvas, 'setPointerCapture').mockImplementation(() => {});
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, clientX: 100, clientY: 100 }),
    );
    canvas.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 2, clientX: 130, clientY: 110 }),
    );
    canvas.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientX: 130, clientY: 110 }),
    );
    director.update(0.05);
    expect(camera.rotation.x).toBeLessThan(0);
    canvas.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
    window.dispatchEvent(new Event('blur'));
    expect(director.inspect().mode).toBe('orbit');
    expect(camera.position.y).toBeGreaterThan(1.55);
  });

  it('completes flights, visits the next season, and cancels at gestures or hidden tabs', async () => {
    const { director, camera, canvas } = await setup();
    director.setReduced(true);
    director.goToStop(0);
    director.setReduced(false);
    const before = camera.position.clone();
    director.goToStop(1);
    for (let frame = 0; frame < 60; frame++) director.update(0.05);
    expect(camera.position.distanceTo(before)).toBeGreaterThan(5);
    director.startTour();
    for (let frame = 0; frame < 230; frame++) director.update(0.05);
    expect(director.inspect().stopIndex).toBe(2);
    canvas.dispatchEvent(new WheelEvent('wheel'));
    expect(director.inspect().touring).toBe(false);
    director.startTour();
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(director.inspect().touring).toBe(false);
    director.overview();
    for (let frame = 0; frame < 60; frame++) director.update(0.05);
    expect(camera.position.y).toBeGreaterThan(50);
    director.setReduced(true);
    director.home();
    expect(camera.position.y).toBe(12);
    director.setReduced(false);
  });

  it('does not enter walking when every observed date is water', async () => {
    const { director } = await setup(true);
    expect(director.walk()).toBe(false);
  });

  it('fits both ends of the annual village in a portrait overview', async () => {
    const { director, camera, model } = await setup();
    camera.aspect = 390 / 844;
    camera.updateProjectionMatrix();
    director.setReduced(true);
    director.overview();
    camera.updateMatrixWorld();
    for (const x of [model.bounds.minX, model.bounds.maxX]) {
      for (const z of [model.bounds.minZ, model.bounds.maxZ]) {
        const projected = new Vector3(x, 0, z).project(camera);
        expect(Math.abs(projected.x)).toBeLessThan(1);
        expect(Math.abs(projected.y)).toBeLessThan(1);
      }
    }
  });
});
