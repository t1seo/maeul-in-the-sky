import { describe, expect, it } from 'vitest';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { buildWorld, frameWorld } from '../../../src/world/model/index.js';
import { createWorldGeometry } from '../../../src/world/three/geometry/index.js';
import { browserFrames, expectSamePng, openThree } from '../three/browser-harness.js';
import { inputFor, sequence } from '../model/helpers.js';

describe('genuine Three.js browser renderer', () => {
  it('restores the actual saved projection and photograph after orbit and mobile resizing', async (context) => {
    const original = await openThree({ elapsedSeconds: 4, weather: 'clear' });
    original.port.update({
      ...original.port.getView(),
      camera: {
        position: { x: -25, y: 8, z: 5 },
        target: { x: 0, y: 1, z: 0 },
        zoom: 3,
      },
    });
    original.host.style.width = '390px';
    await expect.poll(() => original.canvas.width / original.canvas.height).toBeCloseTo(390 / 500);
    await browserFrames();
    const saved = original.port.getView();
    const photo = { format: 'png', width: 390, height: 500 } as const;
    const before = await original.port.capture(photo);
    original.port.dispose();
    const restored = await openThree(saved);
    restored.host.style.width = '390px';
    await expect.poll(() => restored.canvas.width / restored.canvas.height).toBeCloseTo(390 / 500);
    await browserFrames();
    const after = await restored.port.capture(photo);
    expect(restored.port.getView().camera).toEqual(saved.camera);
    await expectSamePng(before, after, context);
  }, 30_000);

  it.for(['off', 'subtle'] as const)(
    'freezes textured river pixels and actors in %s after full motion',
    { timeout: 30_000 },
    async (motion, context) => {
      const world = buildWorld(
        inputFor(sequence('2024-06-01', 8, 25), 2024, {
          from: '2024-06-01',
          to: '2024-06-08',
        }),
      );
      expect(world.terrain.waterways.length).toBeGreaterThan(0);
      const { port } = await openThree({ motion: 'full', elapsedSeconds: 5 }, {}, world);
      await browserFrames();
      port.update({ ...port.getView(), motion });
      await browserFrames();
      const elapsed = port.getView().elapsedSeconds;
      const first = await port.capture({ format: 'png', width: 480, height: 300 });
      await browserFrames(5);
      const second = await port.capture({ format: 'png', width: 480, height: 300 });
      expect(port.getView().elapsedSeconds).toBe(elapsed);
      await expectSamePng(first, second, context);
    },
  );

  it('captures the exact same seasonal pose while subtle motion is paused', async (context) => {
    const { port } = await openThree({
      motion: 'subtle',
      elapsedSeconds: 3,
      seasonOverride: 'spring',
      weather: 'clear',
    });
    const first = await port.capture({ format: 'png', width: 320, height: 200 });
    await browserFrames(4);
    const second = await port.capture({ format: 'png', width: 320, height: 200 });
    await expectSamePng(first, second, context);
    expect(port.getView().elapsedSeconds).toBe(3);
  });
  it('captures a nonblank PNG from real WebGL geometry', async () => {
    const { host, port } = await openThree();

    const blob = await port.capture({ format: 'png', width: 480, height: 300 });

    expect(blob.type).toBe('image/png');
    const image = await createImageBitmap(blob);
    expect([image.width, image.height]).toEqual([480, 300]);
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 300;
    const context = canvas.getContext('2d');
    if (!context) throw new TypeError('Expected canvas context');
    context.drawImage(image, 0, 0);
    image.close();
    const pixels = context.getImageData(160, 90, 160, 120).data;
    const colors = new Set<string>();
    for (let index = 0; index < pixels.length; index += 64)
      colors.add(`${pixels[index]}:${pixels[index + 1]}:${pixels[index + 2]}`);
    expect(colors.size).toBeGreaterThan(25);
    expect(Number(host.querySelector('canvas')?.dataset.triangles)).toBeGreaterThan(500);
    expect(host.querySelectorAll('canvas')).toHaveLength(1);
  });

  it('reimports a GLB containing the actual solid model', async () => {
    const { port } = await openThree();
    if (!port.exportModel) throw new TypeError('Expected GLB export');

    const model = await port.exportModel();
    const parsed = await new GLTFLoader().parseAsync(await model.arrayBuffer(), '');

    let meshes = 0;
    let texturedSurfaces = 0;
    parsed.scene.traverse((object) => {
      if (object instanceof Mesh) {
        meshes++;
        if (
          object.material instanceof MeshStandardMaterial &&
          object.material.map &&
          object.material.normalMap
        )
          texturedSurfaces++;
      }
    });
    expect(meshes).toBeGreaterThan(2);
    expect(texturedSurfaces).toBeGreaterThan(0);
    const size = new Box3().setFromObject(parsed.scene).getSize(new Vector3());
    const expected = createWorldGeometry(TINY_WORLD_SCENE);
    expected.update(frameWorld(TINY_WORLD_SCENE, port.getView()), port.getView());
    const expectedSize = new Box3().setFromObject(expected.content).getSize(new Vector3());
    expected.dispose();
    expect(size.distanceTo(expectedSize)).toBeLessThan(0.00001);
    expect(size.x).toBeGreaterThan(1);
    expect(size.y).toBeGreaterThan(1);
    expect(size.z).toBeGreaterThan(0.5);
  });

  it('focuses, reports its actual camera and disposes its canvas', async () => {
    const { host, port } = await openThree();
    const before = port.getView().camera;

    port.focus({ kind: 'day', date: '2024-02-28' });

    expect(port.getView().focus).toEqual({ kind: 'day', date: '2024-02-28' });
    expect(port.getView().camera).not.toEqual(before);
    port.dispose();
    port.dispose();
    expect(host.querySelector('canvas')).toBeNull();
  });

  it('fills wide photos with sky and restores the live canvas size', async () => {
    const { host, port } = await openThree();
    const canvas = host.querySelector('canvas');
    const liveSize = [canvas?.width, canvas?.height];
    const blob = await port.capture({ format: 'png', width: 1200, height: 240 });
    const image = await createImageBitmap(blob);
    const photo = document.createElement('canvas');
    photo.width = 1200;
    photo.height = 240;
    const context = photo.getContext('2d');
    if (!context) throw new TypeError('Expected canvas context');
    context.drawImage(image, 0, 0);
    image.close();
    for (const x of [0, 1199]) {
      const pixel = context.getImageData(x, 1, 1, 1).data;
      expect(Number(pixel[0]) + Number(pixel[1]) + Number(pixel[2])).toBeGreaterThan(120);
      expect(pixel[3]).toBe(255);
    }
    expect([canvas?.width, canvas?.height]).toEqual(liveSize);
  });

  it('resets a changed orbit to the initial world framing', async () => {
    const { port } = await openThree();
    const original = port.getView().camera;
    port.update({
      ...port.getView(),
      camera: { ...original, position: { x: -25, y: 8, z: 5 }, zoom: 3 },
    });
    port.reset();
    const restored = port.getView();
    const direction = (camera: typeof original) =>
      new Vector3().subVectors(camera.position, camera.target).normalize();
    expect(direction(restored.camera).distanceTo(direction(original))).toBeLessThan(0.000001);
    expect(restored.focus).toEqual({ kind: 'world' });
    expect(restored.camera.zoom).toBeCloseTo(1);
  });
});
