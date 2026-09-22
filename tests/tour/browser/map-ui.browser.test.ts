import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import markup from '../../../docs/demo/tour/index.html?raw';
import stylesheet from '../../../docs/demo/tour/tour.css?raw';
import { mountTestTour as mountTour } from './fixture.js';
import { buttonElement, canvasElement, element } from '../../../src/tour/app/dom.js';

let app: ReturnType<typeof mountTour> | null = null;
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

describe('live tour navigation overlay', () => {
  it('updates the compass from the camera while turning in place, even with the map closed', async () => {
    app = mountTour('https://example.github.io/tour/');
    await expect.poll(() => app?.inspect(), { timeout: 15000 }).not.toBeNull();
    buttonElement('map-close').click();
    buttonElement('walk-toggle').click();
    const before = app.inspect();
    if (!before) throw new Error('Expected a loaded village');
    const compass = document.querySelector('.compass');
    expect(compass?.getAttribute('role')).toBe('img');
    const label = compass?.getAttribute('aria-label');
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' }));
    await expect.poll(() => compass?.getAttribute('aria-label')).not.toBe(label);
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyE' }));
    expect(app.inspect()?.position).toEqual(before.position);
    const state = app.inspect();
    if (!state) throw new Error('Expected active navigation');
    const degrees = ((-state.heading * 180) / Math.PI + 360) % 360;
    await expect
      .poll(() => document.getElementById('compass-bearing')?.textContent)
      .toContain(`${Math.round(degrees) % 360}°`);
    expect(element('map-panel').hidden).toBe(true);
  }, 30000);

  it('renders square tiles at the actual CSS size and keeps both docks clear of the toolbar', async () => {
    const fill = vi.spyOn(CanvasRenderingContext2D.prototype, 'fillRect');
    app = mountTour('https://example.github.io/tour/');
    await expect.poll(() => app?.inspect(), { timeout: 15000 }).not.toBeNull();
    const canvas = canvasElement('mini-map');
    const context = canvas.getContext('2d');
    const call = fill.mock.calls.find((_, index) => fill.mock.contexts[index] === context);
    if (!call) throw new Error('Expected real minimap tiles');
    const rect = canvas.getBoundingClientRect();
    expect((call[2] * rect.width) / canvas.width).toBeCloseTo(
      (call[3] * rect.height) / canvas.height,
      2,
    );
    for (const side of ['right', 'left']) {
      expect(document.body.dataset.mapSide).toBe(side);
      const map = element('map-panel').getBoundingClientRect();
      const toolbar = document.querySelector('.journey')?.getBoundingClientRect();
      if (!toolbar) throw new Error('Expected navigation toolbar');
      expect(
        map.bottom <= toolbar.top || map.left >= toolbar.right || map.right <= toolbar.left,
      ).toBe(true);
      buttonElement('map-dock').click();
    }
    buttonElement('map-dock').click();
    expect(document.body.dataset.mapSide).toBe('left');
    await app.reload();
    expect(document.body.dataset.mapSide).toBe('right');
    expect(buttonElement('map-dock').getAttribute('aria-label')).toBe('Move map to bottom left');
  }, 30000);
});
