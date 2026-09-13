import { expect, test } from '@playwright/test';
import { importSnapshot, openDemo } from './helpers.js';

for (const mode of ['dark', 'light'] as const) {
  test(`captures deterministic static ${mode} terrain and verifies visible geometry`, async ({
    page,
  }, testInfo) => {
    await openDemo(page);
    await importSnapshot(page, 'leap-2000');
    await page.locator('#settings-form details summary').click();
    await page.getByLabel('Motion', { exact: true }).selectOption('off');
    await page.locator(`button[data-mode="${mode}"]`).click();
    await page.addStyleTag({
      content:
        '@font-face { font-family: QaNoto; src: url(/assets/fonts/NotoSansKR.ttf); } #live-terrain text { font-family: QaNoto !important; }',
    });
    await page.evaluate(async () => {
      await document.fonts.load('12px QaNoto');
    });
    const svg = page.locator('#live-terrain > svg');
    await expect(svg).toBeVisible();
    const geometry = await svg.evaluate((root) => {
      const viewport = root.getBoundingClientRect();
      const cells = [...root.querySelectorAll('.terrain-blocks [data-date]')];
      const dates = new Set(cells.map((cell) => cell.getAttribute('data-date')));
      const last = root.querySelector('.terrain-blocks [data-date="2000-12-31"]');
      if (!last) throw new Error('Missing final leap-year day');
      const bounds = last.getBoundingClientRect();
      return {
        count: dates.size,
        viewport: {
          left: viewport.left,
          right: viewport.right,
          top: viewport.top,
          bottom: viewport.bottom,
        },
        last: {
          left: bounds.left,
          right: bounds.right,
          top: bounds.top,
          bottom: bounds.bottom,
          width: bounds.width,
        },
      };
    });
    expect(geometry.count).toBe(366);
    expect(geometry.last.width).toBeGreaterThan(0);
    expect(geometry.last.left).toBeGreaterThanOrEqual(geometry.viewport.left - 1);
    expect(geometry.last.right).toBeLessThanOrEqual(geometry.viewport.right + 1);
    expect(geometry.last.top).toBeGreaterThanOrEqual(geometry.viewport.top - 1);
    expect(geometry.last.bottom).toBeLessThanOrEqual(geometry.viewport.bottom + 1);
    await page.evaluate(() => document.fonts.ready);
    const first = await svg.screenshot({ animations: 'disabled' });
    const second = await svg.screenshot({ animations: 'disabled' });
    expect(second.equals(first)).toBe(true);
    await testInfo.attach(`static-${mode}-${process.platform}-${testInfo.project.name}`, {
      body: first,
      contentType: 'image/png',
    });
    if (process.env.MAEUL_VISUAL_BASELINE === '1') {
      await expect(svg).toHaveScreenshot(`leap-${mode}.png`, {
        animations: 'disabled',
        threshold: 0.1,
        maxDiffPixelRatio: 0.002,
      });
    }
  });
}

test('retains all six selectable fallback images when the browser bundle is unavailable', async ({
  page,
}) => {
  await page.route('**/app/main.js', (route) => route.abort());
  await page.goto('/docs/demo/');
  for (const preset of ['nature', 'balanced', 'civilization']) {
    await page.locator(`[data-preset="${preset}"]`).click();
    for (const mode of ['dark', 'light']) {
      await page.locator(`button[data-mode="${mode}"]`).click();
      const terrain = page.locator('#terrain');
      await expect(terrain).toBeVisible();
      await expect(terrain).toHaveAttribute('src', `assets/preset-${preset}-${mode}.svg`);
      expect(
        await terrain.evaluate(async (node) => {
          if (!(node instanceof HTMLImageElement)) throw new Error('Expected image fallback');
          await node.decode();
          return node.naturalWidth;
        }),
      ).toBe(840);
    }
  }
});
