import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { startWorldApp } from '../../../src/world/app/app.js';
import { createWorldDocument } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { button, html, input, select } from '../../../src/world/app/dom.js';

let app: Awaited<ReturnType<typeof startWorldApp>> | undefined;
beforeEach(() => {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
  html('world-host').style.cssText = 'width:800px;height:500px';
  sessionStorage.clear();
});
afterEach(async () => {
  await app?.dispose();
  app = undefined;
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});
async function open() {
  app = await startWorldApp({
    databaseName: `app-controls-${crypto.randomUUID()}`,
    initialData: createWorldDocument({
      scene: TINY_WORLD_SCENE,
      sourceSnapshot: TINY_WORLD_INPUT.snapshot,
    }),
    loaders: { map: mountMap, three: mountMap },
    search: '',
  });
  return app;
}
function change(id: string, value: string): void {
  select(id).value = value;
  select(id).dispatchEvent(new Event('change'));
}

test('selecting a dated landscape shows that day rather than the end of replay', async () => {
  const running = await open();
  running.session.selectPlace('asset:2024-02-28');
  expect(input('world-date').value).toBe('2024-02-28');
  expect(html('day-details').textContent).toContain('5 contributions');
  expect(running.session.current().view.cursorDate).toBe('2024-02-29');
});

test('replays dates, pauses explicitly and stops when reaching the final day', async () => {
  const running = await open();
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
  button('replay-play').click();
  expect(running.session.current().view.cursorDate).toBe('2024-02-28');
  expect(button('replay-play').getAttribute('aria-pressed')).toBe('true');
  await vi.advanceTimersByTimeAsync(650);
  expect(running.session.current().view.cursorDate).toBe('2024-02-29');
  await vi.advanceTimersByTimeAsync(650);
  expect(button('replay-play').getAttribute('aria-pressed')).toBe('false');
  button('replay-play').click();
  button('replay-play').click();
  await vi.advanceTimersByTimeAsync(1300);
  expect(running.session.current().view.cursorDate).toBe('2024-02-28');
  button('replay-play').click();
  await vi.advanceTimersByTimeAsync(650);
  expect(running.session.current().view.cursorDate).toBe('2024-02-29');
  button('replay-play').click();
  input('replay-range').value = '1';
  input('replay-range').dispatchEvent(new Event('input'));
  expect(running.session.current().view.cursorDate).toBe('2024-02-29');
  input('world-date').value = '2020-01-01';
  input('world-date').dispatchEvent(new Event('change'));
  expect(html('world-status').textContent).toContain('within this world’s date range');
  const focus = running.session.current().view.focus;
  button('focus-date').click();
  expect(running.session.current().view.focus).toEqual(focus);
});

test('rebuilds layout, hemisphere and culture, then focuses months and follows real actors', async () => {
  const running = await open();
  change('world-layout', 'island');
  await expect.poll(() => running.session.current().scene.settings.layout).toBe('island');
  change('world-culture', 'classic');
  await expect.poll(() => running.session.current().scene.settings.culture).toBe('classic');
  change('world-hemisphere', 'south');
  await expect.poll(() => running.session.current().scene.settings.hemisphere).toBe('south');
  html('month-nav').querySelector<HTMLButtonElement>('button')?.click();
  expect(running.session.current().view.focus.kind).toBe('month');
  expect(select('actor-follow').options.length).toBeGreaterThan(1);
  const actor = select('actor-follow').options[1]?.value;
  if (!actor) throw new Error('Actor missing');
  change('actor-follow', actor);
  expect(running.session.current().view.followActorId).toBe(actor);
  change('actor-follow', '');
  expect(running.session.current().view.followActorId).toBeUndefined();
  button('zoom-in').click();
  html('world-host').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
  expect(running.session.current().view.focus.kind).toBe('world');
});

test('honors reduced motion at startup and stops replay when the preference changes', async () => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const matches = vi.spyOn(media, 'matches', 'get').mockReturnValue(true);
  vi.spyOn(window, 'matchMedia').mockReturnValue(media);
  const running = await open();
  expect(running.session.current().view.motion).toBe('off');
  matches.mockReturnValue(false);
  change('world-motion', 'full');
  button('replay-play').click();
  matches.mockReturnValue(true);
  media.dispatchEvent(new Event('change'));
  expect(running.session.current().view.motion).toBe('off');
  expect(button('replay-play').getAttribute('aria-pressed')).toBe('false');
  matches.mockReturnValue(false);
  media.dispatchEvent(new Event('change'));
  expect(running.session.current().view.motion).toBe('off');
  expect(button('replay-play').getAttribute('aria-pressed')).toBe('false');
});

test('uses seasonal weather by default and keeps explicit weather overrides available', async () => {
  const running = await open();
  expect(select('world-weather').options[0]?.textContent).toBe('Seasonal weather');
  expect(running.session.current().view.weather).toBe('seasonal');
  change('world-weather', 'rain');
  expect(running.session.current().view.weather).toBe('rain');
  change('world-weather', 'seasonal');
  change('world-season', 'spring');
  expect(running.session.current().view.weather).toBe('seasonal');
  expect(html('photo-atmosphere').textContent).toContain('Seasonal weather');
  expect(html('photo-atmosphere').textContent).toContain('Spring scenery');
});
