import { afterEach, expect, it, vi } from 'vitest';
import {
  CURRENT_RENDERER,
  createClassicLoader,
  type DemoRenderer,
} from '../../../src/demo/renderers.js';
import { setupVersionSelector } from '../../../src/demo/version-selector.js';
import { updateFormLabels } from '../../../src/demo/settings.js';
import { consumeDemoTransfer } from '../../../src/demo/world-bridge.js';
import { serializeSnapshot } from '../../../src/core/settings/serialize.js';
import { demoQuery, parseDemoQuery } from '../../../src/demo/state.js';
import { historySnapshot, mountEnhancedPage, node } from './harness.js';

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('keeps the current choice when a slower classic request finishes last', async () => {
  mountEnhancedPage();
  let finish: (renderer: DemoRenderer) => void = () => undefined;
  const loading = new Promise<DemoRenderer>((resolve) => {
    finish = resolve;
  });
  const apply = vi.fn();
  const choose = setupVersionSelector(
    () => parseDemoQuery(''),
    apply,
    vi.fn(),
    () => loading,
  );

  const pending = choose('classic');
  await choose('current');
  finish({ ...CURRENT_RENDERER, version: 'classic' });
  await pending;

  expect(apply).toHaveBeenCalledExactlyOnceWith(CURRENT_RENDERER, undefined, true);
  expect(node('#renderer-version', HTMLSelectElement).value).toBe('current');
  expect(node('#renderer-status', HTMLElement).textContent).toContain('Current applied');
  expect(node('#renderer-selection', HTMLElement).getAttribute('aria-busy')).toBe('false');
});

it('keeps the active scene and permits retry when classic fails to load', async () => {
  mountEnhancedPage();
  const apply = vi.fn();
  const recover = vi.fn();
  const load = vi
    .fn<() => Promise<DemoRenderer>>()
    .mockRejectedValueOnce(new TypeError('Network unavailable'))
    .mockResolvedValueOnce({ ...CURRENT_RENDERER, version: 'classic' });
  const choose = setupVersionSelector(() => parseDemoQuery(''), apply, recover, load);

  const pending = choose('classic');
  updateFormLabels();
  expect(node('#terrain-mode', HTMLSelectElement).disabled).toBe(true);
  await pending;

  expect(apply).not.toHaveBeenCalled();
  expect(recover).toHaveBeenCalledOnce();
  expect(node('#renderer-version', HTMLSelectElement).value).toBe('current');
  expect(node('#terrain-mode', HTMLSelectElement).disabled).toBe(false);
  expect(node('#renderer-status', HTMLElement).textContent).toContain('previous scene is kept');
  await choose('classic');
  expect(apply).toHaveBeenCalledOnce();
});

it('discards obsolete failures when a newer choice has succeeded', async () => {
  mountEnhancedPage();
  let fail: (error: Error) => void = () => undefined;
  const loading = new Promise<DemoRenderer>((_, reject) => {
    fail = reject;
  });
  const recover = vi.fn();
  const choose = setupVersionSelector(
    () => parseDemoQuery(''),
    vi.fn(),
    recover,
    () => loading,
  );

  const pending = choose('classic');
  await choose('current');
  fail(new TypeError('Old failure'));
  await pending;

  expect(recover).not.toHaveBeenCalled();
  expect(node('#renderer-status', HTMLElement).dataset.error).toBe('false');
});

it.each([
  { edits: [], title: 'History', mode: 'light' },
  { edits: ['Edited'], title: 'Edited', mode: 'dark' },
  { edits: ['Edited', 'Current'], title: 'Current', mode: 'dark' },
])(
  'preserves the latest intent while classic loads (edits: $edits)',
  async ({ edits, title, mode }) => {
    mountEnhancedPage();
    let settings = parseDemoQuery('?title=Current&mode=dark');
    let editRevision = 0;
    const history = parseDemoQuery('?renderer=classic&title=History&mode=light');
    let finish: (renderer: DemoRenderer) => void = () => undefined;
    const loading = new Promise<DemoRenderer>((resolve) => {
      finish = resolve;
    });
    const choose = setupVersionSelector(
      () => settings,
      (renderer, restored) => {
        settings = { ...(restored ?? settings), renderer: renderer.version };
      },
      vi.fn(),
      () => loading,
      () => editRevision,
    );

    const pending = choose('classic', history, false);
    for (const edit of edits) {
      settings = parseDemoQuery(`?title=${edit}&mode=dark`);
      editRevision++;
    }
    finish({ ...CURRENT_RENDERER, version: 'classic' });
    await pending;

    expect(settings.document.settings.title).toBe(title);
    expect(settings.mode).toBe(mode);
    expect(settings.renderer).toBe('classic');
  },
);

