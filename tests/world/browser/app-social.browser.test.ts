import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { startWorldApp } from '../../../src/world/app/app.js';
import { createWorldDocument } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { button, dialog, html, input, select } from '../../../src/world/app/dom.js';

let app: Awaited<ReturnType<typeof startWorldApp>> | undefined;
function mountPage(): void {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
  html('world-host').style.cssText = 'width:800px;height:500px';
  sessionStorage.clear();
}
beforeEach(mountPage);
afterEach(async () => {
  await app?.dispose();
  app = undefined;
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

function world(username = TINY_WORLD_SCENE.username) {
  return createWorldDocument({
    scene: { ...TINY_WORLD_SCENE, username, worldId: `world:${username}:2024:fixture` },
    sourceSnapshot: { ...TINY_WORLD_INPUT.snapshot, username },
  });
}
async function open(search = '', databaseName = `app-social-${crypto.randomUUID()}`) {
  app = await startWorldApp({
    databaseName,
    initialData: world(),
    loaders: { map: mountMap, three: mountMap },
    search,
  });
  return app;
}
function openDialog(id: string): void {
  document.querySelector<HTMLButtonElement>(`[data-dialog="${id}"]`)?.click();
}
function submit(id: string): void {
  html(id).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}
function clickIn(id: string, label: string): void {
  const target = [...html(id).querySelectorAll('button')].find(
    (node) => node.textContent === label,
  );
  if (!target) throw new Error(`Missing action: ${label}`);
  target.click();
}

test('visits a public friend URL, bookmarks it, and returns to the exact home camera', async () => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => Response.json(world('friend')));
  const databaseName = `app-bookmark-reload-${crypto.randomUUID()}`;
  let running = await open('', databaseName);
  running.session.update({
    motion: 'off',
    lighting: 'night',
    camera: { ...running.session.current().view.camera, zoom: 2 },
  });
  const home = running.session.current();
  openDialog('visits-dialog');
  input('visit-url').value = 'https://friend.github.io/world.json';
  submit('visit-form');
  await expect.poll(() => running.session.current().scene.username).toBe('friend');
  expect(html('visit-banner').hidden).toBe(false);
  openDialog('visits-dialog');
  button('bookmark-visit').click();
  await expect.poll(() => html('bookmark-list').textContent).toContain('friend’s');
  dialog('visits-dialog').close();
  button('return-own').click();
  await expect.poll(() => html('visit-banner').hidden).toBe(true);
  expect(running.session.current()).toEqual(home);
  await running.dispose();
  app = undefined;
  mountPage();
  running = await open('', databaseName);
  openDialog('visits-dialog');
  await expect.poll(() => html('bookmark-list').textContent).toContain('Remove bookmark');
  clickIn('bookmark-list', 'Visit island');
  await expect.poll(() => running.session.current().scene.username).toBe('friend');
  button('return-own').click();
  await expect.poll(() => html('visit-banner').hidden).toBe(true);
  openDialog('visits-dialog');
  await expect.poll(() => html('bookmark-list').textContent).toContain('Remove bookmark');
  clickIn('bookmark-list', 'Remove bookmark');
  await expect.poll(() => html('bookmark-list').textContent).toContain('Bookmark an island');
});

test('automatically opens a URL world and preserves it if the next public fetch fails', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(Response.json(world('friend')));
  const running = await open('?world=https%3A%2F%2Ffriend.github.io%2Fworld.json');
  await expect.poll(() => running.session.current().scene.username).toBe('friend');
  running.session.update({ motion: 'off' });
  const before = running.session.current();
  fetch.mockResolvedValueOnce(new Response('Not found', { status: 404 }));
  openDialog('visits-dialog');
  input('visit-url').value = 'https://friend.github.io/missing.json';
  submit('visit-form');
  await expect.poll(() => html('world-status').textContent).toContain('could not be found');
  expect(dialog('visits-dialog').querySelector('[role="alert"]')?.textContent).toContain(
    'could not be found',
  );
  expect(running.session.current()).toEqual(before);
  input('visit-url').value = 'file:///private-world.json';
  submit('visit-form');
  await expect.poll(() => html('world-status').textContent).toContain('public JSON URL');
  expect(running.session.current()).toEqual(before);
  button('share-world').click();
  await expect.poll(() => html('world-status').dataset.error).toBe('true');
  expect(html('share-link-field').hidden).toBe(true);
});

test('a later public visit wins when an earlier network request arrives last', async () => {
  let finish: (response: Response) => void = () => {
    throw new Error('Request not started');
  };
  const delayed = new Promise<Response>((resolve) => {
    finish = resolve;
  });
  vi.spyOn(globalThis, 'fetch')
    .mockReturnValueOnce(delayed)
    .mockResolvedValueOnce(Response.json(world('latest')));
  const running = await open();
  openDialog('visits-dialog');
  input('visit-url').value = 'https://friend.github.io/slow.json';
  submit('visit-form');
  input('visit-url').value = 'https://friend.github.io/latest.json';
  submit('visit-form');
  await expect.poll(() => running.session.current().scene.username).toBe('latest');
  finish(Response.json(world('slow')));
  await expect.poll(() => html('world-host').getAttribute('aria-busy')).toBe('false');
  expect(running.session.current().scene.username).toBe('latest');
});

test('discovers a real place, records it in the journal and filters visited places', async () => {
  const databaseName = `app-journal-reload-${crypto.randomUUID()}`;
  const running = await open('', databaseName);
  openDialog('discovery-dialog');
  await expect.poll(() => html('discovery-list').textContent).toContain('A first grove');
  clickIn('discovery-list', 'Visit this place');
  await expect.poll(() => dialog('discovery-dialog').open).toBe(false);
  expect(running.session.current().view.focus).toEqual({
    kind: 'entity',
    entityId: 'asset:2024-02-28',
  });
  await running.dispose();
  app = undefined;
  mountPage();
  await open('', databaseName);
  openDialog('discovery-dialog');
  select('discovery-filter').value = 'visited';
  select('discovery-filter').dispatchEvent(new Event('change'));
  await expect.poll(() => html('discovery-list').textContent).toContain('Visited');
  expect(html('discovery-note').textContent).toContain('Discovered 1 of');
  select('discovery-filter').value = 'new';
  select('discovery-filter').dispatchEvent(new Event('change'));
  await expect
    .poll(() => html('discovery-list').textContent)
    .toContain('No places match this view');
});

test('returns to the original home after visiting two friends in succession', async () => {
  vi.spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(Response.json(world('first')))
    .mockResolvedValueOnce(Response.json(world('second')));
  const running = await open();
  running.session.update({ motion: 'off', lighting: 'sunset' });
  const home = running.session.current();
  openDialog('visits-dialog');
  input('visit-url').value = 'https://first.github.io/world.json';
  submit('visit-form');
  await expect.poll(() => running.session.current().scene.username).toBe('first');
  openDialog('visits-dialog');
  input('visit-url').value = 'https://second.github.io/world.json';
  submit('visit-form');
  await expect.poll(() => running.session.current().scene.username).toBe('second');
  button('return-own').click();
  await expect.poll(() => html('visit-banner').hidden).toBe(true);
  expect(running.session.current()).toEqual(home);
});
