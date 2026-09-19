import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { startWorldApp } from '../../../src/world/app/app.js';
import { createWorldDocument } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { dialog, html, input } from '../../../src/world/app/dom.js';

let app: Awaited<ReturnType<typeof startWorldApp>> | undefined;
beforeEach(async () => {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
  html('world-host').style.cssText = 'width:800px;height:500px';
  app = await startWorldApp({
    databaseName: `app-dialog-errors-${crypto.randomUUID()}`,
    initialData: createWorldDocument({
      scene: TINY_WORLD_SCENE,
      sourceSnapshot: TINY_WORLD_INPUT.snapshot,
    }),
    loaders: { map: mountMap, three: mountMap },
    search: '',
  });
});
afterEach(async () => {
  await app?.dispose();
  app = undefined;
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

function open(id: string): void {
  document.querySelector<HTMLButtonElement>(`[data-dialog="${id}"]`)?.click();
}
function submit(): void {
  input('visit-url').value = 'https://friend.github.io/missing.json';
  html('visit-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}
const notice = (id: string) => dialog(id).querySelector('[role="alert"]');

test('shows a visible local visit error and clears it when retrying or reopening dialogs', async () => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    async () => new Response('Missing', { status: 404 }),
  );
  open('visits-dialog');
  submit();
  await expect.poll(() => notice('visits-dialog')?.textContent).toContain('could not be found');
  expect(dialog('visits-dialog').firstElementChild).toBe(notice('visits-dialog'));
  submit();
  expect(notice('visits-dialog')).toBeNull();
  await expect.poll(() => notice('visits-dialog')?.textContent).toContain('could not be found');
  dialog('visits-dialog').close();
  open('photo-dialog');
  expect(notice('photo-dialog')).toBeNull();
  dialog('photo-dialog').close();
  open('visits-dialog');
  expect(notice('visits-dialog')).toBeNull();
});

test('a late failure from a closed visit does not become an unrelated photo dialog error', async () => {
  let finish: (response: Response) => void = () => {
    throw new Error('The public request has not started');
  };
  const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  open('visits-dialog');
  submit();
  await expect.poll(() => fetch.mock.calls.length).toBe(1);
  dialog('visits-dialog').close();
  open('photo-dialog');
  finish(new Response('Missing', { status: 404 }));
  await expect.poll(() => html('world-status').textContent).toContain('could not be found');
  expect(notice('photo-dialog')).toBeNull();
  expect(notice('visits-dialog')).toBeNull();
  expect(app?.session.current().scene.worldId).toBe(TINY_WORLD_SCENE.worldId);
});
