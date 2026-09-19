import { expect, test } from '@playwright/test';
import { resolve } from 'node:path';

for (const lighting of ['day', 'night'] as const) {
  test(`preserves the approved ${lighting} world composition`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/docs/demo/world/');
    await expect(page.locator('#world-host')).toHaveAttribute('data-ready', 'true');
    await page
      .locator('#world-file')
      .setInputFiles(resolve('tests/fixtures/improvements/year-2025.json'));
    await expect(page.locator('#world-period')).toContainText('2025-01-01 — 2025-12-31');
    await page.locator('[data-dialog="atmosphere-dialog"]').click();
    await page.locator('#world-culture').selectOption('korean');
    await page.locator('#world-lighting').selectOption(lighting);
    await page.locator('#world-motion').selectOption('off');
    await page.locator('#atmosphere-dialog [data-close]').click();
    const map = page.locator('#world-host svg[data-world-map]');
    await expect(map).toHaveAttribute('data-lighting', lighting);
    await expect(map.locator('animate, animateTransform')).toHaveCount(0);
    await page.addStyleTag({
      content:
        '@font-face{font-family:QaNoto;src:url(/assets/fonts/NotoSansKR.ttf)} #world-host text{font-family:QaNoto!important}',
    });
    await page.evaluate(async () => {
      await document.fonts.load('12px QaNoto');
      await document.fonts.ready;
    });
    const first = await map.screenshot({ animations: 'disabled' });
    const second = await map.screenshot({ animations: 'disabled' });
    expect(second.equals(first)).toBe(true);
    await info.attach(`world-${lighting}-${info.project.name}`, {
      body: first,
      contentType: 'image/png',
    });
    if (process.env.MAEUL_VISUAL_BASELINE === '1') {
      await expect(map).toHaveScreenshot(`world-${lighting}.png`, {
        animations: 'disabled',
        threshold: 0.1,
        maxDiffPixelRatio: 0.002,
      });
    }
  });
}
