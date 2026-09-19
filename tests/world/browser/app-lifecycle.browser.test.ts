import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { createWorldSession } from '../../../src/world/app/session.js';
import { setupLibrary } from '../../../src/world/app/library.js';
import { createWorldDocument, createWorldLibrary } from '../../../src/world/data/index.js';
import type { WorldDocumentV1 } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { button, dialog, html } from '../../../src/world/app/dom.js';

const cleanups: (() => void | Promise<void>)[] = [];
beforeEach(() => {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
  html('world-host').style.cssText = 'width:800px;height:500px';
});
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

function world(username: string) {
  return createWorldDocument({
    scene: { ...TINY_WORLD_SCENE, username, worldId: `world:${username}:2024:fixture` },
    sourceSnapshot: { ...TINY_WORLD_INPUT.snapshot, username },
  });
}

test('a delayed library read cannot replace a more recently opened saved world', async () => {
  const library = createWorldLibrary({ databaseName: `app-order-${crypto.randomUUID()}` });
  const slow = world('slow');
  const latest = world('latest');
  const slowKey = (await library.save(slow)).key;
  await library.save(latest);
  const session = createWorldSession(world('home'), { map: mountMap, three: mountMap });
  const lifetime = new AbortController();
  cleanups.push(() => lifetime.abort(), session.dispose, library.close);
  await session.open(world('home'));
  const storedLoad = library.load.bind(library);
  let finish: (document: WorldDocumentV1) => void = () => {
    throw new Error('Read not started');
  };
  const delayed = new Promise<WorldDocumentV1>((resolve) => {
    finish = resolve;
  });
  vi.spyOn(library, 'load').mockImplementation((key) =>
    key === slowKey ? delayed : storedLoad(key),
  );
  const collection = setupLibrary(
    session,
    library,
    async (document) => {
      await session.open(document);
    },
    lifetime.signal,
  );
  await collection.refresh();
  function open(name: string): void {
    const card = [...html('library-list').querySelectorAll('article')].find((node) =>
      node.textContent?.includes(`@${name}`),
    );
    card?.querySelector<HTMLButtonElement>('button')?.click();
  }
  open('slow');
  open('latest');
  await expect.poll(() => session.current().scene.username).toBe('latest');
  finish(slow);
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  expect(session.current().scene.username).toBe('latest');
});

test('an empty library updates when a pending save finishes while its dialog is open', async () => {
  const library = createWorldLibrary({ databaseName: `app-save-order-${crypto.randomUUID()}` });
  const session = createWorldSession(world('home'), { map: mountMap, three: mountMap });
  const lifetime = new AbortController();
  cleanups.push(() => lifetime.abort(), session.dispose, library.close);
  await session.open(world('home'));
  let finish = () => {};
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const save = library.save.bind(library);
  vi.spyOn(library, 'save').mockImplementation(async (...args) => {
    await pending;
    return save(...args);
  });
  const collection = setupLibrary(
    session,
    library,
    async (document) => {
      await session.open(document);
    },
    lifetime.signal,
  );
  button('save-world').click();
  dialog('library-dialog').showModal();
  await collection.refresh();
  expect(html('library-list').textContent).toContain('아직 보관한 세계가 없습니다');
  finish();
  await expect.poll(() => html('library-list').textContent).toContain('세계 열기');
  expect(html('library-list').textContent).toContain('@home');
});

test('an obsolete saved-world load cannot overwrite a world opened from another source', async () => {
  const library = createWorldLibrary({ databaseName: `app-library-source-${crypto.randomUUID()}` });
  const stored = world('stored');
  await library.save(stored);
  const session = createWorldSession(world('home'), { map: mountMap, three: mountMap });
  const lifetime = new AbortController();
  cleanups.push(() => lifetime.abort(), session.dispose, library.close);
  await session.open(world('home'));
  let finish: (document: WorldDocumentV1) => void = () => {};
  vi.spyOn(library, 'load').mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const collection = setupLibrary(
    session,
    library,
    async (document) => {
      await session.open(document);
    },
    lifetime.signal,
  );
  await collection.refresh();
  html('library-list').querySelector<HTMLButtonElement>('button')?.click();
  await session.open(world('imported'));
  finish(stored);
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  expect(session.current().scene.username).toBe('imported');
});

test('does not paint a library query after its view has been disposed', async () => {
  const library = createWorldLibrary({ databaseName: `app-library-close-${crypto.randomUUID()}` });
  const session = createWorldSession(world('home'), { map: mountMap, three: mountMap });
  const lifetime = new AbortController();
  cleanups.push(session.dispose, library.close);
  const collection = setupLibrary(
    session,
    library,
    async (document) => {
      await session.open(document);
    },
    lifetime.signal,
  );
  const pending = collection.refresh();
  lifetime.abort();
  document.body.replaceChildren();
  await pending;
  expect(document.body.childElementCount).toBe(0);
});
