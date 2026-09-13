import { expect, vi } from 'vitest';
import { page } from 'vitest/browser';
import pageHtml from '../../../docs/demo/index.html?raw';
import { createSnapshot } from '../../../src/core/settings/parse.js';
import { computeStats } from '../../../src/core/stats.js';
import type { SnapshotV1 } from '../../../src/core/snapshot-types.js';
import type { ContributionWeek } from '../../../src/core/types.js';

export function node<T extends Element>(selector: string, type: { new (): T }): T {
  const found = document.querySelector(selector);
  if (!(found instanceof type)) throw new TypeError(`Missing test target ${selector}`);
  return found;
}

export function mountPage(): void {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  parsed.querySelectorAll('script').forEach((script) => script.remove());
  document.body.replaceChildren(...parsed.body.childNodes);
  window.localStorage.clear();
  delete window.maeulEnhanced;
  window.maeulInitialSearch = '';
}

export function mountEnhancedPage(): void {
  mountPage();
  document.querySelectorAll<HTMLElement>('.enhanced').forEach((element) => {
    element.hidden = false;
  });
}

export async function boot(search = ''): Promise<void> {
  window.maeulInitialSearch = search;
  await import('../../../src/demo/main.js');
  await expect.poll(() => window.maeulEnhanced).toBe(true);
}

export async function press(id: string): Promise<void> {
  const target = node(`#${id}`, HTMLButtonElement);
  for (let parent = target.parentElement; parent; parent = parent.parentElement) {
    if (parent instanceof HTMLDetailsElement && !parent.open) parent.open = true;
  }
  await page.elementLocator(target).click();
}

export function change(id: string, value: string, event = 'change'): void {
  const target = document.getElementById(id);
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement))
    throw new TypeError(`Missing input ${id}`);
  target.value = value;
  if (event === 'change') target.dispatchEvent(new Event('input', { bubbles: true }));
  target.dispatchEvent(new Event(event, { bubbles: true }));
}

export function upload(id: string, value: unknown): void {
  const files = new DataTransfer();
  files.items.add(
    new File([typeof value === 'string' ? value : JSON.stringify(value)], 'village.json', {
      type: 'application/json',
    }),
  );
  const target = node(`#${id}`, HTMLInputElement);
  target.files = files.files;
  target.dispatchEvent(new Event('change', { bubbles: true }));
}

export function historySnapshot(year = 2024, count = 8): SnapshotV1 {
  const weeks: ContributionWeek[] = [
    {
      firstDay: `${year}-01-07`,
      days: [
        { date: `${year}-01-07`, count, level: 2 },
        { date: `${year}-01-08`, count: 1, level: 1 },
        { date: `${year}-01-09`, count: 0, level: 0 },
      ],
    },
  ];
  return createSnapshot(
    { username: 'octocat', year, weeks, stats: computeStats(weeks) },
    { title: 'My history', motion: 'off' },
    { kind: 'github', fetchedAt: '2026-01-01T00:00:00.000Z' },
  );
}

export type SavedDownload = { readonly filename: string; readonly blob: Blob };

export function captureDownloads(): {
  readonly downloads: SavedDownload[];
  readonly stop: () => void;
} {
  const downloads: SavedDownload[] = [];
  const urls = new Map<string, Blob>();
  const create = URL.createObjectURL.bind(URL);
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    const url = create(blob);
    if (blob instanceof Blob) urls.set(url, blob);
    return url;
  });
  const listener = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof HTMLAnchorElement) || !target.download) return;
    event.preventDefault();
    const blob = urls.get(target.href);
    if (!blob) throw new TypeError('Download has no corresponding Blob');
    downloads.push({ filename: target.download, blob });
  };
  document.addEventListener('click', listener, true);
  return { downloads, stop: () => document.removeEventListener('click', listener, true) };
}

export async function downloadAt(
  downloads: readonly SavedDownload[],
  filename: string,
): Promise<Blob> {
  await expect.poll(() => downloads.some((entry) => entry.filename === filename)).toBe(true);
  const entry = downloads.find((download) => download.filename === filename);
  if (!entry) throw new TypeError(`Missing download ${filename}`);
  return entry.blob;
}

export function mockHealth(github = true): void {
  vi.spyOn(window, 'fetch').mockResolvedValue(
    Response.json({ status: 'ok', capabilities: { github } }),
  );
}
