import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import {
  action,
  describeError,
  element,
  html,
  reportError,
  setupDialogs,
} from '../../../src/world/app/dom.js';
import { WorldDataError } from '../../../src/world/data/errors.js';
import { prepareIncoming, sourcePeriod } from '../../../src/world/app/incoming.js';
import { importWorldData } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT } from '../../../src/world/model/fixture.js';
import { dateLabel } from '../../../src/world/app/presentation.js';

const lifetime = new AbortController();
beforeEach(() => {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
});
afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

test.each([
  ['0001-01-01', 'January 1, 0001'],
  ['2024-02-29', 'February 29, 2024'],
  ['2024-12-31', 'December 31, 2024'],
  ['2025-01-01', 'January 1, 2025'],
] as const)('labels %s in English without shifting the calendar date', (date, expected) => {
  // Given a canonical calendar date, including leap days and year boundaries.
  // When its display label is formatted.
  const label = dateLabel(date);
  // Then its original month, day and year remain intact.
  expect(label).toBe(expected);
});

test.each([
  ['too_large', '8 MiB'],
  ['unpublished', 'Publish your world JSON file first'],
  ['network', 'Your current world is unchanged'],
  ['timeout', 'try again'],
  ['private_repository', 'Only public repositories'],
  ['storage', 'Download your world file'],
  ['quota', 'storage'],
  ['replace_required', 'already saved'],
  ['library_full', 'library is full'],
] as const)('explains the %s boundary with a usable recovery action', (code, guidance) => {
  action(() => {
    throw new WorldDataError(code, 'Internal transport details');
  });
  expect(html('world-status').textContent).toContain(guidance);
  expect(html('world-status').textContent).not.toContain('Internal transport details');
  expect(html('world-status').dataset.error).toBe('true');
});

test('keeps useful status when stale or cancelled requests finish and exposes unexpected faults', async () => {
  html('world-status').textContent = '새 세계에 도착했습니다.';
  reportError(new WorldDataError('stale', 'stale'));
  reportError(new WorldDataError('cancelled', 'cancelled'));
  expect(html('world-status').textContent).toBe('새 세계에 도착했습니다.');
  expect(describeError(new WorldDataError('stale', 'stale'))).toContain('newer request');
  expect(describeError(new WorldDataError('cancelled', 'cancelled'))).toContain('cancelled');
  expect(describeError(new WorldDataError('rate_limit', 'limited'))).toContain('Try again shortly');
  action(async () => {
    throw new Error('The graphics device stopped');
  });
  await expect.poll(() => html('world-status').textContent).toContain('graphics device stopped');
  expect(() => reportError('not-an-error')).toThrow('not-an-error');
  expect(() => element('missing-element', HTMLInputElement)).toThrow('page element');
});

test('an empty source remains unobserved instead of inventing a latest contribution day', () => {
  const incoming = prepareIncoming(
    importWorldData({ ...TINY_WORLD_INPUT.snapshot, weeks: [], source: { kind: 'import' } }),
  );
  const first = incoming.documents[0];
  if (!first) throw new Error('Missing empty world');
  expect(first.scene.days.every((day) => day.kind === 'missing')).toBe(true);
  expect(first.view.cursorDate).toBe(first.scene.range.to);
  expect(sourcePeriod(first)).toBe('No observed dates');
});

test('ignores an incomplete dialog trigger without stealing focus or opening a wrong dialog', () => {
  const trigger = document.createElement('button');
  trigger.dataset.dialog = '';
  document.body.append(trigger);
  const opened = vi.fn();
  setupDialogs(lifetime.signal, opened);
  trigger.click();
  expect(opened).not.toHaveBeenCalled();
});
