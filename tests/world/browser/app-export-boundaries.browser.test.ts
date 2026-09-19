import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { startWorldApp } from '../../../src/world/app/app.js';
import { createWorldDocument } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { button, html } from '../../../src/world/app/dom.js';
import { captureDownloads } from '../../demo/browser/harness.js';

let app: Awaited<ReturnType<typeof startWorldApp>> | undefined;
let stopDownload: (() => void) | undefined;
beforeEach(() => {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
  html('world-host').style.cssText = 'width:800px;height:500px';
});
afterEach(async () => {
  await app?.dispose();
  app = undefined;
  stopDownload?.();
  stopDownload = undefined;
  vi.restoreAllMocks();
  document.body.replaceChildren();
});
const frozen = () =>
  createWorldDocument({ scene: TINY_WORLD_SCENE, sourceSnapshot: TINY_WORLD_INPUT.snapshot });
async function open() {
  app = await startWorldApp({
    databaseName: `app-export-${crypto.randomUUID()}`,
    initialData: frozen(),
    loaders: { map: mountMap, three: mountMap },
    search: '',
  });
  return app;
}

test('offers a usable SVG after the browser cannot allocate the postcard canvas', async () => {
  const running = await open();
  const captured = captureDownloads();
  stopDownload = captured.stop;
  const original = HTMLCanvasElement.prototype.getContext;
  let allocated = 0;
  const context = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (
    this: HTMLCanvasElement,
    kind: string,
    options?: unknown,
  ) {
    return ++allocated === 2 ? null : original.call(this, kind, options);
  });
  button('export-png').click();
  await expect.poll(() => html('world-status').textContent).toContain('SVG로 풍경을');
  expect(captured.downloads).toHaveLength(0);
  expect(running.session.current().scene.worldId).toBe(TINY_WORLD_SCENE.worldId);
  context.mockRestore();
  button('export-svg').click();
  await expect.poll(() => captured.downloads.length).toBe(1);
  expect(captured.downloads[0]?.filename).toMatch(/\.svg$/);
});

test('reports a failed browser PNG encoding and leaves the scene available for retry', async () => {
  const running = await open();
  const original = HTMLCanvasElement.prototype.toBlob;
  let encoded = 0;
  const encoder = vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
    this: HTMLCanvasElement,
    callback: BlobCallback,
    type?: string,
    quality?: number,
  ) {
    if (++encoded === 2) callback(null);
    else original.call(this, callback, type, quality);
  });
  button('export-png').click();
  await expect.poll(() => html('world-status').textContent).toContain('PNG 저장에 실패');
  expect(running.session.current().scene.worldId).toBe(TINY_WORLD_SCENE.worldId);
  encoder.mockRestore();
});

test('explains a photo request made while the initial renderer is still loading', async () => {
  let ready = () => {};
  const pending = new Promise<void>((resolve) => {
    ready = resolve;
  });
  const starting = startWorldApp({
    databaseName: `app-loading-${crypto.randomUUID()}`,
    initialData: frozen(),
    loaders: {
      map: async (...args) => {
        await pending;
        return mountMap(...args);
      },
      three: mountMap,
    },
    search: '',
  });
  button('export-png').click();
  await expect.poll(() => html('world-status').textContent).toContain('풍경이 준비되면');
  ready();
  app = await starting;
  expect(html('world-host').querySelector('svg')).not.toBeNull();
});

test.each(['success', 'failure'] as const)(
  'does not download or update a departed page when pending PNG encoding ends with %s',
  async (outcome) => {
    const running = await open();
    const captured = captureDownloads();
    stopDownload = captured.stop;
    const original = HTMLCanvasElement.prototype.toBlob;
    let encoded = 0;
    let finish: (() => void) | undefined;
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
      this: HTMLCanvasElement,
      callback: BlobCallback,
      type?: string,
      quality?: number,
    ) {
      if (++encoded !== 2) original.call(this, callback, type, quality);
      else
        original.call(
          this,
          (blob) => {
            finish = () => callback(outcome === 'success' ? blob : null);
          },
          type,
          quality,
        );
    });
    button('export-png').click();
    await expect.poll(() => finish).toBeTypeOf('function');
    await running.dispose();
    app = undefined;
    document.body.replaceChildren();
    finish?.();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    expect(captured.downloads).toHaveLength(0);
    expect(document.body.childElementCount).toBe(0);
  },
);
