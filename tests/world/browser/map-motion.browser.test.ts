import { afterEach, expect, it, vi } from 'vitest';
import { mountMap } from '../../../src/world/map/index.js';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { defaultWorldView } from '../../../src/world/model/index.js';
import type { WorldRenderer } from '../../../src/world/model/renderer-types.js';
import type { WorldScene } from '../../../src/world/model/types.js';
import { createMapClock } from '../../../src/world/map/clock.js';

let renderer: WorldRenderer | undefined;
afterEach(() => {
  renderer?.dispose();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

const scene: WorldScene = {
  ...TINY_WORLD_SCENE,
  routes: [
    {
      id: 'route:test',
      kind: 'walk',
      nodeIds: [],
      points: [
        { x: 0, y: 0.5, z: 0 },
        { x: 1, y: 0.5, z: 0 },
      ],
      length: 1,
      visibleFrom: '2024-02-28',
      loop: false,
    },
  ],
  actors: [
    {
      id: 'actor:test',
      kind: 'resident',
      modelKey: 'resident',
      routeId: 'route:test',
      speed: 0.3,
      phase: 0,
      visibleFrom: '2024-02-28',
    },
  ],
};

function schedule() {
  const pending = new Map<number, FrameRequestCallback>();
  let nextId = 0;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    pending.set(++nextId, callback);
    return nextId;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    pending.delete(id);
  });
  return {
    pending,
    tick: (time: number) => {
      const callbacks = [...pending.values()];
      pending.clear();
      for (const callback of callbacks) callback(time);
    },
  };
}

function mount(inputScene: WorldScene = scene) {
  const host = document.createElement('div');
  host.style.cssText = 'width:900px;height:600px';
  document.body.append(host);
  const callbacks = { onSelect: vi.fn(), onViewChange: vi.fn(), onError: vi.fn() };
  renderer = mountMap(host, inputScene, defaultWorldView(inputScene), callbacks);
  return { host, callbacks, map: renderer };
}

it('advances shared actor positions with one bounded clock without replacing SVG terrain', () => {
  const clock = schedule();
  const { host, callbacks, map } = mount();
  const svg = host.querySelector('svg');
  const actor = host.querySelector('[data-actor-id="actor:test"]');
  const before = actor?.getAttribute('transform');
  clock.tick(100);
  clock.tick(150);
  expect(actor?.getAttribute('transform')).not.toBe(before);
  expect(host.querySelector('svg')).toBe(svg);
  expect(map.getView().elapsedSeconds).toBeGreaterThan(0);
  expect(clock.pending.size).toBe(1);
  expect(callbacks.onViewChange).not.toHaveBeenCalled();
  map.update({ ...map.getView(), motion: 'off' });
  expect(clock.pending.size).toBe(0);
});

it('cancels scheduled actor work when the mounted renderer is disposed', () => {
  const clock = schedule();
  const { host, map } = mount();
  expect(clock.pending.size).toBe(1);
  map.dispose();
  expect(clock.pending.size).toBe(0);
  expect(host.childElementCount).toBe(0);
});

it('keeps actors static when the operating system requests reduced motion', () => {
  const clock = schedule();
  vi.spyOn(window, 'matchMedia').mockImplementation((media) =>
    Object.assign(new EventTarget(), {
      matches: true,
      media,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
    }),
  );
  mount();
  expect(clock.pending.size).toBe(0);
});

it('follows a visible actor with real camera movement and retains stale follow targets safely', () => {
  const clock = schedule();
  const { map } = mount();
  map.update({ ...map.getView(), followActorId: 'missing-actor' });
  const before = map.getView().camera;
  clock.tick(100);
  clock.tick(150);
  expect(map.getView().camera).toEqual(before);
  map.update({ ...map.getView(), followActorId: 'actor:test' });
  const followed = map.getView().camera.target;
  clock.tick(200);
  expect(map.getView().camera.target).not.toEqual(followed);
  expect(map.getView().camera.target.y).toBe(0.5);
});

