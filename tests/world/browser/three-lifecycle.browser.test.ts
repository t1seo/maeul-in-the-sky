import { describe, expect, it, vi } from 'vitest';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { WebGLRenderer } from 'three';
import { createThreeController } from '../../../src/world/three/controller.js';
import { mountThree } from '../../../src/world/three/index.js';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { defaultWorldView } from '../../../src/world/model/index.js';
import { browserFrames, openThree } from '../three/browser-harness.js';

describe('Three lifecycle and graceful fallback', () => {
  it('rejects unavailable WebGL without leaving a canvas behind', async () => {
    vi.spyOn(WebGL, 'isWebGL2Available').mockReturnValue(false);
    const host = document.createElement('div');
    await expect(
      mountThree(host, TINY_WORLD_SCENE, defaultWorldView(TINY_WORLD_SCENE), {
        onSelect() {},
        onViewChange() {},
        onError() {},
      }),
    ).rejects.toMatchObject({ code: 'unavailable' });
    expect(host.childElementCount).toBe(0);
  });

  it('reports a device allocation failure after the capability check', async () => {
    vi.spyOn(WebGL, 'isWebGL2Available').mockReturnValue(true);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const host = document.createElement('div');
    await expect(
      mountThree(host, TINY_WORLD_SCENE, defaultWorldView(TINY_WORLD_SCENE), {
        onSelect() {},
        onViewChange() {},
        onError() {},
      }),
    ).rejects.toMatchObject({ code: 'unavailable', cause: expect.any(Error) });
    expect(host.childElementCount).toBe(0);
  });

  it.each([new Error('GPU stopped'), 'GPU interrupted'])(
    'pauses runtime rendering errors and notifies fallback: %s',
    async (failure) => {
      const host = document.createElement('div');
      host.style.cssText = 'width:400px;height:300px';
      document.body.append(host);
      const renderer = new WebGLRenderer();
      host.append(renderer.domElement);
      const onError = vi.fn();
      const controller = createThreeController(
        renderer,
        host,
        TINY_WORLD_SCENE,
        { ...defaultWorldView(TINY_WORLD_SCENE), motion: 'off' },
        { onSelect() {}, onViewChange() {}, onError },
      );
      try {
        await controller.prepare();
        vi.spyOn(renderer, 'render').mockImplementation(() => {
          throw failure;
        });
        controller.api.update(controller.api.getView());
        await expect.poll(() => onError.mock.calls.length).toBe(1);
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        await browserFrames(3);
        expect(onError).toHaveBeenCalledTimes(1);
      } finally {
        controller.api.dispose();
        host.remove();
      }
    },
  );

  it('cleans up failed startup after shader compilation or invalid scene state', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const callbacks = { onSelect() {}, onViewChange() {}, onError() {} };
    const renderer = new WebGLRenderer();
    host.append(renderer.domElement);
    const controller = createThreeController(
      renderer,
      host,
      TINY_WORLD_SCENE,
      defaultWorldView(TINY_WORLD_SCENE),
      callbacks,
    );
    vi.spyOn(renderer, 'compileAsync').mockRejectedValue(new Error('Shader compiler unavailable'));
    try {
      await expect(controller.prepare()).rejects.toThrow('Shader compiler unavailable');
      expect(host.childElementCount).toBe(0);
      await expect(
        mountThree(
          host,
          TINY_WORLD_SCENE,
          { ...defaultWorldView(TINY_WORLD_SCENE), cursorDate: 'invalid' },
          callbacks,
        ),
      ).rejects.toMatchObject({ code: 'unavailable' });
      expect(host.childElementCount).toBe(0);
    } finally {
      controller.api.dispose();
      host.remove();
    }
  });

  it('reports context loss for map fallback and can restore before disposal', async () => {
    const onError = vi.fn();
    const { canvas, port } = await openThree({}, { onError });
    const lost = new Event('webglcontextlost', { cancelable: true });
    canvas.dispatchEvent(lost);
    expect(lost.defaultPrevented).toBe(true);
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ code: 'context-lost' }),
    );
    await expect(port.capture({ format: 'png', width: 64, height: 64 })).rejects.toMatchObject({
      code: 'context-lost',
    });
    canvas.dispatchEvent(new Event('webglcontextrestored'));
    await expect(port.capture({ format: 'png', width: 64, height: 64 })).resolves.toBeInstanceOf(
      Blob,
    );
    port.dispose();
    canvas.dispatchEvent(new Event('webglcontextlost'));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(() => port.reset()).toThrow(expect.objectContaining({ code: 'disposed' }));
  });

  it('advances a local clock only while full motion is visible and active', async () => {
    const onViewChange = vi.fn();
    const { port, canvas, host } = await openThree({ motion: 'full' }, { onViewChange });
    await expect.poll(() => port.getView().elapsedSeconds).toBeGreaterThan(0);
    expect(onViewChange).not.toHaveBeenCalled();
    port.update({ ...port.getView(), motion: 'off' });
    await browserFrames();
    const stopped = port.getView().elapsedSeconds;
    const frames = canvas.dataset.frames;
    await browserFrames(5);
    expect(port.getView().elapsedSeconds).toBe(stopped);
    expect(canvas.dataset.frames).toBe(frames);
    port.update({ ...port.getView(), motion: 'subtle' });
    await browserFrames(5);
    expect(port.getView().elapsedSeconds).toBe(stopped);
    port.update({ ...port.getView(), motion: 'full' });
    await expect.poll(() => port.getView().elapsedSeconds).toBeGreaterThan(stopped);
    host.style.transform = 'translateY(3000px)';
    await browserFrames(4);
    const offscreen = port.getView().elapsedSeconds;
    await browserFrames(5);
    expect(port.getView().elapsedSeconds).toBe(offscreen);
    host.style.transform = '';
    await expect.poll(() => port.getView().elapsedSeconds).toBeGreaterThan(offscreen);
    port.dispose();
    const final = canvas.dataset.frames;
    await browserFrames(3);
    expect(canvas.dataset.frames).toBe(final);
    expect(canvas.dataset.geometries).toBe('0');
    expect(canvas.dataset.textures).toBe('0');
    expect(canvas.getContext('webgl2')?.isContextLost()).toBe(true);
  });

  it('honors reduced motion and document visibility changes', async () => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduce = true;
    vi.spyOn(media, 'matches', 'get').mockImplementation(() => reduce);
    vi.spyOn(window, 'matchMedia').mockReturnValue(media);
    const { port } = await openThree({ motion: 'full', elapsedSeconds: 8 });
    await browserFrames(5);
    expect(port.getView().elapsedSeconds).toBe(8);
    reduce = false;
    media.dispatchEvent(new Event('change'));
    await expect.poll(() => port.getView().elapsedSeconds).toBeGreaterThan(8);
    let hidden = true;
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
    document.dispatchEvent(new Event('visibilitychange'));
    const paused = port.getView().elapsedSeconds;
    await browserFrames(5);
    expect(port.getView().elapsedSeconds).toBe(paused);
    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    await expect.poll(() => port.getView().elapsedSeconds).toBeGreaterThan(paused);
  });

  it('resizes for a mobile host without losing the frozen view', async () => {
    const { port, host, canvas } = await openThree();
    const initial = port.getView();
    host.style.width = '390px';
    host.style.height = '640px';
    await expect.poll(() => canvas.width / canvas.height).toBeCloseTo(390 / 640);
    expect([canvas.clientWidth, canvas.clientHeight]).toEqual([390, 640]);
    expect(canvas.width * canvas.height).toBeLessThanOrEqual(2_000_000);
    expect(port.getView().cursorDate).toBe(initial.cursorDate);
    expect(port.getView().camera).toEqual(initial.camera);
    port.update({ ...port.getView(), quality: 'low', weather: 'snow', lighting: 'night' });
    await browserFrames();
    expect(Number(canvas.dataset.calls)).toBeLessThan(80);
    expect(Number(canvas.dataset.triangles)).toBeLessThan(100_000);
  });
});
