import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import worldHtml from '../../../docs/demo/world/index.html?raw';
import { setupWorldBridge } from '../../../src/demo/world-bridge.js';
import { button, dialog, html, select } from '../../../src/demo/dom.js';
import { change, historySnapshot } from './harness.js';

let dispose: (() => void) | undefined;

beforeEach(() => {
  const parsed = new DOMParser().parseFromString(worldHtml, 'text/html');
  const analytics = parsed.getElementById('analytics-dialog');
  if (!(analytics instanceof HTMLDialogElement)) throw new TypeError('Missing activity dialog');
  const world = document.createElement('a');
  world.id = 'explore-world';
  world.href = './world/';
  const activity = document.createElement('button');
  activity.id = 'explore-activity';
  activity.type = 'button';
  activity.textContent = 'Activity';
  const status = document.createElement('p');
  status.id = 'app-status';
  document.body.replaceChildren(world, activity, analytics, status);
});

afterEach(() => {
  dispose?.();
  vi.restoreAllMocks();
  sessionStorage.clear();
  document.body.replaceChildren();
});

function values(): readonly (string | null)[] {
  return [...html('analytics-metrics').querySelectorAll('.analytics-metric-value')].map(
    (node) => node.textContent,
  );
}

async function close(): Promise<void> {
  expect(dialog('analytics-dialog').open).toBe(true);
  const closed = new Promise<void>((resolve) =>
    dialog('analytics-dialog').addEventListener('close', () => resolve(), { once: true }),
  );
  dialog('analytics-dialog').querySelector<HTMLButtonElement>('[data-close]')?.click();
  await closed;
}

it('opens local Activity from the latest snapshot without storage or navigation', () => {
  // Given a changed source and browser storage that cannot be written.
  let snapshot = historySnapshot();
  dispose = setupWorldBridge(() => snapshot).dispose;
  snapshot = { ...historySnapshot(2025, 40), username: 'new-owner' };
  const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Storage unavailable', 'QuotaExceededError');
  });
  const location = window.location.href;
  expect(html('analytics-metrics').childElementCount).toBe(0);
  // When Activity opens on the SVG page.
  button('explore-activity').click();
  // Then the exact source is charted locally, with unavailable breakdowns preserved.
  expect(dialog('analytics-dialog').open).toBe(true);
  expect(html('analytics-account').textContent).toBe('new-owner · Activity');
  expect(values()).toEqual(['41', 'Not available', 'Not available', '2']);
  expect(html('analytics-table').textContent).toContain('2025-01-07');
  expect(storage).not.toHaveBeenCalled();
  expect(window.location.href).toBe(location);
  expect(document.querySelector('canvas')).toBeNull();
});

it('refreshes imported history on reopening and does not duplicate filter listeners', async () => {
  // Given an existing month filter and several opens of the same Activity control.
  let snapshot = historySnapshot();
  dispose = setupWorldBridge(() => snapshot).dispose;
  button('explore-activity').click();
  change('analytics-month', '2024-01');
  await close();
  snapshot = { ...historySnapshot(2025, 40), username: 'imported-owner' };
  button('explore-activity').click();
  await close();
  button('explore-activity').click();
  const render = vi.spyOn(html('analytics-trend'), 'replaceChildren');
  // When the current source is grouped by day.
  change('analytics-granularity', 'day');
  // Then stale filters reset and one filter change renders only the new history once.
  expect(select('analytics-month').value).toBe('');
  expect([...select('analytics-month').options].map((option) => option.value)).toEqual([
    '',
    '2025-01',
  ]);
  expect(html('analytics-account').textContent).toBe('imported-owner · Activity');
  expect(values()[0]).toBe('41');
  expect(html('analytics-table').textContent).toContain('2025-01-09');
  expect(html('analytics-table').textContent).not.toContain('2024-01');
  expect(render).toHaveBeenCalledTimes(1);
});

it('returns focus to Activity when its close button is used', async () => {
  // Given an open Activity dialog.
  const snapshot = historySnapshot();
  dispose = setupWorldBridge(() => snapshot).dispose;
  button('explore-activity').click();
  // When the close control is activated.
  await close();
  // Then the SVG page receives focus on its Activity button.
  expect(dialog('analytics-dialog').open).toBe(false);
  expect(document.activeElement).toBe(button('explore-activity'));
});

it('preserves chart tooltip Escape before dismissing Activity and restoring focus', async () => {
  // Given a keyboard-focused chart value in the open dialog.
  const snapshot = historySnapshot();
  dispose = setupWorldBridge(() => snapshot).dispose;
  button('explore-activity').click();
  const point = html('analytics-trend').querySelector<SVGElement>('.analytics-point');
  if (!point) throw new TypeError('Missing chart observation');
  point.focus();
  // When Escape first dismisses the tooltip and then the dialog.
  await userEvent.keyboard('{Escape}');
  expect(html('analytics-trend-tooltip').textContent).toBe('');
  expect(dialog('analytics-dialog').open).toBe(true);
  await userEvent.keyboard('{Escape}');
  // Then native dialog cancellation returns focus to Activity.
  await expect.poll(() => dialog('analytics-dialog').open).toBe(false);
  await expect.poll(() => document.activeElement).toBe(button('explore-activity'));
});

it('removes Activity and filter listeners when the bridge is disposed', async () => {
  // Given a previously used bridge and its rendered chart.
  const snapshot = historySnapshot();
  dispose = setupWorldBridge(() => snapshot).dispose;
  button('explore-activity').click();
  await close();
  const chart = html('analytics-trend').firstElementChild;
  // When the bridge lifetime ends and stale controls receive events.
  dispose();
  change('analytics-granularity', 'day');
  button('explore-activity').click();
  // Then listeners no longer open the dialog or render charts.
  expect(dialog('analytics-dialog').open).toBe(false);
  expect(html('analytics-trend').firstElementChild).toBe(chart);
});
