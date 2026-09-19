import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { startWorldApp } from '../../../src/world/app/app.js';
import { createWorldDocument, parseWorldDocument } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { button, dialog, html, input, select } from '../../../src/world/app/dom.js';
import { captureDownloads, historySnapshot, upload } from '../../demo/browser/harness.js';

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
  await app?.dispose();
  app = undefined;
  stopDownloads?.();
  stopDownloads = undefined;
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

const frozen = () =>
  createWorldDocument({ scene: TINY_WORLD_SCENE, sourceSnapshot: TINY_WORLD_INPUT.snapshot });
async function open(initialData: unknown = frozen()) {
  app = await startWorldApp({
    databaseName: `app-files-${crypto.randomUUID()}`,
    initialData,
    search: '',
    loaders: { map: mountMap, three: mountMap },
  });
  return app;
}
function openDialog(id: string): void {
  document.querySelector<HTMLButtonElement>(`[data-dialog="${id}"]`)?.click();
}

test('imports all annual archive worlds and switches years through the actual library', async () => {
  const running = await open();
  upload('world-file', {
    kind: 'maeul-archive',
    schemaVersion: 1,
    snapshots: [historySnapshot(2023), historySnapshot(2024)],
    comparison: { years: [2023, 2024], normalization: { kind: 'fixed', maxCount: 50 } },
  });
  await expect.poll(() => running.session.current().scene.year).toBe(2023);
  await expect.poll(() => html('world-status').textContent).toContain('2개의 세계');
  openDialog('library-dialog');
  await expect.poll(() => select('library-year').options.length).toBe(3);
  select('library-year').value = '2024';
  select('library-year').dispatchEvent(new Event('change'));
  await expect.poll(() => html('library-list').querySelectorAll('article').length).toBe(2);
  const imported = [...html('library-list').querySelectorAll('article')].find((node) =>
    node.textContent?.includes('@octocat'),
  );
  imported?.querySelector<HTMLButtonElement>('button')?.click();
  await expect.poll(() => running.session.current().scene.username).toBe('octocat');
  expect(running.session.current().scene.year).toBe(2024);
  expect(dialog('library-dialog').open).toBe(false);
  button('save-world').click();
  await expect.poll(() => html('world-status').textContent).toContain('보관했습니다');
  openDialog('library-dialog');
  await expect.poll(() => html('library-list').textContent).toContain('보관본 삭제');
  [...html('library-list').querySelectorAll('button')]
    .find((node) => node.textContent === '보관본 삭제')
    ?.click();
  await expect.poll(() => html('world-status').textContent).toContain('삭제했습니다');
  expect(running.session.current().scene.username).toBe('octocat');
});

test('keeps camera and world after malformed or unsupported imports, then accepts a valid replacement', async () => {
  const running = await open();
  button('zoom-in').click();
  running.session.update({ motion: 'off' });
  const before = running.session.current();
  upload('world-file', '{broken');
  await expect.poll(() => html('world-status').dataset.error).toBe('true');
  expect(running.session.current()).toEqual(before);
  upload('world-file', { ...frozen(), schemaVersion: 99 });
  await expect.poll(() => html('world-status').textContent).toContain('지원하지 않는');
  expect(running.session.current()).toEqual(before);
  upload('world-file', historySnapshot());
  await expect.poll(() => running.session.current().scene.username).toBe('octocat');
  expect(input('world-file').value).toBe('');
  input('world-file').dispatchEvent(new Event('change'));
  expect(running.session.current().scene.username).toBe('octocat');
});

