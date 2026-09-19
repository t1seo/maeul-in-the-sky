import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { startWorldApp } from '../../../src/world/app/app.js';
import { html } from '../../../src/world/app/dom.js';
import { createWorldDocument } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { mountLayoutPage } from './layout-harness.js';

let app: Awaited<ReturnType<typeof startWorldApp>> | undefined;
beforeEach(mountLayoutPage);
afterEach(async () => {
  await app?.dispose();
  app = undefined;
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

const world = createWorldDocument({
  scene: TINY_WORLD_SCENE,
  sourceSnapshot: TINY_WORLD_INPUT.snapshot,
});

test('requests Three directly for an explicit view link', async () => {
  // Given: an explicit 3D entry and the real map as a lightweight loader probe.
  const three = vi.fn(mountMap);
  // When: the application starts from that link.
  app = await startWorldApp({
    initialData: world,
    search: '?view=three',
    databaseName: crypto.randomUUID(),
    loaders: { map: mountMap, three },
  });
  // Then: the requested renderer receives the exact frozen scene.
  expect(three).toHaveBeenCalledOnce();
  expect(three.mock.calls[0]?.[1]).toEqual(world.scene);
});

test('loads the remote frozen world before requesting its Three view', async () => {
  // Given: a published document and an explicit profile link.
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(world));
  const three = vi.fn(mountMap);
  // When: the profile link opens.
  app = await startWorldApp({
    search: '?world=https%3A%2F%2Ffriend.github.io%2Fworld.json&view=three',
    databaseName: crypto.randomUUID(),
    loaders: { map: mountMap, three },
  });
  // Then: no sample world is sent to the Three loader.
  await expect.poll(() => three.mock.calls.length).toBe(1);
  expect(three.mock.calls[0]?.[1]).toEqual(world.scene);
  await expect.poll(() => html('world-host').getAttribute('aria-busy')).toBe('false');
  expect(app.session.current().scene).toEqual(world.scene);
});

test('keeps a usable exact-world map when direct Three entry is unavailable', async () => {
  // Given: WebGL cannot initialize on this device.
  const three = vi.fn(async () => {
    throw new Error('WebGL unavailable');
  });
  // When: the visitor follows a 3D link.
  app = await startWorldApp({
    initialData: world,
    search: '?view=three',
    databaseName: crypto.randomUUID(),
    loaders: { map: mountMap, three },
  });
  // Then: the same document remains visible with an explained fallback.
  expect(three).toHaveBeenCalledOnce();
  expect(app.session.mode()).toBe('map');
  expect(app.session.current().scene).toEqual(world.scene);
  expect(html('world-fallback').hidden).toBe(false);
});

test.each(['', '?view=unsupported'])('preserves ordinary map startup for %s', async (search) => {
  // Given / When: no supported Three intent was supplied.
  const three = vi.fn(mountMap);
  app = await startWorldApp({
    initialData: world,
    search,
    databaseName: crypto.randomUUID(),
    loaders: { map: mountMap, three },
  });
  // Then: lazy Three code is never needed.
  expect(three).not.toHaveBeenCalled();
  expect(app.session.mode()).toBe('map');
});
