import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { setupZoom, updateExplorer } from '../../../src/demo/explorer.js';
import { renderSnapshot, mountSvg } from '../../../src/demo/preview.js';
import { setupEncyclopedia, updateEncyclopedia } from '../../../src/demo/encyclopedia.js';
import { sampleSnapshot } from '../../../src/demo/sample.js';
import { change, historySnapshot, mountEnhancedPage, node, press } from './harness.js';

beforeEach(mountEnhancedPage);
afterEach(() => vi.restoreAllMocks());

test('navigates actual contribution dates by selector, pointer and roving keyboard focus', async () => {
  const snapshot = historySnapshot();
  const output = renderSnapshot(snapshot);
  updateExplorer(output, snapshot, 'dark');
  expect(node('#date-details', HTMLElement).dataset.count).toBe('8');
  change('date-select', '2024-01-08');
  expect(node('#date-details', HTMLElement).textContent).toContain('1 contribution ');
  const first = node('#live-terrain .terrain-blocks [data-date="2024-01-07"]', SVGElement);
  first.dispatchEvent(new PointerEvent('pointerenter'));
  expect(node('#date-select', HTMLSelectElement).value).toBe('2024-01-07');
  expect(node('#date-details', HTMLElement).closest('details')?.open).toBe(true);
  first.focus();
  await userEvent.keyboard('{ArrowRight}');
  expect(document.activeElement?.getAttribute('data-date')).toBe('2024-01-08');
  expect(first.getAttribute('tabindex')).toBe('-1');
  await userEvent.keyboard('{ArrowLeft}{ArrowUp}');
  expect(document.activeElement).toBe(first);
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}');
  expect(document.activeElement?.getAttribute('data-date')).toBe('2024-01-09');
  await userEvent.keyboard('{Enter}');
  expect(node('#date-details', HTMLElement).dataset.count).toBe('0');
  updateExplorer(output, snapshot, 'light');
  expect(node('#date-select', HTMLSelectElement).value).toBe('2024-01-09');
  expect(node('#preview-panel', HTMLElement).dataset.mode).toBe('light');
});

test('opens zoom with fresh SVG, clamps controls, pans and returns focus when closed', async () => {
  const snapshot = historySnapshot();
  const output = renderSnapshot(snapshot);
  setupZoom(() => ({ snapshot, output, mode: 'dark' }));
  await press('zoom-button');
  const modal = node('#zoom-dialog', HTMLDialogElement);
  const content = node('#zoom-content', HTMLElement);
  const viewport = node('#zoom-viewport', HTMLElement);
  expect(modal.open).toBe(true);
  expect(content.querySelector('svg')).toBeInstanceOf(SVGSVGElement);
  expect(document.activeElement).toBe(viewport);
  const initial = Number.parseFloat(content.style.width);
  await press('zoom-in');
  expect(Number.parseFloat(content.style.width)).toBe(initial * 1.25);
  await press('zoom-out');
  expect(Number.parseFloat(content.style.width)).toBe(initial);
  const scroll = vi.spyOn(viewport, 'scrollBy');
  await userEvent.keyboard('{ArrowRight}{ArrowDown}{ArrowLeft}{ArrowUp}');
  expect(scroll.mock.calls).toEqual([
    [80, 0],
    [0, 80],
    [-80, 0],
    [0, -80],
  ]);
  for (let index = 0; index < 12; index++)
    modal.dispatchEvent(new KeyboardEvent('keydown', { key: '+' }));
  expect(content.style.width).toBe('5040px');
  for (let index = 0; index < 20; index++)
    modal.dispatchEvent(new KeyboardEvent('keydown', { key: '-' }));
  expect(content.style.width).toBe('420px');
  const resetWidth = Math.max(840, viewport.clientWidth * 1.5);
  await userEvent.keyboard('0');
  expect(Number.parseFloat(content.style.width)).toBe(resetWidth);
  await press('zoom-in');
  const buttonResetWidth = Math.max(840, viewport.clientWidth * 1.5);
  await press('zoom-reset');
  expect(Number.parseFloat(content.style.width)).toBe(buttonResetWidth);
  await press('close-zoom');
  await expect.poll(() => content.childElementCount).toBe(0);
  expect(modal.open).toBe(false);
  expect(document.activeElement).toBe(node('#zoom-button', HTMLButtonElement));
});

