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
  ['too_large', '8 MiB'],
  ['unpublished', '먼저 공개'],
  ['network', '지금 세계는 유지'],
  ['timeout', '다시 시도'],
  ['private_repository', '공개 저장소만'],
  ['storage', '파일을 내려받아'],
  ['quota', '저장 공간'],
  ['replace_required', '이미 보관'],
  ['library_full', '보관함이 가득'],
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
  expect(describeError(new WorldDataError('stale', 'stale'))).toContain('새로운 요청');
  expect(describeError(new WorldDataError('cancelled', 'cancelled'))).toContain('취소');
  expect(describeError(new WorldDataError('rate_limit', 'limited'))).toContain('잠시 후');
  action(async () => {
    throw new Error('The graphics device stopped');
  });
  await expect.poll(() => html('world-status').textContent).toContain('graphics device stopped');
  expect(() => reportError('not-an-error')).toThrow('not-an-error');
  expect(() => element('missing-element', HTMLInputElement)).toThrow('화면 요소');
});

test('an empty source remains unobserved instead of inventing a latest contribution day', () => {
  const incoming = prepareIncoming(
    importWorldData({ ...TINY_WORLD_INPUT.snapshot, weeks: [], source: { kind: 'import' } }),
  );
  const first = incoming.documents[0];
  if (!first) throw new Error('Missing empty world');
  expect(first.scene.days.every((day) => day.kind === 'missing')).toBe(true);
  expect(first.view.cursorDate).toBe(first.scene.range.to);
  expect(sourcePeriod(first)).toBe('관측된 날짜 없음');
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
