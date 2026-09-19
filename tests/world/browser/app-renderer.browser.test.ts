import { afterEach, expect, test } from 'vitest';
import { createRendererHost } from '../../../src/world/app/renderer.js';
import type { RendererEvents } from '../../../src/world/app/renderer.js';
import { defaultWorldView } from '../../../src/world/model/index.js';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import type {
  WorldRenderer,
  WorldRendererCallbacks,
} from '../../../src/world/model/renderer-types.js';

const dispose: (() => void)[] = [];
afterEach(() => {
  for (const stop of dispose.splice(0)) stop();
  document.body.replaceChildren();
});

function pending<T>() {
  let finish: (value: T) => void = () => {
    throw new TypeError('Promise has not started');
  };
  const promise = new Promise<T>((resolve) => {
    finish = resolve;
  });
  return { promise, finish };
}

function renderer(kind: 'map' | 'three') {
  let view = defaultWorldView(TINY_WORLD_SCENE);
  let stopped = 0;
  const value: WorldRenderer = {
    kind,
    capabilities: { png: true, svg: kind === 'map', glb: kind === 'three', follow: true },
    update: (next) => {
      view = next;
    },
    focus: () => {},
    reset: () => {},
    getView: () => view,
    capture: async () => new Blob(['image']),
    dispose: () => {
      stopped++;
    },
  };
  return { value, stopped: () => stopped };
}

function events(errors: string[], modes: string[]): RendererEvents {
  return {
    onSelect: () => {},
    onViewChange: () => {},
    onLoadingChange: () => {},
    onError: (error) => {
      errors.push(error.message);
    },
    onModeChange: (mode) => {
      modes.push(mode);
    },
  };
}

test('disposes a late 3D mount when the user has already returned to the map', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const delayed = pending<WorldRenderer>();
  const old = renderer('three');
  const map = renderer('map');
  const modes: string[] = [];
  const mounted = createRendererHost(
    host,
    {
      map: () => map.value,
      three: () => delayed.promise,
    },
    events([], modes),
  );
  dispose.push(mounted.dispose);
  const first = mounted.show(TINY_WORLD_SCENE, defaultWorldView(TINY_WORLD_SCENE), 'three');
  await mounted.show(TINY_WORLD_SCENE, defaultWorldView(TINY_WORLD_SCENE), 'map');

  delayed.finish(old.value);
  expect(await first).toBe(false);

  expect(mounted.current()?.kind).toBe('map');
  expect(modes).toEqual(['map']);
  expect(old.stopped()).toBe(1);
  expect(host.children.length).toBe(1);
});

test('keeps a usable map and explains a WebGL startup failure', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const map = renderer('map');
  const errors: string[] = [];
  const mounted = createRendererHost(
    host,
    {
      map: () => map.value,
      three: () => Promise.reject(new Error('WebGL unavailable')),
    },
    events(errors, []),
  );
  dispose.push(mounted.dispose);

  expect(await mounted.show(TINY_WORLD_SCENE, defaultWorldView(TINY_WORLD_SCENE), 'three')).toBe(
    true,
  );

  expect(mounted.current()?.kind).toBe('map');
  expect(errors.join(' ')).toContain('WebGL unavailable');
  expect(host.children.length).toBe(1);
});

test('preserves the displayed world when a replacement renderer fails', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const map = renderer('map');
  let attempt = 0;
  const mounted = createRendererHost(
    host,
    {
      map: () => {
        if (++attempt > 1) throw new Error('Invalid new world');
        return map.value;
      },
      three: () => map.value,
    },
    events([], []),
  );
  dispose.push(mounted.dispose);
  await mounted.show(TINY_WORLD_SCENE, defaultWorldView(TINY_WORLD_SCENE), 'map');

  await expect(
    mounted.show(TINY_WORLD_SCENE, defaultWorldView(TINY_WORLD_SCENE), 'map'),
  ).rejects.toThrow('Invalid new world');

  expect(mounted.current()).toBe(map.value);
  expect(map.stopped()).toBe(0);
  expect(host.children.length).toBe(1);
});

