import { afterAll, expect, test, vi } from 'vitest';
import { boot, change, mockHealth, mountPage, node, press, upload } from './harness.js';

afterAll(() => vi.restoreAllMocks());

test('shows invalid-link and input errors and recovers without exporting unsafe workflow expressions', async () => {
  mountPage();
  mockHealth();
  await boot('?v=unsupported');
  expect(node('#settings-error', HTMLElement).textContent).toContain('Invalid settings link');
  expect(node('#download-workflow', HTMLButtonElement).disabled).toBe(true);
  await expect.poll(() => node('#fetch-preview', HTMLButtonElement).disabled).toBe(false);
  await press('fetch-preview');
  await expect
    .poll(() => node('#app-status', HTMLElement).textContent)
    .toContain('Correct the settings before fetching');
  change('username', 'invalid user', 'input');
  expect(node('#settings-error', HTMLElement).hidden).toBe(false);
  change('username', 'invalid user');
  expect(node('#workflow-preview', HTMLElement).textContent).toContain('Correct the settings');
  change('username', 'octocat');
  expect(node('#settings-error', HTMLElement).hidden).toBe(true);
  expect(node('#download-workflow', HTMLButtonElement).disabled).toBe(false);
  change('title', '${{ secrets.TOKEN }}', 'input');
  expect(node('#title-error', HTMLElement).textContent).toContain('Remove ${{');
  expect(node('#copy-workflow', HTMLButtonElement).disabled).toBe(true);
  change('title', 'Safe title');
  change('layout-seed', '${{ secrets.TOKEN }}', 'input');
  expect(node('#layout-seed-error', HTMLElement).hidden).toBe(false);
  expect(node('#download-workflow', HTMLButtonElement).disabled).toBe(true);
  change('layout-seed', 'stable');
  expect(node('#layout-seed-error', HTMLElement).hidden).toBe(true);
  expect(node('#download-workflow', HTMLButtonElement).disabled).toBe(false);

  upload('snapshot-input', '{broken');
  await expect.poll(() => node('#app-status', HTMLElement).textContent).toContain('Malformed JSON');
  expect(node('#app-status', HTMLElement).dataset.error).toBe('true');
  expect(node('#snapshot-input', HTMLInputElement).value).toBe('');
  const files = new DataTransfer();
  files.items.add(new File([' '.repeat(2 * 1024 * 1024 + 1)], 'large.json'));
  node('#snapshot-input', HTMLInputElement).files = files.files;
  node('#snapshot-input', HTMLInputElement).dispatchEvent(new Event('change'));
  await expect.poll(() => node('#app-status', HTMLElement).textContent).toContain('2 MiB');
  expect(node('#source-badge', HTMLElement).textContent).toContain('Sample');
  const url = new URL(window.location.href);
  url.search = '?mode=sepia';
  window.history.replaceState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
  expect(node('#settings-error', HTMLElement).textContent).toContain('Invalid settings link');
  node('#snapshot-input', HTMLInputElement).files = new DataTransfer().files;
  node('#snapshot-input', HTMLInputElement).dispatchEvent(new Event('change'));
  node('#settings-input', HTMLInputElement).dispatchEvent(new Event('change'));
}, 30_000);
