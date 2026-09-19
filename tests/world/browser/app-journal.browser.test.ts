import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { startWorldApp } from '../../../src/world/app/app.js';
import { createWorldDocument } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { button, html, input } from '../../../src/world/app/dom.js';
import { captureDownloads, historySnapshot } from '../../demo/browser/harness.js';

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

async function open(initialData: unknown) {
  app = await startWorldApp({
    databaseName: `app-journal-${crypto.randomUUID()}`,
    initialData,
    loaders: { map: mountMap, three: mountMap },
    search: '',
  });
  return app;
}

test('distinguishes absent dates, observed zero and unreplayed records without inventing activity', async () => {
  const snapshot = { ...historySnapshot(), source: { kind: 'import' } };
  const running = await open(snapshot);
  expect(html('world-source').textContent).toContain('Imported records');
  input('world-date').value = '2024-01-05';
  input('world-date').dispatchEvent(new Event('change'));
  expect(html('day-details').textContent).toContain('does not count as zero contributions');
  expect(html('stat-contributions').textContent).toBe('0');
  running.session.update({ selectedId: 'day:2024-01-07' });
  expect(html('day-details').textContent).toContain('This date has not appeared yet');
  running.session.selectPlace('tile:2024-01-07');
  expect(running.session.current().view.cursorDate).toBe('2024-01-07');
  expect(html('day-details').textContent).toContain('8 contributions');
  await running.session.rebuild({ layout: 'island' });
  expect(running.session.current().view.selectedId).toBe('day:2024-01-07');
  document.querySelector<HTMLButtonElement>('[data-dialog="photo-dialog"]')?.click();
  expect(html('photo-caption').textContent).toContain('octocat');
  const captured = captureDownloads();
  stopDownload = captured.stop;
  button('export-svg').click();
  await expect.poll(() => captured.downloads.length).toBe(1);
  expect(await captured.downloads[0]?.blob.text()).toContain('Imported records');
});

test('pauses replay when the document becomes hidden and ignores nested shortcut events', async () => {
  const running = await open(
    createWorldDocument({ scene: TINY_WORLD_SCENE, sourceSnapshot: TINY_WORLD_INPUT.snapshot }),
  );
  button('replay-play').click();
  expect(button('replay-play').getAttribute('aria-pressed')).toBe('true');
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  document.dispatchEvent(new Event('visibilitychange'));
  expect(button('replay-play').getAttribute('aria-pressed')).toBe('false');
  hidden.mockReturnValue(false);
  document.dispatchEvent(new Event('visibilitychange'));
  expect(button('replay-play').getAttribute('aria-pressed')).toBe('false');
  const child = document.createElement('input');
  html('world-host').append(child);
  running.session.update({ camera: { ...running.session.current().view.camera, zoom: 2 } });
  child.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
  expect(running.session.current().view.camera.zoom).toBe(2);
  html('world-host').dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
  );
  expect(running.session.current().view.camera.zoom).toBe(2);
});
