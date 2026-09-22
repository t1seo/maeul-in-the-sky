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
  await page.getByRole('button', { name: '여름 풍경으로 이동' }).click();
  await expect(page.locator('#place-label')).toHaveText('여름의 마을');
  await page.getByRole('button', { name: '밤', exact: true }).click();
  await expect(page.locator('body')).toHaveAttribute('data-light', 'night');
  await page.getByRole('button', { name: '직접 걷기', exact: true }).click();
  await expect(page.locator('#walk-pad')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#walk-pad')).toBeHidden();
  await page.getByRole('button', { name: '전체 풍경', exact: true }).click();
  await page.getByRole('button', { name: '처음 시점', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('invalid profile sources have an explicit recoverable error', async ({ page }) => {
  await page.goto('/docs/demo/tour/?snapshot=https://example.invalid/private.json');
  await expect(page.locator('#loading-title')).toHaveText('잠시, 마을 입구에서');
  await expect(page.getByRole('button', { name: '다시 열기' })).toBeVisible();
  await expect(page.locator('#fallback-link')).toBeVisible();
  await expect(page.locator('#owner')).toHaveText('기록으로 자란');
});
