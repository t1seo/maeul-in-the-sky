import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import markup from '../../../docs/demo/tour/index.html?raw';
import stylesheet from '../../../docs/demo/tour/tour.css?raw';
import { mountTour } from '../../../src/tour/app/main.js';
import { buttonElement, canvasElement, element } from '../../../src/tour/app/dom.js';
import { sampleSnapshot } from '../../../src/demo/sample.js';

let app: ReturnType<typeof mountTour> | null = null;
beforeEach(() => {
  const parsed = new DOMParser().parseFromString(markup, 'text/html');
  parsed.querySelectorAll('script').forEach((script) => script.remove());
  document.body.replaceChildren(...parsed.body.childNodes);
  const style = document.createElement('style');
  style.textContent = stylesheet;
  document.body.prepend(style);
  canvasElement('village').style.cssText = 'width:900px;height:600px';
});
afterEach(() => {
  app?.dispose();
  app = null;
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe('tour entrance and controls', () => {
  it('never substitutes the sample when a requested source is invalid', async () => {
    app = mountTour('https://example.github.io/tour/?snapshot=https://evil.example/history.json');
    await expect.poll(() => element('loading-title').textContent).toBe('잠시, 마을 입구에서');
    expect(element('retry').hidden).toBe(false);
    expect(element('fallback-link').hidden).toBe(false);
    expect(app.inspect()).toBeNull();
    buttonElement('retry').click();
    await expect.poll(() => element('retry').hidden).toBe(false);
  });

  it('reports a missing snapshot and oversized body without inventing activity', async () => {
    const fetcher = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('', { status: 404 }));
    app = mountTour(
      'https://example.github.io/tour/?snapshot=https://raw.githubusercontent.com/u/r/main/no.json',
    );
    await expect.poll(() => element('loading-message').textContent).toContain('찾지 못했습니다');
    fetcher.mockResolvedValue(
      new Response('', { headers: { 'content-length': String(3 * 1024 * 1024) } }),
    );
    await app.reload();
    expect(element('loading-message').textContent).toContain('용량을 초과');
    expect(app.inspect()).toBeNull();
  });

  it('keeps navigation, keyboard, touch, inspection and lighting usable in a real scene', async () => {
    app = mountTour('https://example.github.io/tour/');
    await expect.poll(() => app?.inspect(), { timeout: 15000 }).not.toBeNull();
    expect(element('loading-screen').hidden).toBe(true);
    expect(element('source-tag').textContent).toContain('SAMPLE');
    buttonElement('help-toggle').click();
    expect(element('help-panel').hidden).toBe(false);
    buttonElement('help-toggle').click();
    buttonElement('walk-toggle').click();
    expect(app.inspect()?.mode).toBe('walk');
    expect(element('walk-pad').hidden).toBe(false);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
    window.dispatchEvent(new Event('blur'));
    expect(app.inspect()?.mode).toBe('orbit');
    expect(element('walk-pad').hidden).toBe(true);
    buttonElement('walk-toggle').click();
    buttonElement('walk-toggle').click();
    buttonElement('tour-play').click();
    expect(app.inspect()?.touring).toBe(true);
    buttonElement('tour-play').click();
    expect(app.inspect()?.touring).toBe(false);
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-light]'))
      button.click();
    expect(document.body.dataset.light).toBe('night');
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-stop]'))
      button.click();
    expect(app.inspect()?.stopIndex).toBe(3);
    buttonElement('overview').click();
    buttonElement('home-view').click();
    const canvas = canvasElement('village');
    for (const x of [450]) {
      await page.elementLocator(canvas).click({ position: { x, y: 300 } });
    }
    buttonElement('detail-close').click();
    expect(element('detail-panel').hidden).toBe(true);
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    await expect.poll(() => app?.inspect()?.disposed, { timeout: 15000 }).toBe(false);
    buttonElement('walk-toggle').click();
    expect(app.inspect()?.mode).toBe('walk');
    app.dispose();
    app.dispose();
    expect(app.inspect()?.disposed).toBe(true);
  }, 30000);

  it('shows an accessible fallback if WebGL is unavailable', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    app = mountTour('https://example.github.io/tour/');
    await expect.poll(() => element('loading-message').textContent).toContain('WebGL');
    expect(element('fallback-link').hidden).toBe(false);
    expect(element('retry').hidden).toBe(false);
  });

  it('reopens the same village on a fresh canvas after genuine context loss', async () => {
    app = mountTour('https://example.github.io/tour/');
    await expect.poll(() => app?.inspect(), { timeout: 15000 }).not.toBeNull();
    const original = canvasElement('village');
    const context = original.getContext('webgl2');
    if (!context) throw new Error('Expected the real WebGL2 context');
    const extension: WEBGL_lose_context | null = context.getExtension('WEBGL_lose_context');
    if (!extension) throw new Error('Expected context loss extension');
    extension.loseContext();
    await expect.poll(() => element('loading-message').textContent).toContain('연결이 중단');
    buttonElement('retry').click();
    await expect.poll(() => element('loading-screen').hidden, { timeout: 15000 }).toBe(true);
    expect(canvasElement('village')).not.toBe(original);
    expect(app.inspect()?.triangles).toBeGreaterThan(1000);
    buttonElement('walk-toggle').click();
    expect(app.inspect()?.mode).toBe('walk');
  }, 30000);

  it('discards an interrupted load and preserves hostile source labels as plain text', async () => {
    const snapshot = sampleSnapshot();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(snapshot)));
    app = mountTour(
      'https://example.github.io/tour/?snapshot=https://raw.githubusercontent.com/u/r/main/v.json',
    );
    app.dispose();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    expect(app.inspect()).toBeNull();
    expect(() => element('absent')).toThrow('Missing');
    expect(() => canvasElement('owner')).toThrow('Expected canvas');
    expect(() => buttonElement('owner')).toThrow('Expected button');
  });
});
