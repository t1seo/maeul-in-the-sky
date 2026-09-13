import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function verifySetup(
  page: Page,
  url: string,
  evidence: string,
  record: (action: string, detail?: unknown) => Promise<void>,
): Promise<void> {
  await page.goto(`${url}/?preset=civilization&mode=light`);
  await expect(page.locator('#live-terrain > svg')).toBeVisible();
  await expect(page.locator('[data-preset="civilization"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('#density')).toHaveValue('9');
  await record('C06 URL preset/mode restored', {
    preset: 'civilization',
    mode: 'light',
    density: 9,
  });
  await page.getByLabel('Title', { exact: true }).fill('A: "B" & <C>');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download workflow', exact: true }).click();
  const download = await downloadPromise;
  await download.saveAs(`${evidence}/maeul.yml`);
  const yaml = await readFile(`${evidence}/maeul.yml`, 'utf8');
  assert.equal(JSON.parse(yaml.match(/^ {10}title: (.+)$/m)?.[1] ?? 'null'), 'A: "B" & <C>');
  assert(yaml.includes('preset: "civilization"'));
  await record('C06 downloaded workflow preserves exact quoted title and preset');
  await page.getByText('README picture', { exact: true }).click();
  const readmePromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download README', exact: true }).click();
  await (await readmePromise).saveAs(`${evidence}/maeul-readme.html`);
  const readme = await readFile(`${evidence}/maeul-readme.html`, 'utf8');
  const parsed = await page.evaluate((markup) => {
    const document = new DOMParser().parseFromString(markup, 'text/html');
    return {
      alt: document.querySelector('img')?.alt,
      scripts: document.querySelectorAll('script').length,
    };
  }, readme);
  assert.deepEqual(parsed, { alt: 'A: "B" & <C>', scripts: 0 });
  await page.locator('[data-preset="nature"]').click();
  await expect(page.locator('#density')).toHaveValue('2');
  await page.goBack();
  await expect(page.locator('[data-preset="civilization"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.reload();
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('A: "B" & <C>');
  await record('C06 Back/reload restore settings and README remains inert');
  await page.evaluate(
    "Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async function () { throw new DOMException('Denied', 'NotAllowedError'); } } })",
  );
  const fallbackPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Copy workflow', exact: true }).click();
  assert.equal((await fallbackPromise).suggestedFilename(), 'maeul.yml');
  await expect(page.locator('#app-status')).toContainText('Clipboard unavailable');
  await page.getByLabel('Title', { exact: true }).fill('${{ secrets.PRIVATE }}');
  await expect(page.getByRole('button', { name: 'Download workflow', exact: true })).toBeDisabled();
  await expect(page.locator('#title-error')).toContainText('Remove ${{');
  await page.getByLabel('Title', { exact: true }).fill('My safe village');
  await page.getByText('Fine-tune your world', { exact: true }).click();
  await page.locator('#layout-seed').fill('${{ secrets.PRIVATE }}');
  await expect(page.getByRole('button', { name: 'Download workflow', exact: true })).toBeDisabled();
  await expect(page.locator('#layout-seed-error')).toContainText('Remove ${{ from Layout seed');
  await page.locator('#layout-seed').fill('');
  await page.getByLabel('Year', { exact: true }).fill('0');
  await expect(page.getByRole('button', { name: 'Download workflow', exact: true })).toBeDisabled();
  await page.getByLabel('Year', { exact: true }).fill('2025');
  await page.getByLabel('Title', { exact: true }).focus();
  await page.screenshot({ path: `${evidence}/desktop-setup.png`, fullPage: true });
  await record(
    'C06 invalid year / Actions expression block workflow; denied clipboard downloads file',
  );
}
