import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import { z } from 'zod';
import { parseSnapshot, snapshotToContributionData } from '../../src/core/settings/parse.js';
const evidence = '.orca/maeul-improvements/evidence/T12/local';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
try {
  await page.goto('http://127.0.0.1:4318/');
  await expect(page.locator('#live-terrain > svg')).toBeVisible();
  await page.getByLabel('GitHub username', { exact: true }).fill('t1seo');
  await page.getByLabel('Year', { exact: true }).fill('2025');
  await page.getByLabel('Title', { exact: true }).fill('@t1seo');
  await page.getByText('Connect a local preview', { exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Fetch contributions', exact: true }),
  ).toBeEnabled();
  const responsePromise = page.waitForResponse((response) =>
    response.url().endsWith('/api/preview'),
  );
  await page.getByRole('button', { name: 'Fetch contributions', exact: true }).click();
  const response = await responsePromise;
  assert.equal(response.status(), 200);
  const body: unknown = await response.json();
  const snapshot = parseSnapshot(z.object({ snapshot: z.unknown() }).parse(body).snapshot);
  const data = snapshotToContributionData(snapshot);
  assert.equal(snapshot.source.kind, 'github');
  assert.equal(snapshot.username, 't1seo');
  await expect(page.locator('#stat-total')).toHaveText(data.stats.total.toLocaleString());
  await expect(page.locator('#provenance')).toContainText('Source: github');
  await page.locator('#preview-panel').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${evidence}/authenticated-local-preview.png` });
  await writeFile(
    `${evidence}/result.json`,
    JSON.stringify(
      {
        passed: true,
        origin: 'http://127.0.0.1:4318',
        status: 200,
        username: snapshot.username,
        source: snapshot.source.kind,
        total: data.stats.total,
        displayedTotal: await page.locator('#stat-total').textContent(),
        dates: data.weeks.flatMap((week) => week.days).length,
      },
      null,
      2,
    ),
  );
} catch (error) {
  await writeFile(
    `${evidence}/result.json`,
    JSON.stringify({
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  throw error;
} finally {
  await browser.close();
  await writeFile(
    `${evidence}/cleanup.txt`,
    'Closed owned Chrome browser; coordinator-owned local service untouched.\n',
  );
}
