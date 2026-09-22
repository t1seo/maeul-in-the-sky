import { expect, test } from '@playwright/test';
import { parseSettings, parseSnapshot } from '../../src/core/settings/parse.js';
import { clickDownload, openDemo } from './helpers.js';

test('preserves independent culture and art choices across setup, sharing and imports', async ({
  page,
  context,
  browserName,
}, testInfo) => {
  // Given: an old settings link that has a culture but no art-style preference.
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openDemo(page, '?style=korean&motion=off');
  const art = page.getByRole('combobox', { name: 'Art style', exact: true });
  const culture = page.getByRole('combobox', { name: 'Village style', exact: true });
  await expect(art).toHaveValue('miniature');
  await expect(culture).toHaveValue('korean');
  const total = await page.locator('#stat-total').textContent();
  await testInfo.attach('miniature-studio', {
    body: await page.locator('#make-it-yours').screenshot({
      path: testInfo.outputPath('miniature-studio.png'),
    }),
    contentType: 'image/png',
  });

  // When: the user chooses pixel art and carries that choice through the setup flow.
  await culture.focus();
  await page.keyboard.press('Tab');
  await expect(art).toBeFocused();
  await art.selectOption('pixel');
  await culture.selectOption('classic');
  await expect(art).toHaveValue('pixel');
  await culture.selectOption('korean');
  await page.reload();
  await expect(art).toHaveValue('pixel');
  await expect(culture).toHaveValue('korean');
  const saved = await clickDownload(page, 'Download settings JSON');
  expect(parseSettings(saved.toString()).settings).toMatchObject({
    style: 'korean',
    artStyle: 'pixel',
  });
  const workflow = (await clickDownload(page, 'Download workflow')).toString();
  expect(workflow).toContain('village_style: "korean"');
  expect(workflow).toContain('art_style: "pixel"');
  expect(workflow).toContain('uses: t1seo/maeul-in-the-sky@v2.1.0');
  await art.selectOption('miniature');
  await page.locator('#settings-input').setInputFiles({
    name: 'settings.json',
    mimeType: 'application/json',
    buffer: saved,
  });
  await expect(art).toHaveValue('pixel');
  if (browserName === 'chromium') {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Copy settings link', exact: true }).click();
    await expect(page.locator('#app-status')).toContainText('Copied');
    const link = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(link);
    await expect(art).toHaveValue('pixel');
    await expect(culture).toHaveValue('korean');
  }

  // Then: real exports and the visible form retain both choices without changing history.
  const snapshot = parseSnapshot((await clickDownload(page, 'Download snapshot')).toString());
  expect(snapshot.settings).toMatchObject({ style: 'korean', artStyle: 'pixel' });
  const svg = (await clickDownload(page, 'Download SVG')).toString();
  expect(svg).toContain('<svg');
  const png = await clickDownload(page, 'Download static PNG');
  expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1680, 480]);
  await expect(page.locator('#stat-total')).toHaveText(total ?? '');
  await expect(page.locator('#source-badge')).toContainText('Sample');
  await testInfo.attach('pixel-village', {
    body: await page.locator('#preview-panel').screenshot({
      path: testInfo.outputPath('pixel-village.png'),
    }),
    contentType: 'image/png',
  });
  expect(errors).toEqual([]);
});

test('keeps the seasonal and daily growth guides readable at the current viewport', async ({
  page,
}, testInfo) => {
  // Given: the live village page at desktop or mobile size.
  await openDemo(page);

  // When: the reader scrolls to the seasonal and daily contribution guides.
  await page.locator('#season-guide').scrollIntoViewIfNeeded();

  // Then: all seasons, growth boundaries and higher-day distinctions remain readable.
  await expect(page.locator('#season-guide h3')).toHaveText([
    'Spring',
    'Summer',
    'Autumn',
    'Winter',
  ]);
  await expect(page.locator('.growth-count')).toHaveText([
    '0',
    '1–4',
    '5–9',
    '10–24',
    '25–49',
    '50+',
  ]);
  await expect(page.locator('#growth-guide')).toContainText('GitHub contributions per day');
  await expect(page.locator('#growth-guide')).toContainText('25 and 50');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await testInfo.attach('seasons-and-growth', {
    body: await page.locator('.world-guide').screenshot({
      path: testInfo.outputPath('seasons-and-growth.png'),
    }),
    contentType: 'image/png',
  });
  await page.getByRole('link', { name: 'Explore a day', exact: true }).click();
  await page.locator('#day-explorer summary').click();
  await expect(page.getByLabel('Contribution date', { exact: true })).toBeVisible();
});
