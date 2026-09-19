import { afterEach, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { mountMap } from '../../../src/world/map/index.js';
import type { WorldRenderer } from '../../../src/world/model/renderer-types.js';
import { mapScene, mapView } from '../map/fixtures.js';

let renderer: WorldRenderer | undefined;
afterEach(() => {
  renderer?.dispose();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function setup() {
  const host = document.createElement('div');
  host.style.cssText = 'width:900px;height:600px';
  document.body.append(host);
  const callbacks = { onSelect: vi.fn(), onViewChange: vi.fn(), onError: vi.fn() };
  const map = mountMap(host, mapScene, mapView, callbacks);
  renderer = map;
  const svg = host.querySelector('svg');
  if (!svg) throw new TypeError('Map SVG missing');
  const box = svg.getBoundingClientRect();
  const point = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  const pointer = (type: string, id: number, dx: number, dy: number): void => {
    svg.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        pointerId: id,
        button: 0,
        pointerType: 'touch',
        clientX: point.x + dx,
        clientY: point.y + dy,
      }),
    );
  };
  return { host, map, svg, callbacks, pointer, point };
}

it('pans with a pointer and pinches around the gesture center without selecting scenery', () => {
  const { map, svg, callbacks, pointer } = setup();
  const before = map.getView().camera;
  pointer('pointerdown', 1, 0, 0);
  pointer('pointermove', 1, 70, 35);
  pointer('pointerup', 1, 70, 35);
  svg.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  expect(map.getView().camera.target).not.toEqual(before.target);
  expect(callbacks.onSelect).not.toHaveBeenCalled();
  pointer('pointerdown', 2, -40, 0);
  pointer('pointerdown', 3, 40, 0);
  pointer('pointermove', 3, 100, 0);
  pointer('pointercancel', 2, -40, 0);
  pointer('pointerup', 3, 100, 0);
  expect(map.getView().camera.zoom).toBeGreaterThan(before.zoom);
});

it('zooms by wheel and supports bounded keyboard zoom plus world reset', async () => {
  const { map, svg, point } = setup();
  svg.dispatchEvent(
    new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: -100,
      clientX: point.x,
      clientY: point.y,
    }),
  );
  expect(map.getView().camera.zoom).toBeGreaterThan(1);
  svg.focus();
  await userEvent.keyboard('{ArrowLeft}{ArrowUp}{ArrowRight}{ArrowDown}-');
  for (let index = 0; index < 30; index++)
    svg.dispatchEvent(new KeyboardEvent('keydown', { key: '-', bubbles: true }));
  expect(map.getView().camera.zoom).toBe(0.45);
  await userEvent.keyboard('{Escape}');
  expect(map.getView().camera.zoom).toBe(1);
});

it('keeps a focused date reachable after changing presentation and replay', async () => {
  const { host, map, callbacks } = setup();
  const day = host.querySelector<SVGElement>('[data-day-id="day:2024-02-28"]');
  day?.focus();
  map.update({ ...map.getView(), lighting: 'night', weather: 'snow' });
  expect(document.activeElement?.getAttribute('data-day-id')).toBe('day:2024-02-28');
  await userEvent.keyboard('{End}{Home}{ArrowUp}{ArrowDown} ');
  expect(callbacks.onSelect).toHaveBeenLastCalledWith('day:2024-02-29');
  map.update({ ...map.getView(), cursorDate: '2024-02-28' });
  expect(host.querySelector('[data-day-id="day:2024-02-29"]')).toBeNull();
  expect(document.activeElement?.getAttribute('data-day-id')).toBe('day:2024-02-28');
  expect(host.querySelector('[data-day-id="day:2024-02-28"]')?.getAttribute('tabindex')).toBe('0');
});

it('ignores unsupported mouse buttons and unfocused keyboard letters', () => {
  const { svg, map, pointer } = setup();
  const before = map.getView().camera;
  svg.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 5, button: 2 }));
  pointer('pointermove', 5, 100, 100);
  svg.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
  expect(map.getView().camera).toEqual(before);
});

it('returns the actual bounded camera after an external view requests an extreme zoom', () => {
  const { map } = setup();
  map.update({ ...map.getView(), camera: { ...map.getView().camera, zoom: 0.1 } });
  expect(map.getView().camera.zoom).toBe(0.45);
});
