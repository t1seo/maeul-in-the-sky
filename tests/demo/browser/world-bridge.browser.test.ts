import { afterEach, expect, it, vi } from 'vitest';
import { setupWorldBridge } from '../../../src/demo/world-bridge.js';
import { parseSnapshot } from '../../../src/core/settings/parse.js';
import { historySnapshot } from './harness.js';

let dispose: (() => void) | undefined;

afterEach(() => {
  dispose?.();
  vi.restoreAllMocks();
  sessionStorage.clear();
  document.body.replaceChildren();
});

function mountLink(): HTMLAnchorElement {
  const link = document.createElement('a');
  link.id = 'explore-world';
  link.href = './world/';
  link.textContent = 'Explore your world';
  const status = document.createElement('p');
  status.id = 'app-status';
  document.body.replaceChildren(link, status);
  return link;
}

it('transfers the current snapshot when the world link opens', () => {
  const link = mountLink();
  let snapshot = historySnapshot();
  dispose = setupWorldBridge(() => snapshot).dispose;
  snapshot = historySnapshot(2025, 40);
  link.addEventListener('click', (event) => event.preventDefault());

  link.click();

  expect(parseSnapshot(sessionStorage.getItem('maeul-world-transfer') ?? '')).toEqual(snapshot);
  expect(link.getAttribute('href')).toBe('./world/?renderer=current');
});

it('keeps the demo open with a useful error when storage is unavailable', () => {
  const link = mountLink();
  link.removeAttribute('href');
  dispose = setupWorldBridge(() => historySnapshot()).dispose;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Storage unavailable', 'QuotaExceededError');
  });
  const click = new MouseEvent('click', { cancelable: true });

  link.dispatchEvent(click);

  expect(click.defaultPrevented).toBe(true);
  expect(document.getElementById('app-status')?.textContent).toContain('snapshot');
  expect(sessionStorage.getItem('maeul-world-transfer')).toBeNull();
});

it('transfers current preview settings independently of the analytics source getter', () => {
  const link = mountLink();
  const source = historySnapshot();
  const preview = { ...source, settings: { ...source.settings, title: 'Updated preview title' } };
  dispose = setupWorldBridge(
    () => source,
    () => 'current',
    () => preview,
  ).dispose;
  link.addEventListener('click', (event) => event.preventDefault());

  link.click();

  expect(parseSnapshot(sessionStorage.getItem('maeul-world-transfer') ?? '')).toEqual(preview);
  expect(source.settings.title).toBe('My history');
});

it('preserves the archived world transfer with the current renderer selection', () => {
  const link = mountLink();
  const archive = document.createElement('details');
  archive.id = 'world-archive';
  link.before(archive);
  archive.append(link);
  let snapshot = historySnapshot();
  dispose = setupWorldBridge(
    () => snapshot,
    () => 'classic',
  ).dispose;
  snapshot = historySnapshot(2025, 40);
  link.addEventListener('click', (event) => event.preventDefault());

  link.click();

  expect(parseSnapshot(sessionStorage.getItem('maeul-world-transfer') ?? '')).toEqual(snapshot);
  expect(link.getAttribute('href')).toBe('./world/?renderer=classic');
  expect(archive.open).toBe(false);
});
