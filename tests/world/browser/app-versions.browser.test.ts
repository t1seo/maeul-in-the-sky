import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { startWorldApp } from '../../../src/world/app/app.js';
import { html, input, select } from '../../../src/world/app/dom.js';
import { createWorldDocument } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { parseSnapshot } from '../../../src/core/settings/parse.js';
import { setupVersionSelection } from '../../../src/world/app/versions.js';
import type { SnapshotV1 } from '../../../src/core/snapshot-types.js';
import { historySnapshot, upload } from '../../demo/browser/harness.js';

let app: Awaited<ReturnType<typeof startWorldApp>> | undefined;
let lifetime: AbortController;
beforeEach(() => {
  lifetime = new AbortController();
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
  html('world-host').style.cssText = 'width:800px;height:500px';
  sessionStorage.clear();
});
afterEach(async () => {
  lifetime.abort();
  await app?.dispose();
  app = undefined;
  vi.restoreAllMocks();
  sessionStorage.clear();
  document.body.replaceChildren();
});

async function open(search = '') {
  app = await startWorldApp({
    initialData: createWorldDocument({
      scene: TINY_WORLD_SCENE,
      sourceSnapshot: TINY_WORLD_INPUT.snapshot,
    }),
    databaseName: `app-versions-${crypto.randomUUID()}`,
    loaders: { map: mountMap, three: mountMap },
    search,
  });
  app.session.update({ motion: 'off' });
  return app;
}

function change(value: string): void {
  select('world-version').value = value;
  select('world-version').dispatchEvent(new Event('change', { bubbles: true }));
}

test.each(['current', 'classic'])(
  'shows the world version after arriving from %s SVG',
  async (version) => {
    const running = await open(`?renderer=${version}`);
    expect(document.querySelector('select#world-version')).not.toBeNull();
    expect(select('world-version').labels?.[0]?.textContent).toContain('View version');
    expect(select('world-version').value).toBe('world');
    const before = running.session.current();
    change('world');
    expect(sessionStorage.getItem('maeul-demo-transfer')).toBeNull();
    expect(running.session.current()).toEqual(before);
  },
);

test('keeps the world interactive and its source intact when version transfer storage fails', async () => {
  const running = await open();
  upload('world-file', historySnapshot(2024, 73));
  await expect.poll(() => running.session.current().sourceSnapshot.username).toBe('octocat');
  running.session.update({ motion: 'off' });
  const before = running.session.current();
  const save = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Storage full', 'QuotaExceededError');
  });
  change('classic');
  expect(save).toHaveBeenCalledOnce();
  const transfer = save.mock.calls[0];
  expect(transfer?.[0]).toBe('maeul-demo-transfer');
  expect(parseSnapshot(transfer?.[1])).toEqual(before.sourceSnapshot);
  expect(running.session.current()).toEqual(before);
  expect(select('world-version').value).toBe('world');
  expect(html('world-version-status').hidden).toBe(false);
  expect(html('world-version-status').getAttribute('role')).toBe('alert');
  expect(html('world-version-status').textContent).toContain('Your current world');
  input('world-date').value = '2024-01-07';
  input('world-date').dispatchEvent(new Event('change'));
  expect(running.session.current().view.cursorDate).toBe('2024-01-07');
  expect(html('world-host').querySelector('svg')).not.toBeNull();
  change('world');
  expect(html('world-version-status').hidden).toBe(true);
});

test('removes the version change listener when the app is disposed', async () => {
  const running = await open();
  await running.dispose();
  app = undefined;
  const save = vi.spyOn(Storage.prototype, 'setItem');
  change('current');
  expect(save).not.toHaveBeenCalled();
});

test.each(['current', 'classic'])(
  'transfers the latest exact schema-v1 snapshot before opening %s',
  (version) => {
    let snapshot = historySnapshot(2024, 8);
    const navigate = vi.fn((url: string) => {
      expect(url).toBe(`../?renderer=${version}`);
      expect(parseSnapshot(sessionStorage.getItem('maeul-demo-transfer'))).toEqual(snapshot);
    });
    setupVersionSelection(() => snapshot, lifetime.signal, navigate);
    snapshot = historySnapshot(2025, 29);
    const untouched = structuredClone(snapshot);
    change(version);
    expect(navigate).toHaveBeenCalledOnce();
    expect(snapshot).toEqual(untouched);
    expect(select('world-version').value).toBe('world');
    expect(html('world-version-status').hidden).toBe(true);
  },
);

test('validates the source before overwriting a pending transfer or navigating, and allows a retry', () => {
  let snapshot: SnapshotV1 = { ...historySnapshot(), year: 10000 };
  const navigate = vi.fn();
  sessionStorage.setItem('maeul-demo-transfer', 'previous transfer');
  setupVersionSelection(() => snapshot, lifetime.signal, navigate);
  change('classic');
  expect(navigate).not.toHaveBeenCalled();
  expect(sessionStorage.getItem('maeul-demo-transfer')).toBe('previous transfer');
  expect(html('world-version-status').hidden).toBe(false);
  expect(html('world-version-status').textContent).toContain(
    'Could not transfer the contribution records',
  );
  expect(select('world-version').value).toBe('world');
  snapshot = historySnapshot();
  change('classic');
  expect(navigate).toHaveBeenCalledWith('../?renderer=classic');
  expect(parseSnapshot(sessionStorage.getItem('maeul-demo-transfer'))).toEqual(snapshot);
  expect(html('world-version-status').hidden).toBe(true);
});

test('recovers locally if the browser refuses navigation', () => {
  const navigate = vi.fn(() => {
    throw new DOMException('Navigation unavailable', 'SecurityError');
  });
  setupVersionSelection(() => historySnapshot(), lifetime.signal, navigate);
  change('current');
  expect(navigate).toHaveBeenCalledOnce();
  expect(select('world-version').value).toBe('world');
  expect(html('world-version-status').hidden).toBe(false);
  expect(html('world-version-status').textContent).toContain('Your current world is unchanged');
  change('world');
  expect(html('world-version-status').hidden).toBe(true);
});
