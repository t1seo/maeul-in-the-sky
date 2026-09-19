import { afterAll, expect, test, vi } from 'vitest';
import { parseSettings } from '../../../src/core/settings/parse.js';
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

const capture = captureDownloads();
afterAll(() => {
  capture.stop();
  vi.restoreAllMocks();
});

test('preserves sample provenance while changing presets, setup and imported settings', async () => {
  mountPage();
  mockHealth();
  await boot('?user=alice&year=2025&mode=light');
  expect(node('#source-badge', HTMLElement).textContent).toBe('Sample · @maeul-sky');
  expect(node('#preview-panel', HTMLElement).dataset.mode).toBe('light');
  expect(node('#live-terrain svg', SVGSVGElement).getAttribute('viewBox')).toBe('0 0 840 240');
  expect(node('#settings-form', HTMLFormElement).hidden).toBe(false);
  const total = node('#stat-total', HTMLElement).textContent;
  const submit = new Event('submit', { bubbles: true, cancelable: true });
  expect(node('#settings-form', HTMLFormElement).dispatchEvent(submit)).toBe(false);

  node('[data-preset="civilization"]', HTMLButtonElement).click();
  await expect.poll(() => node('#preset-name', HTMLElement).textContent).toBe('Civilization');
  expect(node('#density', HTMLInputElement).value).toBe('9');
  expect(node('[data-preset="civilization"]', HTMLButtonElement).getAttribute('aria-pressed')).toBe(
    'true',
  );
  change('username', 'bob');
  change('title', 'Bob’s garden', 'input');
  expect(node('#workflow-preview', HTMLElement).textContent).toContain('Bob’s garden');
  change('title', 'Bob’s garden');
  change('normalization', 'fixed');
  change('max-count', '25');
  change('layout-seed', 'garden-1');
  expect(node('#max-count-field', HTMLElement).hidden).toBe(false);
  expect(node('#scale-note', HTMLElement).textContent).toContain('Fixed height scale: 25');
  expect(window.location.search).toContain('layoutSeed=garden-1');
  expect(node('#stat-total', HTMLElement).textContent).toBe(total);
  expect(node('#source-badge', HTMLElement).textContent).toContain('@maeul-sky');
  change('repository', 'bob/village repo', 'input');
  await expect
    .poll(() => node('#readme-preview', HTMLElement).textContent)
    .toContain('bob/village%20repo');

  const clipboard = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
  await press('share-settings');
  await expect.poll(() => clipboard.mock.calls.length).toBe(1);
  const shared = new URL(clipboard.mock.calls[0]?.[0] ?? '');
  expect(shared.searchParams.get('user')).toBe('bob');
  expect(shared.searchParams.get('maxCount')).toBe('25');
  expect(shared.hash).toBe('');
  await press('download-settings');
  const saved = parseSettings(
    await (await downloadAt(capture.downloads, 'maeul-settings.json')).text(),
  );
  expect(saved.username).toBe('bob');
  expect(saved.settings.normalization).toEqual({ kind: 'fixed', maxCount: 25 });

  await press('download-workflow');
  expect(await (await downloadAt(capture.downloads, 'maeul.yml')).text()).toContain(
    'max_count: "25"',
  );
  await press('copy-workflow');
  await expect.poll(() => clipboard.mock.lastCall?.[0]).toContain('username: "bob"');
  change('readme-appearance', 'light');
  await expect
    .poll(() => node('#readme-preview', HTMLElement).textContent)
    .not.toContain('<source');
  await press('copy-readme');
  await expect
    .poll(() => clipboard.mock.lastCall?.[0])
    .toBe(node('#readme-preview', HTMLElement).textContent);
  expect(clipboard.mock.lastCall?.[0]).toContain('-light.svg');
  await press('download-readme');
  expect(await (await downloadAt(capture.downloads, 'maeul-readme.html')).text()).toBe(
    node('#readme-preview', HTMLElement).textContent,
  );
  clipboard.mockRejectedValue(new DOMException('Clipboard blocked', 'NotAllowedError'));
  await press('copy-readme');
  await expect
    .poll(() => node('#app-status', HTMLElement).textContent)
    .toContain('Clipboard unavailable');

  upload('settings-input', {
    ...saved,
    username: 'carol',
    settings: {
      ...saved.settings,
      title: 'Imported settings',
      normalization: { kind: 'relative' },
    },
  });
  await expect.poll(() => node('#username', HTMLInputElement).value).toBe('carol');
  expect(node('#repository', HTMLInputElement).value).toBe('carol/carol');
  expect(node('#app-status', HTMLElement).textContent).toContain(
    'Contribution data and its source have not changed',
  );
  expect(node('#source-badge', HTMLElement).textContent).toBe('Sample · @maeul-sky');
  expect(node('#settings-input', HTMLInputElement).value).toBe('');
  expect(node('#max-count-field', HTMLElement).hidden).toBe(true);

  node('button[data-mode="dark"]', HTMLButtonElement).click();
  await expect.poll(() => node('#preview-panel', HTMLElement).dataset.mode).toBe('dark');
  const url = new URL(window.location.href);
  url.search = '?user=dora&preset=nature&mode=light';
  window.history.replaceState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
  expect(node('#username', HTMLInputElement).value).toBe('dora');
  expect(node('#preview-panel', HTMLElement).dataset.mode).toBe('light');
  expect(node('#preset-name', HTMLElement).textContent).toBe('Nature');
  await press('use-sample');
  await expect
    .poll(() => node('#app-status', HTMLElement).textContent)
    .toContain('No account has been fetched');
}, 30_000);
