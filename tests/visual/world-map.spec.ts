import { test, expect } from '@playwright/test';
import { Resvg } from '@resvg/resvg-js';
import { SaxesParser } from 'saxes';
import { TINY_WORLD_INPUT } from '../../src/world/model/fixture.js';
import { downloadBytes } from './helpers.js';

test('2D map preserves source-day selection across input, focus, presentation, and layout', async ({
  page,
}, testInfo) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  await page.goto('/docs/demo/world/');
  await expect(page.locator('#world-host')).toHaveAttribute('data-ready', 'true');
  await page.locator('#world-file').setInputFiles({
    name: 'leap-day-map.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(TINY_WORLD_INPUT.snapshot)),
  });
  await expect(page.locator('#world-source')).toContainText('@world-fixture');
  const map = page.locator('#world-host svg[data-world-map]');
  await expect(map).toBeVisible();
  await expect(map.locator('[data-day-id][data-day-kind="observed"]')).toHaveCount(2);
  await expect(map.locator('[data-day-id][data-date="2024-03-01"]')).toHaveCount(0);
  const leapDay = map.locator('[data-day-id="day:2024-02-29"]');
  await leapDay.click();
  await expect(page.locator('#world-date')).toHaveValue('2024-02-29');
  await expect(page.locator('#day-details')).toContainText('0 contributions');
  await map.locator('[data-day-id="day:2024-02-28"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#day-details')).toContainText('5 contributions');
  await page.locator('#focus-date').click();
  await page.locator('#zoom-in').click();
  await page.locator('#reset-view').click();
  await page.locator('#world-layout').selectOption('island');
  await expect(map).toHaveAttribute('data-layout', 'island');
  await expect(page.locator('#world-date')).toHaveValue('2024-02-28');
  await page.locator('[data-dialog="atmosphere-dialog"]').click();
  await page.locator('#world-season').selectOption('autumn');
  await page.locator('#world-lighting').selectOption('night');
  await page.locator('#world-weather').selectOption('snow');
  await page.locator('#world-motion').selectOption('off');
  await page.locator('#atmosphere-dialog [data-close]').click();
  await expect(map).toHaveAttribute('data-season', 'autumn');
  await expect(map).toHaveAttribute('data-lighting', 'night');
  await expect(map.locator('animate, animateTransform')).toHaveCount(0);
  await page.locator('#world-host').scrollIntoViewIfNeeded();
  const interactivePath = testInfo.outputPath('world-map-interactive.png');
  await page.screenshot({ fullPage: true, path: interactivePath });
  await testInfo.attach('world-map-interactive', {
    path: interactivePath,
    contentType: 'image/png',
  });
  expect(failures).toEqual([]);
});

test('2D photo exports are self-contained SVG and painted PNG documents', async ({
  page,
}, testInfo) => {
  await page.goto('/docs/demo/world/');
  await expect(page.locator('#world-host')).toHaveAttribute('data-ready', 'true');
  await page.locator('[data-dialog="atmosphere-dialog"]').click();
  await page.locator('#world-motion').selectOption('off');
  await page.locator('#atmosphere-dialog [data-close]').click();
  await page.locator('[data-dialog="photo-dialog"]').click();
  const svgDownload = page.waitForEvent('download');
  await page.locator('#export-svg').click();
  const svg = (await downloadBytes(await svgDownload)).toString('utf8');
  const tags: string[] = [];
  const parser = new SaxesParser();
  parser.on('opentag', (tag) => tags.push(tag.name));
  parser.write(svg).close();
  expect(tags).not.toContain('script');
  expect(tags).not.toContain('image');
  expect(tags).not.toContain('foreignObject');
  expect(tags).not.toContain('animate');
  expect(svg).not.toMatch(/href="https?:/);
  const rendered = new Resvg(svg).render();
  expect([rendered.width, rendered.height]).toEqual([1600, 1160]);
  expect(new Set(rendered.pixels).size).toBeGreaterThan(100);
  const pngDownload = page.waitForEvent('download');
  await page.locator('#export-png').click();
  const downloaded = await pngDownload;
  const png = await downloadBytes(downloaded);
  expect(png.subarray(1, 4).toString()).toBe('PNG');
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1600, 1160]);
  const postcardPath = testInfo.outputPath('world-map-postcard.png');
  await downloaded.saveAs(postcardPath);
  await testInfo.attach('world-map-postcard', { path: postcardPath, contentType: 'image/png' });
});

test('2D sky fills its host after changing focused month, season, and night weather', async ({
  page,
}, testInfo) => {
  await page.goto('/docs/demo/world/');
  const host = page.locator('#world-host');
  await expect(host).toHaveAttribute('data-ready', 'true');
  await page.locator('[data-month="2025-07"]').click();
  await page.locator('[data-dialog="atmosphere-dialog"]').click();
  await page.locator('#world-season').selectOption('spring');
  await page.locator('#world-lighting').selectOption('night');
  await page.locator('#world-weather').selectOption('seasonal');
  await page.locator('#world-motion').selectOption('off');
  await page.locator('#atmosphere-dialog [data-close]').click();
  await page.locator('[data-month="2025-03"]').click();
  const map = host.locator('svg[data-world-map]');
  await expect(map).toHaveAttribute('data-lighting', 'night');
  await expect(map.locator('.map-viewport-frame')).toHaveCount(0);
  const viewport = await host.evaluate((element) => {
    const svg = element.querySelector('svg');
    if (!svg) throw new TypeError('Missing map SVG');
    return {
      width: svg.viewBox.baseVal.width,
      height: svg.viewBox.baseVal.height,
      hostWidth: element.clientWidth,
      hostHeight: element.clientHeight,
      overflow: getComputedStyle(svg).overflow,
    };
  });
  expect(viewport.width).toBe(viewport.hostWidth);
  expect(viewport.height).toBe(viewport.hostHeight);
  expect(viewport.overflow).toBe('hidden');
  if (viewport.hostWidth < 600) {
    const monthWidth = await map
      .locator('.map-ground [data-tile-id^="tile:2025-03"]')
      .evaluateAll((tiles) => {
        const bounds = tiles.map((tile) => tile.getBoundingClientRect());
        return (
          Math.max(...bounds.map((bound) => bound.right)) -
          Math.min(...bounds.map((bound) => bound.left))
        );
      });
    expect(monthWidth / viewport.hostWidth).toBeGreaterThan(0.68);
    expect(monthWidth / viewport.hostWidth).toBeLessThan(0.86);
  }
  const responsivePath = testInfo.outputPath('world-map-responsive-night.png');
  await host.screenshot({ path: responsivePath });
  await testInfo.attach('world-map-responsive-night', {
    path: responsivePath,
    contentType: 'image/png',
  });
  await map.locator('[data-day-id="day:2025-03-14"]').click();
  await expect(page.locator('#world-date')).toHaveValue('2025-03-14');
});
