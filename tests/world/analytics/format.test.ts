import { expect, test } from 'vitest';
import { activityPeriod, monthText } from '../../../src/world/analytics/format.js';
import { activity } from './fixtures.js';

test.each([
  ['2024-02-01T00:00:00Z', '2024-02-29T23:59:59Z', false],
  ['2024-02-01T00:00:00.000Z', '2024-02-29T23:59:59.999Z', false],
  ['2024-02-01T00:00:00.000Z', '2024-02-29T12:00:00.000Z', true],
  ['2024-02-02T00:00:00.000Z', '2024-02-29T23:59:59.000Z', true],
] as const)('describes the actual recorded interval %s through %s', (from, to, partial) => {
  const interval = { ...activity.months[1], from, to };
  const label = activityPeriod(interval);
  expect(label).toContain(`${from} – ${to}`);
  expect(label.includes('Partial month')).toBe(partial);
});

test('formats month labels with their real year in English and UTC', () => {
  expect(monthText('2024-02')).toBe('Feb 2024');
  expect(monthText('2025-02')).toBe('Feb 2025');
  expect(monthText('0001-01')).toBe('Jan 1');
});
