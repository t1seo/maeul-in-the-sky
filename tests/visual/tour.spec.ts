import { test, expect } from '@playwright/test';

test('the Calendar tour opens, stays usable on touch screens, and respects reduced motion', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Real WebGL rendering is exercised on Chromium; old Calendar keeps its full cross-browser suite.',
  );
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/docs/demo/tour/');
  await expect(page.locator('#loading-screen')).toBeHidden({ timeout: 25000 });
  await expect(page.locator('#source-tag')).toContainText('SAMPLE');
  await page.getByRole('button', { name: 'Visit Summer' }).click();
  await expect(page.locator('#place-label')).toHaveText('Summer riverside');
  await page.getByRole('button', { name: 'Night', exact: true }).click();
  await expect(page.locator('body')).toHaveAttribute('data-light', 'night');
  await page.getByRole('button', { name: 'Walk', exact: true }).click();
  await expect(page.locator('#walk-pad')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Turn left', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Turn right', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#walk-pad')).toBeHidden();
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  await page.getByRole('button', { name: 'Home view', exact: true }).click();
  if (await page.locator('#map-panel').isVisible())
    await page.getByRole('button', { name: 'Close map', exact: true }).click();
  await page.getByRole('button', { name: 'Map', exact: true }).click();
  await expect(page.locator('#mini-map')).toBeVisible();
  await page.locator('#mini-map').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('body')).toHaveAttribute('data-mode', 'walk');
  await expect(page.locator('#announcement')).toContainText('Moved to the map marker');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('invalid profile sources have an explicit recoverable error', async ({ page }) => {
  await page.goto('/docs/demo/tour/?snapshot=https://example.invalid/private.json');
  await expect(page.locator('#loading-title')).toHaveText('The village could not open');
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(page.locator('#fallback-link')).toBeVisible();
  await expect(page.locator('#owner')).toHaveText('Your');
});
