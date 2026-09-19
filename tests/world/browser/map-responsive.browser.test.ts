import { afterEach, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { mountMap } from '../../../src/world/map/index.js';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { defaultWorldView } from '../../../src/world/model/index.js';
import type { WorldRenderer } from '../../../src/world/model/renderer-types.js';

let renderer: WorldRenderer | undefined;
afterEach(() => {
  renderer?.dispose();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function mount() {
  const host = document.createElement('div');
  host.style.cssText = 'width:390px;height:520px';
  document.body.append(host);
  const callbacks = { onSelect: vi.fn(), onViewChange: vi.fn(), onError: vi.fn() };
  renderer = mountMap(
    host,
    TINY_WORLD_SCENE,
    { ...defaultWorldView(TINY_WORLD_SCENE), motion: 'off' },
    callbacks,
  );
  return { host, map: renderer, callbacks };
}

it('fills a portrait host with night sky and retains exact day pointer selection', async () => {
  const { host, map, callbacks } = mount();
  map.update({
    ...map.getView(),
    lighting: 'night',
    seasonOverride: 'spring',
    weather: 'seasonal',
  });
  const svg = host.querySelector('svg');
  expect(svg?.getAttribute('viewBox')).toBe('0 0 390 520');
  expect(svg?.querySelector('rect')?.getAttribute('height')).toBe('520');
  expect(svg?.querySelector('.map-viewport-frame')).toBeNull();
  if (!svg) throw new TypeError('Missing mounted map');
  expect(getComputedStyle(svg).overflow).toBe('hidden');
  const matrix = svg.getScreenCTM();
  expect(matrix?.a).toBeCloseTo(1);
  expect(matrix?.d).toBeCloseTo(1);
  const day = host.querySelector('[data-day-id="day:2024-02-29"]');
  if (!(day instanceof SVGElement)) throw new TypeError('Missing leap day');
  await userEvent.click(day);
  expect(callbacks.onSelect).toHaveBeenLastCalledWith('day:2024-02-29');
});

it('refits the viewport on orientation changes while preserving camera and date focus', async () => {
  const { host, map } = mount();
  map.focus({ kind: 'day', date: '2024-02-29' });
  const camera = map.getView().camera;
  const day = host.querySelector('[data-day-id="day:2024-02-29"]');
  if (!(day instanceof SVGElement)) throw new TypeError('Missing leap day');
  day.focus();
  host.style.width = '920px';
  host.style.height = '420px';
  await expect.poll(() => host.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 920 420');
  expect(map.getView().camera).toEqual(camera);
  expect(document.activeElement?.getAttribute('data-day-id')).toBe('day:2024-02-29');
});

it('disconnects resize observation once and leaves no output after disposal', async () => {
  const disconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect');
  const { host, map } = mount();
  map.dispose();
  map.dispose();
  host.style.width = '920px';
  expect(disconnect).toHaveBeenCalledTimes(1);
  await expect.poll(() => host.childElementCount).toBe(0);
});
