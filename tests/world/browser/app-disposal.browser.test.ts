import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { startWorldApp } from '../../../src/world/app/app.js';
import { createWorldDocument } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { html, input } from '../../../src/world/app/dom.js';
import { upload } from '../../demo/browser/harness.js';

let app: Awaited<ReturnType<typeof startWorldApp>> | undefined;
beforeEach(() => {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
  html('world-host').style.cssText = 'width:800px;height:500px';
});
afterEach(async () => {
  await app?.dispose();
  app = undefined;
  vi.restoreAllMocks();
  document.body.replaceChildren();
});
const frozen = () =>
  createWorldDocument({ scene: TINY_WORLD_SCENE, sourceSnapshot: TINY_WORLD_INPUT.snapshot });
async function open() {
  app = await startWorldApp({
    databaseName: `app-disposal-${crypto.randomUUID()}`,
    initialData: frozen(),
    loaders: { map: mountMap, three: mountMap },
    search: '',
  });
  return app;
}

test('finishes an abandoned file read without touching the detached UI', async () => {
  const running = await open();
  let controller: ReadableStreamDefaultController<Uint8Array<ArrayBuffer>> | undefined;
  const stream = new ReadableStream<Uint8Array<ArrayBuffer>>({
    start(value) {
      controller = value;
    },
  });
  vi.spyOn(Blob.prototype, 'stream').mockReturnValue(stream);
  upload('world-file', frozen());
  await running.dispose();
  app = undefined;
  document.body.replaceChildren();
  controller?.enqueue(new TextEncoder().encode(JSON.stringify(frozen())));
  controller?.close();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  expect(document.body.childElementCount).toBe(0);
});

test('does not re-enable or render search controls after a pending public lookup is disposed', async () => {
  let finish: (response: Response) => void = () => {
    throw new Error('Request not started');
  };
  const response = new Promise<Response>((resolve) => {
    finish = resolve;
  });
  vi.spyOn(globalThis, 'fetch').mockReturnValue(response);
  const running = await open();
  input('project-query').value = 'octocat';
  html('project-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await running.dispose();
  app = undefined;
  document.body.replaceChildren();
  finish(Response.json([]));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  expect(document.body.childElementCount).toBe(0);
});

test('retains a cached page and still disposes when a later departure is permanent', async () => {
  await open();
  window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
  expect(html('world-host').querySelector('svg')).not.toBeNull();
  input('world-date').value = '2024-02-28';
  input('world-date').dispatchEvent(new Event('change'));
  expect(html('day-details').textContent).toContain('5번의 기여');
  window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }));
  await expect.poll(() => html('world-host').childElementCount).toBe(0);
});