test('keeps the touched content point centered while pinching and supports one-finger panning', async () => {
  const snapshot = historySnapshot();
  const output = renderSnapshot(snapshot);
  setupZoom(() => ({ snapshot, output, mode: 'dark' }));
  await press('zoom-button');
  const content = node('#zoom-content', HTMLElement);
  const viewport = node('#zoom-viewport', HTMLElement);
  viewport.style.width = '320px';
  viewport.style.height = '220px';
  viewport.style.overflow = 'auto';
  vi.spyOn(viewport, 'setPointerCapture').mockImplementation(() => undefined);
  vi.spyOn(viewport, 'hasPointerCapture').mockReturnValue(false);
  viewport.scrollTo(120, 0);
  const viewportBox = viewport.getBoundingClientRect();
  const centerX = viewportBox.left + viewport.clientWidth / 2;
  const centerY = viewportBox.top + viewport.clientHeight / 2;
  const initialWidth = Number.parseFloat(content.style.width);
  const initialAnchor = (viewport.scrollLeft + viewport.clientWidth / 2) / initialWidth;
  const touch = (type: string, pointerId: number, clientX: number): void => {
    viewport.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        clientX,
        clientY: centerY,
        pointerId,
        pointerType: 'touch',
      }),
    );
  };

  touch('pointerdown', 1, centerX - 60);
  touch('pointerdown', 2, centerX + 60);
  touch('pointermove', 1, centerX - 120);
  touch('pointermove', 2, centerX + 120);

  const pinchedWidth = Number.parseFloat(content.style.width);
  expect(pinchedWidth).toBe(initialWidth * 2);
  expect((viewport.scrollLeft + viewport.clientWidth / 2) / pinchedWidth).toBeCloseTo(
    initialAnchor,
    5,
  );
  touch('pointerup', 1, centerX - 120);
  touch('pointerup', 2, centerX + 120);

  const panBefore = viewport.scrollLeft;
  touch('pointerdown', 3, centerX + 50);
  touch('pointermove', 3, centerX - 50);
  touch('pointerup', 3, centerX - 50);

  expect(viewport.scrollLeft).toBe(panBefore + 100);
});

test('explains discovered and locked Wonders using real terrain metadata and restores card focus', async () => {
  const snapshot = sampleSnapshot();
  const output = renderSnapshot({
    ...snapshot,
    weeks: snapshot.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => ({ ...day, count: 100, level: 4 })),
    })),
  });
  setupEncyclopedia();
  updateEncyclopedia(output.metadata);
  expect(node('#wonder-count', HTMLElement).textContent).toContain(
    `${new Set(output.metadata.wonders.map((wonder) => wonder.catalogId)).size} /`,
  );
  const discovered = node('.wonder-card[data-discovered="true"]', HTMLButtonElement);
  discovered.click();
  expect(node('#wonder-dialog', HTMLDialogElement).open).toBe(true);
  expect(node('#wonder-details', HTMLElement).textContent).toContain('Found in this village');
  expect(node('#wonder-details', HTMLElement).textContent).toContain('required');
  expect(node('#wonder-details', HTMLElement).querySelectorAll('li').length).toBeGreaterThan(0);
  expect(document.activeElement).toBe(node('#close-wonder', HTMLButtonElement));
  await press('close-wonder');
  await expect.poll(() => document.activeElement).toBe(discovered);
  const locked = node('.wonder-card[data-discovered="false"]', HTMLButtonElement);
  locked.click();
  expect(node('#wonder-details', HTMLElement).textContent).toContain(
    'no placement in the current Contribution Calendar',
  );
  expect(node('#wonder-details', HTMLElement).textContent).toContain('Base selection chance');
  await press('close-wonder');
  await expect.poll(() => document.activeElement).toBe(locked);
});

test('rejects malformed SVG without replacing the current visible village', () => {
  const target = node('#live-terrain', HTMLElement);
  mountSvg(target, '<svg xmlns="http://www.w3.org/2000/svg"><title>Existing village</title></svg>');
  expect(() => mountSvg(target, '<not-svg>')).toThrow('not a valid SVG');
  expect(target.textContent).toBe('Existing village');
});
