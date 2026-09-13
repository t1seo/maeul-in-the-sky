import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { expect, type Page } from '@playwright/test';

export async function verifyExplorer(
  page: Page,
  evidence: string,
  record: (action: string, detail?: unknown) => Promise<void>,
): Promise<void> {
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .locator('[data-testid="snapshot-input"]')
    .setInputFiles('tests/fixtures/improvements/partial-2025.json');
  await expect(page.locator('#provenance')).toContainText('benchmark');
  const first = page.locator('#live-terrain .terrain-blocks [data-date="2025-01-01"]:visible');
  await first.focus();
  await expect(page.locator('#date-details')).toHaveAttribute('data-week', '0');
  await expect(page.locator('#date-details')).toHaveAttribute('data-day', '3');
  await page.locator('#live-terrain .terrain-blocks [data-date="2025-01-05"]:visible').focus();
  await expect(page.locator('#date-details')).toHaveAttribute('data-week', '1');
  await expect(page.locator('#date-details')).toHaveAttribute('data-day', '0');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#live-terrain .terrain-blocks [data-date="2025-01-01"]:visible').focus();
  await expect(page.locator('#date-details')).toHaveAttribute('data-date', '2025-01-01');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const sizes = await page.locator('#summary-stats').evaluate((element) => ({
    values: [...element.querySelectorAll('strong')].map((node) =>
      parseFloat(getComputedStyle(node).fontSize),
    ),
    labels: [...element.querySelectorAll('span')].map((node) =>
      parseFloat(getComputedStyle(node).fontSize),
    ),
  }));
  assert(sizes.values.every((size) => size >= 20));
  assert(sizes.labels.every((size) => size >= 14));
  await record('C12/C03 actual partial dates and mobile type sizes', sizes);
  await page
    .locator('[data-testid="snapshot-input"]')
    .setInputFiles('tests/fixtures/improvements/wonders-2025.json');
  await page.getByRole('button', { name: 'Replace saved snapshots', exact: true }).click();
  await expect(page.locator('.wonder-card')).toHaveCount(30);
  const wonder = page.locator('.wonder-card[data-discovered="true"]').first();
  await expect(wonder).toBeVisible();
  await wonder.click();
  await expect(page.locator('#wonder-dialog')).toBeVisible();
  await expect(page.locator('#wonder-details')).toContainText('required');
  await expect(page.locator('#wonder-details')).toContainText('2025-');
  await page.screenshot({ path: `${evidence}/mobile-wonder.png` });
  await page.locator('#close-wonder').click();
  await expect(wonder).toBeFocused();
  await page.getByRole('button', { name: 'Zoom village', exact: true }).click();
  await expect(page.locator('#zoom-dialog')).toBeVisible();
  const before = await page.locator('#zoom-content').evaluate((node) => node.clientWidth);
  await page.keyboard.press('+');
  assert((await page.locator('#zoom-content').evaluate((node) => node.clientWidth)) > before);
  await page.keyboard.press('ArrowRight');
  assert((await page.locator('#zoom-viewport').evaluate((node) => node.scrollLeft)) > 0);
  await page.keyboard.press('0');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Zoom village', exact: true })).toBeFocused();
  await record(
    'C12 Wonder actual date/threshold detail and keyboard zoom/pan/reset/Escape focus return',
  );
  await page
    .locator('[data-testid="snapshot-input"]')
    .setInputFiles('tests/fixtures/improvements/full-2024.json');
  await expect(page.locator('#archive-list .archive-item')).toHaveCount(2);
  await page.getByLabel('Comparison scale', { exact: true }).selectOption('fixed');
  await page.getByLabel('Fixed maximum', { exact: true }).fill('42');
  await page.getByRole('button', { name: 'Compare', exact: true }).click();
  await expect(page.locator('.annual-card')).toHaveCount(2);
  const maxima = await page
    .locator('.annual-card')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-normalization-max')));
  assert.equal(new Set(maxima).size, 1);
  const archivePromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download archive', exact: true }).click();
  await (await archivePromise).saveAs(`${evidence}/archive.json`);
  const raw: unknown = JSON.parse(await readFile(`${evidence}/archive.json`, 'utf8'));
  assert(raw && typeof raw === 'object' && 'snapshots' in raw);
  await page.reload();
  await expect(page.locator('.annual-card')).toHaveCount(2);
  await expect(page.getByLabel('Comparison scale', { exact: true })).toHaveValue('fixed');
  await expect(page.getByLabel('Fixed maximum', { exact: true })).toHaveValue('42');
  await expect(page.locator('#comparison-note')).toContainText(
    `Common fixed maximum: ${maxima[0]}`,
  );
  const stored = await page.evaluate(() => localStorage.getItem('maeul-library-v1'));
  await page
    .locator('[data-testid="snapshot-input"]')
    .setInputFiles('tests/fixtures/improvements/malformed.json');
  await expect(page.locator('#app-status')).toHaveAttribute('data-error', 'true');
  assert.equal(await page.evaluate(() => localStorage.getItem('maeul-library-v1')), stored);
  await page.evaluate(
    "Storage.prototype.setItem = function () { throw new DOMException('Quota exceeded', 'QuotaExceededError'); }",
  );
  await page.getByRole('button', { name: 'Save current year', exact: true }).click();
  await expect(page.locator('#archive-status')).toContainText('Existing archive kept');
  assert.equal(await page.evaluate(() => localStorage.getItem('maeul-library-v1')), stored);
  await record(
    'C12 two-year shared scale, archive download/reload, malformed and quota preserve storage',
    { maxima },
  );
  await page.reload();
  await page.getByRole('button', { name: 'View 2024', exact: true }).click();
  await page.locator('button[data-mode="dark"]').click();
  await page.locator('#preview-panel').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${evidence}/mobile-dark.png` });
  await page.locator('button[data-mode="light"]').click();
  await page.screenshot({ path: `${evidence}/mobile-light.png` });
  const pngPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download static PNG', exact: true }).click();
  await (await pngPromise).saveAs(`${evidence}/static.png`);
  const bytes = await readFile(`${evidence}/static.png`);
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  assert.equal(bytes.readUInt32BE(16), 1680);
  assert.equal(bytes.readUInt32BE(20), 480);
  await record('C12 static PNG real canvas download', { width: 1680, height: 480 });
}
