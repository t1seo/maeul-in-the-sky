import { afterEach, beforeEach, expect, test } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { createWorldSession, type WorldSession } from '../../../src/world/app/session.js';
import { createWorldDocument } from '../../../src/world/data/index.js';
import { defaultWorldView } from '../../../src/world/model/index.js';
import type { PublicRepoRecord } from '../../../src/world/model/types.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { html } from '../../../src/world/app/dom.js';

let session: WorldSession | undefined;
beforeEach(() => {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
  html('world-host').style.cssText = 'width:800px;height:500px';
});
afterEach(() => {
  session?.dispose();
  session = undefined;
  document.body.replaceChildren();
});

async function prepare() {
  const initial = createWorldDocument({
    scene: TINY_WORLD_SCENE,
    sourceSnapshot: TINY_WORLD_INPUT.snapshot,
  });
  const releases: (() => void)[] = [];
  let delayed = false;
  let fail = false;
  session = createWorldSession(initial, {
    map: (...args) => {
      if (fail) throw new Error('Replacement rejected');
      return mountMap(...args);
    },
    three: async (...args) => {
      if (delayed) await new Promise<void>((resolve) => releases.push(resolve));
      if (fail) throw new Error('Replacement rejected');
      return { ...mountMap(...args), kind: 'three' as const };
    },
  });
  await session.open(initial, 'three');
  delayed = true;
  return {
    initial,
    session,
    release: (index = 0) => {
      const finish = releases.splice(index, 1)[0];
      if (!finish) throw new Error('Expected a delayed mount');
      finish();
    },
    fail: (value: boolean) => {
      fail = value;
    },
  };
}

test('preserves live date and atmosphere during rebuild while reframing the new terrain', async () => {
  const { session, release } = await prepare();
  session.update({ camera: { ...session.current().view.camera, zoom: 3 } });
  const rebuilding = session.rebuild({ layout: 'seasonal' });
  session.update({
    cursorDate: '2024-02-28',
    selectedId: 'day:2024-02-28',
    lighting: 'night',
    motion: 'off',
    weather: 'rain',
    elapsedSeconds: 12.5,
  });
  release();
  await rebuilding;
  const current = session.current();
  expect(current.scene.settings.layout).toBe('seasonal');
  expect(current.view).toMatchObject({
    cursorDate: '2024-02-28',
    selectedId: 'day:2024-02-28',
    lighting: 'night',
    motion: 'off',
    weather: 'rain',
    elapsedSeconds: 12.5,
    focus: { kind: 'world' },
    camera: defaultWorldView(current.scene).camera,
  });
  expect(current.view.followActorId).toBeUndefined();
});

test('composes rapid settings changes even when the newest mount finishes first', async () => {
  const { session, release } = await prepare();
  const layout = session.rebuild({ layout: 'island' });
  const culture = session.rebuild({ culture: 'korean', hemisphere: 'south' });
  release(1);
  await culture;
  release();
  await layout;
  expect(session.current().scene.settings).toMatchObject({
    layout: 'island',
    culture: 'korean',
    hemisphere: 'south',
  });
  expect(html('world-host').childElementCount).toBe(1);
});

test('switching back to map retains a pending layout and newest live view', async () => {
  const { session, release } = await prepare();
  const rebuilding = session.rebuild({ layout: 'seasonal' });
  session.update({ lighting: 'night', motion: 'off' });
  await session.switchRenderer('map');
  release();
  await rebuilding;
  expect(session.current().scene.settings.layout).toBe('seasonal');
  expect(session.current().view).toMatchObject({ lighting: 'night', motion: 'off' });
  expect(session.mode()).toBe('map');
});

test('rebuilding during a renderer switch retains the requested rendering mode', async () => {
  const { session, release } = await prepare();
  await session.switchRenderer('map');
  const switching = session.switchRenderer('three');
  const rebuilding = session.rebuild({ layout: 'island' });
  release(1);
  await rebuilding;
  release();
  await switching;
  expect(session.mode()).toBe('three');
  expect(session.current().scene.settings.layout).toBe('island');
});

test('an explicit saved world replaces pending settings and keeps its saved view', async () => {
  const { initial, session, release } = await prepare();
  const rebuilding = session.rebuild({ layout: 'island' });
  const saved = { ...initial, view: { ...initial.view, lighting: 'sunset' as const } };
  const loading = session.open(saved, 'three');
  session.update({ lighting: 'night' });
  release(1);
  await loading;
  release();
  await rebuilding;
  expect(session.current()).toEqual(saved);
});

test('failed replacement discards its settings before a subsequent successful rebuild', async () => {
  const { initial, session, release, fail } = await prepare();
  const rebuilding = session.rebuild({ layout: 'island' });
  fail(true);
  const rejection = expect(rebuilding).rejects.toThrow('Replacement rejected');
  release();
  await rejection;
  expect(session.current().scene).toBe(initial.scene);
  fail(false);
  const next = session.rebuild({ culture: 'korean' });
  release();
  await next;
  expect(session.current().scene.settings.layout).toBe(initial.scene.settings.layout);
  expect(session.current().scene.settings.culture).toBe('korean');
});

test('reframes the new layout even if its previous camera was edited while loading', async () => {
  const { session, release } = await prepare();
  const camera = { ...session.current().view.camera, zoom: 2 };
  session.update({ camera });
  const rebuilding = session.rebuild({ layout: 'seasonal' });
  session.update({ camera: { ...camera, zoom: 3 } });
  session.update({ camera });
  release();
  await rebuilding;
  expect(session.current().view.camera).toEqual(defaultWorldView(session.current().scene).camera);
});

test('keeps pending repository additions and removals when another setting changes', async () => {
  const { session, release } = await prepare();
  const repositories: readonly PublicRepoRecord[] = [
    {
      id: '1',
      fullName: 'octocat/garden',
      url: 'https://github.com/octocat/garden',
      description: null,
      visibility: 'public',
      createdAt: '2024-02-28T00:00:00Z',
      retrievedAt: '2024-03-01T00:00:00Z',
      releases: [],
      coverage: { complete: true },
    },
  ];
  const adding = session.rebuild({}, repositories);
  const layout = session.rebuild({ layout: 'island' });
  release();
  await adding;
  release();
  await layout;
  expect(session.current().repositoryData).toEqual(repositories);
  const removing = session.rebuild({}, []);
  const culture = session.rebuild({ culture: 'korean', layout: 'seasonal' });
  session.focus({ kind: 'entity', entityId: 'repo:1' });
  release();
  await removing;
  release();
  await culture;
  expect(session.current().repositoryData).toEqual([]);
  expect(session.current().scene.settings.layout).toBe('seasonal');
  expect(session.current().view.focus).toEqual({ kind: 'world' });
  expect(session.current().view.camera).toEqual(defaultWorldView(session.current().scene).camera);
  expect(() => createWorldDocument(session.current())).not.toThrow();
});

test('a late rebuild after disposal cannot replace the last committed document', async () => {
  const { initial, session, release } = await prepare();
  const rebuilding = session.rebuild({ layout: 'island' });
  session.dispose();
  release();
  await rebuilding;
  expect(session.current().scene).toBe(initial.scene);
  expect(html('world-host').childElementCount).toBe(0);
});
