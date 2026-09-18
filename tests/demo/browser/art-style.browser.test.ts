import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { parseSettings, parseSnapshot } from '../../../src/core/settings/parse.js';
import { readForm, writeForm } from '../../../src/demo/settings.js';
import { parseDemoQuery } from '../../../src/demo/state.js';
import {
  boot,
  captureDownloads,
  change,
  downloadAt,
  mockHealth,
  mountPage,
  node,
  press,
  upload,
} from './harness.js';

beforeEach(mountPage);
afterEach(() => vi.restoreAllMocks());

test.each([
  ['classic', 'miniature'],
  ['classic', 'pixel'],
  ['korean', 'miniature'],
  ['korean', 'pixel'],
] as const)('roundtrips %s culture and %s art through the form', (style, artStyle) => {
  // Given: a settings document with independent culture and art choices.
  const { document } = parseDemoQuery(`?style=${style}&artStyle=${artStyle}`);

  // When: the form restores and reads the settings.
  writeForm(document);
  const restored = readForm(document.settings.preset);

  // Then: both visible choices and their saved values agree.
  expect(node('#style', HTMLSelectElement).value).toBe(style);
  expect(node('#art-style', HTMLSelectElement).value).toBe(artStyle);
  expect(restored).toEqual(document);
});

test('explains all four seasons and the six daily contribution ranges', () => {
  // Given: the village page, including its no-JavaScript guide.
  // When: the reader explores the season and growth guides.
  const seasons = node('#season-guide', HTMLElement);
  const growth = node('#growth-guide', HTMLElement);

  // Then: distinct seasonal features and exact daily ranges are readable.
  expect(Array.from(seasons.querySelectorAll('h3'), (item) => item.textContent)).toEqual([
    'Spring',
    'Summer',
    'Autumn',
    'Winter',
  ]);
  expect(Array.from(growth.querySelectorAll('.growth-count'), (item) => item.textContent)).toEqual([
    '0',
    '1–4',
    '5–9',
    '10–24',
    '25–49',
    '50+',
  ]);
  expect(growth.textContent).toContain('contributions per day');
  expect(growth.textContent).toContain('25 and 50');
  expect(growth.textContent).not.toContain('commits');
});

test('keeps pixel and Korean choices through sharing, imports, downloads and older links', async () => {
  // Given: a live sample with the Korean culture and pixel art selected.
  mockHealth();
  const capture = captureDownloads();
  const clipboard = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
  await boot('?style=korean&artStyle=pixel&motion=off');
  const total = node('#stat-total', HTMLElement).textContent;

  // When: the user saves and restores their chosen appearance.
  try {
    expect(node('#style', HTMLSelectElement).value).toBe('korean');
    expect(node('#art-style', HTMLSelectElement).value).toBe('pixel');
    change('style', 'classic');
    expect(node('#art-style', HTMLSelectElement).value).toBe('pixel');
    change('style', 'korean');
    await press('share-settings');
    await expect.poll(() => clipboard.mock.calls.length).toBe(1);
    const shared = new URL(clipboard.mock.calls[0]?.[0] ?? '');
    expect(parseDemoQuery(shared.search).document.settings).toMatchObject({
      style: 'korean',
      artStyle: 'pixel',
    });
    await press('download-settings');
    const saved = parseSettings(
      await (await downloadAt(capture.downloads, 'maeul-settings.json')).text(),
    );
    expect(saved.settings).toMatchObject({ style: 'korean', artStyle: 'pixel' });
    change('art-style', 'miniature');
    upload('settings-input', saved);
    await expect.poll(() => node('#art-style', HTMLSelectElement).value).toBe('pixel');
    await press('download-workflow');
    const workflow = await (await downloadAt(capture.downloads, 'maeul.yml')).text();
    expect(workflow).toContain('village_style: "korean"');
    expect(workflow).toContain('art_style: "pixel"');
    await press('download-snapshot');
    const snapshotDownload = capture.downloads.find((entry) =>
      entry.filename.startsWith('maeul-maeul-sky-'),
    );
    expect(snapshotDownload).toBeDefined();
    const savedSnapshot = parseSnapshot(await snapshotDownload?.blob.text());
    expect(savedSnapshot.settings).toMatchObject({ style: 'korean', artStyle: 'pixel' });
    const oldUrl = new URL(window.location.href);
    oldUrl.search = '?style=korean';
    window.history.replaceState({}, '', oldUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));

    // Then: old links restore miniature while contribution data stays intact.
    expect(node('#style', HTMLSelectElement).value).toBe('korean');
    expect(node('#art-style', HTMLSelectElement).value).toBe('miniature');
    expect(node('#stat-total', HTMLElement).textContent).toBe(total);
    expect(node('#source-badge', HTMLElement).textContent).toContain('Sample');
    expect(node('#app-status', HTMLElement).dataset.error).toBe('false');
  } finally {
    capture.stop();
  }
}, 30_000);
