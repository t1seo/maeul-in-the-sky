import { afterEach, expect, it, vi } from 'vitest';
import { setupWorldBridge } from '../../../src/demo/world-bridge.js';
import { parseSnapshot } from '../../../src/core/settings/parse.js';
import { historySnapshot } from './harness.js';

afterEach(() => {
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
  setupWorldBridge(() => snapshot);
  snapshot = historySnapshot(2025, 40);
  link.addEventListener('click', (event) => event.preventDefault());

  link.click();

  expect(parseSnapshot(sessionStorage.getItem('maeul-world-transfer') ?? '')).toEqual(snapshot);
  expect(link.getAttribute('href')).toBe('./world/?renderer=current');
});

it('keeps the demo open with a useful error when storage is unavailable', () => {
  const link = mountLink();
  link.removeAttribute('href');
  setupWorldBridge(() => historySnapshot());
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Storage unavailable', 'QuotaExceededError');
  });
  const click = new MouseEvent('click', { cancelable: true });

  link.dispatchEvent(click);

  expect(click.defaultPrevented).toBe(true);
  expect(document.getElementById('app-status')?.textContent).toContain('snapshot');
  expect(sessionStorage.getItem('maeul-world-transfer')).toBeNull();
});
