import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { startWorldApp } from '../../../src/world/app/app.js';
import { createWorldDocument, createWorldLibrary } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { button, dialog, html, input, select } from '../../../src/world/app/dom.js';
import type { PublicRepoRecord } from '../../../src/world/model/types.js';

let app: Awaited<ReturnType<typeof startWorldApp>> | undefined;
const databaseName = `app-state-${crypto.randomUUID()}`;
const repository: PublicRepoRecord = {
  id: 'public-garden',
  fullName: 'world-fixture/garden',
  url: 'https://github.com/world-fixture/garden',
  description: 'A public garden',
  visibility: 'public',
  createdAt: '2024-01-01T00:00:00Z',
  retrievedAt: '2024-03-01T00:00:00Z',
  releases: [],
  coverage: { complete: true },
};

beforeEach(() => {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
  html('world-host').style.cssText = 'width:800px;height:500px';
  sessionStorage.clear();
});
afterEach(async () => {
  await app?.dispose();
  app = undefined;
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

async function open() {
  app = await startWorldApp({
    databaseName,
    initialData: createWorldDocument({
      scene: TINY_WORLD_SCENE,
      sourceSnapshot: TINY_WORLD_INPUT.snapshot,
    }),
    loaders: {
      map: mountMap,
      three: async () => {
        throw new Error('WebGL unavailable');
      },
    },
    search: '',
  });
  return app;
}

function change(id: string, value: string): void {
  select(id).value = value;
  select(id).dispatchEvent(new Event('change', { bubbles: true }));
}

test('removes a selected public project without losing the current world', async () => {
  const running = await open();
  await running.session.rebuild({}, [repository]);
  running.session.selectPlace('repo:public-garden');
  const opener = document.querySelector<HTMLButtonElement>('[data-dialog="projects-dialog"]');
  opener?.click();
  const remove = [...html('project-selected').querySelectorAll('button')].find(
    (node) => node.textContent === '동네에서 빼기',
  );
  expect(remove).toBeDefined();
  remove?.click();
  await expect.poll(() => running.session.current().repositoryData.length).toBe(0);
  expect(running.session.current().view.selectedId).toBeUndefined();
  expect(html('world-host').querySelector('svg')).not.toBeNull();
});

test('persists the live renderer camera and restores it through the library', async () => {
  const running = await open();
  const renderer = running.session.renderer.current();
  expect(renderer).toBeDefined();
  const view = running.session.current().view;
  const camera = { position: { x: 14, y: 22, z: 18 }, target: { x: 3, y: 1, z: 4 }, zoom: 2.25 };
  renderer?.update({ ...view, camera, lighting: 'sunset' });
  button('save-world').click();
  const library = createWorldLibrary({ databaseName });
  await expect.poll(async () => (await library.list()).length).toBeGreaterThan(0);
  const summary = (await library.list()).find(
    (entry) => entry.worldId === TINY_WORLD_SCENE.worldId,
  );
  expect(summary).toBeDefined();
  const saved = summary ? await library.load(summary.key) : undefined;
  expect(saved?.view.camera).toEqual(camera);
  expect(saved?.view.lighting).toBe('sunset');
  running.session.reset();
  document.querySelector<HTMLButtonElement>('[data-dialog="library-dialog"]')?.click();
  await expect.poll(() => html('library-list').textContent).toContain('세계 열기');
  html('library-list').querySelector<HTMLButtonElement>('button')?.click();
  await expect.poll(() => running.session.current().view.camera).toEqual(camera);
  await library.close();
});

test('updates dates, atmosphere, follow controls and genuine map fallback', async () => {
  const running = await open();
  expect(html('day-details').textContent).toContain('0번의 기여');
  input('world-date').value = '2024-02-28';
  input('world-date').dispatchEvent(new Event('change'));
  expect(html('day-details').textContent).toContain('5번의 기여');
  button('focus-date').click();
  expect(running.session.current().view.focus).toEqual({ kind: 'day', date: '2024-02-28' });
  change('world-season', 'winter');
  change('world-lighting', 'night');
  change('world-weather', 'snow');
  change('world-motion', 'off');
  change('world-quality', 'low');
  expect(running.session.current().view).toMatchObject({
    seasonOverride: 'winter',
    lighting: 'night',
    weather: 'snow',
    motion: 'off',
    quality: 'low',
  });
  expect(html('season-note').textContent).toContain('겨울로 연출');
  button('mode-three').click();
  await expect.poll(() => html('world-fallback').hidden).toBe(false);
  await expect.poll(() => button('mode-map').getAttribute('aria-pressed')).toBe('true');
  expect(button('export-glb').disabled).toBe(true);
  button('zoom-in').click();
  expect(running.session.current().view.camera.zoom).toBeGreaterThan(1);
  button('zoom-out').click();
  button('reset-view').click();
  document.querySelector<HTMLButtonElement>('[data-dialog="atmosphere-dialog"]')?.click();
  expect(dialog('atmosphere-dialog').open).toBe(true);
  dialog('atmosphere-dialog').querySelector<HTMLButtonElement>('[data-close]')?.click();
  expect(dialog('atmosphere-dialog').open).toBe(false);
});
