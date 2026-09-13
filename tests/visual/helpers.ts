import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, type Download, type Page } from '@playwright/test';
import { parseSnapshot } from '../../src/core/settings/parse.js';

export const fixturePath = (name: string) => resolve('tests/fixtures/improvements', `${name}.json`);

export async function openDemo(page: Page, query = '?motion=off') {
  await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
  await page.goto(`/docs/demo/${query}`);
  await expect(page.locator('#settings-form')).toBeVisible();
  await expect(page.locator('#live-terrain > svg')).toBeVisible();
}

export async function importSnapshot(page: Page, name: string) {
  const snapshot = parseSnapshot(await readFile(fixturePath(name), 'utf8'));
  await page.getByTestId('snapshot-input').setInputFiles(fixturePath(name));
  const days = snapshot.weeks.flatMap((week) => week.days);
  const total = days.reduce((sum, day) => sum + day.count, 0);
  await expect(page.locator('#stat-total')).toHaveText(total.toLocaleString('en-US'));
  await expect(page.locator('#stat-active')).toHaveText(
    days.filter((day) => day.count > 0).length.toLocaleString('en-US'),
  );
  return snapshot;
}

export async function downloadBytes(download: Download): Promise<Buffer> {
  expect(await download.failure()).toBeNull();
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream)
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export async function clickDownload(page: Page, name: string) {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name, exact: true }).click();
  return downloadBytes(await pending);
}
