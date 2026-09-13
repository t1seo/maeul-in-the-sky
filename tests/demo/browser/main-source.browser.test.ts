import { afterAll, expect, test, vi } from 'vitest';
import { parseSnapshot } from '../../../src/core/settings/parse.js';
import { loadLibrary } from '../../../src/demo/archive-store.js';
import {
  boot,
  captureDownloads,
  downloadAt,
  historySnapshot,
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

test('fetches same-origin data, imports history, confirms replacement and exports real images and counts', async () => {
  mountPage();
  const incoming = historySnapshot();
  const fetch = vi
    .spyOn(window, 'fetch')
    .mockResolvedValueOnce(Response.json({ status: 'ok', capabilities: { github: true } }));
  await boot('?user=octocat&year=2024&mode=light');
  await expect.poll(() => node('#fetch-preview', HTMLButtonElement).disabled).toBe(false);
  fetch.mockResolvedValueOnce(
    Response.json(
      { error: { code: 'unauthorized', message: 'Token expired; restart the service.' } },
      { status: 401 },
    ),
  );
  await press('fetch-preview');
  await expect.poll(() => node('#app-status', HTMLElement).textContent).toContain('Token expired');
  expect(node('#fetch-preview', HTMLButtonElement).disabled).toBe(false);
  expect(node('#source-badge', HTMLElement).textContent).toContain('Sample');

  fetch.mockResolvedValueOnce(Response.json({ snapshot: incoming }));
  await press('fetch-preview');
  await expect.poll(() => node('#source-badge', HTMLElement).textContent).toBe('@octocat · github');
  expect(node('#stat-total', HTMLElement).textContent).toBe('9');
  expect(node('#period', HTMLElement).textContent).toBe('2024-01-07 to 2024-01-09');
  expect(node('#provenance', HTMLElement).textContent).toContain('Fetched 2026-01-01');
  const request = fetch.mock.lastCall;
  expect(String(request?.[0])).toBe(`${window.location.origin}/api/preview`);
  expect(request?.[1]?.credentials).toBe('same-origin');
  expect(JSON.parse(String(request?.[1]?.body))).toMatchObject({ username: 'octocat', year: 2024 });

  await press('save-snapshot');
  await expect.poll(() => loadLibrary(localStorage).snapshots.length).toBe(1);
  expect(node('#archive-list', HTMLElement).textContent).toContain('9 contributions');
  const replacement = historySnapshot(2024, 40);
  upload('snapshot-input', replacement);
  await expect.poll(() => node('#replace-dialog', HTMLDialogElement).open).toBe(true);
  expect(node('#replace-description', HTMLElement).textContent).toContain(
    '@octocat 2024 already exists',
  );
  await press('replace-cancel');
  await expect
    .poll(() => node('#archive-status', HTMLElement).textContent)
    .toContain('Import canceled');
  expect(node('#stat-total', HTMLElement).textContent).toBe('9');
  expect(loadLibrary(localStorage).snapshots[0]).toEqual(incoming);

  upload('snapshot-input', replacement);
  await expect.poll(() => node('#replace-dialog', HTMLDialogElement).open).toBe(true);
  await press('replace-confirm');
  await expect.poll(() => node('#stat-total', HTMLElement).textContent).toBe('41');
  expect(loadLibrary(localStorage).snapshots[0]).toEqual(replacement);
  expect(node('#snapshot-input', HTMLInputElement).value).toBe('');
  await press('download-snapshot');
  const saved = parseSnapshot(
    await (await downloadAt(capture.downloads, 'maeul-octocat-2024.json')).text(),
  );
  expect(saved.weeks).toEqual(replacement.weeks);
  await press('download-svg');
  const svg = await (await downloadAt(capture.downloads, 'maeul-in-the-sky-light.svg')).text();
  expect(svg).toContain('2024-01-07');
  expect(
    new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('parsererror'),
  ).toBeNull();
  await press('download-png');
  const bitmap = await createImageBitmap(
    await downloadAt(capture.downloads, 'maeul-in-the-sky-light.png'),
  );
  expect([bitmap.width, bitmap.height]).toEqual([1680, 480]);
  bitmap.close();
  await press('use-sample');
  await expect.poll(() => node('#source-badge', HTMLElement).textContent).toContain('Sample');
  node('#archive-list button', HTMLButtonElement).click();
  expect(node('#stat-total', HTMLElement).textContent).toBe('41');
}, 30_000);
