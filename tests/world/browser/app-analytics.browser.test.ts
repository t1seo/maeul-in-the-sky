import { afterEach, beforeEach, expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import type { SnapshotV1 } from '../../../src/core/snapshot-types.js';
import { setupAnalytics } from '../../../src/world/analytics/index.js';
import { createWorldSession } from '../../../src/world/app/session.js';
import type { WorldSession } from '../../../src/world/app/session.js';
import { button, dialog, html, select } from '../../../src/world/app/dom.js';
import { createWorldDocument } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { activity, records, snapshot } from '../analytics/fixtures.js';

const history = [...records, ['2024-02-28', 5], ['2024-02-29', 0], ['2024-03-01', 7]] as const;
let session: WorldSession;
let controller: AbortController;
let analytics: ReturnType<typeof setupAnalytics>;

beforeEach(() => {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
  html('world-host').style.cssText = 'width:800px;height:500px';
  dialog('analytics-dialog').style.width = '360px';
  for (const id of ['analytics-trend', 'analytics-breakdown', 'analytics-weekdays'])
    html(id).style.width = '320px';
  controller = new AbortController();
});
afterEach(() => {
  controller.abort();
  session?.dispose();
  document.body.replaceChildren();
});

function prepare(source: SnapshotV1 = snapshot(history, activity)): void {
  const initial = createWorldDocument({
    scene: TINY_WORLD_SCENE,
    sourceSnapshot: TINY_WORLD_INPUT.snapshot,
  });
  session = createWorldSession(
    { ...initial, sourceSnapshot: source },
    { map: mountMap, three: mountMap },
  );
  analytics = setupAnalytics(() => session.current().sourceSnapshot, controller.signal);
}
function open(): void {
  dialog('analytics-dialog').showModal();
  analytics.refresh();
}
function change(id: string, value: string): void {
  select(id).value = value;
  select(id).dispatchEvent(new Event('change'));
}
function values(): readonly (string | null)[] {
  return [...html('analytics-metrics').querySelectorAll('.analytics-metric-value')].map(
    (node) => node.textContent,
  );
}

test('renders lazily from the entire source snapshot and reuses the DOM during replay', () => {
  // Given a source history that extends beyond the displayed scene.
  prepare();
  expect(html('analytics-metrics').childElementCount).toBe(0);
  // When the dialog is opened and replay changes without a source change.
  open();
  const first = html('analytics-trend').firstElementChild;
  session.update({ cursorDate: '2024-02-28' });
  analytics.refresh();
  // Then totals retain the whole source history and no duplicate render occurs.
  expect(values()).toEqual(['19', '2', '4', '4']);
  expect(html('analytics-period').textContent).toContain('2024-01-30 – 2024-03-01');
  expect(html('analytics-source').textContent).toContain('Sample data');
  expect(html('analytics-trend').firstElementChild).toBe(first);
  expect(html('analytics-availability').textContent).toContain('2 of 3 months');
});

test('filters exact months while exposing unavailable breakdown and real zero values', () => {
  // Given sparse observations with recorded January and February breakdown.
  prepare();
  open();
  // When February is selected and grouped by day.
  change('analytics-month', '2024-02');
  change('analytics-granularity', 'day');
  // Then only February counts are used, and missing days remain distinct from zero.
  expect(values()).toEqual(['10', '0', '4', '2']);
  expect(html('analytics-coverage').textContent).toContain('3 of 29 calendar days observed');
  expect(html('analytics-trend').querySelector('[data-value="0"]')).not.toBeNull();
  expect(html('analytics-trend').querySelector('[data-value="unavailable"]')).not.toBeNull();
  expect(html('analytics-table').textContent).toContain('2024-02-29');
  expect(html('analytics-table').textContent).toContain('Partial month');
  change('analytics-month', '2024-03');
  expect(values()).toEqual(['7', 'Not available', 'Not available', '1']);
});

test('exposes exact values with keyboard, pointer and touch-compatible click tooltips', async () => {
  // Given an open dashboard with focusable SVG observations.
  prepare();
  open();
  const points = [...html('analytics-trend').querySelectorAll<SVGElement>('.analytics-point')];
  const first = points[0];
  const second = points[1];
  if (!first || !second) throw new Error('Expected multiple trend points');
  // When focus, arrow keys, dismissal and pointer interaction inspect values.
  first.focus();
  expect(html('analytics-trend-tooltip').textContent).toBe(first.getAttribute('aria-label'));
  first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  expect(document.activeElement).toBe(second);
  expect(html('analytics-trend-tooltip').textContent).toBe(second.getAttribute('aria-label'));
  second.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(html('analytics-trend-tooltip').textContent).toBe('');
  first.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
  // Then the complete tooltip is also available without hover-only access.
  expect(html('analytics-trend-tooltip').textContent).toBe(first.getAttribute('aria-label'));
  second.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  expect(html('analytics-trend-tooltip').textContent).toBe(second.getAttribute('aria-label'));
  await userEvent.keyboard('{Escape}');
  expect(dialog('analytics-dialog').open).toBe(true);
  await userEvent.keyboard('{Escape}');
  expect(dialog('analytics-dialog').open).toBe(false);
});

test('keeps axes readable at narrow widths and responds to visible dialog resizing', async () => {
  // Given a chart container with a narrow mobile width.
  prepare();
  open();
  // When the open dialog and chart width change.
  const before = html('analytics-trend').querySelector('svg');
  expect(before?.getAttribute('viewBox')).toBe('0 0 320 240');
  for (const id of ['analytics-weekdays', 'analytics-breakdown']) {
    for (const bar of html(id).querySelectorAll<SVGRectElement>('.analytics-bar')) {
      expect(bar.x.baseVal.value).toBeGreaterThanOrEqual(58);
      expect(bar.x.baseVal.value + bar.width.baseVal.value).toBeLessThanOrEqual(302);
    }
  }
  dialog('analytics-dialog').style.width = '480px';
  html('analytics-trend').style.width = '440px';
  // Then a bounded resize refresh adjusts coordinates instead of shrinking text.
  await expect
    .poll(() => html('analytics-trend').querySelector('svg')?.getAttribute('viewBox'))
    .toBe('0 0 440 240');
  expect(html('analytics-trend').querySelectorAll('.analytics-axis').length).toBeLessThanOrEqual(
    10,
  );
});

test('keeps legacy metadata unavailable and treats account names as text', () => {
  // Given a legacy source and a display name containing markup characters.
  prepare({ ...snapshot(history), username: '<b>owner & 마을</b>' });
  // When analytics renders its source identity.
  open();
  // Then no element is created from the name and no breakdown is fabricated.
  expect(html('analytics-account').textContent).toBe('<b>owner & 마을</b> · Activity');
  expect(html('analytics-account').querySelector('b')).toBeNull();
  expect(values()).toEqual(['19', 'Not available', 'Not available', '4']);
  expect(html('analytics-breakdown').textContent).toContain('Not available in this snapshot');
  expect(html('analytics-table').querySelectorAll('table')).toHaveLength(3);
});

test('updates a replaced source and stops all refreshes and listeners on abort', async () => {
  // Given a rendered original source.
  prepare();
  open();
  // When a new source is opened and the analytics lifetime ends afterward.
  const replacement = createWorldDocument({
    scene: TINY_WORLD_SCENE,
    sourceSnapshot: TINY_WORLD_INPUT.snapshot,
  });
  await session.open(replacement);
  analytics.refresh();
  expect(values()).toEqual(['5', 'Not available', 'Not available', '1']);
  const content = html('analytics-trend').firstElementChild;
  controller.abort();
  change('analytics-granularity', 'day');
  analytics.refresh();
  // Then the detached lifetime cannot mutate or rerender the UI.
  expect(html('analytics-trend').firstElementChild).toBe(content);
  document.body.replaceChildren();
  expect(() => analytics.refresh()).not.toThrow();
});

test('pages complete numeric history with bounded SVG and table rows while retaining focus', () => {
  const source = snapshot(
    Array.from(
      { length: 365 },
      (_, day) =>
        [
          new Date(Date.parse('2024-01-01T00:00:00Z') + day * 86_400_000)
            .toISOString()
            .slice(0, 10),
          1,
        ] as const,
    ),
  );
  prepare(source);
  open();
  change('analytics-granularity', 'day');
  expect(html('analytics-trend').querySelectorAll('.analytics-point')).toHaveLength(160);
  expect(html('analytics-table').querySelector('tbody')?.childElementCount).toBe(160);
  button('analytics-trend-next').click();
  button('analytics-trend-next').click();
  expect(html('analytics-trend').querySelectorAll('.analytics-point')).toHaveLength(45);
  expect(document.activeElement).toBe(button('analytics-trend-previous'));
  button('analytics-table-trend-next').click();
  button('analytics-table-trend-next').click();
  expect(html('analytics-table').querySelector('tbody')?.childElementCount).toBe(45);
  expect(html('analytics-table').querySelector('tbody')?.textContent).toContain('2024-12-30');
});
