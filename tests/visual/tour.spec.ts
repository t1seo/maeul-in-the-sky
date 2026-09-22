import { test, expect, type Page } from '@playwright/test';

async function openSample(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/docs/demo/tour/');
  await expect(page.locator('#loading-screen')).toBeHidden({ timeout: 25000 });
  await expect(page.locator('#source-tag')).toContainText('SAMPLE');
  return errors;
}

async function expectSeparate(page: Page, first: string, second: string): Promise<void> {
  const a = await page.locator(first).boundingBox();
  const b = await page.locator(second).boundingBox();
  if (!a || !b) throw new Error(`Expected visible controls: ${first}, ${second}`);
  expect(
    a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y,
  ).toBe(true);
}

test('the Calendar tour supports seasonal destinations and lighting', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Real WebGL rendering is exercised on Chromium; old Calendar keeps its full cross-browser suite.',
  );
  const errors = await openSample(page);
  await page.getByRole('button', { name: 'Visit Summer' }).click();
  await expect(page.locator('#place-label')).toHaveText('Summer riverside');
  await page.getByRole('button', { name: 'Night', exact: true }).click();
  await expect(page.locator('body')).toHaveAttribute('data-light', 'night');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('the Calendar tour supports overview and home navigation', async ({ page, browserName }) => {
  test.skip(
    browserName !== 'chromium',
    'Real WebGL rendering is exercised on Chromium; old Calendar keeps its full cross-browser suite.',
  );
  const errors = await openSample(page);
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  await page.getByRole('button', { name: 'Home view', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('walking and turning controls stay usable across viewport and motion settings', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Real WebGL rendering is exercised on Chromium; old Calendar keeps its full cross-browser suite.',
  );
  const errors = await openSample(page);
  await page.getByRole('button', { name: 'Walk', exact: true }).click();
  await expect(page.locator('#walk-pad')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Turn left', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Turn right', exact: true })).toBeVisible();
  await expectSeparate(page, '#compass', '#walk-pad');
  await page.keyboard.press('Escape');
  await expect(page.locator('#walk-pad')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('map travel stays usable across viewport and motion settings', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Real WebGL rendering is exercised on Chromium; old Calendar keeps its full cross-browser suite.',
  );
  const errors = await openSample(page);
  if (await page.locator('#map-panel').isVisible())
    await page.getByRole('button', { name: 'Close map', exact: true }).click();
  await page.getByRole('button', { name: 'Map', exact: true }).click();
  await expect(page.locator('#mini-map')).toBeVisible();
  await expectSeparate(page, '#map-panel', '.journey');
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
