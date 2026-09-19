import { afterAll, expect, test, vi } from 'vitest';
import { button, dialog, html } from '../../../src/demo/dom.js';
import { boot, change, historySnapshot, mountPage, press, upload } from './harness.js';

afterAll(() => {
  window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }));
  vi.restoreAllMocks();
  sessionStorage.clear();
  localStorage.clear();
  document.body.replaceChildren();
});

test('keeps open Activity current across fetched and imported history without treating settings as source data', async () => {
  mountPage();
  let resolvePreview: ((response: Response) => void) | undefined;
  const response = new Promise<Response>((resolve) => {
    resolvePreview = resolve;
  });
  vi.spyOn(window, 'fetch')
    .mockResolvedValueOnce(Response.json({ status: 'ok', capabilities: { github: true } }))
    .mockImplementationOnce(() => response);
  await boot('?user=octocat&year=2024');
  await expect.poll(() => button('fetch-preview').disabled).toBe(false);
  await press('fetch-preview');
  await press('explore-activity');
  expect(dialog('analytics-dialog').open).toBe(true);
  expect(html('analytics-source').textContent).toContain('Sample data');

  if (!resolvePreview) throw new TypeError('Preview response was not requested');
  resolvePreview(Response.json({ snapshot: historySnapshot(2024, 40) }));
  await expect.poll(() => html('analytics-account').textContent).toBe('octocat · Activity');
  expect(html('analytics-metrics').querySelector('.analytics-metric-value')?.textContent).toBe(
    '41',
  );
  expect(html('analytics-availability').textContent).toContain('Not available in this snapshot');

  const chart = html('analytics-trend').firstElementChild;
  change('username', 'settings-only');
  expect(html('analytics-account').textContent).toBe('octocat · Activity');
  expect(html('analytics-trend').firstElementChild).toBe(chart);

  upload('snapshot-input', { ...historySnapshot(2025, 70), username: 'imported-owner' });
  await expect.poll(() => html('analytics-account').textContent).toBe('imported-owner · Activity');
  expect(html('analytics-metrics').querySelector('.analytics-metric-value')?.textContent).toBe(
    '71',
  );
  expect(html('analytics-table').textContent).toContain('2025-01-07');
  expect(sessionStorage.getItem('maeul-world-transfer')).toBeNull();
  expect(document.querySelector('canvas')).toBeNull();
});
