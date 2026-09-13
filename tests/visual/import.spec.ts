import { expect, test } from '@playwright/test';
import { parseSnapshot } from '../../src/core/settings/parse.js';
import { clickDownload, fixturePath, importSnapshot, openDemo } from './helpers.js';

test('imports actual counts and downloads a lossless snapshot', async ({ page }) => {
  await openDemo(page);
  const original = await importSnapshot(page, 'partial-2025');
  const exported = parseSnapshot((await clickDownload(page, 'Download snapshot')).toString());
  expect(exported.weeks).toEqual(original.weeks);
  expect(exported.username).toBe(original.username);
  await page.locator('.date-inspector summary').click();
  const dateSelect = page.getByRole('combobox', { name: 'Contribution date', exact: true });
  await dateSelect.selectOption('2025-01-01');
  await expect(page.locator('#date-details')).toContainText('2025-01-01');
  await expect(page.locator('#date-details')).toHaveAttribute('data-week', '0');
  await expect(page.locator('#date-details')).toHaveAttribute('data-day', '3');
  await dateSelect.selectOption('2025-01-05');
  await expect(page.locator('#date-details')).toContainText('2025-01-05');
  await expect(page.locator('#date-details')).toHaveAttribute('data-week', '1');
  await expect(page.locator('#date-details')).toHaveAttribute('data-day', '0');
});

test('rejects malformed imports while preserving accepted data', async ({ page }) => {
  await openDemo(page);
  await importSnapshot(page, 'partial-2025');
  const before = await page.locator('#live-terrain').innerHTML();
  await page.getByTestId('snapshot-input').setInputFiles(fixturePath('malformed'));
  await expect(page.locator('#app-status')).toContainText(/invalid|failed|error|schema|reject/i);
  expect(await page.locator('#live-terrain').innerHTML()).toBe(before);
});

test('renders zero history without invented activity or discovered Wonders', async ({ page }) => {
  await openDemo(page);
  await importSnapshot(page, 'empty-2025');
  await expect(page.locator('#stat-total')).toHaveText('0');
  await expect(page.locator('#stat-active')).toHaveText('0');
  await expect(page.locator('#wonder-count')).toContainText(/^0\b/);
  await expect(page.locator('#live-terrain > svg')).toBeVisible();
});

test('keeps missing dates absent from the day selector', async ({ page }) => {
  await openDemo(page);
  const snapshot = await importSnapshot(page, 'gaps-2025');
  const dates = snapshot.weeks.flatMap((week) => week.days.map((day) => day.date));
  const options = await page
    .locator('#date-select option')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('value')).filter((value) => value !== ''),
    );
  expect(options).toHaveLength(dates.length);
  expect([...options].sort()).toEqual([...dates].sort());
  expect(options).not.toContain('2025-01-08');
});
