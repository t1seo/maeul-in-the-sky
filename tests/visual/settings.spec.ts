import { expect, test } from '@playwright/test';
import { parseSettings } from '../../src/core/settings/parse.js';
import { clickDownload, downloadBytes, openDemo } from './helpers.js';

test('restores settings after reload and browser back navigation', async ({ page }) => {
  await openDemo(page, '?preset=civilization&mode=light&motion=off');
  await expect(page.locator('[data-preset="civilization"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByLabel('Title', { exact: true }).fill('A: "B" & <C>');
  await page.getByLabel('Title', { exact: true }).press('Tab');
  await expect(page).toHaveURL(/title=/);
  await page.reload();
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('A: "B" & <C>');
  await page.locator('[data-preset="nature"]').click();
  await expect(page.locator('[data-preset="nature"]')).toHaveAttribute('aria-pressed', 'true');
  await page.goBack();
  await expect(page.locator('[data-preset="civilization"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('downloads escaped workflow and settings from actual form values', async ({ page }) => {
  await openDemo(page);
  await page.getByLabel('Title', { exact: true }).fill('A: "B" & <C>');
  await page.getByLabel('Title', { exact: true }).press('Tab');
  const workflow = (await clickDownload(page, 'Download workflow')).toString();
  const titleLine = workflow.split('\n').find((line) => line.trimStart().startsWith('title:'));
  expect(titleLine).toBeDefined();
  expect(JSON.parse(titleLine?.slice(titleLine.indexOf(':') + 1).trim() ?? 'null')).toBe(
    'A: "B" & <C>',
  );
  const settings = parseSettings((await clickDownload(page, 'Download settings JSON')).toString());
  expect(settings.settings.title).toBe('A: "B" & <C>');
  await expect(page.locator('#live-terrain > svg')).toContainText('A: "B" & <C>');
  expect(await page.locator('#live-terrain script').count()).toBe(0);
});

test('copies workflow to the real clipboard when permission is available', async ({
  page,
  context,
  browserName,
}) => {
  await openDemo(page);
  if (browserName === 'chromium') {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  } else {
    await page.evaluate(() => {
      Object.defineProperty(navigator.clipboard, 'writeText', {
        value: async () => {
          throw new DOMException('Clipboard denied', 'NotAllowedError');
        },
      });
    });
  }
  const fallback = browserName === 'chromium' ? undefined : page.waitForEvent('download');
  await page.getByRole('button', { name: 'Copy workflow', exact: true }).click();
  await expect(page.locator('#app-status')).toContainText(/copied|clipboard/i);
  if (browserName === 'chromium') {
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toBe(await page.locator('#workflow-preview').textContent());
  } else if (fallback) {
    expect((await downloadBytes(await fallback)).toString()).toBe(
      await page.locator('#workflow-preview').textContent(),
    );
  }
});

test('rejects Actions expressions without losing JSON title content', async ({ page }) => {
  await openDemo(page);
  await page.getByLabel('Title', { exact: true }).fill('${{ secrets.PRIVATE }}');
  await page.getByLabel('Title', { exact: true }).press('Tab');
  await expect(page.locator('#title-error')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download workflow', exact: true })).toBeDisabled();
  const settings = parseSettings((await clickDownload(page, 'Download settings JSON')).toString());
  expect(settings.settings.title).toBe('${{ secrets.PRIVATE }}');
});

test('roundtrips advanced form inputs through settings import', async ({ page }) => {
  await openDemo(page);
  await page.locator('#settings-form details summary').click();
  await page.getByLabel('Hemisphere', { exact: true }).selectOption('south');
  await page.getByLabel('Village style', { exact: true }).selectOption('korean');
  await page.getByLabel('Layout', { exact: true }).selectOption('card');
  await page.getByLabel('Height scale', { exact: true }).selectOption('fixed');
  await page.getByLabel('Maximum count', { exact: true }).fill('42');
  await page.getByLabel('Layout seed').fill('shared-seed');
  await page.getByLabel('Layout seed').press('Tab');
  const bytes = await clickDownload(page, 'Download settings JSON');
  const settings = parseSettings(bytes.toString());
  expect(settings.settings).toMatchObject({
    hemisphere: 'south',
    style: 'korean',
    layout: 'card',
    normalization: { kind: 'fixed', maxCount: 42 },
    layoutSeed: 'shared-seed',
  });
  await page.getByLabel('Hemisphere', { exact: true }).selectOption('north');
  await page
    .locator('#settings-input')
    .setInputFiles({ name: 'settings.json', mimeType: 'application/json', buffer: bytes });
  await expect(page.getByLabel('Hemisphere', { exact: true })).toHaveValue('south');
  await expect(page.getByLabel('Maximum count', { exact: true })).toHaveValue('42');
  await expect(page.locator('#live-terrain > svg')).toHaveAttribute('data-layout', 'card');
});
