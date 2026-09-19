import { afterEach, beforeEach, expect, test } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { createWorldSession } from '../../../src/world/app/session.js';
import type { WorldSession } from '../../../src/world/app/session.js';
import { createWorldDocument } from '../../../src/world/data/index.js';
import type { WorldDocumentV1 } from '../../../src/world/data/index.js';
import { buildWorld } from '../../../src/world/model/index.js';
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

function prepare(
  initial: WorldDocumentV1 = createWorldDocument({
    scene: TINY_WORLD_SCENE,
    sourceSnapshot: TINY_WORLD_INPUT.snapshot,
  }),
) {
  let finish = () => {};
  const ready = new Promise<void>((resolve) => {
    finish = resolve;
  });
  session = createWorldSession(initial, {
    map: mountMap,
    three: async (...args) => {
      await ready;
      return mountMap(...args);
    },
  });
  return { initial, session, finish };
}

test('keeps date, selection, atmosphere and camera changes made during a delayed renderer switch', async () => {
  const { initial, session, finish } = prepare();
  await session.open(initial);
  const switching = session.switchRenderer('three');
  session.update({
    cursorDate: '2024-02-28',
    selectedId: 'day:2024-02-28',
    lighting: 'night',
    motion: 'off',
  });
  session.focus({ kind: 'day', date: '2024-02-28' });
  session.update({ camera: { ...session.current().view.camera, zoom: 2.5 } });
  const expected = session.current().view;
  finish();
  await switching;
  expect(session.current().view).toEqual(expected);
  expect(session.renderer.current()?.getView()).toEqual(expected);
});

test('restores an explicitly loaded saved view instead of carrying edits from its previous view', async () => {
  const { initial, session, finish } = prepare();
  await session.open(initial);
  const saved = {
    ...initial,
    view: { ...initial.view, lighting: 'sunset' as const, motion: 'off' as const },
  };
  const loading = session.open(saved, 'three');
  session.update({ lighting: 'night', cursorDate: '2024-02-28' });
  finish();
  expect(await loading).toBe(true);
  expect(session.current().view).toEqual(saved.view);
});

test('a delayed renderer cannot restore its old scene after a different world was opened', async () => {
  const { initial, session, finish } = prepare();
  await session.open(initial);
  const switching = session.switchRenderer('three');
  session.update({ lighting: 'night', cursorDate: '2024-02-28' });
  const next = createWorldDocument({
    scene: { ...TINY_WORLD_SCENE, username: 'latest', worldId: 'world:latest:2024:fixture' },
    sourceSnapshot: { ...TINY_WORLD_INPUT.snapshot, username: 'latest' },
    view: { ...initial.view, motion: 'off' },
  });
  await session.open(next);
  finish();
  await switching;
  expect(session.current().scene.username).toBe('latest');
  expect(session.current().view).toEqual(next.view);
  expect(html('world-host').childElementCount).toBe(1);
});

test('reads renderer-local elapsed time and a following camera immediately before replacement', async () => {
  const initial = createWorldDocument({
    scene: buildWorld(TINY_WORLD_INPUT),
    sourceSnapshot: TINY_WORLD_INPUT.snapshot,
  });
  const { session, finish } = prepare(initial);
  await session.open(initial);
  const actor = initial.scene.actors[0];
  if (!actor) throw new Error('An actual generated actor is required');
  session.focus({ kind: 'actor', actorId: actor.id });
  const switching = session.switchRenderer('three');
  const live = session.renderer.current();
  if (!live) throw new Error('The original renderer must remain live during mounting');
  const current = live.getView();
  live.update({ ...current, elapsedSeconds: current.elapsedSeconds + 2, motion: 'off' });
  const expected = live.getView();
  expect(expected.followActorId).toBe(actor.id);
  finish();
  await switching;
  expect(session.current().view).toEqual(expected);
});
