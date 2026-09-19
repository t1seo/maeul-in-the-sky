import { expect, test } from '@playwright/test';
import { clickDownload, openDemo } from './helpers.js';

test('starts with SVG and preserves history through day/night and reload', async ({ page }) => {
  const worldRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/world/')) worldRequests.push(request.url());
  });
  await openDemo(page, '?mode=dark');
  await expect(page.locator('#renderer-version')).toHaveValue('current');
  await expect(page.locator('#live-terrain > svg')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('#world-archive')).not.toHaveAttribute('open');
  const total = await page.locator('#stat-total').textContent();
  await page.getByRole('button', { name: 'Day', exact: true }).click();
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-mode', 'light');
  await expect(page.locator('#stat-total')).toHaveText(total ?? '');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Day', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Night', exact: true }).click();
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-mode', 'dark');
  await page.goBack();
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-mode', 'light');
  await expect(page.locator('#stat-total')).toHaveText(total ?? '');
  expect(worldRequests).toEqual([]);
});

test('exports automatic or fixed README appearance with matching previews', async ({ page }) => {
  await openDemo(page);
  await page.getByText('README picture', { exact: true }).click();
  await expect(page.locator('#readme-preview')).toContainText('prefers-color-scheme: dark');
  for (const appearance of ['light', 'dark', 'auto']) {
    await page.getByLabel('README appearance', { exact: true }).selectOption(appearance);
    await page.getByLabel('Repository').fill('owner/my village');
    const content = (await clickDownload(page, 'Download README')).toString();
    expect(content).toBe(await page.locator('#readme-preview').textContent());
    expect(content).toContain('owner/my%20village/output/maeul-in-the-sky');
    if (appearance === 'auto') {
      expect(content).toContain('<picture>');
      expect(content).toContain('prefers-color-scheme: light');
    } else {
      expect(content).toContain(`-${appearance}.svg`);
      expect(content).not.toContain('<source');
      expect(content).not.toContain('<picture>');
    }
  }
});