test('exports parseable world JSON and self-contained SVG/PNG postcards with real image pixels', async () => {
  const running = await open();
  const captured = captureDownloads();
  stopDownloads = captured.stop;
  running.session.update({ lighting: 'sunset', weather: 'rain' });
  button('export-world').click();
  await expect.poll(() => captured.downloads.length).toBe(1);
  const document = parseWorldDocument(await captured.downloads[0]?.blob.text());
  expect(document.view).toMatchObject({ lighting: 'sunset', weather: 'rain' });
  expect(document.scene).toEqual(running.session.current().scene);
  button('export-svg').click();
  await expect.poll(() => captured.downloads.length).toBe(2);
  const svg = await captured.downloads[1]?.blob.text();
  const parsed = new DOMParser().parseFromString(svg ?? '', 'image/svg+xml');
  expect(parsed.querySelector('parsererror')).toBeNull();
  expect(parsed.documentElement.getAttribute('height')).toBe('1160');
  expect(parsed.documentElement.textContent).toContain('해 질 녘 · 비');
  expect(parsed.querySelectorAll('script, image[href^="http"]')).toHaveLength(0);
  button('export-png').click();
  await expect.poll(() => captured.downloads.length, { timeout: 10000 }).toBe(3);
  const png = captured.downloads[2]?.blob;
  expect(png?.type).toBe('image/png');
  if (!png) throw new Error('PNG missing');
  const bitmap = await createImageBitmap(png);
  expect([bitmap.width, bitmap.height]).toEqual([1600, 1160]);
  bitmap.close();
  expect(png.size).toBeGreaterThan(10000);
});

test('shows malformed startup data as a recoverable error over the usable sample world', async () => {
  const running = await open({ kind: 'wrong' });
  expect(running.session.current().sourceSnapshot.source.kind).toBe('sample');
  expect(html('world-status').dataset.error).toBe('true');
  expect(html('world-host').querySelector('svg')).not.toBeNull();
  const chooser = vi.spyOn(input('world-file'), 'click').mockImplementation(() => {});
  button('open-import').click();
  button('library-import').click();
  expect(chooser).toHaveBeenCalledTimes(2);
});

test('consumes the legacy demo transfer without losing its source or contribution values', async () => {
  sessionStorage.setItem('maeul-world-transfer', JSON.stringify(historySnapshot(2024, 19)));
  app = await startWorldApp({
    databaseName: `app-transfer-${crypto.randomUUID()}`,
    loaders: { map: mountMap, three: mountMap },
    search: '',
  });
  expect(app.session.current().sourceSnapshot.weeks[0]?.days[0]?.count).toBe(19);
  expect(app.session.current().sourceSnapshot.source.kind).toBe('github');
  expect(sessionStorage.getItem('maeul-world-transfer')).toBeNull();
  expect(html('world-status').textContent).toContain('기존 데모');
});

test('starts an imported snapshot at its latest supplied day and labels its observed period', async () => {
  const running = await open(historySnapshot());
  expect(running.session.current().view.cursorDate).toBe('2024-01-09');
  expect(html('world-period').textContent).toContain('2024-01-07 — 2024-01-09');
  expect(html('replay-end').textContent).toBe('2024-12-31');
  expect(html('day-details').textContent).toContain('0번의 기여');
  const captured = captureDownloads();
  stopDownloads = captured.stop;
  button('export-svg').click();
  await expect.poll(() => captured.downloads.length).toBe(1);
  const postcard = await captured.downloads[0]?.blob.text();
  expect(postcard).toContain('GitHub 기여 기록');
  expect(postcard).toContain('2024-01-07 — 2024-01-09');
});

test('opens a usable, explicitly labelled sample when no world or demo transfer exists', async () => {
  app = await startWorldApp({
    databaseName: `app-first-visit-${crypto.randomUUID()}`,
    loaders: { map: mountMap, three: mountMap },
    search: '',
  });
  expect(app.session.current().sourceSnapshot.source.kind).toBe('sample');
  expect(html('world-status').textContent).toContain('샘플 세계를 둘러보고 있습니다');
  expect(html('world-provenance').textContent).toContain('실제 계정을 조회한 데이터가 아닙니다');
  expect(html('world-host').querySelector('svg')).not.toBeNull();
  expect(html('world-host').getAttribute('aria-busy')).toBe('false');
});
