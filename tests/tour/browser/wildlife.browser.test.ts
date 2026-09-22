import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import markup from '../../../docs/demo/tour/index.html?raw';
import stylesheet from '../../../docs/demo/tour/tour.css?raw';
import { mountTestTour as mountTour } from './fixture.js';
import { buttonElement, element } from '../../../src/tour/app/dom.js';

let app: ReturnType<typeof mountTour> | null = null;
afterEach(() => {
  app?.dispose();
  app = null;
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

beforeEach(() => {
  const parsed = new DOMParser().parseFromString(markup, 'text/html');
  parsed.querySelectorAll('script').forEach((script) => script.remove());
  document.body.replaceChildren(...parsed.body.childNodes);
  const style = document.createElement('style');
  style.textContent = stylesheet;
  document.body.prepend(style);
});

it('opens the actual authored cow and squirrel in the sample village', async () => {
  app = mountTour('https://example.github.io/tour/');
  await expect.poll(() => app?.inspect(), { timeout: 15000 }).not.toBeNull();
  expect(app.inspect()).toMatchObject({
    wildlife: { species: expect.arrayContaining(['cow', 'squirrel']) },
  });
  expect(app.inspect()?.drawCalls).toBeLessThan(350);
});

it('shows an honest model download failure and recovers the same sample on Retry', async () => {
  const nativeFetch = globalThis.fetch;
  const fetcher = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation((input, init) =>
      String(input).endsWith('cow.glb')
        ? Promise.resolve(new Response('', { status: 404 }))
        : nativeFetch(input, init),
    );
  app = mountTour('https://example.github.io/tour/');
  await expect
    .poll(() => element('loading-message').textContent, { timeout: 15000 })
    .toContain('animal models');
  expect(app.inspect()).toBeNull();
  expect(element('fallback-image').hidden).toBe(false);
  fetcher.mockRestore();
  buttonElement('retry').click();
  await expect.poll(() => app?.inspect(), { timeout: 15000 }).not.toBeNull();
  expect(element('source-tag').textContent).toContain('SAMPLE');
  expect(app.inspect()?.wildlife.species).toContain('cow');
});
