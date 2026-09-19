import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  BoxGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  OrthographicCamera,
} from 'three';
import { attachPicking } from '../../../src/world/three/picking.js';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { ACTOR_SCENE, browserFrames, openThree } from '../three/browser-harness.js';

describe('Three camera interaction and picking', () => {
  it('picks the real dated terrain and excludes a future day during replay', async () => {
    const onSelect = vi.fn();
    const { canvas, port } = await openThree(
      {
        camera: {
          position: { x: 1, y: 18, z: 0.1 },
          target: { x: 1, y: 0.4, z: 0 },
          zoom: 2,
        },
      },
      { onSelect },
    );
    await userEvent.click(canvas);
    const expected = TINY_WORLD_SCENE.days.find((day) => day.date === '2024-02-29');
    expect(onSelect).toHaveBeenLastCalledWith(expected?.id);
    expect(port.getView().selectedId).toBe(expected?.id);
    onSelect.mockClear();
    port.update({ ...port.getView(), cursorDate: '2024-02-28' });
    await browserFrames();
    await userEvent.click(canvas);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('supports keyboard zoom, orbit panning and Home reset', async () => {
    const onViewChange = vi.fn();
    const { canvas, port } = await openThree({}, { onViewChange });
    canvas.focus();
    const initial = port.getView().camera;
    await userEvent.keyboard('+');
    expect(port.getView().camera.zoom).toBeGreaterThan(initial.zoom);
    await userEvent.keyboard('-{ArrowRight}');
    expect(port.getView().camera.target).not.toEqual(initial.target);
    expect(onViewChange).toHaveBeenCalled();
    await userEvent.keyboard('{Home}');
    expect(port.getView().focus.kind).toBe('world');
    expect(port.getView().camera.zoom).toBeCloseTo(1);
  });

  it.each(['full', 'off'] as const)(
    'keeps manual key navigation after later rendered frames while motion is %s',
    async (motion) => {
      // Given: the camera follows a real actor in the active motion mode.
      const onViewChange = vi.fn();
      const { canvas, host, port } = await openThree(
        { motion, followActorId: 'walker' },
        { onViewChange },
        ACTOR_SCENE,
      );
      canvas.focus();
      for (const key of [
        '{ArrowRight}',
        '{ArrowLeft}',
        '{ArrowUp}',
        '{ArrowDown}',
        '+',
        '=',
        '-',
        '{Home}',
      ]) {
        port.focus({ kind: 'actor', actorId: 'walker' });
        port.update({ ...port.getView(), camera: { ...port.getView().camera, zoom: 2 } });
        await browserFrames();
        const before = port.getView().camera;
        onViewChange.mockClear();

        // When: a manual navigation key is followed by actual renderer frames.
        await userEvent.keyboard(key);
        const navigated = port.getView();
        const rendered = Number(canvas.dataset.frames);
        host.style.width = `${host.clientWidth + 1}px`;
        await expect.poll(() => Number(canvas.dataset.frames)).toBeGreaterThan(rendered);
        if (motion === 'full')
          await expect.poll(() => Number(canvas.dataset.frames)).toBeGreaterThan(rendered + 2);

        // Then: the new camera pose persists and view callbacks report follow released.
        expect(navigated.followActorId, key).toBeUndefined();
        expect(navigated.camera, key).not.toEqual(before);
        expect(port.getView().camera.target, key).toEqual(navigated.camera.target);
        expect(port.getView().camera.zoom, key).toBe(navigated.camera.zoom);
        expect(port.getView().followActorId, key).toBeUndefined();
        expect(onViewChange).toHaveBeenLastCalledWith(
          expect.objectContaining({ followActorId: undefined }),
        );
      }
    },
    60_000,
  );

  it.each(['full', 'off'] as const)(
    'keeps actor follow for unrelated keys while motion is %s',
    async (motion) => {
      // Given: an actor-following camera with keyboard focus.
      const { canvas, port } = await openThree(
        { motion, followActorId: 'walker' },
        {},
        ACTOR_SCENE,
      );
      canvas.focus();

      // When: keys without camera navigation actions are pressed.
      await userEvent.keyboard('a{Shift}{Escape}');
      await browserFrames();

      // Then: follow remains active in either motion mode.
      expect(port.getView().followActorId).toBe('walker');
    },
    60_000,
  );

  it('follows canonical actor positions and stops following when navigation begins', async () => {
    const onViewChange = vi.fn();
    const { canvas, port } = await openThree(
      { motion: 'full', followActorId: 'walker' },
      { onViewChange },
      ACTOR_SCENE,
    );
    await expect.poll(() => port.getView().elapsedSeconds).toBeGreaterThan(0.1);
    const target = port.getView().camera.target;
    await expect.poll(() => port.getView().camera.target.x).not.toBe(target.x);
    const rect = canvas.getBoundingClientRect();
    canvas.dispatchEvent(
      new WheelEvent('wheel', {
        deltaY: -50,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        cancelable: true,
      }),
    );
    expect(port.getView().followActorId).toBeUndefined();
    expect(onViewChange).toHaveBeenCalled();
    port.focus({ kind: 'actor', actorId: 'walker' });
    expect(port.getView().focus).toEqual({ kind: 'actor', actorId: 'walker' });
    expect(port.getView().followActorId).toBe('walker');
    port.update({ ...port.getView(), motion: 'subtle' });
    await browserFrames();
    const paused = port.getView();
    await browserFrames(5);
    expect(port.getView().elapsedSeconds).toBe(paused.elapsedSeconds);
    expect(port.getView().camera.target).toEqual(paused.camera.target);
  }, 60_000);

  it('handles a camera saved at its target and clamps unsafe zoom', async () => {
    const { port } = await openThree({
      camera: { position: { x: 0, y: 0, z: 0 }, target: { x: 0, y: 0, z: 0 }, zoom: 0 },
    });
    const camera = port.getView().camera;
    expect(camera.zoom).toBe(0.35);
    expect(Math.hypot(camera.position.x, camera.position.y, camera.position.z)).toBeGreaterThan(8);
    port.update({ ...port.getView(), camera: { ...camera, zoom: 100 } });
    expect(port.getView().camera.zoom).toBe(18);
    port.update({ ...port.getView(), camera: { ...camera, position: { x: 1, y: 1, z: 1 } } });
    expect(port.getView().camera.position.y).toBeGreaterThan(1);
    await browserFrames();
  });

  it('raycasts instance zero correctly, rejects drags and releases pointer listeners', () => {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:400px;height:300px';
    document.body.append(canvas);
    const content = new Group();
    const batch = new InstancedMesh(new BoxGeometry(0.6, 0.6, 0.6), new MeshStandardMaterial(), 2);
    batch.setMatrixAt(0, new Matrix4().makeTranslation(-1, 0, 0));
    batch.setMatrixAt(1, new Matrix4().makeTranslation(1, 0, 0));
    content.add(batch);
    const camera = new OrthographicCamera(-2, 2, 1.5, -1.5, 0.1, 10);
    camera.position.z = 5;
    const onSelect = vi.fn();
    const events = new AbortController();
    attachPicking(
      canvas,
      camera,
      {
        content,
        update() {},
        dispose() {},
        identify: (hit) => (hit.instanceId === undefined ? undefined : `asset-${hit.instanceId}`),
      },
      onSelect,
      events.signal,
    );
    const rect = canvas.getBoundingClientRect();
    function pointer(type: string, x: number, overrides: PointerEventInit = {}) {
      canvas.dispatchEvent(
        new PointerEvent(type, {
          pointerId: 1,
          isPrimary: true,
          button: 0,
          clientX: rect.left + x,
          clientY: rect.top + 150,
          ...overrides,
        }),
      );
    }
    try {
      pointer('pointerdown', 100);
      pointer('pointerup', 100);
      expect(onSelect).toHaveBeenLastCalledWith('asset-0');
      pointer('pointerdown', 300);
      pointer('pointerup', 300);
      expect(onSelect).toHaveBeenLastCalledWith('asset-1');
      onSelect.mockClear();
      pointer('pointerdown', 100);
      pointer('pointerup', 300);
      pointer('pointerdown', 100);
      pointer('pointercancel', 100);
      pointer('pointerup', 100);
      pointer('pointerdown', 100, { button: 2 });
      pointer('pointerup', 100);
      pointer('pointerdown', 100, { isPrimary: false });
      pointer('pointerup', 100);
      pointer('pointerdown', 100);
      pointer('pointerup', 100, { pointerId: 2 });
      pointer('pointerdown', 200);
      pointer('pointerup', 200);
      canvas.style.display = 'none';
      pointer('pointerdown', 100);
      pointer('pointerup', 100);
      canvas.style.display = '';
      expect(onSelect).not.toHaveBeenCalled();
      events.abort();
      pointer('pointerdown', 100);
      pointer('pointerup', 100);
      expect(onSelect).not.toHaveBeenCalled();
    } finally {
      events.abort();
      canvas.remove();
      batch.dispose();
      batch.geometry.dispose();
      if (!Array.isArray(batch.material)) batch.material.dispose();
    }
  });
});
