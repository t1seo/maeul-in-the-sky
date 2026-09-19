import { afterEach, beforeEach, expect, test } from 'vitest';
import { html, input, select } from '../../../src/world/app/dom.js';
import { inputFor, sequence } from '../model/helpers.js';
import {
  changeLayoutControl,
  chooseLayout,
  layoutChoices,
  mountLayoutPage,
  openLayoutApp,
} from './layout-harness.js';

let app: Awaited<ReturnType<typeof openLayoutApp>> | undefined;
beforeEach(mountLayoutPage);
afterEach(async () => {
  await app?.dispose();
  app = undefined;
  document.body.replaceChildren();
});

test('offers three named landforms while keeping the separate Classic selector', async () => {
  // Given the world explorer.
  app = await openLayoutApp();
  // When its layout choices are read.
  const choices = [...select('world-layout').options].map((option) => [option.value, option.text]);
  // Then geography and renderer version remain independent choices.
  expect(choices).toEqual(layoutChoices);
  expect(select('world-layout').getAttribute('aria-describedby')).toBe('layout-note');
  expect([...select('world-version').options].map((option) => option.value)).toEqual([
    'world',
    'current',
    'classic',
  ]);
});

test.each(layoutChoices)(
  'preserves selected date and exact day records when choosing %s',
  async (layout, label) => {
    // Given a selected observed zero day and a stopped replay.
    const running = await openLayoutApp();
    app = running;
    running.session.update({ cursorDate: '2024-02-29', selectedId: 'day:2024-02-29' });
    const days = running.session.current().scene.days;
    const total = html('stat-contributions').textContent;
    // When a landform is selected through the control.
    await chooseLayout(running, layout);
    // Then dates, zero observations and counts remain identical.
    expect(running.session.current().scene.days).toEqual(days);
    expect(input('world-date').value).toBe('2024-02-29');
    expect(html('day-details').textContent).toContain('0번의 기여');
    expect(html('stat-contributions').textContent).toBe(total);
    expect(html('map-caption').textContent).toContain(label);
    expect(html('layout-note').textContent).toContain(
      layout === 'island' ? '이어' : layout === 'seasonal' ? '계절' : '달',
    );
  },
);

test('shows only represented seasons for a partial range', async () => {
  // Given dates crossing the winter/spring boundary.
  const running = await openLayoutApp(
    inputFor(sequence('2024-02-28', 4), 2024, { from: '2024-02-28', to: '2024-03-02' }),
  );
  app = running;
  // When grouped into seasonal islands.
  await chooseLayout(running, 'seasonal');
  // Then the legend describes just the months present in the scene.
  const legend = html('season-legend');
  expect(
    [...legend.querySelectorAll('[data-season]')].map((node) => node.getAttribute('data-season')),
  ).toEqual(['spring', 'winter']);
  expect(legend.textContent).toContain('봄');
  expect(legend.textContent).toContain('3월');
  expect(legend.textContent).toContain('겨울');
  expect(legend.textContent).toContain('2월');
});

test('keeps geographic season labels when a southern scene gets a scenery override', async () => {
  // Given a southern winter/spring boundary in the calendar.
  const source = inputFor(sequence('2024-02-28', 4), 2024, {
    from: '2024-02-28',
    to: '2024-03-02',
  });
  const running = await openLayoutApp({
    ...source,
    settings: { ...source.settings, hemisphere: 'south' },
  });
  app = running;
  await chooseLayout(running, 'seasonal');
  const before = html('season-legend').textContent;
  // When all scenery is previewed as spring.
  changeLayoutControl('world-season', 'spring');
  // Then calendar summer/autumn geography remains clearly labelled.
  expect(html('season-legend').textContent).toBe(before);
  expect(before).toContain('여름');
  expect(before).toContain('가을');
  expect(before).not.toContain('봄');
  expect(html('season-note').textContent).toContain('섬의 계절 구분');
});

test('keeps all 13 year-month targets chronological when the same month appears twice', async () => {
  // Given a rolling 13-month scene.
  const source = inputFor(
    [
      ['2024-01-01', 5],
      ['2025-01-01', 9],
    ],
    2024,
    { from: '2024-01-01', to: '2025-01-01' },
  );
  const running = await openLayoutApp(source);
  app = running;
  // When grouped by season.
  await chooseLayout(running, 'seasonal');
  // Then monthly navigation retains absolute dates in chronological order.
  const buttons = [...html('month-nav').querySelectorAll<HTMLButtonElement>('button')];
  const months = buttons.map((node) => node.dataset.month);
  expect(months).toEqual([
    ...Array.from({ length: 12 }, (_, index) => `2024-${String(index + 1).padStart(2, '0')}`),
    '2025-01',
  ]);
  expect(buttons[0]?.getAttribute('aria-label')).toContain('2024년 1월');
  expect(buttons.at(-1)?.getAttribute('aria-label')).toContain('2025년 1월');
  expect(html('season-legend').textContent).toContain('2024년');
  expect(html('season-legend').textContent).toContain('2025년');
});
