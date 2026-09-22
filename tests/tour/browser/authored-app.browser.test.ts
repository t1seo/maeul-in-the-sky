import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import markup from '../../../docs/demo/tour/index.html?raw';
import stylesheet from '../../../docs/demo/tour/tour.css?raw';
import { mountTestTour } from './fixture.js';
import { buttonElement, element } from '../../../src/tour/app/dom.js';

let app: ReturnType<typeof mountTestTour> | null = null;

beforeEach(() => {
  const parsed = new DOMParser().parseFromString(markup, 'text/html');
  parsed.querySelectorAll('script').forEach((script) => script.remove());
  document.body.replaceChildren(...parsed.body.childNodes);
  const style = document.createElement('style');
  style.textContent = stylesheet;
  document.body.prepend(style);
});

afterEach(() => {
  app?.dispose();
  app = null;
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

it('opens the sample with detailed external plants and buildings and keeps walking available', async () => {
  app = mountTestTour('https://example.github.io/tour/');
  await expect.poll(() => app?.inspect(), { timeout: 20000 }).not.toBeNull();
  expect(app.inspect()?.authored.count).toBeGreaterThan(100);
  expect(app.inspect()?.drawCalls).toBeLessThan(350);
  buttonElement('walk-toggle').click();
  expect(app.inspect()?.mode).toBe('walk');
  expect(element('source-tag').textContent).toContain('SAMPLE');
}, 30000);

it('reports a failed nature collection and retries the same village with fresh resources', async () => {
  const nativeFetch = globalThis.fetch;
  const fetcher = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation((input, init) =>
      String(input).endsWith('/nature/nature-collection.glb')
        ? Promise.resolve(new Response('', { status: 404 }))
        : nativeFetch(input, init),
    );
  app = mountTestTour('https://example.github.io/tour/');
  await expect
    .poll(() => element('loading-title').textContent, { timeout: 20000 })
    .toBe('The village could not open');
  expect(element('fallback-image').hidden).toBe(false);
  expect(app.inspect()).toBeNull();
  fetcher.mockRestore();
  buttonElement('retry').click();
  await expect.poll(() => app?.inspect(), { timeout: 20000 }).not.toBeNull();
  expect(app.inspect()?.authored.count).toBeGreaterThan(100);
  expect(element('source-tag').textContent).toContain('SAMPLE');
}, 45000);
