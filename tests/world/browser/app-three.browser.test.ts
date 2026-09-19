import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { startWorldApp } from '../../../src/world/app/app.js';
import { createWorldDocument, parseWorldDocument } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { button, html, input } from '../../../src/world/app/dom.js';
import { captureDownloads } from '../../demo/browser/harness.js';

let app: Awaited<ReturnType<typeof startWorldApp>> | undefined;
let stopDownloads: (() => void) | undefined;
beforeEach(() => {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
  html('world-host').style.cssText = 'width:800px;height:500px';
  sessionStorage.clear();
});
afterEach(async () => {
  window.dispatchEvent(new Event('pagehide'));
  await app?.dispose();
  app = undefined;
  stopDownloads?.();
  stopDownloads = undefined;
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

test('uses genuine 3D, saves the live orbit camera, and downloads a real GLB model', async () => {
  app = await startWorldApp({
    databaseName: `app-three-${crypto.randomUUID()}`,
    initialData: createWorldDocument({
      scene: TINY_WORLD_SCENE,
      sourceSnapshot: TINY_WORLD_INPUT.snapshot,
    }),
    loaders: {
      map: mountMap,
      three: async (...args) =>
        (await import('../../../src/world/three/index.js')).mountThree(...args),
    },
    search: '',
  });
  const running = app;
  const captured = captureDownloads();
  stopDownloads = captured.stop;
  running.session.selectPlace('day:2024-02-28');
  button('mode-three').click();
  await expect.poll(() => running.session.mode(), { timeout: 10000 }).toBe('three');
  expect(input('world-date').value).toBe('2024-02-28');
  const canvas = html('world-host').querySelector('canvas');
  expect(canvas).not.toBeNull();
  const before = running.session.current().view.camera;
  canvas?.dispatchEvent(new WheelEvent('wheel', { deltaY: 220, bubbles: true, cancelable: true }));
  await expect.poll(() => running.session.current().view.camera).not.toEqual(before);
  const after = running.session.current().view.camera;
  button('export-world').click();
  await expect.poll(() => captured.downloads.length).toBe(1);
  expect(parseWorldDocument(await captured.downloads[0]?.blob.text()).view.camera).toEqual(after);
  expect(button('export-glb').disabled).toBe(false);
  button('export-glb').click();
  await expect
    .poll(() => captured.downloads.length === 2 || html('world-status').dataset.error === 'true', {
      timeout: 10000,
    })
    .toBe(true);
  expect(html('world-status').dataset.error, html('world-status').textContent ?? '').not.toBe(
    'true',
  );
  const glb = captured.downloads[1]?.blob;
  if (!glb) throw new Error('GLB missing');
  expect(new DataView(await glb.arrayBuffer()).getUint32(0, true)).toBe(0x46546c67);
  expect(glb.size).toBeGreaterThan(1000);
  button('export-png').click();
  await expect.poll(() => captured.downloads.length, { timeout: 10000 }).toBe(3);
  expect(captured.downloads[2]?.blob.type).toBe('image/png');
  button('mode-map').click();
  await expect.poll(() => running.session.mode()).toBe('map');
  expect(html('world-host').querySelector('canvas')).toBeNull();
  expect(input('world-date').value).toBe('2024-02-28');
  expect(html('day-details').textContent).toContain('5 contributions');
});

test('the real ESM entry boots transferred records and disposes on page departure', async () => {
  sessionStorage.setItem(
    'maeul-world-transfer',
    JSON.stringify(
      createWorldDocument({ scene: TINY_WORLD_SCENE, sourceSnapshot: TINY_WORLD_INPUT.snapshot }),
    ),
  );
  await import('../../../src/world/app/main.js');
  await expect.poll(() => html('world-host').dataset.ready, { timeout: 10000 }).toBe('true');
  expect(html('world-source').textContent).toContain('@world-fixture');
  expect(sessionStorage.getItem('maeul-world-transfer')).toBeNull();
  button('mode-three').click();
  await expect.poll(() => html('world-host').dataset.renderer, { timeout: 10000 }).toBe('three');
  window.dispatchEvent(new Event('pagehide'));
  await expect.poll(() => html('world-host').childElementCount).toBe(0);
});
