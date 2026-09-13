import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { createArchive } from '../../../src/core/archive/comparison.js';
import { parseArchive } from '../../../src/core/archive/parse.js';
import { setupArchive } from '../../../src/demo/archive.js';
import { LIBRARY_KEY, loadLibrary, saveLibrary } from '../../../src/demo/archive-store.js';
import {
  captureDownloads,
  change,
  downloadAt,
  historySnapshot,
  mountEnhancedPage,
  node,
  press,
} from './harness.js';

beforeEach(mountEnhancedPage);
afterEach(() => vi.restoreAllMocks());

test('imports a shared-scale archive, persists selections and exports annual cards and selected history', async () => {
  const capture = captureDownloads();
  try {
    const snapshots = [historySnapshot(2023, 5), historySnapshot(2024, 12)];
    const archive = createArchive(snapshots, [2023, 2024], { kind: 'fixed', maxCount: 30 });
    const opened = vi.fn();
    const controller = setupArchive(
      () => historySnapshot(),
      () => 'light',
      opened,
    );
    expect(await controller.importData({ snapshots, archive })).toBe(true);
    expect(node('#comparison-scale', HTMLSelectElement).value).toBe('fixed');
    expect(node('#comparison-max', HTMLInputElement).value).toBe('30');
    expect(document.querySelectorAll('.annual-card')).toHaveLength(2);
    for (const card of document.querySelectorAll<HTMLElement>('.annual-card'))
      expect(card.dataset.normalizationMax).toBe('30');
    expect(loadLibrary(localStorage).comparison).toEqual({
      username: 'octocat',
      years: [2023, 2024],
      maxCount: 30,
    });
    const checkbox = node('#archive-list input', HTMLInputElement);
    checkbox.click();
    await press('compare-years');
    await expect.poll(() => node('#app-status', HTMLElement).dataset.error).toBe('true');
    checkbox.click();
    change('comparison-scale', 'relative');
    await press('compare-years');
    await expect
      .poll(() => node('#archive-status', HTMLElement).textContent)
      .toContain('Compared 2 years');
    const max = loadLibrary(localStorage).comparison?.maxCount;
    expect(max).toBeGreaterThan(0);
    expect(node('#comparison-note', HTMLElement).textContent).toContain(
      `Common fixed maximum: ${max}`,
    );
    await press('export-archive');
    const exported = parseArchive(
      await (await downloadAt(capture.downloads, 'maeul-octocat-archive.json')).text(),
    );
    expect(exported.snapshots).toEqual(snapshots);
    expect(exported.comparison.normalization.maxCount).toBe(max);
    node('#archive-list button', HTMLButtonElement).click();
    expect(opened).toHaveBeenCalledWith(snapshots[0]);
    node('#archive-list .button-row button:nth-child(2)', HTMLButtonElement).click();
    const cardSvg = await (
      await downloadAt(capture.downloads, 'maeul-octocat-2023-card.svg')
    ).text();
    expect(cardSvg).toContain('viewBox="0 0 420 360"');
    node('#comparison-cards .button-row button', HTMLButtonElement).click();
    expect(
      await (await downloadAt(capture.downloads, 'maeul-2023-comparison.svg')).text(),
    ).toContain('2023-01-07');
    node('#comparison-cards .button-row button:nth-child(2)', HTMLButtonElement).click();
    const bitmap = await createImageBitmap(
      await downloadAt(capture.downloads, 'maeul-2023-comparison.png'),
    );
    expect([bitmap.width, bitmap.height]).toEqual([840, 720]);
    bitmap.close();
  } finally {
    capture.stop();
  }
});

test('restores saved comparison and its selected years on startup', () => {
  const snapshots = [historySnapshot(2022), historySnapshot(2023), historySnapshot(2024)];
  saveLibrary(localStorage, {
    snapshots,
    comparison: { username: 'OCTOCAT', years: [2023, 2024], maxCount: 70 },
  });
  setupArchive(
    () => historySnapshot(),
    () => 'dark',
    vi.fn(),
  );
  expect(node('#archive-status', HTMLElement).textContent).toContain('3 saved snapshots restored');
  expect(
    [...document.querySelectorAll<HTMLInputElement>('#archive-list input:checked')].map(
      (checkbox) => checkbox.value,
    ),
  ).toEqual(['octocat:2023', 'octocat:2024']);
  expect(node('#comparison-max', HTMLInputElement).value).toBe('70');
  expect(document.querySelectorAll('.annual-card')).toHaveLength(2);
});

test('keeps malformed browser storage intact and reports recovery instructions', () => {
  localStorage.setItem(LIBRARY_KEY, '{broken');
  setupArchive(
    () => historySnapshot(),
    () => 'dark',
    vi.fn(),
  );
  expect(node('#archive-status', HTMLElement).textContent).toContain(
    'Saved archive could not be opened',
  );
  expect(node('#archive-status', HTMLElement).dataset.error).toBe('true');
  expect(localStorage.getItem(LIBRARY_KEY)).toBe('{broken');
  expect(document.querySelectorAll('.archive-item')).toHaveLength(0);
});

test('preserves existing history and preview when browser storage rejects an import', async () => {
  const original = historySnapshot(2023);
  saveLibrary(localStorage, { snapshots: [original] });
  const controller = setupArchive(
    () => historySnapshot(),
    () => 'dark',
    vi.fn(),
  );
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Storage full', 'QuotaExceededError');
  });
  expect(await controller.importData({ snapshots: [historySnapshot(2024)] })).toBe(false);
  expect(loadLibrary(localStorage).snapshots).toEqual([original]);
  expect(node('#app-status', HTMLElement).textContent).toContain('QuotaExceededError');
  expect(document.querySelectorAll('.archive-item')).toHaveLength(1);
});
