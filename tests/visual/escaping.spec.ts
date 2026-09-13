import { expect, test } from '@playwright/test';
import { parseSettings } from '../../src/core/settings/parse.js';
import { clickDownload, openDemo } from './helpers.js';

test('rejects Actions expressions in layout seeds while preserving JSON literals', async ({
  page,
}) => {
  await openDemo(page);
  await page.locator('#settings-form details summary').click();
  await page.getByLabel('Layout seed').fill('${{ secrets.PRIVATE }}');
  await page.getByLabel('Layout seed').press('Tab');
  await expect(page.locator('#layout-seed-error')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download workflow', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Copy workflow', exact: true })).toBeDisabled();
  const settings = parseSettings((await clickDownload(page, 'Download settings JSON')).toString());
  expect(settings.settings.layoutSeed).toBe('${{ secrets.PRIVATE }}');
});
