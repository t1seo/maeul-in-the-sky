import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import type { Page } from '@playwright/test';

export async function smokeClassic(page: Page, baseUrl: string, fixture: string) {
  const url = `${baseUrl}/dist/demo/versions/classic/browser.js`;
  const response = await page.request.get(url);
  assert.equal(response.status(), 200);
  assert.equal(
    createHash('sha256')
      .update(await response.body())
      .digest('hex'),
    '44e02537900ec9d8a0f58b492ca4f4ba5ed7145f149929804c84272b725ae458',
  );
  const result = await page.evaluate(
    async ({ moduleUrl, text }) => {
      const classic: typeof import('../../src/browser.js') = await import(moduleUrl);
      const snapshot = classic.parseSnapshot(text);
      const data = classic.snapshotToContributionData(snapshot);
      const output = classic.renderTerrain(data, {
        ...snapshot.settings,
        motion: 'off',
        width: 840,
        height: 240,
      });
      return {
        total: output.metadata.stats.total,
        expected: data.weeks.flatMap((week) => week.days).reduce((sum, day) => sum + day.count, 0),
        days: output.metadata.dataDayCount,
        svg: output.dark.startsWith('<svg'),
      };
    },
    { moduleUrl: url, text: fixture },
  );
  assert.equal(result.total, result.expected);
  assert.ok(result.days > 0);
  assert.equal(result.svg, true);
  console.log('PASS Chromium: immutable packed classic renderer executes with original counts');
}
