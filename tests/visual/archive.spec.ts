import { expect, test } from '@playwright/test';
import { parseArchive } from '../../src/core/archive/parse.js';
import { clickDownload, fixturePath, openDemo } from './helpers.js';

test('imports, compares, exports, and restores two years under a common maximum', async ({
  page,
}) => {
  await openDemo(page);
  await page.getByTestId('snapshot-input').setInputFiles(fixturePath('two-year-archive'));
  await expect(page.locator('#archive-list input[type="checkbox"]')).toHaveCount(2);
  for (const checkbox of await page.locator('#archive-list input[type="checkbox"]').all())
    await checkbox.check();
  await page.getByRole('button', { name: 'Compare', exact: true }).click();
  await expect(page.locator('#comparison-cards img')).toHaveCount(2);
  const dimensions = await page.locator('#comparison-cards img').evaluateAll(async (images) =>
    Promise.all(
      images.map(async (image) => {
        if (!(image instanceof HTMLImageElement)) throw new Error('Expected comparison image');
        await image.decode();
        return { width: image.naturalWidth, height: image.naturalHeight };
      }),
    ),
  );
  expect(dimensions).toEqual([
    { width: 420, height: 360 },
    { width: 420, height: 360 },
  ]);
  const heights = await page.locator('#comparison-cards img').evaluateAll((images) =>
    images.map((image) => {
      if (!(image instanceof HTMLImageElement)) throw new Error('Expected comparison image');
      const source = decodeURIComponent(image.src.slice(image.src.indexOf(',') + 1));
      const svg = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:fixed;left:-10000px;top:0';
      wrapper.append(document.importNode(svg, true));
      document.body.append(wrapper);
      try {
        const cell = wrapper.querySelector('.terrain-blocks [data-count="20"]');
        if (!(cell instanceof SVGGraphicsElement))
          throw new Error('Missing equal-count terrain cell');
        return cell.getBBox().height;
      } finally {
        wrapper.remove();
      }
    }),
  );
  expect(heights[0]).toBeGreaterThan(0);
  expect(heights[0]).toBeCloseTo(heights[1], 5);
  await expect(page.locator('#comparison-note')).toContainText(/shared|common|maximum/i);
  const archive = parseArchive((await clickDownload(page, 'Download archive')).toString());
  expect(archive.snapshots).toHaveLength(2);
  expect(archive.comparison.years).toEqual([2024, 2025]);
  expect(archive.comparison.normalization.kind).toBe('fixed');
  expect(archive.comparison.normalization.maxCount).toBeGreaterThan(0);
  for (const card of await page.locator('#comparison-cards .annual-card').all()) {
    await expect(card).toHaveAttribute(
      'data-normalization-max',
      String(archive.comparison.normalization.maxCount),
    );
  }
  const before = await page.locator('#comparison-cards').innerHTML();
  await page.reload();
  await expect(page.locator('#archive-list input[type="checkbox"]')).toHaveCount(2);
  for (const checkbox of await page.locator('#archive-list input[type="checkbox"]').all())
    await checkbox.check();
  await page.getByRole('button', { name: 'Compare', exact: true }).click();
  await expect(page.locator('#comparison-cards')).toHaveJSProperty('innerHTML', before);
});

test('preserves saved archive when browser storage rejects a write', async ({ page }) => {
  await openDemo(page);
  await page.getByTestId('snapshot-input').setInputFiles(fixturePath('two-year-archive'));
  await expect(page.locator('#archive-list input[type="checkbox"]')).toHaveCount(2);
  const before = await page.evaluate(() => localStorage.getItem('maeul-library-v1'));
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === 'maeul-library-v1')
        throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      original.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: 'Compare', exact: true }).click();
  await expect(page.locator('#archive-status')).toContainText('QuotaExceededError');
  expect(await page.evaluate(() => localStorage.getItem('maeul-library-v1'))).toBe(before);
  await expect(page.locator('#archive-list input[type="checkbox"]')).toHaveCount(2);
});

test('requires explicit replacement and preserves saved years on malformed import', async ({
  page,
}) => {
  await openDemo(page);
  await page.getByTestId('snapshot-input').setInputFiles(fixturePath('two-year-archive'));
  await expect(page.locator('#archive-list input[type="checkbox"]')).toHaveCount(2);
  const before = await page.locator('#archive-list').innerHTML();
  await page.getByTestId('snapshot-input').setInputFiles(fixturePath('two-year-archive'));
  await expect(page.locator('#replace-dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Keep existing', exact: true }).click();
  await expect(page.locator('#archive-list')).toHaveJSProperty('innerHTML', before);
  await page.getByTestId('snapshot-input').setInputFiles(fixturePath('malformed'));
  await expect(page.locator('#app-status')).toContainText(/invalid|failed|error|schema|reject/i);
  await expect(page.locator('#archive-list')).toHaveJSProperty('innerHTML', before);
});
