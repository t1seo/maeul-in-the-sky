import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import markup from '../../../docs/demo/tour/index.html?raw';
import stylesheet from '../../../docs/demo/tour/tour.css?raw';
import { mountTestTour as mountTour } from './fixture.js';
import { buttonElement, canvasElement, element } from '../../../src/tour/app/dom.js';
import { sampleSnapshot } from '../../../src/demo/sample.js';
import { parseTourSnapshot } from '../../../src/tour/model/snapshot.js';
import { projectMapPoint } from '../../../src/tour/app/map-coordinates.js';

async function frames(count = 5): Promise<void> {
  for (let index = 0; index < count; index++)
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

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
    await expect
      .poll(() => element('loading-title').textContent)
      .toBe('The village could not open');
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
    await expect.poll(() => element('loading-message').textContent).toContain('was not found');
    fetcher.mockResolvedValue(
      new Response('', { headers: { 'content-length': String(3 * 1024 * 1024) } }),
    );
    await app.reload();
    expect(element('loading-message').textContent).toContain('download size limit');
    expect(app.inspect()).toBeNull();
  });

  it('keeps navigation, keyboard, touch, inspection and lighting usable in a real scene', async () => {
    app = mountTour('https://example.github.io/tour/');
    await expect.poll(() => app?.inspect(), { timeout: 15000 }).not.toBeNull();
    expect(element('loading-screen').hidden).toBe(true);
    expect(element('source-tag').textContent).toContain('SAMPLE');
    expect(document.body.textContent).not.toMatch(/[가-힣]/u);
    expect(element('date-range').textContent).toMatch(/[A-Z][a-z]+ \d+, 20\d\d/u);
    buttonElement('help-toggle').click();
    expect(element('help-panel').hidden).toBe(false);
    expect(element('map-panel').hidden).toBe(true);
    expect(buttonElement('map-toggle').getAttribute('aria-expanded')).toBe('false');
    buttonElement('map-toggle').click();
    expect(element('help-panel').hidden).toBe(true);
    expect(buttonElement('help-toggle').getAttribute('aria-expanded')).toBe('false');
    buttonElement('map-close').click();
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
    await expect
      .poll(() => element('loading-message').textContent)
      .toContain('connection was interrupted');
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

  it('turns while a touch control is held and stops immediately when the touch is canceled', async () => {
    app = mountTour('https://example.github.io/tour/');
    await expect.poll(() => app?.inspect(), { timeout: 15000 }).not.toBeNull();
    buttonElement('walk-toggle').click();
    const before = app.inspect();
    if (!before) throw new Error('Expected a loaded village');
    const turn = buttonElement('turn-left');
    vi.spyOn(turn, 'setPointerCapture').mockImplementation(() => {});
    turn.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 7, pointerType: 'touch', button: 0 }),
    );
    await frames();
    const turned = app.inspect();
    if (!turned) throw new Error('Expected active navigation');
    expect(Math.abs(turned.heading - before.heading)).toBeGreaterThan(0.001);
    expect(turned.position).toEqual(before.position);
    expect(turn.getAttribute('aria-pressed')).toBe('true');
    turn.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 7 }));
    await frames();
    expect(app.inspect()?.heading).toBeCloseTo(turned.heading, 8);
    expect(turn.getAttribute('aria-pressed')).toBe('false');
    const right = buttonElement('turn-right');
    right.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await frames();
    right.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
    const released = app.inspect()?.heading;
    await frames();
    expect(app.inspect()?.heading).toBe(released);
    expect(right.getAttribute('aria-pressed')).toBe('false');
  }, 30000);

  it('teleports from the map and keeps map keyboard movement separate from walking', async () => {
    const model = parseTourSnapshot(sampleSnapshot());
    app = mountTour('https://example.github.io/tour/');
    await expect.poll(() => app?.inspect(), { timeout: 15000 }).not.toBeNull();
    const before = app.inspect();
    if (!before) throw new Error('Expected a loaded village');
    const cell = model.cells.find(
      (entry) => entry.surface !== 'water' && Math.abs(entry.x - before.position.x) > 20,
    );
    if (!cell) throw new Error('Expected distant sample land');
    const map = canvasElement('mini-map');
    const point = projectMapPoint(model.bounds, map, cell);
    await page.elementLocator(map).click({
      position: {
        x: (point.x * map.clientWidth) / map.width,
        y: (point.y * map.clientHeight) / map.height,
      },
    });
    expect(app.inspect()?.mode).toBe('walk');
    expect(app.inspect()?.heading).toBeCloseTo(before.heading, 8);
    expect(
      Math.abs((app.inspect()?.position.x ?? before.position.x) - before.position.x),
    ).toBeGreaterThan(10);
    const arrival = app.inspect();
    map.focus();
    map.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight', bubbles: true }),
    );
    await frames();
    map.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'ArrowRight', code: 'ArrowRight', bubbles: true }),
    );
    expect(app.inspect()?.position).toEqual(arrival?.position);
    expect(app.inspect()?.heading).toBe(arrival?.heading);
    expect(element('map-marker-label').textContent).toContain('Marker');
    buttonElement('map-walk').click();
    expect(element('announcement').textContent).toContain('Moved to the map marker');
    buttonElement('map-close').click();
    expect(element('map-panel').hidden).toBe(true);
    buttonElement('map-toggle').click();
    expect(element('map-panel').hidden).toBe(false);
  }, 30000);
});