it('restores pending history when the current settings have equal values but new identities', async () => {
  // Given: reading settings returns fresh parsed objects with unchanged values.
  mountEnhancedPage();
  const current = parseDemoQuery('?title=Current&mode=dark');
  const history = parseDemoQuery('?renderer=classic&title=History&mode=light&density=8');
  const apply = vi.fn();
  const renderer: DemoRenderer = { ...CURRENT_RENDERER, version: 'classic' };
  const choose = setupVersionSelector(
    () => parseDemoQuery(demoQuery(current)),
    apply,
    vi.fn(),
    async () => renderer,
  );

  // When: the historical renderer finishes loading without a semantic settings edit.
  await choose('classic', history, false);

  // Then: all pending settings are restored despite the fresh object identities.
  expect(apply).toHaveBeenCalledExactlyOnceWith(renderer, history, false);
});

it('retries a failed module URL and caches only a valid classic engine', async () => {
  const importer = vi
    .fn<(url: string) => Promise<unknown>>()
    .mockResolvedValueOnce({ renderTerrain: 'invalid' })
    .mockResolvedValueOnce({ renderTerrain: CURRENT_RENDERER.renderTerrain });
  const load = createClassicLoader(importer);

  await expect(load()).rejects.toThrow();
  const restored = await load();
  const cached = await load();

  expect(restored.version).toBe('classic');
  expect(cached).toBe(restored);
  expect(importer).toHaveBeenCalledTimes(2);
  const urls = importer.mock.calls.map(([url]) => new URL(url));
  expect(urls[0]?.origin).toBe(window.location.origin);
  expect(urls[1]?.searchParams.get('retry')).toBe('1');
});

it('clears a transferred snapshot only after the receiving scene accepts it', () => {
  const snapshot = historySnapshot(2025, 40);
  sessionStorage.setItem('maeul-demo-transfer', serializeSnapshot(snapshot));
  const open = vi.fn();

  consumeDemoTransfer(open);
  consumeDemoTransfer(open);

  expect(open).toHaveBeenCalledExactlyOnceWith(snapshot);
  expect(sessionStorage.getItem('maeul-demo-transfer')).toBeNull();
});

it('releases a stalled classic request when its loading deadline expires', async () => {
  vi.useFakeTimers();
  const load = createClassicLoader(() => new Promise(() => undefined));

  const pending = expect(load()).rejects.toThrow('classic download timed out');
  await vi.advanceTimersByTimeAsync(15_000);

  await pending;
  expect(vi.getTimerCount()).toBe(0);
});

it('retains a newer transfer when opening the previous one produces another saved snapshot', () => {
  const newer = serializeSnapshot(historySnapshot(2025, 10));
  sessionStorage.setItem('maeul-demo-transfer', serializeSnapshot(historySnapshot()));

  consumeDemoTransfer(() => sessionStorage.setItem('maeul-demo-transfer', newer));

  expect(sessionStorage.getItem('maeul-demo-transfer')).toBe(newer);
});

it.each(['invalid', 'render failure'])(
  'preserves a transfer when restoration encounters %s',
  (failure) => {
    mountEnhancedPage();
    const saved = failure === 'invalid' ? '{broken' : serializeSnapshot(historySnapshot());
    sessionStorage.setItem('maeul-demo-transfer', saved);

    consumeDemoTransfer(() => {
      throw new TypeError('Unable to render');
    });

    expect(sessionStorage.getItem('maeul-demo-transfer')).toBe(saved);
    expect(node('#app-status', HTMLElement).textContent).toContain('saved transfer are kept');
  },
);
