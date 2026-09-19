import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { mountMap } from '../../../src/world/map/index.js';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { defaultWorldView } from '../../../src/world/model/index.js';
import type { WorldRenderer } from '../../../src/world/model/renderer-types.js';

const mounted: WorldRenderer[] = [];
afterEach(() => {
  for (const renderer of mounted.splice(0)) renderer.dispose();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function setup() {
  const host = document.createElement('div');
  host.style.cssText = 'width:1000px;height:650px';
  document.body.append(host);
  const callbacks = { onSelect: vi.fn(), onViewChange: vi.fn(), onError: vi.fn() };
  const view = { ...defaultWorldView(TINY_WORLD_SCENE), motion: 'off' as const };
  const renderer = mountMap(host, TINY_WORLD_SCENE, view, callbacks);
  mounted.push(renderer);
  return { host, callbacks, renderer, view };
}

function node(host: HTMLElement, selector: string): SVGElement {
  const found = host.querySelector(selector);
  if (!(found instanceof SVGElement)) throw new TypeError(`Missing SVG element: ${selector}`);
  return found;
}

describe('mounted map', () => {
  it('selects the exact leap-day record after pointer activation', async () => {
    const { host, callbacks } = setup();
    await userEvent.click(node(host, '[data-day-id="day:2024-02-29"]'));
    expect(callbacks.onSelect).toHaveBeenLastCalledWith('day:2024-02-29');
    expect(node(host, '[data-day-id="day:2024-02-29"]').getAttribute('aria-pressed')).toBe('true');
  });

  it('moves roving keyboard focus and selects the focused source date', async () => {
    const { host, callbacks } = setup();
    node(host, '[data-day-id="day:2024-02-28"]').focus();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    expect(callbacks.onSelect).toHaveBeenLastCalledWith('day:2024-02-29');
    expect(document.activeElement?.getAttribute('data-day-id')).toBe('day:2024-02-29');
  });

  it('keeps actual camera state after zoom, focused navigation, and remount', async () => {
    const { host, renderer, callbacks } = setup();
    node(host, 'svg').focus();
    await userEvent.keyboard('+');
    const zoomed = renderer.getView();
    expect(zoomed.camera.zoom).toBeGreaterThan(1);
    expect(callbacks.onViewChange).toHaveBeenCalled();
    renderer.focus({ kind: 'day', date: '2024-02-29' });
    const saved = renderer.getView();
    renderer.dispose();
    const restored = mountMap(host, TINY_WORLD_SCENE, saved, callbacks);
    mounted.push(restored);
    expect(restored.getView().camera).toEqual(saved.camera);
    restored.reset();
    expect(restored.getView().camera.zoom).toBe(1);
    expect(restored.getView().focus.kind).toBe('world');
  });

  it('exports a static standalone SVG and a nonblank PNG at requested dimensions', async () => {
    const { renderer } = setup();
    const svg = await renderer.capture({ format: 'svg', width: 640, height: 420 });
    const parsed = new DOMParser().parseFromString(await svg.text(), 'image/svg+xml');
    expect(
      parsed.querySelector('parsererror,script,image,animate,animateTransform,foreignObject'),
    ).toBeNull();
    const png = await renderer.capture({ format: 'png', width: 640, height: 420 });
    const bitmap = await createImageBitmap(png);
    expect([bitmap.width, bitmap.height]).toEqual([640, 420]);
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 420;
    const context = canvas.getContext('2d');
    if (!context) throw new TypeError('Canvas 2D unavailable');
    context.drawImage(bitmap, 0, 0);
    expect(new Set(context.getImageData(0, 0, 640, 420).data).size).toBeGreaterThan(100);
    bitmap.close();
  });

  it('does not pick scenery and releases detached handlers on disposal', async () => {
    const { host, renderer, callbacks } = setup();
    const svg = node(host, 'svg');
    svg.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(callbacks.onSelect).not.toHaveBeenCalled();
    renderer.dispose();
    const before = callbacks.onViewChange.mock.calls.length;
    svg.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true }));
    expect(callbacks.onViewChange).toHaveBeenCalledTimes(before);
    expect(host.childElementCount).toBe(0);
  });

  it('starts no animation frame while motion is off', () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    const { host } = setup();
    expect(raf).not.toHaveBeenCalled();
    expect(host.querySelector('animate,animateTransform')).toBeNull();
  });
});
