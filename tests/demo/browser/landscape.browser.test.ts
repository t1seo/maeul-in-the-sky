import { afterAll, expect, test, vi } from 'vitest';
import { parseSnapshot } from '../../../src/core/settings/parse.js';
import { parseDemoQuery } from '../../../src/demo/state.js';
import {
  boot,
  captureDownloads,
  change,
  downloadAt,
  historySnapshot,
  mockHealth,
  mountPage,
  node,
  press,
  upload,
} from './harness.js';

vi.mock('../../../src/demo/renderers.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../../src/demo/renderers.js')>();
  const archived = await import('../../../assets/versions/classic/browser.js');
  return {
    ...original,
    loadClassicRenderer: async () => ({
      version: 'classic',
      renderTerrain: archived.renderTerrain,
    }),
  };
});

const capture = captureDownloads();
afterAll(() => {
  capture.stop();
  vi.restoreAllMocks();
});

test('opens, shares and exports a real landscape while retaining the calendar and Classic modes', async () => {
  mountPage();
  mockHealth();
  await boot('?terrainMode=landscape&landscapeLayout=island&mode=light&motion=off');
  expect(node('#terrain-mode', HTMLSelectElement).value).toBe('landscape');
  expect(node('#landscape-layout-field', HTMLElement).hidden).toBe(false);
  expect(node('#live-terrain svg', SVGSVGElement).getAttribute('viewBox')).toBe('0 0 1200 840');
  expect(node('#preview-panel', HTMLElement).dataset.terrainMode).toBe('landscape');
  expect(node('#scale-note', HTMLElement).textContent).toContain('elevation follows geography');
  expect(node('#activity-legend', HTMLElement).hidden).toBe(true);
  expect(node('#workflow-version', HTMLElement).textContent).toContain('must be pushed');
  const total = node('#stat-total', HTMLElement).textContent;
  for (const layout of ['archipelago', 'valley']) {
    change('landscape-layout', layout);
    expect(node('#stat-total', HTMLElement).textContent).toBe(total);
    expect(window.location.search).toContain(`landscapeLayout=${layout}`);
  }

  const incoming = {
    ...historySnapshot(2025, 8),
    settings: parseDemoQuery('?terrainMode=landscape&landscapeLayout=valley&motion=off').document
      .settings,
  };
  upload('snapshot-input', incoming);
  await expect.poll(() => node('#source-badge', HTMLElement).textContent).toBe('@octocat · github');
  expect(node('#stat-total', HTMLElement).textContent).toBe('9');
  const date = node('.terrain-blocks [data-date="2025-01-09"]', SVGElement);
  date.dispatchEvent(new FocusEvent('focus'));
  expect(node('#date-details', HTMLElement).dataset.count).toBe('0');
  expect(node('#date-select', HTMLSelectElement).value).toBe('2025-01-09');

  const clipboard = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
  await press('share-settings');
  await expect.poll(() => clipboard.mock.calls.length).toBe(1);
  const shared = new URL(clipboard.mock.calls[0]?.[0] ?? '');
  expect(shared.searchParams.get('terrainMode')).toBe('landscape');
  expect(shared.searchParams.get('landscapeLayout')).toBe('valley');
  await press('download-snapshot');
  const snapshot = parseSnapshot(
    await (await downloadAt(capture.downloads, 'maeul-octocat-2025.json')).text(),
  );
  expect(snapshot.settings).toMatchObject({ terrainMode: 'landscape', landscapeLayout: 'valley' });
  await press('download-svg');
  const svg = await (await downloadAt(capture.downloads, 'maeul-in-the-sky-light.svg')).text();
  expect(svg).toContain('viewBox="0 0 1200 840"');
  expect(svg).not.toMatch(/<script\b|<foreignObject\b/);
  await press('download-png');
  const bitmap = await createImageBitmap(
    await downloadAt(capture.downloads, 'maeul-in-the-sky-light.png'),
  );
  expect([bitmap.width, bitmap.height]).toEqual([2400, 1680]);
  bitmap.close();

  change('layout', 'card');
  expect(node('#live-terrain svg', SVGSVGElement).getAttribute('viewBox')).toBe('0 0 840 840');
  change('terrain-mode', 'calendar');
  expect(node('#live-terrain svg', SVGSVGElement).getAttribute('viewBox')).toBe('0 0 420 360');
  expect(node('#activity-legend', HTMLElement).hidden).toBe(false);
  expect(window.location.search).not.toContain('terrainMode');
  change('terrain-mode', 'landscape');
  change('renderer-version', 'classic');
  await expect.poll(() => node('#preview-panel', HTMLElement).dataset.renderer).toBe('classic');
  expect(node('#terrain-mode', HTMLSelectElement).value).toBe('calendar');
  expect(node('#terrain-mode', HTMLSelectElement).disabled).toBe(true);
  expect(node('#renderer-status', HTMLElement).textContent).toContain('calendar terrain');
  expect(window.location.search).not.toContain('landscapeLayout');

  upload(
    'settings-input',
    parseDemoQuery('?terrainMode=landscape&landscapeLayout=archipelago').document,
  );
  await expect
    .poll(() => node('#app-status', HTMLElement).textContent)
    .toContain('Imported settings');
  expect(node('#terrain-mode', HTMLSelectElement).value).toBe('calendar');
  expect(node('#live-terrain svg', SVGSVGElement).getAttribute('viewBox')).toBe('0 0 840 240');
  expect(node('#settings-error', HTMLElement).hidden).toBe(true);
  change('renderer-version', 'current');
  expect(node('#terrain-mode', HTMLSelectElement).disabled).toBe(false);
  expect(node('#stat-total', HTMLElement).textContent).toBe('9');
}, 60_000);
