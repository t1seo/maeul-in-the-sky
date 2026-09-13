import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { parseSnapshot, snapshotToContributionData } from '../../src/core/settings/parse.js';
import { startPreviewServer } from '../../src/preview/server.js';
import { fixturePath } from './helpers.js';

test('uses real local health and imports exact upstream counts without exposing the token', async ({
  page,
}) => {
  const snapshot = parseSnapshot(await readFile(fixturePath('partial-2025'), 'utf8'));
  const data = snapshotToContributionData(snapshot);
  const token = 'smoke-browser-server-canary';
  const calls: string[] = [];
  const server = await startPreviewServer({
    port: 0,
    assetRoot: resolve('docs/demo'),
    token,
    fetchContributions: async (username, year, received) => {
      expect(received).toBe(token);
      expect(year).toBe(2025);
      calls.push(username);
      return { ...data, username };
    },
  });
  try {
    await page.goto(server.url);
    await expect(page.locator('#settings-form')).toBeVisible();
    await page.getByLabel('GitHub username', { exact: true }).fill('benchmark');
    await page.getByLabel('Year', { exact: true }).fill('2025');
    await page.getByLabel('Year', { exact: true }).press('Tab');
    await page.getByText('Connect a local preview', { exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Fetch contributions', exact: true }),
    ).toBeEnabled();
    const responsePromise = page.waitForResponse(`${server.url}/api/preview`);
    await page.getByRole('button', { name: 'Fetch contributions', exact: true }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect(await response.text()).not.toContain(token);
    await expect(page.locator('#stat-total')).toHaveText(String(data.stats.total));
    await expect(page.locator('#stat-active')).toHaveText(String(data.stats.activeDays));
    await expect(page.locator('#source-badge')).toContainText('github');
    expect(calls).toEqual(['benchmark']);
    expect(await page.content()).not.toContain(token);
    expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).not.toContain(token);
  } finally {
    await page.goto('about:blank');
    await server.close();
  }
});

test('disables account fetch when the real local server reports no token', async ({ page }) => {
  const server = await startPreviewServer({ port: 0, assetRoot: resolve('docs/demo'), token: '' });
  try {
    await page.goto(server.url);
    await page.getByText('Connect a local preview', { exact: true }).click();
    await expect(page.locator('#service-status')).toContainText('GITHUB_TOKEN');
    await expect(
      page.getByRole('button', { name: 'Fetch contributions', exact: true }),
    ).toBeDisabled();
  } finally {
    await page.goto('about:blank');
    await server.close();
  }
});