test('keeps live callbacks after a rejected replacement and ignores callbacks from disposed views', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const callbacks: WorldRendererCallbacks[] = [];
  const selected: string[] = [];
  const updates: number[] = [];
  const first = renderer('map');
  const next = renderer('map');
  let attempt = 0;
  const mounted = createRendererHost(
    host,
    {
      map: (_host, _scene, _view, events) => {
        callbacks.push(events);
        if (++attempt === 2) throw new Error('Replacement failed');
        return attempt === 1 ? first.value : next.value;
      },
      three: () => next.value,
    },
    {
      ...events([], []),
      onSelect: (id) => {
        selected.push(id);
      },
      onViewChange: (view) => {
        updates.push(view.camera.zoom);
      },
    },
  );
  dispose.push(mounted.dispose);
  const view = defaultWorldView(TINY_WORLD_SCENE);
  await mounted.show(TINY_WORLD_SCENE, view, 'map');
  await expect(mounted.show(TINY_WORLD_SCENE, view, 'map')).rejects.toThrow('Replacement failed');
  callbacks[0]?.onSelect('day:2024-02-28');
  callbacks[0]?.onViewChange({ ...view, camera: { ...view.camera, zoom: 2 } });
  expect(selected).toEqual(['day:2024-02-28']);
  expect(updates).toEqual([2]);
  await mounted.show(TINY_WORLD_SCENE, view, 'map');
  callbacks[0]?.onSelect('stale');
  callbacks[0]?.onViewChange(view);
  callbacks[0]?.onError(new Error('Old context'));
  expect(selected).toEqual(['day:2024-02-28']);
  expect(updates).toEqual([2]);
});

test('falls back after a live GPU context loss and disposes a mount arriving after page departure', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  let live: WorldRendererCallbacks | undefined;
  const gpu = renderer('three');
  const map = renderer('map');
  const failures: string[] = [];
  const mounted = createRendererHost(
    host,
    {
      map: () => map.value,
      three: (_host, _scene, _view, callbacks) => {
        live = callbacks;
        return gpu.value;
      },
    },
    events(failures, []),
  );
  dispose.push(mounted.dispose);
  await mounted.show(TINY_WORLD_SCENE, defaultWorldView(TINY_WORLD_SCENE), 'three');
  live?.onError(new Error('GPU context lost'));
  await expect.poll(() => mounted.current()?.kind).toBe('map');
  expect(gpu.stopped()).toBe(1);
  expect(failures).toContain('GPU context lost');
  const late = pending<WorldRenderer>();
  const abandoned = renderer('three');
  const departing = createRendererHost(
    host,
    { map: () => map.value, three: () => late.promise },
    events([], []),
  );
  const loading = departing.show(TINY_WORLD_SCENE, defaultWorldView(TINY_WORLD_SCENE), 'three');
  departing.dispose();
  late.finish(abandoned.value);
  expect(await loading).toBe(false);
  expect(abandoned.stopped()).toBe(1);
});

test('reports a failed GPU fallback without silently removing the last visible scene', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  let live: WorldRendererCallbacks | undefined;
  const gpu = renderer('three');
  const failures: string[] = [];
  const mounted = createRendererHost(
    host,
    {
      map: () => {
        throw new Error('Map allocation failed');
      },
      three: (_host, _scene, _view, callbacks) => {
        live = callbacks;
        return gpu.value;
      },
    },
    events(failures, []),
  );
  dispose.push(mounted.dispose);
  await mounted.show(TINY_WORLD_SCENE, defaultWorldView(TINY_WORLD_SCENE), 'three');
  live?.onError(new Error('GPU context lost'));
  await expect.poll(() => failures).toContain('Map allocation failed');
  expect(mounted.current()).toBe(gpu.value);
});