it('suspends the renderer clock while the page is hidden and resumes without a time jump', () => {
  const clock = schedule();
  const { map } = mount();
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  document.dispatchEvent(new Event('visibilitychange'));
  expect(clock.pending.size).toBe(0);
  hidden.mockReturnValue(false);
  document.dispatchEvent(new Event('visibilitychange'));
  expect(clock.pending.size).toBe(1);
  clock.tick(100_000);
  expect(map.getView().elapsedSeconds).toBe(0);
  clock.tick(100_050);
  expect(map.getView().elapsedSeconds).toBeCloseTo(0.05);
});

it('suspends actor updates while the map is outside the visible viewport', async () => {
  const clock = schedule();
  const { host } = mount();
  host.style.display = 'none';
  await expect.poll(() => clock.pending.size).toBe(0);
  host.style.display = 'block';
  await expect.poll(() => clock.pending.size).toBe(1);
});

it('reports a clock-boundary failure and stops further animation work', () => {
  const scheduler = schedule();
  const host = document.createElement('div');
  document.body.append(host);
  const failure = new RangeError('Frame calculation failed');
  const onError = vi.fn();
  const clock = createMapClock(
    host,
    () => true,
    () => {
      throw failure;
    },
    onError,
  );
  scheduler.tick(100);
  scheduler.tick(150);
  expect(onError).toHaveBeenCalledWith(failure);
  expect(scheduler.pending.size).toBe(0);
  clock.dispose();
});

it('moves seasonal life and river currents without actors or replacing static terrain', () => {
  const scheduler = schedule();
  const { host, map } = mount({
    ...scene,
    actors: [],
    terrain: {
      ...scene.terrain,
      waterways: [
        {
          id: 'stream',
          islandId: scene.islands[0].id,
          kind: 'river',
          width: 0.2,
          points: [
            { x: 0, y: 0.5, z: 0 },
            { x: 1, y: 0.5, z: 0.3 },
            { x: 2, y: 0.5, z: 0 },
          ],
        },
      ],
    },
  });
  map.update({ ...map.getView(), seasonOverride: 'spring', weather: 'rain' });
  const svg = host.querySelector('svg');
  const ground = host.querySelector('.map-ground');
  const petal = host.querySelector('[data-scenery-motion="petal"]');
  const rain = host.querySelector('[data-scenery-motion="rain"]');
  const current = host.querySelector('[data-water-current]');
  const petalBefore = petal?.getAttribute('transform');
  const rainBefore = rain?.getAttribute('transform');
  const waterBefore = current?.getAttribute('stroke-dashoffset');
  scheduler.tick(100);
  scheduler.tick(180);
  expect(petal?.getAttribute('transform')).not.toBe(petalBefore);
  expect(rain?.getAttribute('transform')).not.toBe(rainBefore);
  expect(current?.getAttribute('stroke-dashoffset')).not.toBe(waterBefore);
  expect(host.querySelector('svg')).toBe(svg);
  expect(host.querySelector('.map-ground')).toBe(ground);
  expect(scheduler.pending.size).toBe(1);
});

it.each(['subtle', 'off'] as const)(
  'freezes scenery at its current pose when motion becomes %s',
  (motion) => {
    const scheduler = schedule();
    const { host, map } = mount({ ...scene, actors: [] });
    map.update({ ...map.getView(), seasonOverride: 'spring', weather: 'snow' });
    scheduler.tick(100);
    scheduler.tick(180);
    const snow = host.querySelector('[data-scenery-motion="snow"]');
    const pose = snow?.getAttribute('transform');
    const elapsed = map.getView().elapsedSeconds;
    map.update({ ...map.getView(), motion });
    scheduler.tick(8000);
    expect(snow?.getAttribute('transform')).toBe(pose);
    expect(map.getView().elapsedSeconds).toBe(elapsed);
    expect(scheduler.pending.size).toBe(0);
  },
);
